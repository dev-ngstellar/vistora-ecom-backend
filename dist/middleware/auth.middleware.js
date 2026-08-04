"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const api_error_util_1 = require("../utils/api-error.util");
const async_handler_util_1 = require("../utils/async-handler.util");
const jwt_util_1 = require("../utils/jwt.util");
exports.authenticate = (0, async_handler_util_1.asyncHandler)(async (req, _res, next) => {
    let token;
    // 1. Extract from Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }
    else if (req.cookies && req.cookies['accessToken']) {
        // 2. Extract from HTTP-only Cookie
        token = req.cookies['accessToken'];
    }
    if (!token) {
        throw api_error_util_1.ApiError.unauthorized('Authentication token is required');
    }
    // 3. Verify JWT Access Token
    const payload = jwt_util_1.JwtUtil.verifyAccessToken(token);
    // 4. Attach decoded user payload to Request context
    req.user = {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        roleId: payload.roleId,
        firstName: payload.firstName,
        lastName: payload.lastName,
    };
    next();
});
