"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePermissions = exports.requireRoles = void 0;
const client_1 = require("@prisma/client");
const api_error_util_1 = require("../utils/api-error.util");
const ROLE_PERMISSIONS_MAP = {
    [client_1.UserRole.SUPER_ADMIN]: ['*'],
    [client_1.UserRole.ADMIN]: [
        'manage:products',
        'manage:categories',
        'manage:brands',
        'manage:collections',
        'manage:inventory',
        'manage:orders',
        'manage:customers',
        'manage:coupons',
        'manage:reviews',
        'manage:banners',
        'manage:cms',
        'view:reports',
        'manage:settings',
    ],
    [client_1.UserRole.MANAGER]: [
        'manage:products',
        'manage:categories',
        'manage:inventory',
        'manage:orders',
        'manage:customers',
        'view:reports',
    ],
    [client_1.UserRole.CUSTOMER]: [
        'read:products',
        'manage:own_cart',
        'manage:own_orders',
        'manage:own_profile',
        'manage:own_wishlist',
    ],
};
const requireRoles = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(api_error_util_1.ApiError.unauthorized('Authentication context missing'));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(api_error_util_1.ApiError.forbidden(`Forbidden. Access requires one of the following roles: [${allowedRoles.join(', ')}]`));
        }
        next();
    };
};
exports.requireRoles = requireRoles;
const requirePermissions = (...requiredPermissions) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(api_error_util_1.ApiError.unauthorized('Authentication context missing'));
        }
        const userRole = req.user.role;
        const userPermissions = ROLE_PERMISSIONS_MAP[userRole] || [];
        // Super Admin has wildcard '*' access
        if (userPermissions.includes('*')) {
            return next();
        }
        const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));
        if (!hasAllPermissions) {
            return next(api_error_util_1.ApiError.forbidden(`Forbidden. Access requires permissions: [${requiredPermissions.join(', ')}]`));
        }
        next();
    };
};
exports.requirePermissions = requirePermissions;
