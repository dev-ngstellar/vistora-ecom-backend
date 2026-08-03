import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { BrandController } from './brand.controller';
import { createBrandSchema, updateBrandSchema } from './brand.validation';

const brandRouter = Router();
const brandController = new BrandController();

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
brandRouter.get('/brands', asyncHandler(brandController.listBrands));
brandRouter.post(
  '/brands',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createBrandSchema),
  asyncHandler(brandController.createBrand),
);

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
brandRouter.get('/brands/:idOrSlug', asyncHandler(brandController.getBrand));

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
brandRouter.put(
  '/brands/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateBrandSchema),
  asyncHandler(brandController.updateBrand),
);

brandRouter.delete(
  '/brands/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(brandController.deleteBrand),
);

export { brandRouter };
