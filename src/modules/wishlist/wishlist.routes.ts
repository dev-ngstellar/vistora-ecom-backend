import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { WishlistController } from './wishlist.controller';
import { addToWishlistSchema } from './wishlist.validation';

const wishlistRouter = Router();
const wishlistController = new WishlistController();

wishlistRouter.use(authenticate);

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
wishlistRouter.get('/wishlist', asyncHandler(wishlistController.getWishlist));

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
wishlistRouter.get('/wishlist/count', asyncHandler(wishlistController.getWishlistCount));

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
wishlistRouter.post(
  '/wishlist/items',
  validateRequest(addToWishlistSchema),
  asyncHandler(wishlistController.addToWishlist),
);

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
wishlistRouter.delete(
  '/wishlist/items/:itemId',
  asyncHandler(wishlistController.removeFromWishlist),
);

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
wishlistRouter.post(
  '/wishlist/items/:itemId/move-to-cart',
  asyncHandler(wishlistController.moveToCart),
);

export { wishlistRouter };
