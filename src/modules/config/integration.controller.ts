import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import * as integrationService from './integration.service';

const userId = (req: Request) => (req as Request & { user?: { id: string } }).user?.id;
const ip = (req: Request) => req.ip ?? req.socket?.remoteAddress;

export const listIntegrations = async (req: Request, res: Response) => {
  const category = req.query['category'] as string | undefined;
  const data = await integrationService.listIntegrations(category);
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Integrations retrieved', data);
};

export const getIntegration = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await integrationService.getIntegration(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Integration not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Integration retrieved', data);
};

export const createIntegration = async (req: Request, res: Response) => {
  const data = await integrationService.createIntegration(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Integration created', data);
};

export const updateIntegration = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await integrationService.updateIntegration(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Integration updated', data);
};

export const deleteIntegration = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await integrationService.deleteIntegration(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Integration deleted', null);
};

export const toggleIntegration = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { enabled } = req.body as { enabled: boolean };
  const data = await integrationService.toggleIntegration(id, enabled, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, `Integration ${enabled ? 'connected' : 'disconnected'}`, data);
};

export const testIntegration = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await integrationService.testIntegration(id, userId(req));
  const status = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
  return ApiResponseHandler.success(res, status, result.message, result);
};
