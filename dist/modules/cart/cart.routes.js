"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const async_handler_util_1 = require("../../utils/async-handler.util");
const cart_controller_1 = require("./cart.controller");
const cart_validation_1 = require("./cart.validation");
const cartRouter = (0, express_1.Router)();
exports.cartRouter = cartRouter;
const cartController = new cart_controller_1.CartController();
cartRouter.use(auth_middleware_1.authenticate);
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
cartRouter.get('/cart', (0, async_handler_util_1.asyncHandler)(cartController.getCart));
cartRouter.delete('/cart', (0, async_handler_util_1.asyncHandler)(cartController.clearCart));
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
cartRouter.post('/cart/items', (0, validate_middleware_1.validateRequest)(cart_validation_1.addToCartSchema), (0, async_handler_util_1.asyncHandler)(cartController.addToCart));
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
cartRouter.put('/cart/items/:itemId', (0, validate_middleware_1.validateRequest)(cart_validation_1.updateCartItemSchema), (0, async_handler_util_1.asyncHandler)(cartController.updateCartItem));
cartRouter.delete('/cart/items/:itemId', (0, async_handler_util_1.asyncHandler)(cartController.removeCartItem));
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
cartRouter.post('/cart/merge', (0, validate_middleware_1.validateRequest)(cart_validation_1.mergeGuestCartSchema), (0, async_handler_util_1.asyncHandler)(cartController.mergeGuestCart));
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
cartRouter.post('/cart/coupon', (0, validate_middleware_1.validateRequest)(cart_validation_1.applyCouponSchema), (0, async_handler_util_1.asyncHandler)(cartController.applyCoupon));
cartRouter.delete('/cart/coupon', (0, async_handler_util_1.asyncHandler)(cartController.removeCoupon));
