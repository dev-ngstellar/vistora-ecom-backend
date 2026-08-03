import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import * as paymentConfigService from './payment-config.service';

const userId = (req: Request) => (req as Request & { user?: { id: string } }).user?.id;
const ip = (req: Request) => req.ip ?? req.socket?.remoteAddress;

export const listGateways = async (_req: Request, res: Response) => {
  const data = await paymentConfigService.listPaymentGateways();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Payment gateways retrieved', data);
};

export const getGateway = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await paymentConfigService.getPaymentGateway(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Payment gateway not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Payment gateway retrieved', data);
};

export const createGateway = async (req: Request, res: Response) => {
  const data = await paymentConfigService.createPaymentGateway(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Payment gateway created', data);
};

export const updateGateway = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await paymentConfigService.updatePaymentGateway(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Payment gateway updated', data);
};

export const deleteGateway = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await paymentConfigService.deletePaymentGateway(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Payment gateway deleted', null);
};

export const toggleGateway = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { enabled } = req.body as { enabled: boolean };
  const data = await paymentConfigService.togglePaymentGateway(id, enabled, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, `Payment gateway ${enabled ? 'enabled' : 'disabled'}`, data);
};

export const testGateway = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await paymentConfigService.testPaymentGateway(id, userId(req));
  const status = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
  return ApiResponseHandler.success(res, status, result.message, result);
};
