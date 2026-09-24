import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { PaymentService } from './payment.service';

export class PaymentController {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  public createRazorpayOrder = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const result = await this.paymentService.createRazorpayOrder(userId, req.body);
    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Razorpay order created successfully',
      result,
    );
  };

  public verifyPayment = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user?.id;
    if (!userId) {
      return ApiResponseHandler.error(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
    }

    const result = await this.paymentService.verifyPayment(userId, req.body);
    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      result.message || 'Payment verified successfully',
      result,
    );
  };

  public handleWebhook = async (req: Request, res: Response): Promise<Response> => {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = (req as any).rawBody || req.body;

    const result = await this.paymentService.handleWebhook(rawBody, signature, req.body);
    return res.status(HTTP_STATUS.OK).json(result);
  };
}
