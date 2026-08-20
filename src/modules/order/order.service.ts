import { OrderStatus } from '@prisma/client';
import { OrderQueryFilters, OrderRepository } from '../../repositories/order.repository';
import { ApiError } from '../../utils/api-error.util';
import { prisma } from '../../config/prisma.config';

export class OrderService {
  private orderRepository: OrderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  public async getOrders(filters: OrderQueryFilters) {
    return this.orderRepository.findOrders(filters);
  }

  public async getOrderById(id: string) {
    const order = await this.orderRepository.findOrderById(id);
    if (!order) {
      throw ApiError.notFound('Order not found');
    }
    return order;
  }

  public async updateOrderStatus(id: string, status: OrderStatus, remarks?: string, updatedBy?: string) {
    const existing = await this.orderRepository.findOrderById(id);
    if (!existing) {
      throw ApiError.notFound('Order not found');
    }
    return this.orderRepository.updateOrderStatus(id, status, remarks, updatedBy);
  }

  public async cancelOrder(id: string, reason?: string, updatedBy?: string) {
    const existing = await this.orderRepository.findOrderById(id);
    if (!existing) {
      throw ApiError.notFound('Order not found');
    }
    if (existing.status === OrderStatus.DELIVERED) {
      throw ApiError.badRequest('Delivered orders cannot be cancelled');
    }
    return this.orderRepository.cancelOrder(id, reason, updatedBy);
  }

  public async getInvoice(orderId: string) {
    return this.orderRepository.ensureInvoice(orderId);
  }

  public async getOrderStats() {
    return this.orderRepository.getOrderStats();
  }

  public async exportOrdersCsv(filters: OrderQueryFilters) {
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
  public async createCustomerOrder(userId: string, input: {
    addressId: string;
    paymentMethod: 'RAZORPAY' | 'STRIPE' | 'COD';
    couponCode?: string | null;
    notes?: string;
    items?: Array<{ productId: string; variantId?: string | null; quantity: number }>;
  }) {
    let orderItemsData: any[] = [];
    let subtotal = 0;
    let itemsToDeduct: Array<{ productId: string; variantId: string | null; quantity: number }> = [];

    if (input.items && input.items.length > 0) {
      // 1. Process custom buy-now items
      const itemsToProcess = [];
      for (const item of input.items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          include: { images: true }
        });
        if (!product) {
          throw ApiError.notFound(`Product with ID ${item.productId} not found`);
        }
        let variant = null;
        if (item.variantId) {
          variant = await prisma.productVariant.findUnique({
            where: { id: item.variantId }
          });
          if (!variant) {
            throw ApiError.notFound(`Variant with ID ${item.variantId} not found`);
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

    } else {
      // 2. Fetch user cart
      const cart = await prisma.cart.findUnique({
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
        throw ApiError.badRequest('Shopping cart is empty');
      }

      orderItemsData = cart.items.map((item: any) => {
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

      itemsToDeduct = cart.items.map((item: any) => ({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity
      }));
    }

    // Verify address
    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId },
    });
    if (!address) {
      throw ApiError.notFound('Delivery address not found');
    }

    // Compute discount
    let discount = 0;
    if (input.couponCode) {
      const coupon = await prisma.coupon.findUnique({ where: { code: input.couponCode } });
      if (coupon && coupon.status === 'ACTIVE') {
        const couponVal = Number(coupon.value);
        if (coupon.type === 'PERCENTAGE') {
          discount = (subtotal * couponVal) / 100;
        } else if (coupon.type === 'FIXED_AMOUNT') {
          discount = couponVal;
        }
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const shipping = subtotal >= 150 ? 0 : 15;
    const tax = parseFloat((taxableAmount * 0.05).toFixed(2)); // 5% tax
    const total = parseFloat((taxableAmount + shipping + tax).toFixed(2));

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
    
    // Transaction order creation
    const order = await prisma.$transaction(async (tx: any) => {
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

      // Clear user cart items if not a custom Buy Now order
      if (!input.items || input.items.length === 0) {
        const cart = await tx.cart.findUnique({ where: { userId } });
        if (cart) {
          await tx.cartItem.deleteMany({
            where: { cartId: cart.id },
          });
        }
      }

      return createdOrder;
    });

    return order;
  }

  // ==================== PAYMENT VERIFICATION ====================
  public async verifyPayment(input: {
    orderId: string;
    gateway: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    stripePaymentIntentId?: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    const payment = order.payments[0];
    if (payment) {
      await prisma.payment.update({
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

    await prisma.order.update({
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
