"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishlistRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const wishlist_controller_1 = require("./wishlist.controller");
const wishlist_validation_1 = require("./wishlist.validation");
const wishlistRouter = (0, express_1.Router)();
exports.wishlistRouter = wishlistRouter;
const wishlistController = new wishlist_controller_1.WishlistController();
wishlistRouter.use(auth_middleware_1.authenticate);
/**
 * @openapi
 * /wishlist:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get user wishlist
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist details retrieved successfully
 */
wishlistRouter.get('/wishlist', (0, async_handler_util_1.asyncHandler)(wishlistController.getWishlist));
/**
 * @openapi
 * /wishlist/count:
 *   get:
 *     tags:
 *       - Wishlist
 *     summary: Get wishlist item count
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Wishlist item count
 */
wishlistRouter.get('/wishlist/count', (0, async_handler_util_1.asyncHandler)(wishlistController.getWishlistCount));
/**
 * @openapi
 * /wishlist/items:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Add product/variant to wishlist
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *             properties:
 *               productId:
 *                 type: string
 *               variantId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Item added to wishlist successfully
 */
wishlistRouter.post('/wishlist/items', (0, validate_middleware_1.validateRequest)(wishlist_validation_1.addToWishlistSchema), (0, async_handler_util_1.asyncHandler)(wishlistController.addToWishlist));
/**
 * @openapi
 * /wishlist/items/{itemId}:
 *   delete:
 *     tags:
 *       - Wishlist
 *     summary: Remove item from wishlist
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item removed from wishlist
 */
wishlistRouter.delete('/wishlist/items/:itemId', (0, async_handler_util_1.asyncHandler)(wishlistController.removeFromWishlist));
/**
 * @openapi
 * /wishlist/items/{itemId}/move-to-cart:
 *   post:
 *     tags:
 *       - Wishlist
 *     summary: Move wishlist item to cart
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Item moved to cart successfully
 */
wishlistRouter.post('/wishlist/items/:itemId/move-to-cart', (0, async_handler_util_1.asyncHandler)(wishlistController.moveToCart));
