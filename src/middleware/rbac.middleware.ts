import { UserRole } from '@prisma/client';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ApiError } from '../utils/api-error.util';

const ROLE_PERMISSIONS_MAP: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: ['*'],
  [UserRole.ADMIN]: [
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
  [UserRole.MANAGER]: [
    'manage:products',
    'manage:categories',
    'manage:inventory',
    'manage:orders',
    'manage:customers',
    'view:reports',
  ],
  [UserRole.CUSTOMER]: [
    'read:products',
    'manage:own_cart',
    'manage:own_orders',
    'manage:own_profile',
    'manage:own_wishlist',
  ],
};

export const requireRoles = (...allowedRoles: UserRole[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication context missing'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Forbidden. Access requires one of the following roles: [${allowedRoles.join(', ')}]`,
        ),
      );
    }

    next();
  };
};

export const requirePermissions = (...requiredPermissions: string[]): RequestHandler => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication context missing'));
    }

    const userRole = req.user.role;
    const userPermissions = ROLE_PERMISSIONS_MAP[userRole] || [];

    // Super Admin has wildcard '*' access
    if (userPermissions.includes('*')) {
      return next();
    }

    const hasAllPermissions = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAllPermissions) {
      return next(
        ApiError.forbidden(
          `Forbidden. Access requires permissions: [${requiredPermissions.join(', ')}]`,
        ),
      );
    }

    next();
  };
};
