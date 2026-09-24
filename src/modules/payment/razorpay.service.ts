import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '../../config/env.config';
import { ApiError } from '../../utils/api-error.util';
import { logger } from '../../config/logger.config';

export interface CreateRazorpayOrderInput {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifySignatureInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface ValidateWebhookInput {
  rawBody: string | Buffer;
  signature: string;
  webhookSecret?: string;
}

export class RazorpayService {
  private client: Razorpay | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): Razorpay | null {
    if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
      logger.warn('Razorpay credentials missing in environment. Razorpay service running in unconfigured mode.');
      return null;
    }

    if (!this.client) {
      this.client = new Razorpay({
        key_id: env.RAZORPAY_KEY_ID,
        key_secret: env.RAZORPAY_KEY_SECRET,
      });
    }
    return this.client;
  }

  public getClient(): Razorpay {
    const client = this.initClient();
    if (!client) {
      throw ApiError.internal('Razorpay gateway credentials are not configured on the server');
    }
    return client;
  }

  public getKeyId(): string {
    return env.RAZORPAY_KEY_ID || '';
  }

  /**
   * Create a Razorpay Order
   * @param input Order details including amount in paise, currency, receipt, and notes
   */
  public async createOrder(input: CreateRazorpayOrderInput): Promise<{
    id: string;
    amount: number | string;
    currency: string;
    receipt?: string;
    status: string;
  }> {
    const client = this.getClient();

    if (!input.amountInPaise || input.amountInPaise <= 0) {
      throw ApiError.badRequest('Invalid payable amount for Razorpay order creation');
    }

    try {
      const order = await client.orders.create({
        amount: Math.round(input.amountInPaise),
        currency: input.currency || 'INR',
        receipt: input.receipt,
        notes: input.notes,
      });

      return order as {
        id: string;
        amount: number | string;
        currency: string;
        receipt?: string;
        status: string;
      };
    } catch (error: any) {
      logger.error({ error: error?.message || error }, 'Failed to create Razorpay order');
      throw ApiError.badRequest(error?.error?.description || error?.message || 'Failed to initialize Razorpay order');
    }
  }

  /**
   * Cryptographically verify Razorpay Payment Signature
   * Signature payload: `${razorpay_order_id}|${razorpay_payment_id}`
   */
  public verifyPaymentSignature(input: VerifySignatureInput): boolean {
    const secret = env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      throw ApiError.internal('Razorpay key secret not configured on server');
    }

    if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
      return false;
    }

    const payload = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return expectedSignature === input.razorpaySignature;
  }

  /**
   * Cryptographically validate Razorpay Webhook Signature
   */
  public validateWebhookSignature(input: ValidateWebhookInput): boolean {
    const secret = input.webhookSecret || env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) {
      return false;
    }

    if (!input.signature || !input.rawBody) {
      return false;
    }

    try {
      const rawBodyString = Buffer.isBuffer(input.rawBody)
        ? input.rawBody.toString('utf8')
        : typeof input.rawBody === 'string'
          ? input.rawBody
          : JSON.stringify(input.rawBody);

      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBodyString)
        .digest('hex');

      return expectedSignature === input.signature;
    } catch (error: any) {
      logger.error({ error: error?.message }, 'Error validating Razorpay webhook signature');
      return false;
    }
  }
}
