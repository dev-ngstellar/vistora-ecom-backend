import { Prisma } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.config';
import { logger } from '../config/logger.config';
import { HTTP_STATUS, HttpStatusCode } from '../constants/http-status.constant';
import { ApiErrorDetail } from '../types/api-response.type';
import { ApiError } from '../utils/api-error.util';
import { ApiResponseHandler } from '../utils/api-response.util';

export const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  let statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred on the server';
  let errors: ApiErrorDetail[] = [];

  logger.error({ err }, `Error handled by globalErrorHandler: ${err.message}`);

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY;
    message = 'Validation failed for request parameters';
    errors = err.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
      code: issue.code,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': {
        statusCode = HTTP_STATUS.CONFLICT;
        const target = (err.meta?.target as string[]) || [];
        const fieldName = target.join(', ') || 'field';
        message = `A record with this ${fieldName} already exists`;
        errors = [{ field: fieldName, message }];
        break;
      }
      case 'P2025': {
        statusCode = HTTP_STATUS.NOT_FOUND;
        message = 'Requested database record was not found';
        break;
      }
      case 'P2003': {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = 'Invalid reference relationship ID provided';
        break;
      }
      default: {
        statusCode = HTTP_STATUS.BAD_REQUEST;
        message = `Database constraint error (${err.code})`;
        break;
      }
    }
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    statusCode = HTTP_STATUS.BAD_REQUEST;
    message = 'Malformed JSON payload provided in request body';
  } else {
    message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  }

  const stack = env.NODE_ENV === 'development' ? err.stack : undefined;

  return ApiResponseHandler.error(res, statusCode, message, errors, stack);
};
