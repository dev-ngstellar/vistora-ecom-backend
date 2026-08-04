"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
const http_status_constant_1 = require("../constants/http-status.constant");
class ApiError extends Error {
    statusCode;
    errors;
    isOperational;
    constructor(statusCode, message, errors = [], isOperational = true, stack = '') {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = isOperational;
        if (stack) {
            this.stack = stack;
        }
        else if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    static badRequest(message, errors = []) {
        return new ApiError(http_status_constant_1.HTTP_STATUS.BAD_REQUEST, message, errors);
    }
    static unauthorized(message = 'Unauthorized access') {
        return new ApiError(http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, message);
    }
    static forbidden(message = 'Forbidden access') {
        return new ApiError(http_status_constant_1.HTTP_STATUS.FORBIDDEN, message);
    }
    static notFound(message = 'Resource not found') {
        return new ApiError(http_status_constant_1.HTTP_STATUS.NOT_FOUND, message);
    }
    static conflict(message) {
        return new ApiError(http_status_constant_1.HTTP_STATUS.CONFLICT, message);
    }
    static unprocessableEntity(message, errors = []) {
        return new ApiError(http_status_constant_1.HTTP_STATUS.UNPROCESSABLE_ENTITY, message, errors);
    }
    static internal(message = 'Internal server error') {
        return new ApiError(http_status_constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, message, [], false);
    }
}
exports.ApiError = ApiError;
