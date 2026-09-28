"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.couponRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const coupon_controller_1 = require("./coupon.controller");
const coupon_validation_1 = require("./coupon.validation");
const couponRouter = (0, express_1.Router)();
exports.couponRouter = couponRouter;
const couponController = new coupon_controller_1.CouponController();
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
couponRouter.post('/coupons/validate', (0, validate_middleware_1.validateRequest)(coupon_validation_1.validateCouponSchema), (0, async_handler_util_1.asyncHandler)(couponController.validateCoupon));
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
couponRouter.get('/coupons/public', (0, async_handler_util_1.asyncHandler)(couponController.listActiveCoupons));
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
couponRouter.get('/coupons/stats', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(couponController.getCouponStats));
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
couponRouter.get('/coupons', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(couponController.getAllCoupons));
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
couponRouter.get('/coupons/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(couponController.getCouponById));
couponRouter.post('/coupons', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(coupon_validation_1.createCouponSchema), (0, async_handler_util_1.asyncHandler)(couponController.createCoupon));
couponRouter.put('/coupons/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(coupon_validation_1.updateCouponSchema), (0, async_handler_util_1.asyncHandler)(couponController.updateCoupon));
couponRouter.delete('/coupons/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(couponController.deleteCoupon));
