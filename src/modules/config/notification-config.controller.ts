import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import * as notificationConfigService from './notification-config.service';

const userId = (req: Request) => (req as Request & { user?: { id: string } }).user?.id;
const ip = (req: Request) => req.ip ?? req.socket?.remoteAddress;

// ===== CHANNELS =====
export const listChannels = async (_req: Request, res: Response) => {
  const data = await notificationConfigService.listNotificationChannels();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification channels retrieved', data);
};

export const upsertChannel = async (req: Request, res: Response) => {
  const data = await notificationConfigService.upsertNotificationChannel(req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification channel saved', data);
};

export const toggleChannel = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const { enabled } = req.body as { enabled: boolean };
  const data = await notificationConfigService.toggleNotificationChannel(id, enabled, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, `Notification channel ${enabled ? 'enabled' : 'disabled'}`, data);
};

export const testChannel = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const result = await notificationConfigService.testNotificationChannel(id, userId(req));
  const status = result.success ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST;
  return ApiResponseHandler.success(res, status, result.message, result);
};

// ===== TEMPLATES =====
export const listTemplates = async (_req: Request, res: Response) => {
  const data = await notificationConfigService.listNotificationTemplates();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification templates retrieved', data);
};

export const getTemplate = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await notificationConfigService.getNotificationTemplate(id);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Notification template not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification template retrieved', data);
};

export const createTemplate = async (req: Request, res: Response) => {
  const data = await notificationConfigService.createNotificationTemplate(req.body, userId(req), ip(req));
  return ApiResponseHandler.created(res, 'Notification template created', data);
};

export const updateTemplate = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  const data = await notificationConfigService.updateNotificationTemplate(id, req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification template updated', data);
};

export const deleteTemplate = async (req: Request, res: Response) => {
  const id = req.params['id'] as string;
  await notificationConfigService.deleteNotificationTemplate(id, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Notification template deleted', null);
};
