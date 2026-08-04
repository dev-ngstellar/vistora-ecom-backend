"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponseHandler = void 0;
const http_status_constant_1 = require("../constants/http-status.constant");
class ApiResponseHandler {
    static success(res, statusCode = http_status_constant_1.HTTP_STATUS.OK, message, data, meta) {
        const payload = {
            success: true,
            message,
            data,
            ...(meta && { meta }),
        };
        return res.status(statusCode).json(payload);
    }
    static created(res, message, data) {
        return this.success(res, http_status_constant_1.HTTP_STATUS.CREATED, message, data);
    }
    static noContent(res) {
        return res.status(http_status_constant_1.HTTP_STATUS.NO_CONTENT).send();
    }
    static error(res, statusCode = http_status_constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, message, errors = [], stack) {
        const payload = {
            success: false,
            message,
            errors,
            ...(stack && { stack }),
        };
        return res.status(statusCode).json(payload);
    }
}
exports.ApiResponseHandler = ApiResponseHandler;
