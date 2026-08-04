"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const wishlist_service_1 = require("./wishlist.service");
class WishlistController {
    wishlistService;
    constructor(wishlistService = new wishlist_service_1.WishlistService()) {
        this.wishlistService = wishlistService;
    }
    getWishlist = async (req, res) => {
        const userId = req.user.id;
        const wishlist = await this.wishlistService.getWishlistSummary(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Wishlist retrieved successfully', wishlist);
    };
    getWishlistCount = async (req, res) => {
        const userId = req.user.id;
        const count = await this.wishlistService.getItemCount(userId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Wishlist count retrieved successfully', { count });
    };
    addToWishlist = async (req, res) => {
        const userId = req.user.id;
        const wishlist = await this.wishlistService.addToWishlist(userId, req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Item added to wishlist successfully', wishlist);
    };
    removeFromWishlist = async (req, res) => {
        const userId = req.user.id;
        const itemId = req.params['itemId'];
        const wishlist = await this.wishlistService.removeFromWishlist(userId, itemId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Item removed from wishlist successfully', wishlist);
    };
    moveToCart = async (req, res) => {
        const userId = req.user.id;
        const itemId = req.params['itemId'];
        const wishlist = await this.wishlistService.moveToCart(userId, itemId);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Item moved to cart successfully', wishlist);
    };
}
exports.WishlistController = WishlistController;
