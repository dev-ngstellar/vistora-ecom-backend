import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import * as shippingConfigService from './shipping-config.service';

const userId = (req: Request) => (req as Request & { user?: { id: string } }).user?.id;
const ip = (req: Request) => req.ip ?? req.socket?.remoteAddress;

// ===== PROVIDERS =====
export const listProviders = async (_req: Request, res: Response) => {
  const data = await shippingConfigService.listShippingProviders();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping providers retrieved', data);
};

export const getProvider = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.getShippingProvider(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Provider not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping provider retrieved', data);
};

export const createProvider = async (req: Request, res: Response) => {
  const data = await shippingConfigService.createShippingProvider(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Shipping provider created', data);
};

export const updateProvider = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.updateShippingProvider(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping provider updated', data);
};

export const deleteProvider = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await shippingConfigService.deleteShippingProvider(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping provider deleted', null);
};

export const toggleProvider = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { enabled } = req.body as { enabled: boolean };
  const data = await shippingConfigService.toggleShippingProvider(id, enabled, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, `Provider ${enabled ? 'enabled' : 'disabled'}`, data);
};

export const testProvider = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await shippingConfigService.testShippingProvider(id, userId(req));
  const status = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
  return ApiResponseHandler.success(res, status, result.message, result);
};

// ===== METHODS =====
export const listMethods = async (_req: Request, res: Response) => {
  const data = await shippingConfigService.listShippingMethods();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping methods retrieved', data);
};

export const getMethod = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.getShippingMethod(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Method not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping method retrieved', data);
};

export const createMethod = async (req: Request, res: Response) => {
  const data = await shippingConfigService.createShippingMethod(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Shipping method created', data);
};

export const updateMethod = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.updateShippingMethod(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping method updated', data);
};

export const deleteMethod = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await shippingConfigService.deleteShippingMethod(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping method deleted', null);
};

// ===== ZONES =====
export const listZones = async (_req: Request, res: Response) => {
  const data = await shippingConfigService.listShippingZones();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping zones retrieved', data);
};

export const getZone = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.getShippingZone(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Zone not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping zone retrieved', data);
};

export const createZone = async (req: Request, res: Response) => {
  const data = await shippingConfigService.createShippingZone(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Shipping zone created', data);
};

export const updateZone = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await shippingConfigService.updateShippingZone(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping zone updated', data);
};

export const deleteZone = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await shippingConfigService.deleteShippingZone(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Shipping zone deleted', null);
};
