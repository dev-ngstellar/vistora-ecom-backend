import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { PaymentController } from './payment.controller';

const paymentRouter = Router();
const paymentController = new PaymentController();

// ==================== CUSTOMER PAYMENT ROUTES ====================
/**
 * @openapi
 * /payments/razorpay/create-order:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create a Razorpay test/live gateway order
 *     description: Computes server-verified pricing and creates a synchronized Razorpay gateway order.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               addressId:
 *                 type: string
 *                 description: Shipping address ID
 *               couponCode:
 *                 type: string
 *                 nullable: true
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Razorpay order generated successfully
 *       400:
 *         description: Validation or pricing error
 *       401:
 *         description: Unauthorized
 */
paymentRouter.post(
  '/payments/razorpay/create-order',
  authenticate,
  asyncHandler(paymentController.createRazorpayOrder),
);

/**
 * @openapi
 * /payments/verify:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Cryptographically verify Razorpay payment
 *     description: Validates HMAC-SHA256 signature for Razorpay payments and transitions order to CONFIRMED.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderId
 *               - gateway
 *             properties:
 *               orderId:
 *                 type: string
 *               gateway:
 *                 type: string
 *                 example: RAZORPAY
 *               razorpayPaymentId:
 *                 type: string
 *               razorpayOrderId:
 *                 type: string
 *               razorpaySignature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment successfully verified and recorded
 *       400:
 *         description: Invalid signature or missing credentials
 */
paymentRouter.post(
  '/payments/verify',
  authenticate,
  asyncHandler(paymentController.verifyPayment),
);

// ==================== WEBHOOK RECONCILIATION ROUTE ====================
/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Razorpay webhook reconciliation endpoint
 *     description: Public webhook receiver for asynchronous gateway events (e.g. payment.captured, payment.failed).
 *     responses:
 *       200:
 *         description: Webhook processed
 */
paymentRouter.post(
  '/payments/webhook',
  asyncHandler(paymentController.handleWebhook),
);

export { paymentRouter };
