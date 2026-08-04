"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const async_handler_util_1 = require("../utils/async-handler.util");
const validateRequest = (schema) => {
    return (0, async_handler_util_1.asyncHandler)(async (req, _res, next) => {
        await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    });
};
exports.validateRequest = validateRequest;
