import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import * as settingsService from './settings.service';

const userId = (req: Request) => (req as Request & { user?: { id: string } }).user?.id;
const ip = (req: Request) => req.ip ?? req.socket?.remoteAddress;

export const listSettings = async (_req: Request, res: Response) => {
  const data = await settingsService.listSettings();
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Settings retrieved', data);
};

export const getSetting = async (req: Request, res: Response) => {
  const key = req.params['key'] as string;
  const data = await settingsService.getSetting(key);
  if (!data) return ApiResponseHandler.error(res, HTTP_STATUS.NOT_FOUND, 'Setting not found');
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Setting retrieved', data);
};

export const upsertSetting = async (req: Request, res: Response) => {
  const key = req.params['key'] as string;
  const data = await settingsService.upsertSetting(
    { key, value: req.body.value, description: req.body.description },
    userId(req),
    ip(req),
  );
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Setting saved', data);
};

export const bulkUpsertSettings = async (req: Request, res: Response) => {
  const data = await settingsService.bulkUpsertSettings(req.body, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Settings saved in bulk', data);
};

export const deleteSetting = async (req: Request, res: Response) => {
  const key = req.params['key'] as string;
  await settingsService.deleteSetting(key, userId(req), ip(req));
  return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Setting deleted', null);
};
