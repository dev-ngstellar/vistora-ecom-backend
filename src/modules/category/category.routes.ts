import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CategoryController } from './category.controller';
import { createCategorySchema, updateCategorySchema } from './category.validation';

const categoryRouter = Router();
const categoryController = new CategoryController();

/**
 * @openapi
 * /categories/tree:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get full hierarchical category tree
 *     description: Returns top-level parent categories with nested children arrays.
 *     responses:
 *       200:
 *         description: Category tree retrieved successfully
 */
categoryRouter.get('/categories/tree', asyncHandler(categoryController.getCategoryTree));

/**
 * @openapi
 * /categories:
 *   get:
 *     tags:
 *       - Categories
 *     summary: List all active categories
 *     description: Returns flat array of active categories.
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
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
 *                 example: Women's Couture
 *               slug:
 *                 type: string
 *                 example: womens-couture
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 example: Luxury evening dresses and haute couture
 *               imageUrl:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1515886657613-9f3515b0c78f
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: ACTIVE
 *               sortOrder:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Category created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Staff access required
 */
categoryRouter.get('/categories', asyncHandler(categoryController.listCategories));
categoryRouter.post(
  '/categories',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createCategorySchema),
  asyncHandler(categoryController.createCategory),
);

/**
 * @openapi
 * /categories/{idOrSlug}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get category by ID or Slug
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
categoryRouter.get('/categories/:idOrSlug', asyncHandler(categoryController.getCategory));

/**
 * @openapi
 * /categories/{id}:
 *   put:
 *     tags:
 *       - Categories
 *     summary: Update category
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
 *               parentId:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *               imageUrl:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *               sortOrder:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Soft delete category
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
 *         description: Category soft-deleted successfully
 *       404:
 *         description: Category not found
 */
categoryRouter.put(
  '/categories/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateCategorySchema),
  asyncHandler(categoryController.updateCategory),
);

categoryRouter.delete(
  '/categories/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(categoryController.deleteCategory),
);

export { categoryRouter };
