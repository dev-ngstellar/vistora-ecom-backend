"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const api_error_util_1 = require("../utils/api-error.util");
const notFoundHandler = (req, _res, next) => {
    const error = api_error_util_1.ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`);
    next(error);
};
exports.notFoundHandler = notFoundHandler;
