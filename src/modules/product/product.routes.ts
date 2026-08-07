import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { ProductController } from './product.controller';
import {
  addProductImageSchema,
  addProductVariantSchema,
  createProductSchema,
  updateProductSchema,
} from './product.validation';

const productRouter = Router();
const productController = new ProductController();

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
productRouter.get('/products', asyncHandler(productController.listProducts));
productRouter.post(
  '/products',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createProductSchema),
  asyncHandler(productController.createProduct),
);

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
productRouter.get('/products/:idOrSlug', asyncHandler(productController.getProduct));

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
productRouter.put(
  '/products/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateProductSchema),
  asyncHandler(productController.updateProduct),
);

productRouter.delete(
  '/products/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(productController.deleteProduct),
);

// Product Images Sub-routes
productRouter.post(
  '/products/:productId/images',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(addProductImageSchema),
  asyncHandler(productController.addProductImage),
);

productRouter.delete(
  '/products/images/:imageId',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(productController.deleteProductImage),
);

// Product Variants Sub-routes
productRouter.post(
  '/products/:productId/variants',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(addProductVariantSchema),
  asyncHandler(productController.addProductVariant),
);

productRouter.delete(
  '/products/variants/:variantId',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(productController.deleteProductVariant),
);

productRouter.post(
  '/products/bulk-action',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(productController.bulkAction),
);

export { productRouter };
