"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const env_config_1 = require("../config/env.config");
const logger_config_1 = require("../config/logger.config");
const http_status_constant_1 = require("../constants/http-status.constant");
const api_error_util_1 = require("../utils/api-error.util");
const api_response_util_1 = require("../utils/api-response.util");
const globalErrorHandler = (err, _req, res, _next) => {
    let statusCode = http_status_constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred on the server';
    let errors = [];
    logger_config_1.logger.error({ err }, `Error handled by globalErrorHandler: ${err.message}`);
    if (err instanceof api_error_util_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    else if (err instanceof zod_1.ZodError) {
        statusCode = http_status_constant_1.HTTP_STATUS.UNPROCESSABLE_ENTITY;
        message = 'Validation failed for request parameters';
        errors = err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code,
        }));
    }
    else if (err instanceof client_1.Prisma.PrismaClientKnownRequestError) {
        switch (err.code) {
            case 'P2002': {
                statusCode = http_status_constant_1.HTTP_STATUS.CONFLICT;
                const target = err.meta?.target || [];
                const fieldName = target.join(', ') || 'field';
                message = `A record with this ${fieldName} already exists`;
                errors = [{ field: fieldName, message }];
                break;
            }
            case 'P2025': {
                statusCode = http_status_constant_1.HTTP_STATUS.NOT_FOUND;
                message = 'Requested database record was not found';
                break;
            }
            case 'P2003': {
                statusCode = http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
                message = 'Invalid reference relationship ID provided';
                break;
            }
            default: {
                statusCode = http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
                message = `Database constraint error (${err.code})`;
                break;
            }
        }
    }
    else if (err.name === 'SyntaxError' && 'body' in err) {
        statusCode = http_status_constant_1.HTTP_STATUS.BAD_REQUEST;
        message = 'Malformed JSON payload provided in request body';
    }
    else {
        message = env_config_1.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
    }
    const stack = env_config_1.env.NODE_ENV === 'development' ? err.stack : undefined;
    return api_response_util_1.ApiResponseHandler.error(res, statusCode, message, errors, stack);
};
exports.globalErrorHandler = globalErrorHandler;
