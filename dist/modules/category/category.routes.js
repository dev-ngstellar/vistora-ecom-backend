"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const category_controller_1 = require("./category.controller");
const category_validation_1 = require("./category.validation");
const categoryRouter = (0, express_1.Router)();
exports.categoryRouter = categoryRouter;
const categoryController = new category_controller_1.CategoryController();
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
categoryRouter.get('/categories/tree', (0, async_handler_util_1.asyncHandler)(categoryController.getCategoryTree));
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
categoryRouter.get('/categories', (0, async_handler_util_1.asyncHandler)(categoryController.listCategories));
categoryRouter.post('/categories', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(category_validation_1.createCategorySchema), (0, async_handler_util_1.asyncHandler)(categoryController.createCategory));
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
categoryRouter.get('/categories/:idOrSlug', (0, async_handler_util_1.asyncHandler)(categoryController.getCategory));
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
categoryRouter.put('/categories/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(category_validation_1.updateCategorySchema), (0, async_handler_util_1.asyncHandler)(categoryController.updateCategory));
categoryRouter.delete('/categories/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(categoryController.deleteCategory));
