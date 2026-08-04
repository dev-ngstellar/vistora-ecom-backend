"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRepository = void 0;
const base_repository_1 = require("./base.repository");
class WishlistRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.wishlist;
    }
    async getOrCreateUserWishlist(userId) {
        let wishlist = await this.prisma.wishlist.findUnique({
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
                                compareAtPrice: true,
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
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!wishlist) {
            wishlist = await this.prisma.wishlist.create({
                data: {
                    userId,
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
                                    compareAtPrice: true,
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
                                },
                            },
                        },
                    },
                },
            });
        }
        return wishlist;
    }
    async addItem(wishlistId, productId, variantId) {
        const existing = await this.prisma.wishlistItem.findFirst({
            where: {
                wishlistId,
                productId,
                variantId: variantId || null,
            },
        });
        if (existing) {
            return existing;
        }
        return this.prisma.wishlistItem.create({
            data: {
                wishlistId,
                productId,
                variantId: variantId || null,
            },
        });
    }
    async removeItem(itemId) {
        return this.prisma.wishlistItem.delete({
            where: { id: itemId },
        });
    }
    async getItemCount(userId) {
        const wishlist = await this.prisma.wishlist.findUnique({
            where: { userId },
            select: {
                _count: {
                    select: { items: true },
                },
            },
        });
        return wishlist?._count.items || 0;
    }
}
exports.WishlistRepository = WishlistRepository;
