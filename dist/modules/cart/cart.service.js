"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const coupon_repository_1 = require("../../repositories/coupon.repository");
const product_repository_1 = require("../../repositories/product.repository");
const cart_repository_1 = require("../../repositories/cart.repository");
const api_error_util_1 = require("../../utils/api-error.util");
const TAX_RATE = 0.08; // 8% sales tax
const STANDARD_SHIPPING_FEE = 15.0; // $15 standard shipping
const FREE_SHIPPING_THRESHOLD = 150.0; // Free shipping for orders >= $150
class CartService {
    cartRepository;
    productRepository;
    couponRepository;
    constructor(cartRepository = new cart_repository_1.CartRepository(), productRepository = new product_repository_1.ProductRepository(), couponRepository = new coupon_repository_1.CouponRepository()) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }
    async getCartSummary(userId) {
        const rawCart = await this.cartRepository.getOrCreateUserCart(userId);
        let subtotal = 0;
        const formattedItems = rawCart.items.map((item) => {
            const currentUnitPrice = item.variant
                ? Number(item.variant.price)
                : Number(item.product.price);
            const availableStock = item.variant ? item.variant.stock : 999;
            const itemTotal = currentUnitPrice * item.quantity;
            subtotal += itemTotal;
            return {
                id: item.id,
                productId: item.productId,
                productName: item.product.name,
                productSlug: item.product.slug,
                imageUrl: item.product.images[0]?.imageUrl || '',
                variantId: item.variantId,
                variantSku: item.variant?.sku || null,
                variantColor: item.variant?.color || null,
                variantSize: item.variant?.size || null,
                quantity: item.quantity,
                unitPrice: currentUnitPrice,
                totalPrice: itemTotal,
                availableStock,
            };
        });
        // Recalculate discount if a coupon is applied
        let discount = 0;
        let validCouponCode = rawCart.couponCode;
        if (validCouponCode) {
            const coupon = await this.couponRepository.findByCode(validCouponCode);
            if (coupon && coupon.status === 'ACTIVE' && new Date() <= coupon.endDate) {
                const minOrder = coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : 0;
                if (subtotal >= minOrder) {
                    if (coupon.type === 'PERCENTAGE') {
                        discount = (subtotal * Number(coupon.value)) / 100;
                        if (coupon.maximumDiscount && discount > Number(coupon.maximumDiscount)) {
                            discount = Number(coupon.maximumDiscount);
                        }
                    }
                    else {
                        discount = Number(coupon.value);
                    }
                    if (discount > subtotal)
                        discount = subtotal;
                }
                else {
                    validCouponCode = null; // Minimum order threshold not met
                }
            }
            else {
                validCouponCode = null; // Expired or invalid coupon
            }
        }
        const taxableAmount = Math.max(0, subtotal - discount);
        const tax = Number((taxableAmount * TAX_RATE).toFixed(2));
        const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
        const shipping = subtotal > 0 ? (freeShippingEligible ? 0 : STANDARD_SHIPPING_FEE) : 0;
        const total = Number((taxableAmount + tax + shipping).toFixed(2));
        // Sync recalculated totals back to cart database record
        await this.cartRepository.updateCartTotals(rawCart.id, {
            subtotal,
            discount,
            tax,
            shipping,
            total,
            couponCode: validCouponCode,
        });
        return {
            id: rawCart.id,
            userId,
            status: rawCart.status,
            couponCode: validCouponCode,
            items: formattedItems,
            subtotal,
            discount,
            tax,
            shipping,
            total,
            itemCount: formattedItems.reduce((acc, item) => acc + item.quantity, 0),
            freeShippingEligible,
            freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        };
    }
    async addToCart(userId, input) {
        const product = await this.productRepository.findByIdFull(input.productId);
        if (!product || product.status === 'DRAFT' || product.status === 'INACTIVE') {
            throw api_error_util_1.ApiError.badRequest('Selected product is currently unavailable or inactive');
        }
        if (product.status === 'OUT_OF_STOCK') {
            throw api_error_util_1.ApiError.badRequest('This product is currently out of stock');
        }
        // Auto-resolve first active variant if product has variants and no variantId was provided
        if (!input.variantId && product.variants && product.variants.length > 0) {
            const defaultVariant = product.variants.find((v) => v.status === 'ACTIVE' && v.stock >= input.quantity) ||
                product.variants[0];
            if (defaultVariant) {
                input.variantId = defaultVariant.id;
            }
        }
        let unitPrice = Number(product.price);
        if (input.variantId) {
            const variant = product.variants.find((v) => v.id === input.variantId);
            if (!variant || variant.status !== 'ACTIVE') {
                throw api_error_util_1.ApiError.badRequest('Selected product variant is unavailable');
            }
            if (variant.stock < input.quantity) {
                throw api_error_util_1.ApiError.badRequest(`Insufficient stock for variant (Available: ${variant.stock})`);
            }
            unitPrice = Number(variant.price);
        }
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        await this.cartRepository.addOrUpdateCartItem(cart.id, input.productId, input.variantId || null, input.quantity, unitPrice);
        return this.getCartSummary(userId);
    }
    async updateCartItemQuantity(userId, itemId, input) {
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        const item = cart.items.find((i) => i.id === itemId);
        if (!item) {
            throw api_error_util_1.ApiError.notFound(`Cart item '${itemId}' not found in user cart`);
        }
        if (item.variant && item.variant.stock < input.quantity) {
            throw api_error_util_1.ApiError.badRequest(`Insufficient stock for variant (Available: ${item.variant.stock})`);
        }
        const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
        await this.cartRepository.updateItemQuantity(itemId, input.quantity, unitPrice);
        return this.getCartSummary(userId);
    }
    async removeCartItem(userId, itemId) {
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        const item = cart.items.find((i) => i.id === itemId);
        if (!item) {
            throw api_error_util_1.ApiError.notFound(`Cart item '${itemId}' not found in user cart`);
        }
        await this.cartRepository.removeCartItem(itemId);
        return this.getCartSummary(userId);
    }
    async clearCart(userId) {
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        await this.cartRepository.clearCart(cart.id);
        return this.getCartSummary(userId);
    }
    async mergeGuestCart(userId, input) {
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        for (const guestItem of input.guestItems) {
            try {
                const product = await this.productRepository.findByIdFull(guestItem.productId);
                if (product && product.status === 'ACTIVE') {
                    const unitPrice = Number(product.price);
                    await this.cartRepository.addOrUpdateCartItem(cart.id, guestItem.productId, guestItem.variantId || null, guestItem.quantity, unitPrice);
                }
            }
            catch {
                // Skip invalid guest items gracefully
            }
        }
        return this.getCartSummary(userId);
    }
    async applyCoupon(userId, code) {
        const coupon = await this.couponRepository.findByCode(code);
        if (!coupon || coupon.status !== 'ACTIVE') {
            throw api_error_util_1.ApiError.badRequest(`Coupon code '${code}' is invalid or inactive`);
        }
        if (new Date() > coupon.endDate) {
            throw api_error_util_1.ApiError.badRequest(`Coupon code '${code}' has expired`);
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            throw api_error_util_1.ApiError.badRequest(`Coupon code '${code}' usage limit reached`);
        }
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        await this.cartRepository.updateCartTotals(cart.id, {
            subtotal: Number(cart.subtotal),
            discount: Number(cart.discount),
            tax: Number(cart.tax),
            shipping: Number(cart.shipping),
            total: Number(cart.total),
            couponCode: coupon.code,
        });
        return this.getCartSummary(userId);
    }
    async removeCoupon(userId) {
        const cart = await this.cartRepository.getOrCreateUserCart(userId);
        await this.cartRepository.updateCartTotals(cart.id, {
            subtotal: Number(cart.subtotal),
            discount: 0,
            tax: Number(cart.tax),
            shipping: Number(cart.shipping),
            total: Number(cart.total),
            couponCode: null,
        });
        return this.getCartSummary(userId);
    }
}
exports.CartService = CartService;
