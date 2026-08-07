"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const order_repository_1 = require("../../repositories/order.repository");
const api_error_util_1 = require("../../utils/api-error.util");
const prisma_config_1 = require("../../config/prisma.config");
class OrderService {
    orderRepository;
    constructor() {
        this.orderRepository = new order_repository_1.OrderRepository();
    }
    async getOrders(filters) {
        return this.orderRepository.findOrders(filters);
    }
    async getOrderById(id) {
        const order = await this.orderRepository.findOrderById(id);
        if (!order) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        return order;
    }
    async updateOrderStatus(id, status, remarks, updatedBy) {
        const existing = await this.orderRepository.findOrderById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        return this.orderRepository.updateOrderStatus(id, status, remarks, updatedBy);
    }
    async cancelOrder(id, reason, updatedBy) {
        const existing = await this.orderRepository.findOrderById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        if (existing.status === client_1.OrderStatus.DELIVERED) {
            throw api_error_util_1.ApiError.badRequest('Delivered orders cannot be cancelled');
        }
        return this.orderRepository.cancelOrder(id, reason, updatedBy);
    }
    async getInvoice(orderId) {
        return this.orderRepository.ensureInvoice(orderId);
    }
    async getOrderStats() {
        return this.orderRepository.getOrderStats();
    }
    async exportOrdersCsv(filters) {
        const { orders } = await this.orderRepository.findOrders({ ...filters, limit: 10000 });
        const headers = ['Order Number', 'Date', 'Customer Name', 'Email', 'Status', 'Payment Status', 'Total Amount', 'Items Count'];
        const rows = orders.map((o) => [
            o.orderNumber,
            new Date(o.createdAt).toISOString(),
            `"${o.user?.fullName || ''}"`,
            o.user?.email || '',
            o.status,
            o.payments[0]?.status || 'PENDING',
            o.total,
            o.items.length,
        ]);
        const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        return csvContent;
    }
    // ==================== CUSTOMER ORDER PLACEMENT ====================
    async createCustomerOrder(userId, input) {
        // 1. Fetch user cart
        const cart = await prisma_config_1.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: { include: { images: true } },
                        variant: true,
                    },
                },
            },
        });
        if (!cart || cart.items.length === 0) {
            throw api_error_util_1.ApiError.badRequest('Shopping cart is empty');
        }
        // 2. Verify address
        const address = await prisma_config_1.prisma.address.findFirst({
            where: { id: input.addressId, userId },
        });
        if (!address) {
            throw api_error_util_1.ApiError.notFound('Delivery address not found');
        }
        // 3. Compute calculations
        let subtotal = 0;
        const orderItemsData = cart.items.map((item) => {
            const price = item.variant ? item.variant.price : item.product.price;
            const itemTotal = price * item.quantity;
            subtotal += itemTotal;
            return {
                productId: item.productId,
                variantId: item.variantId || null,
                productName: item.product.name,
                sku: item.variant ? item.variant.sku : item.product.sku,
                quantity: item.quantity,
                unitPrice: price,
                discount: 0,
                tax: 0,
                total: itemTotal,
            };
        });
        // 4. Compute discount
        let discount = 0;
        if (input.couponCode) {
            const coupon = await prisma_config_1.prisma.coupon.findUnique({ where: { code: input.couponCode } });
            if (coupon && coupon.status === 'ACTIVE') {
                const couponVal = Number(coupon.value);
                if (coupon.type === 'PERCENTAGE') {
                    discount = (subtotal * couponVal) / 100;
                }
                else if (coupon.type === 'FIXED_AMOUNT') {
                    discount = couponVal;
                }
            }
        }
        const taxableAmount = Math.max(0, subtotal - discount);
        const shipping = subtotal >= 150 ? 0 : 15;
        const tax = parseFloat((taxableAmount * 0.05).toFixed(2)); // 5% tax
        const total = parseFloat((taxableAmount + shipping + tax).toFixed(2));
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        // 5. Transaction order creation
        const order = await prisma_config_1.prisma.$transaction(async (tx) => {
            const createdOrder = await tx.order.create({
                data: {
                    orderNumber,
                    userId,
                    addressId: input.addressId,
                    subtotal,
                    discount,
                    tax,
                    shipping,
                    total,
                    status: 'PENDING',
                    notes: input.notes || null,
                    items: {
                        create: orderItemsData,
                    },
                    payments: {
                        create: {
                            paymentMethod: input.paymentMethod,
                            status: input.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
                            amount: total,
                            transactionReference: input.paymentMethod === 'COD' ? 'COD-CONFIRMED' : 'DEMO-PAYMENT',
                        },
                    },
                    statusHistory: {
                        create: {
                            status: 'PENDING',
                            remarks: 'Order initiated via checkout',
                        },
                    },
                },
                include: {
                    items: true,
                    payments: true,
                    address: true,
                },
            });
            // Stock deduction for ordered items
            for (const item of cart.items) {
                if (item.variantId) {
                    await tx.productVariant.update({
                        where: { id: item.variantId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }
                await tx.inventory.updateMany({
                    where: {
                        OR: [
                            { variantId: item.variantId || undefined },
                            { productId: item.productId },
                        ],
                    },
                    data: { availableStock: { decrement: item.quantity } },
                });
            }
            // Record coupon usage if a valid coupon was applied
            if (input.couponCode && discount > 0) {
                const coupon = await tx.coupon.findUnique({ where: { code: input.couponCode } });
                if (coupon) {
                    await tx.coupon.update({
                        where: { id: coupon.id },
                        data: { usedCount: { increment: 1 } },
                    });
                    await tx.couponUsage.create({
                        data: {
                            couponId: coupon.id,
                            userId,
                            orderId: createdOrder.id,
                            discount,
                        },
                    });
                }
            }
            // Clear user cart items
            await tx.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return createdOrder;
        });
        return order;
    }
    // ==================== PAYMENT VERIFICATION ====================
    async verifyPayment(input) {
        const order = await prisma_config_1.prisma.order.findUnique({
            where: { id: input.orderId },
            include: { payments: true },
        });
        if (!order) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        const payment = order.payments[0];
        if (payment) {
            await prisma_config_1.prisma.payment.update({
                where: { id: payment.id },
                data: {
                    status: 'PAID',
                    gatewayPaymentId: input.razorpayPaymentId || input.stripePaymentIntentId || null,
                    gatewayOrderId: input.razorpayOrderId || null,
                    transactionReference: input.razorpayPaymentId || input.stripePaymentIntentId || 'VERIFIED',
                    paidAt: new Date(),
                },
            });
        }
        await prisma_config_1.prisma.order.update({
            where: { id: input.orderId },
            data: { status: 'CONFIRMED' },
        });
        return {
            success: true,
            message: 'Payment verified and order confirmed successfully',
            transactionReference: input.razorpayPaymentId || input.stripePaymentIntentId || 'VERIFIED',
        };
    }
}
exports.OrderService = OrderService;
