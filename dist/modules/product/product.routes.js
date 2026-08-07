"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const product_controller_1 = require("./product.controller");
const product_validation_1 = require("./product.validation");
const productRouter = (0, express_1.Router)();
exports.productRouter = productRouter;
const productController = new product_controller_1.ProductController();
/**
 * @openapi
 * /products:
 *   get:
 *     tags:
 *       - Products
 *     summary: Search, filter, and list products
 *     description: Public product search and filter endpoint supporting keyword search, category, brand, collection, price range, sorting, and pagination.
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search keyword (matches name, description, or SKU)
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *       - in: query
 *         name: brandId
 *         schema:
 *           type: string
 *       - in: query
 *         name: collectionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK, ARCHIVED]
 *       - in: query
 *         name: featured
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, name_asc, name_desc, created_at_asc, created_at_desc]
 *           default: created_at_desc
 *     responses:
 *       200:
 *         description: Paginated product list with metadata
 *   post:
 *     tags:
 *       - Products
 *     summary: Create a product
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
 *               - sku
 *               - categoryId
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: Italian Silk Evening Gown
 *               slug:
 *                 type: string
 *                 example: italian-silk-evening-gown
 *               sku:
 *                 type: string
 *                 example: VIS-DRS-001
 *               categoryId:
 *                 type: string
 *               price:
 *                 type: number
 *                 example: 890.00
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, INACTIVE, OUT_OF_STOCK, ARCHIVED]
 *                 example: ACTIVE
 *               images:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       example: https://images.unsplash.com/photo-1539109136881-3be0616acf4b
 *                     isPrimary:
 *                       type: boolean
 *                       example: true
 *               variants:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     sku:
 *                       type: string
 *                       example: VIS-DRS-001-RED-M
 *                     color:
 *                       type: string
 *                       example: Crimson Red
 *                     size:
 *                       type: string
 *                       example: M
 *                     price:
 *                       type: number
 *                       example: 890.00
 *                     stock:
 *                       type: integer
 *                       example: 25
 *     responses:
 *       201:
 *         description: Product created successfully
 */
productRouter.get('/products', (0, async_handler_util_1.asyncHandler)(productController.listProducts));
productRouter.post('/products', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(product_validation_1.createProductSchema), (0, async_handler_util_1.asyncHandler)(productController.createProduct));
/**
 * @openapi
 * /products/{idOrSlug}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get full product details by ID or Slug
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Full product details with images, variants, and attributes
 *       404:
 *         description: Product not found
 */
productRouter.get('/products/:idOrSlug', (0, async_handler_util_1.asyncHandler)(productController.getProduct));
/**
 * @openapi
 * /products/{id}:
 *   put:
 *     tags:
 *       - Products
 *     summary: Update product
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
 *         description: Product updated successfully
 *   delete:
 *     tags:
 *       - Products
 *     summary: Soft delete product
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
 *         description: Product soft-deleted successfully
 */
productRouter.put('/products/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(product_validation_1.updateProductSchema), (0, async_handler_util_1.asyncHandler)(productController.updateProduct));
productRouter.delete('/products/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(productController.deleteProduct));
// Product Images Sub-routes
productRouter.post('/products/:productId/images', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(product_validation_1.addProductImageSchema), (0, async_handler_util_1.asyncHandler)(productController.addProductImage));
productRouter.delete('/products/images/:imageId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(productController.deleteProductImage));
// Product Variants Sub-routes
productRouter.post('/products/:productId/variants', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(product_validation_1.addProductVariantSchema), (0, async_handler_util_1.asyncHandler)(productController.addProductVariant));
productRouter.delete('/products/variants/:variantId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(productController.deleteProductVariant));
productRouter.post('/products/bulk-action', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(productController.bulkAction));
