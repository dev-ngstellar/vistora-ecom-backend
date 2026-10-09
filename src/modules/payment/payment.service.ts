import { OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';
import { prisma } from '../../config/prisma.config';
import { ApiError } from '../../utils/api-error.util';
import { logger } from '../../config/logger.config';
import { RazorpayService } from './razorpay.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';
import { mailService } from '../../services/mail.service';

export interface CreateRazorpayOrderPayload {
  orderId?: string;
  addressId?: string;
  couponCode?: string | null;
  notes?: string;
  items?: Array<{ productId: string; variantId?: string | null; quantity: number }>;
}

export interface PaymentVerificationInput {
  orderId: string;
  gateway: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  stripePaymentIntentId?: string;
}

export class PaymentService {
  private razorpayService: RazorpayService;
  private orderService: OrderService;
  private notificationService: NotificationService;

  constructor() {
    this.razorpayService = new RazorpayService();
    this.orderService = new OrderService();
    this.notificationService = new NotificationService();
  }

  /**
   * Create Razorpay TEST Order from server-calculated order totals
   */
  public async createRazorpayOrder(userId: string, input: CreateRazorpayOrderPayload) {
    let order: any;

    if (input.orderId) {
      // 1. Existing order payment initiation
      order = await prisma.order.findUnique({
        where: { id: input.orderId },
        include: { payments: true, user: true },
      });

      if (!order) {
        throw ApiError.notFound('Order not found');
      }

      if (order.userId !== userId) {
        throw ApiError.forbidden('You do not have permission to access this order');
      }

      const existingPaidPayment = order.payments.find((p: any) => p.status === PaymentStatus.PAID);
      if (existingPaidPayment || order.status === OrderStatus.CONFIRMED) {
        throw ApiError.badRequest('This order has already been paid and confirmed');
      }
    } else if (input.addressId) {
      // Check if user has an existing recent PENDING Razorpay order for this address
      const existingPending = await prisma.order.findFirst({
        where: {
          userId,
          status: OrderStatus.PENDING,
          addressId: input.addressId,
          payments: {
            some: {
              paymentMethod: PaymentMethod.RAZORPAY,
              status: PaymentStatus.PENDING,
            },
          },
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000), // within last 15 mins
          },
        },
        orderBy: { createdAt: 'desc' },
        include: { payments: true, user: true },
      });

      if (existingPending) {
        order = existingPending;
      } else {
        // Full checkout initiation with server-side pricing
        order = await this.orderService.createCustomerOrder(userId, {
          addressId: input.addressId,
          paymentMethod: PaymentMethod.RAZORPAY,
          couponCode: input.couponCode,
          notes: input.notes,
          items: input.items,
        });
      }
    } else {
      throw ApiError.badRequest('Either orderId or addressId must be provided to create a payment order');
    }

    const payableAmount = Number(order.total);
    const amountInPaise = Math.round(payableAmount * 100);

    if (amountInPaise <= 0) {
      throw ApiError.badRequest('Payable amount must be greater than zero');
    }

    // Call Razorpay API to generate a gateway order
    const rzpOrder = await this.razorpayService.createOrder({
      amountInPaise,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: {
        vistoraOrderId: order.id,
        orderNumber: order.orderNumber,
        userId,
      },
    });

    // Associate Razorpay Order ID with Vistora Payment record
    const payment = order.payments && order.payments.length > 0 ? order.payments[0] : null;
    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          gatewayOrderId: rzpOrder.id,
          paymentMethod: PaymentMethod.RAZORPAY,
          amount: payableAmount,
        },
      });
    } else {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          paymentMethod: PaymentMethod.RAZORPAY,
          status: PaymentStatus.PENDING,
          amount: payableAmount,
          gatewayOrderId: rzpOrder.id,
          transactionReference: rzpOrder.id,
        },
      });
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      razorpayOrderId: rzpOrder.id,
      amount: payableAmount,
      amountInPaise,
      currency: 'INR',
      keyId: this.razorpayService.getKeyId(),
    };
  }

  /**
   * Securely verify Razorpay Payment with cryptographic signature & ownership validation
   */
  public async verifyPayment(userId: string, input: PaymentVerificationInput) {
    const order = await prisma.order.findUnique({
      where: { id: input.orderId },
      include: { payments: true },
    });

    if (!order) {
      throw ApiError.notFound('Order not found');
    }

    // 1. Authenticated customer ownership check
    if (order.userId !== userId) {
      throw ApiError.forbidden('You do not have permission to verify payment for this order');
    }

    const payment = order.payments.find((p) => p.paymentMethod === PaymentMethod.RAZORPAY) || order.payments[0];
    if (!payment) {
      throw ApiError.notFound('No associated payment record found for this order');
    }

    // 2. Idempotency Check
    if (payment.status === PaymentStatus.PAID && order.status === OrderStatus.CONFIRMED) {
      return {
        success: true,
        alreadyProcessed: true,
        message: 'Payment has already been verified and order is confirmed',
        transactionReference: payment.transactionReference || payment.gatewayPaymentId || 'VERIFIED',
      };
    }

    // 3. Razorpay Cryptographic Signature Verification
    if (input.gateway === 'RAZORPAY' || payment.paymentMethod === PaymentMethod.RAZORPAY) {
      if (!input.razorpayPaymentId || !input.razorpayOrderId || !input.razorpaySignature) {
        throw ApiError.badRequest('Missing Razorpay verification credentials (paymentId, orderId, or signature)');
      }

      // Check that the returned Razorpay order matches our record if one was stored
      if (payment.gatewayOrderId && payment.gatewayOrderId !== input.razorpayOrderId) {
        throw ApiError.badRequest('Razorpay order ID mismatch with registered order payment record');
      }

      const isValid = this.razorpayService.verifyPaymentSignature({
        razorpayOrderId: input.razorpayOrderId,
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
      });

      if (!isValid) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.FAILED,
            failureReason: 'Cryptographic signature verification failed',
            gatewayPaymentId: input.razorpayPaymentId,
            gatewayOrderId: input.razorpayOrderId,
          },
        });
        throw ApiError.badRequest('Invalid Razorpay payment signature. Verification failed.');
      }

      // 4. Mark Payment as PAID and Order as CONFIRMED atomically
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PAID,
            gatewayPaymentId: input.razorpayPaymentId,
            gatewayOrderId: input.razorpayOrderId,
            gatewaySignature: input.razorpaySignature,
            transactionReference: input.razorpayPaymentId,
            paidAt: new Date(),
            failureReason: null,
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CONFIRMED },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: OrderStatus.CONFIRMED,
            remarks: `Payment verified successfully via Razorpay (Payment ID: ${input.razorpayPaymentId})`,
            updatedBy: 'Razorpay Gateway Verification',
          },
        }),
      ]);

      // Trigger admin payment notification & email
      this.notificationService.createPaymentNotification(order).catch(() => {});
      mailService.sendAdminOrderSuccessNotification(order.id).catch((err) => {
        logger.error({ err }, 'Failed sending admin order email notification on payment verification');
      });

      return {
        success: true,
        message: 'Payment verified and order confirmed successfully',
        transactionReference: input.razorpayPaymentId,
      };
    }

    // 5. COD / Alternate Gateway Handling
    if (input.gateway === 'COD' || payment.paymentMethod === PaymentMethod.COD) {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.PENDING,
            transactionReference: 'COD-CONFIRMED',
          },
        }),
        prisma.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.CONFIRMED },
        }),
      ]);

      mailService.sendAdminOrderSuccessNotification(order.id).catch((err) => {
        logger.error({ err }, 'Failed sending admin order email notification on COD verification');
      });

      return {
        success: true,
        message: 'COD order confirmed successfully',
        transactionReference: 'COD-CONFIRMED',
      };
    }

    throw ApiError.badRequest(`Unsupported payment gateway '${input.gateway}'`);
  }

  /**
   * Process incoming Razorpay Webhook notification with signature validation
   */
  public async handleWebhook(rawBody: Buffer | string, signature: string, body: any) {
    const isValid = this.razorpayService.validateWebhookSignature({
      rawBody,
      signature,
    });

    if (!isValid) {
      logger.warn('Razorpay webhook received with invalid signature');
      throw ApiError.badRequest('Invalid webhook signature');
    }

    const event = body?.event;
    const payload = body?.payload;

    logger.info(`Processing valid Razorpay webhook event: ${event}`);

    // Asynchronous Reconciliation for order.paid or payment.captured
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id || payload?.order?.entity?.id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: razorpayOrderId },
          include: { order: true },
        });

        if (payment && payment.status !== PaymentStatus.PAID) {
          await prisma.$transaction([
            prisma.payment.update({
              where: { id: payment.id },
              data: {
                status: PaymentStatus.PAID,
                gatewayPaymentId: razorpayPaymentId || payment.gatewayPaymentId,
                transactionReference: razorpayPaymentId || 'WEBHOOK-CONFIRMED',
                paidAt: new Date(),
              },
            }),
            prisma.order.update({
              where: { id: payment.orderId },
              data: { status: OrderStatus.CONFIRMED },
            }),
            prisma.orderStatusHistory.create({
              data: {
                orderId: payment.orderId,
                status: OrderStatus.CONFIRMED,
                remarks: `Payment reconciled asynchronously via Webhook event: ${event}`,
                updatedBy: 'Razorpay Webhook',
              },
            }),
          ]);
          // Clear customer cart upon successful payment confirmation via webhook
          if (payment.order.userId) {
            const userCart = await prisma.cart.findUnique({ where: { userId: payment.order.userId } });
            if (userCart) {
              await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
            }
          }

          logger.info(`Order #${payment.order.orderNumber} successfully confirmed via webhook reconciliation`);
          mailService.sendAdminOrderSuccessNotification(payment.orderId).catch((err) => {
            logger.error({ err }, 'Failed sending admin order email notification on webhook reconciliation');
          });
        }
      }
    } else if (event === 'payment.failed') {
      const paymentEntity = payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const failureReason = paymentEntity?.error_description || 'Payment failed';

      if (razorpayOrderId) {
        const payment = await prisma.payment.findFirst({
          where: { gatewayOrderId: razorpayOrderId },
        });

        if (payment && payment.status === PaymentStatus.PENDING) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.FAILED,
              failureReason,
            },
          });
        }
      }
    }

    return { received: true, status: 'processed' };
  }
}
