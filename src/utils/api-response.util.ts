import { Response } from 'express';
import { HTTP_STATUS, HttpStatusCode } from '../constants/http-status.constant';
import { ApiResponseError, ApiResponseSuccess } from '../types/api-response.type';

export class ApiResponseHandler {
  static success<T>(
    res: Response,
    statusCode: HttpStatusCode = HTTP_STATUS.OK,
    message: string,
    data: T,
    meta?: Record<string, unknown>,
  ): Response {
    const payload: ApiResponseSuccess<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };

    return res.status(statusCode).json(payload);
  }

  static created<T>(res: Response, message: string, data: T): Response {
    return this.success(res, HTTP_STATUS.CREATED, message, data);
  }

  static noContent(res: Response): Response {
    return res.status(HTTP_STATUS.NO_CONTENT).send();
  }

  static error(
    res: Response,
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message: string,
    errors: ApiResponseError['errors'] = [],
    stack?: string,
  ): Response {
    const payload: ApiResponseError = {
      success: false,
      message,
      errors,
      ...(stack && { stack }),
    };

    return res.status(statusCode).json(payload);
  }
}
