"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.brandRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const brand_controller_1 = require("./brand.controller");
const brand_validation_1 = require("./brand.validation");
const brandRouter = (0, express_1.Router)();
exports.brandRouter = brandRouter;
const brandController = new brand_controller_1.BrandController();
/**
 * @openapi
 * /brands:
 *   get:
 *     tags:
 *       - Brands
 *     summary: List all active brands
 *     responses:
 *       200:
 *         description: Brands retrieved successfully
 *   post:
 *     tags:
 *       - Brands
 *     summary: Create a brand
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gucci
 *               slug:
 *                 type: string
 *                 example: gucci
 *               logoUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1548036328-c9fa89d128fa
 *               description:
 *                 type: string
 *                 example: Italian luxury fashion house
 *               website:
 *                 type: string
 *                 example: https://www.gucci.com
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Brand created successfully
 */
brandRouter.get('/brands', (0, async_handler_util_1.asyncHandler)(brandController.listBrands));
brandRouter.post('/brands', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(brand_validation_1.createBrandSchema), (0, async_handler_util_1.asyncHandler)(brandController.createBrand));
/**
 * @openapi
 * /brands/{idOrSlug}:
 *   get:
 *     tags:
 *       - Brands
 *     summary: Get brand details
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Brand details
 */
brandRouter.get('/brands/:idOrSlug', (0, async_handler_util_1.asyncHandler)(brandController.getBrand));
/**
 * @openapi
 * /brands/{id}:
 *   put:
 *     tags:
 *       - Brands
 *     summary: Update brand
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               logoUrl:
 *                 type: string
 *               description:
 *                 type: string
 *               website:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Brand updated successfully
 *   delete:
 *     tags:
 *       - Brands
 *     summary: Soft delete brand
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
 *         description: Brand soft-deleted successfully
 */
brandRouter.put('/brands/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(brand_validation_1.updateBrandSchema), (0, async_handler_util_1.asyncHandler)(brandController.updateBrand));
brandRouter.delete('/brands/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(brandController.deleteBrand));
