import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { PaymentController } from './payment.controller';

const paymentRouter = Router();
const paymentController = new PaymentController();

// ==================== CUSTOMER PAYMENT ROUTES ====================
// 1. Create Razorpay Test Order (Authenticated)
paymentRouter.post(
  '/payments/razorpay/create-order',
  authenticate,
  asyncHandler(paymentController.createRazorpayOrder),
);

// 2. Cryptographic Payment Verification (Authenticated)
paymentRouter.post(
  '/payments/verify',
  authenticate,
  asyncHandler(paymentController.verifyPayment),
);

// ==================== WEBHOOK RECONCILIATION ROUTE ====================
// 3. Public Webhook Receiver with HMAC Signature Validation
paymentRouter.post(
  '/payments/webhook',
  asyncHandler(paymentController.handleWebhook),
);

export { paymentRouter };
