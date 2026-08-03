import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validate.middleware';
import { asyncHandler } from '../../utils/async-handler.util';
import { CartController } from './cart.controller';
import {
  addToCartSchema,
  applyCouponSchema,
  mergeGuestCartSchema,
  updateCartItemSchema,
} from './cart.validation';

const cartRouter = Router();
const cartController = new CartController();

cartRouter.use(authenticate);

/**
 * @openapi
 * /cart:
 *   get:
 *     tags:
 *       - Cart
 *     summary: Get current user shopping cart
 *     description: Returns shopping cart summary with recalculated subtotal, discount, tax, shipping, and item breakdown.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shopping cart summary retrieved successfully
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Clear shopping cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shopping cart cleared successfully
 */
cartRouter.get('/cart', asyncHandler(cartController.getCart));
cartRouter.delete('/cart', asyncHandler(cartController.clearCart));

/**
 * @openapi
 * /cart/items:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Add product/variant to cart
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
 *                 nullable: true
 *               quantity:
 *                 type: integer
 *                 default: 1
 *     responses:
 *       201:
 *         description: Item added to cart successfully
 */
cartRouter.post(
  '/cart/items',
  validateRequest(addToCartSchema),
  asyncHandler(cartController.addToCart),
);

/**
 * @openapi
 * /cart/items/{itemId}:
 *   put:
 *     tags:
 *       - Cart
 *     summary: Update cart item quantity
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Cart item quantity updated
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Remove item from cart
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
 *         description: Cart item removed
 */
cartRouter.put(
  '/cart/items/:itemId',
  validateRequest(updateCartItemSchema),
  asyncHandler(cartController.updateCartItem),
);

cartRouter.delete('/cart/items/:itemId', asyncHandler(cartController.removeCartItem));

/**
 * @openapi
 * /cart/merge:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Merge guest cart into user cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestItems:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     variantId:
 *                       type: string
 *                     quantity:
 *                       type: integer
 *     responses:
 *       200:
 *         description: Guest cart merged successfully
 */
cartRouter.post(
  '/cart/merge',
  validateRequest(mergeGuestCartSchema),
  asyncHandler(cartController.mergeGuestCart),
);

/**
 * @openapi
 * /cart/coupon:
 *   post:
 *     tags:
 *       - Cart
 *     summary: Apply coupon code to cart
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *                 example: LUXURY20
 *     responses:
 *       200:
 *         description: Coupon applied successfully
 *   delete:
 *     tags:
 *       - Cart
 *     summary: Remove coupon code from cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Coupon removed successfully
 */
cartRouter.post(
  '/cart/coupon',
  validateRequest(applyCouponSchema),
  asyncHandler(cartController.applyCoupon),
);

cartRouter.delete('/cart/coupon', asyncHandler(cartController.removeCoupon));

export { cartRouter };
