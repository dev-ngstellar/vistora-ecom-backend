import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CouponController } from './coupon.controller';
import { createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupon.validation';

const couponRouter = Router();
const couponController = new CouponController();

couponRouter.post(
  '/coupons/validate',
  validateRequest(validateCouponSchema),
  asyncHandler(couponController.validateCoupon),
);

couponRouter.get('/coupons/public', asyncHandler(couponController.listActiveCoupons));

couponRouter.get(
  '/coupons/stats',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.getCouponStats),
);

couponRouter.get(
  '/coupons',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.getAllCoupons),
);

couponRouter.get(
  '/coupons/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.getCouponById),
);

couponRouter.post(
  '/coupons',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createCouponSchema),
  asyncHandler(couponController.createCoupon),
);

couponRouter.put(
  '/coupons/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateCouponSchema),
  asyncHandler(couponController.updateCoupon),
);

couponRouter.delete(
  '/coupons/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.deleteCoupon),
);

export { couponRouter };
