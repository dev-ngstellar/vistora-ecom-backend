"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const client_1 = require("@prisma/client");
const order_repository_1 = require("../../repositories/order.repository");
const api_error_util_1 = require("../../utils/api-error.util");
const prisma_config_1 = require("../../config/prisma.config");
const logger_config_1 = require("../../config/logger.config");
const notification_service_1 = require("../notification/notification.service");
const mail_service_1 = require("../../services/mail.service");
const settings_service_1 = require("../config/settings.service");
class OrderService {
    orderRepository;
    notificationService;
    constructor() {
        this.orderRepository = new order_repository_1.OrderRepository();
        this.notificationService = new notification_service_1.NotificationService();
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
    async updateOrderStatus(id, status, remarks, updatedBy, shippingInfo) {
        const existing = await this.orderRepository.findOrderById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Order not found');
        }
        return this.orderRepository.updateOrderStatus(id, status, remarks, updatedBy, shippingInfo);
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
        const escapeCsv = (val) => {
            if (val === null || val === undefined)
                return '""';
            const str = String(val).replace(/"/g, '""');
            return `"${str}"`;
        };
        const headers = [
            'Order Number',
            'Date & Time',
            'Customer Name',
            'Customer Email',
            'Customer Phone',
            'Order Status',
            'Payment Status',
            'Payment Method',
            'Items Count',
            'Items Summary',
            'Subtotal (INR)',
            'Discount (INR)',
            'Shipping Fee (INR)',
            'Tax (INR)',
            'Total Amount (INR)',
            'Shipping Address',
            'Shipping Carrier',
            'Tracking Number',
        ];
        const rows = orders.map((o) => {
            const customerName = o.user?.fullName ||
                [o.user?.firstName, o.user?.lastName].filter(Boolean).join(' ') ||
                o.address?.fullName ||
                'Guest Customer';
            const customerEmail = o.user?.email || '';
            const customerPhone = o.user?.phone || o.address?.phone || '';
            const itemsSummary = (o.items || [])
                .map((item) => {
                const name = item.product?.title || 'Product';
                const variant = item.variant?.sku ? ` [${item.variant.sku}]` : '';
                return `${name}${variant} (x${item.quantity})`;
            })
                .join('; ');
            const totalItemsCount = (o.items || []).reduce((sum, item) => sum + (item.quantity || 1), 0);
            const address = o.address
                ? [
                    o.address.addressLine1,
                    o.address.addressLine2,
                    o.address.city,
                    o.address.state,
                    o.address.postalCode,
                    o.address.country,
                ]
                    .filter(Boolean)
                    .join(', ')
                : '';
            const payment = o.payments?.[0];
            const paymentStatus = payment?.status || 'PENDING';
            const paymentMethod = payment?.paymentMethod || 'COD';
            const formattedDate = new Date(o.createdAt).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
            });
            return [
                escapeCsv(o.orderNumber),
                escapeCsv(formattedDate),
                escapeCsv(customerName),
                escapeCsv(customerEmail),
                escapeCsv(customerPhone),
                escapeCsv(o.status),
                escapeCsv(paymentStatus),
                escapeCsv(paymentMethod),
                escapeCsv(totalItemsCount),
                escapeCsv(itemsSummary),
                escapeCsv(Number(o.subtotal).toFixed(2)),
                escapeCsv(Number(o.discount).toFixed(2)),
                escapeCsv(Number(o.shipping).toFixed(2)),
                escapeCsv(Number(o.tax).toFixed(2)),
                escapeCsv(Number(o.total).toFixed(2)),
                escapeCsv(address),
                escapeCsv(o.shipment?.courierName || '—'),
                escapeCsv(o.shipment?.trackingNumber || '—'),
            ];
        });
        const csvContent = [headers.map(escapeCsv).join(','), ...rows.map((r) => r.join(','))].join('\n');
        return csvContent;
    }
    // ==================== CUSTOMER ORDER PLACEMENT ====================
    async createCustomerOrder(userId, input) {
        let orderItemsData = [];
        let subtotal = 0;
        let itemsToDeduct = [];
        if (input.items && input.items.length > 0) {
            // 1. Process custom buy-now items
            const itemsToProcess = [];
            for (const item of input.items) {
                const product = await prisma_config_1.prisma.product.findUnique({
                    where: { id: item.productId },
                    include: { images: true }
                });
                if (!product) {
                    throw api_error_util_1.ApiError.notFound(`Product with ID ${item.productId} not found`);
                }
                let variant = null;
                if (item.variantId) {
                    variant = await prisma_config_1.prisma.productVariant.findUnique({
                        where: { id: item.variantId }
                    });
                    if (!variant) {
                        throw api_error_util_1.ApiError.notFound(`Variant with ID ${item.variantId} not found`);
                    }
                }
                itemsToProcess.push({ item, product, variant });
            }
            orderItemsData = itemsToProcess.map(({ item, product, variant }) => {
                const price = Number(variant ? variant.price : product.price);
                const itemTotal = price * item.quantity;
                subtotal += itemTotal;
                return {
                    productId: item.productId,
                    variantId: item.variantId || null,
                    productName: product.name,
                    sku: variant ? variant.sku : product.sku,
                    quantity: item.quantity,
                    unitPrice: price,
                    discount: 0,
                    tax: 0,
                    total: itemTotal,
                };
            });
            itemsToDeduct = input.items.map(item => ({
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity
            }));
        }
        else {
            // 2. Fetch user cart
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
            orderItemsData = cart.items.map((item) => {
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
            itemsToDeduct = cart.items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId || null,
                quantity: item.quantity
            }));
        }
        // Verify address
        const address = await prisma_config_1.prisma.address.findFirst({
            where: { id: input.addressId, userId },
        });
        if (!address) {
            throw api_error_util_1.ApiError.notFound('Delivery address not found');
        }
        // Compute discount
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
        const taxConfig = await (0, settings_service_1.getTaxSettings)();
        const taxRate = Number(taxConfig.taxRate) || 0;
        const taxInclusive = Boolean(taxConfig.taxInclusive);
        const taxableAmount = Math.max(0, subtotal - discount);
        const shipping = 0; // Free shipping
        let tax = 0;
        if (taxInclusive) {
            tax = parseFloat(((taxableAmount * taxRate) / (100 + taxRate)).toFixed(2));
        }
        else {
            tax = parseFloat(((taxableAmount * taxRate) / 100).toFixed(2));
        }
        const total = parseFloat((taxableAmount + (taxInclusive ? 0 : tax) + shipping).toFixed(2));
        const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
        // Transaction order creation
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
                            status: 'PENDING',
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
            for (const item of itemsToDeduct) {
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
            // Clear user cart items ONLY for Cash on Delivery (COD) orders upon initial placement.
            // For online payment gateways (Razorpay, Stripe), cart items must remain intact
            // until payment is successfully completed and verified.
            if (input.paymentMethod === 'COD' && (!input.items || input.items.length === 0)) {
                const cart = await tx.cart.findUnique({ where: { userId } });
                if (cart) {
                    await tx.cartItem.deleteMany({
                        where: { cartId: cart.id },
                    });
                }
            }
            return createdOrder;
        });
        // Asynchronously dispatch real-time admin notification
        this.notificationService.createOrderNotification(order).catch(() => { });
        if (input.paymentMethod === 'COD') {
            mail_service_1.mailService.sendAdminOrderSuccessNotification(order.id).catch((err) => {
                logger_config_1.logger.error({ err }, 'Failed sending admin order email notification for COD order');
            });
        }
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
        // Clear user cart items now that online payment is verified and completed successfully
        if (order.userId) {
            const cart = await prisma_config_1.prisma.cart.findUnique({ where: { userId: order.userId } });
            if (cart) {
                await prisma_config_1.prisma.cartItem.deleteMany({
                    where: { cartId: cart.id },
                });
            }
        }
        mail_service_1.mailService.sendAdminOrderSuccessNotification(input.orderId).catch((err) => {
            logger_config_1.logger.error({ err }, 'Failed sending admin order email notification on verifyPayment');
        });
        return {
            success: true,
            message: 'Payment verified and order confirmed successfully',
            transactionReference: input.razorpayPaymentId || input.stripePaymentIntentId || 'VERIFIED',
        };
    }
}
exports.OrderService = OrderService;
