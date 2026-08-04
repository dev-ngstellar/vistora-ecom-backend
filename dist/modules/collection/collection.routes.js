"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectionRouter = void 0;
const client_1 = require("@prisma/client");
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const collection_controller_1 = require("./collection.controller");
const collection_validation_1 = require("./collection.validation");
const collectionRouter = (0, express_1.Router)();
exports.collectionRouter = collectionRouter;
const collectionController = new collection_controller_1.CollectionController();
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
collectionRouter.get('/collections', (0, async_handler_util_1.asyncHandler)(collectionController.listCollections));
collectionRouter.post('/collections', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(collection_validation_1.createCollectionSchema), (0, async_handler_util_1.asyncHandler)(collectionController.createCollection));
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
collectionRouter.get('/collections/:idOrSlug', (0, async_handler_util_1.asyncHandler)(collectionController.getCollection));
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
collectionRouter.put('/collections/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, validate_middleware_1.validateRequest)(collection_validation_1.updateCollectionSchema), (0, async_handler_util_1.asyncHandler)(collectionController.updateCollection));
collectionRouter.delete('/collections/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRoles)(client_1.UserRole.SUPER_ADMIN, client_1.UserRole.ADMIN, client_1.UserRole.MANAGER), (0, async_handler_util_1.asyncHandler)(collectionController.deleteCollection));
