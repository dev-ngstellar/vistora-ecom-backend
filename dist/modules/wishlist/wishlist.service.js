"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistService = void 0;
const cart_repository_1 = require("../../repositories/cart.repository");
const product_repository_1 = require("../../repositories/product.repository");
const wishlist_repository_1 = require("../../repositories/wishlist.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class WishlistService {
    wishlistRepository;
    productRepository;
    cartRepository;
    constructor(wishlistRepository = new wishlist_repository_1.WishlistRepository(), productRepository = new product_repository_1.ProductRepository(), cartRepository = new cart_repository_1.CartRepository()) {
        this.wishlistRepository = wishlistRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
    }
    async getWishlistSummary(userId) {
        const rawWishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
        const items = rawWishlist.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.product.name,
            productSlug: item.product.slug,
            price: item.variant ? Number(item.variant.price) : Number(item.product.price),
            compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
            imageUrl: item.product.images[0]?.imageUrl || '',
            variantId: item.variantId,
            variantSku: item.variant?.sku || null,
            variantColor: item.variant?.color || null,
            variantSize: item.variant?.size || null,
        }));
        return {
            id: rawWishlist.id,
            userId,
            items,
            itemCount: items.length,
        };
    }
    async addToWishlist(userId, input) {
        const product = await this.productRepository.findByIdFull(input.productId);
        if (!product) {
            throw api_error_util_1.ApiError.notFound(`Product with ID '${input.productId}' not found`);
        }
        const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
        await this.wishlistRepository.addItem(wishlist.id, input.productId, input.variantId);
        return this.getWishlistSummary(userId);
    }
    async removeFromWishlist(userId, itemId) {
        const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
        const item = wishlist.items.find((i) => i.id === itemId);
        if (!item) {
            throw api_error_util_1.ApiError.notFound(`Wishlist item '${itemId}' not found in user wishlist`);
        }
        await this.wishlistRepository.removeItem(itemId);
        return this.getWishlistSummary(userId);
    }
    async moveToCart(userId, itemId) {
        const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
        const item = wishlist.items.find((i) => i.id === itemId);
        if (!item) {
            throw api_error_util_1.ApiError.notFound(`Wishlist item '${itemId}' not found in user wishlist`);
        }
        const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        // Add 1 unit to cart
        await this.cartRepository.addOrUpdateCartItem(cart.id, item.productId, item.variantId, 1, unitPrice);
        // Remove from wishlist
        await this.wishlistRepository.removeItem(itemId);
        return this.getWishlistSummary(userId);
    }
    async getItemCount(userId) {
        return this.wishlistRepository.getItemCount(userId);
    }
}
exports.WishlistService = WishlistService;
