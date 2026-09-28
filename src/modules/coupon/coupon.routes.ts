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

/**
 * @openapi
 * /coupons/validate:
 *   post:
 *     tags:
 *       - Coupons
 *     summary: Validate a promotional coupon code
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - subtotal
 *             properties:
 *               code:
 *                 type: string
 *                 example: VISTORA1500
 *               subtotal:
 *                 type: number
 *                 example: 2500
 *     responses:
 *       200:
 *         description: Coupon validated successfully with discount details
 *       400:
 *         description: Invalid or expired coupon
 */
couponRouter.post(
  '/coupons/validate',
  validateRequest(validateCouponSchema),
  asyncHandler(couponController.validateCoupon),
);

/**
 * @openapi
 * /coupons/public:
 *   get:
 *     tags:
 *       - Coupons
 *     summary: List public promotional coupons for customers
 *     responses:
 *       200:
 *         description: List of available coupons
 */
couponRouter.get('/coupons/public', asyncHandler(couponController.listActiveCoupons));

/**
 * @openapi
 * /coupons/stats:
 *   get:
 *     tags:
 *       - Coupons
 *     summary: Get coupon performance stats (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon usage metrics
 */
couponRouter.get(
  '/coupons/stats',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.getCouponStats),
);

/**
 * @openapi
 * /coupons:
 *   get:
 *     tags:
 *       - Coupons
 *     summary: List all coupons (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of coupons
 */
couponRouter.get(
  '/coupons',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(couponController.getAllCoupons),
);

/**
 * @openapi
 * /coupons/{id}:
 *   get:
 *     tags:
 *       - Coupons
 *     summary: Get coupon details by ID (Admin/Manager)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Coupon details
 */
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
