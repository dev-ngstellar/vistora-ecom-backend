import { HTTP_STATUS, HttpStatusCode } from '../constants/http-status.constant';
import { ApiErrorDetail } from '../types/api-response.type';

export class ApiError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly errors: ApiErrorDetail[];
  public readonly isOperational: boolean;

  constructor(
    statusCode: HttpStatusCode,
    message: string,
    errors: ApiErrorDetail[] = [],
    isOperational = true,
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  static badRequest(message: string, errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(HTTP_STATUS.BAD_REQUEST, message, errors);
  }

  static unauthorized(message = 'Unauthorized access'): ApiError {
    return new ApiError(HTTP_STATUS.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden access'): ApiError {
    return new ApiError(HTTP_STATUS.FORBIDDEN, message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(HTTP_STATUS.NOT_FOUND, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(HTTP_STATUS.CONFLICT, message);
  }

  static unprocessableEntity(message: string, errors: ApiErrorDetail[] = []): ApiError {
    return new ApiError(HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
  }
}
