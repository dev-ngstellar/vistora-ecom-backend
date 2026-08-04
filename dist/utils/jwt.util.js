"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_config_1 = require("../config/env.config");
const api_error_util_1 = require("./api-error.util");
class JwtUtil {
    static generateAccessToken(user) {
        const options = {
            expiresIn: env_config_1.env.JWT_EXPIRES_IN,
        };
        return jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            role: user.role,
            roleId: user.roleId,
            firstName: user.firstName,
            lastName: user.lastName,
        }, env_config_1.env.JWT_SECRET, options);
    }
    static generateRefreshToken(userId) {
        const options = {
            expiresIn: env_config_1.env.JWT_REFRESH_EXPIRES_IN,
        };
        return jsonwebtoken_1.default.sign({ id: userId }, env_config_1.env.JWT_REFRESH_SECRET, options);
    }
    static verifyAccessToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_SECRET);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw api_error_util_1.ApiError.unauthorized('Access token has expired');
            }
            throw api_error_util_1.ApiError.unauthorized('Invalid access token');
        }
    }
    static verifyRefreshToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, env_config_1.env.JWT_REFRESH_SECRET);
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw api_error_util_1.ApiError.unauthorized('Refresh token has expired');
            }
            throw api_error_util_1.ApiError.unauthorized('Invalid refresh token');
        }
    }
}
exports.JwtUtil = JwtUtil;
