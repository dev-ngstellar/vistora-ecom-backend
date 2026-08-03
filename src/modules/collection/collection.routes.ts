import { UserRole } from '@prisma/client';
import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRoles } from '../../middleware/rbac.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CollectionController } from './collection.controller';
import { createCollectionSchema, updateCollectionSchema } from './collection.validation';

const collectionRouter = Router();
const collectionController = new CollectionController();

/**
 * @openapi
 * /collections:
 *   get:
 *     tags:
 *       - Collections
 *     summary: List all active collections
 *     responses:
 *       200:
 *         description: Collections retrieved successfully
 *   post:
 *     tags:
 *       - Collections
 *     summary: Create a collection
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
 *                 example: Autumn Winter 2026 Lookbook
 *               slug:
 *                 type: string
 *                 example: autumn-winter-2026
 *               description:
 *                 type: string
 *                 example: Seasonal runway collection
 *               bannerImage:
 *                 type: string
 *                 example: https://images.unsplash.com/photo-1490481651871-ab68de25d43d
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *                 example: ACTIVE
 *     responses:
 *       201:
 *         description: Collection created successfully
 */
collectionRouter.get('/collections', asyncHandler(collectionController.listCollections));
collectionRouter.post(
  '/collections',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(createCollectionSchema),
  asyncHandler(collectionController.createCollection),
);

/**
 * @openapi
 * /collections/{idOrSlug}:
 *   get:
 *     tags:
 *       - Collections
 *     summary: Get collection details
 *     parameters:
 *       - in: path
 *         name: idOrSlug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collection details
 */
collectionRouter.get('/collections/:idOrSlug', asyncHandler(collectionController.getCollection));

/**
 * @openapi
 * /collections/{id}:
 *   put:
 *     tags:
 *       - Collections
 *     summary: Update collection
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
 *               description:
 *                 type: string
 *               bannerImage:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE]
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *   delete:
 *     tags:
 *       - Collections
 *     summary: Soft delete collection
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
 *         description: Collection soft-deleted successfully
 */
collectionRouter.put(
  '/collections/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  validateRequest(updateCollectionSchema),
  asyncHandler(collectionController.updateCollection),
);

collectionRouter.delete(
  '/collections/:id',
  authenticate,
  requireRoles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER),
  asyncHandler(collectionController.deleteCollection),
);

export { collectionRouter };
