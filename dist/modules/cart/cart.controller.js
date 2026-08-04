"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const cart_service_1 = require("./cart.service");
class CartController {
    cartService;
    constructor(cartService = new cart_service_1.CartService()) {
        this.cartService = cartService;
    }
    getCart = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.getCartSummary(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shopping cart retrieved successfully', cart);
    };
    addToCart = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.addToCart(userId, req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Item added to shopping cart successfully', cart);
    };
    updateCartItem = async (req, res) => {
        const userId = req.user.id;
        const itemId = req.params['itemId'];
        const cart = await this.cartService.updateCartItemQuantity(userId, itemId, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Cart item quantity updated successfully', cart);
    };
    removeCartItem = async (req, res) => {
        const userId = req.user.id;
        const itemId = req.params['itemId'];
        const cart = await this.cartService.removeCartItem(userId, itemId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Cart item removed successfully', cart);
    };
    clearCart = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.clearCart(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Shopping cart cleared successfully', cart);
    };
    mergeGuestCart = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.mergeGuestCart(userId, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Guest cart merged successfully', cart);
    };
    applyCoupon = async (req, res) => {
        const userId = req.user.id;
        const { code } = req.body;
        const cart = await this.cartService.applyCoupon(userId, code);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon code applied successfully', cart);
    };
    removeCoupon = async (req, res) => {
        const userId = req.user.id;
        const cart = await this.cartService.removeCoupon(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon code removed successfully', cart);
    };
}
exports.CartController = CartController;
