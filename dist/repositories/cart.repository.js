"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class CartRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.cart;
    }
    async getOrCreateUserCart(userId) {
        let cart = await this.prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                price: true,
                                status: true,
                                images: { select: { imageUrl: true, isPrimary: true }, take: 1 },
                            },
                        },
                        variant: {
                            select: {
                                id: true,
                                sku: true,
                                color: true,
                                size: true,
                                price: true,
                                stock: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!cart) {
            cart = await this.prisma.cart.create({
                data: {
                    userId,
                    status: client_1.CartStatus.ACTIVE,
                },
                include: {
                    items: {
                        include: {
                            product: {
                                select: {
                                    id: true,
                                    name: true,
                                    slug: true,
                                    price: true,
                                    status: true,
                                    images: { select: { imageUrl: true, isPrimary: true }, take: 1 },
                                },
                            },
                            variant: {
                                select: {
                                    id: true,
                                    sku: true,
                                    color: true,
                                    size: true,
                                    price: true,
                                    stock: true,
                                },
                            },
                        },
                    },
                },
            });
        }
        return cart;
    }
    async addOrUpdateCartItem(cartId, productId, variantId, quantity, unitPrice) {
        const existing = await this.prisma.cartItem.findFirst({
            where: {
                cartId,
                productId,
                variantId: variantId || null,
            },
        });
        if (existing) {
            const newQuantity = existing.quantity + quantity;
            return this.prisma.cartItem.update({
                where: { id: existing.id },
                data: {
                    quantity: newQuantity,
                    unitPrice,
                    totalPrice: newQuantity * unitPrice,
                },
            });
        }
        return this.prisma.cartItem.create({
            data: {
                cartId,
                productId,
                variantId: variantId || null,
                quantity,
                unitPrice,
                totalPrice: quantity * unitPrice,
            },
        });
    }
    async updateItemQuantity(itemId, quantity, unitPrice) {
        return this.prisma.cartItem.update({
            where: { id: itemId },
            data: {
                quantity,
                unitPrice,
                totalPrice: quantity * unitPrice,
            },
        });
    }
    async removeCartItem(itemId) {
        return this.prisma.cartItem.delete({
            where: { id: itemId },
        });
    }
    async clearCart(cartId) {
        await this.prisma.cartItem.deleteMany({
            where: { cartId },
        });
        await this.prisma.cart.update({
            where: { id: cartId },
            data: {
                couponCode: null,
                subtotal: 0,
                discount: 0,
                tax: 0,
                shipping: 0,
                total: 0,
            },
        });
    }
    async updateCartTotals(cartId, totals) {
        return this.prisma.cart.update({
            where: { id: cartId },
            data: {
                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                shipping: totals.shipping,
                total: totals.total,
                couponCode: totals.couponCode !== undefined ? totals.couponCode : undefined,
            },
        });
    }
}
exports.CartRepository = CartRepository;
