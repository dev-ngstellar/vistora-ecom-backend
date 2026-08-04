"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const env_config_1 = require("../../config/env.config");
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const auth_service_1 = require("./auth.service");
const getCookieOptions = () => ({
    httpOnly: true,
    secure: env_config_1.env.NODE_ENV === 'production',
    sameSite: env_config_1.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});
class AuthController {
    authService;
    constructor(authService = new auth_service_1.AuthService()) {
        this.authService = authService;
    }
    register = async (req, res) => {
        const result = await this.authService.register(req.body);
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
        return api_response_util_1.ApiResponseHandler.created(res, 'User registration completed successfully', {
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
        });
    };
    login = async (req, res) => {
        const metadata = {
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        };
        const result = await this.authService.login(req.body, metadata);
        // Set refresh token in HTTP-only cookie
        res.cookie('refreshToken', result.tokens.refreshToken, getCookieOptions());
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Login successful', {
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
        });
    };
    refreshToken = async (req, res) => {
        const tokenFromCookie = req.cookies ? req.cookies['refreshToken'] : undefined;
        const tokenFromBody = req.body ? req.body.refreshToken : undefined;
        const token = tokenFromCookie || tokenFromBody;
        const metadata = {
            ipAddress: req.ip || req.socket.remoteAddress,
            userAgent: req.get('user-agent'),
        };
        const tokens = await this.authService.refreshToken(token, metadata);
        // Set rotated refresh token in HTTP-only cookie
        res.cookie('refreshToken', tokens.refreshToken, getCookieOptions());
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Tokens refreshed successfully', {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
        });
    };
    logout = async (req, res) => {
        const tokenFromCookie = req.cookies ? req.cookies['refreshToken'] : undefined;
        const tokenFromBody = req.body ? req.body.refreshToken : undefined;
        const token = tokenFromCookie || tokenFromBody;
        const userId = req.user?.id;
        await this.authService.logout(token, userId);
        // Clear refresh token cookie
        res.clearCookie('refreshToken', getCookieOptions());
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Logout completed successfully', null);
    };
    getCurrentUser = async (req, res) => {
        const userId = req.user?.id;
        if (!userId) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.UNAUTHORIZED, 'Authentication required');
        }
        const context = await this.authService.getAuthenticatedUserContext(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Current authenticated user context retrieved successfully', context);
    };
}
exports.AuthController = AuthController;
