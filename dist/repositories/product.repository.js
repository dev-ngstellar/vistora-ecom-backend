"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
const base_repository_1 = require("./base.repository");
class ProductRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.product;
    }
    async findBySlug(slug) {
        return this.prisma.product.findFirst({
            where: { slug: slug.toLowerCase(), deletedAt: null },
            include: {
                category: true,
                brand: true,
                collection: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { orderBy: { price: 'asc' } },
                attributes: true,
            },
        });
    }
    async findByIdFull(id) {
        return this.prisma.product.findFirst({
            where: { id, deletedAt: null },
            include: {
                category: true,
                brand: true,
                collection: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { orderBy: { price: 'asc' } },
                attributes: true,
            },
        });
    }
    async searchAndFilterProducts(filters) {
        const { q, categoryId, brandId, collectionId, minPrice, maxPrice, status, featured, visibility, page = 1, limit = 12, sort = 'created_at_desc', } = filters;
        const where = {
            deletedAt: null,
        };
        if (q) {
            where.OR = [
                { name: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { sku: { contains: q, mode: 'insensitive' } },
            ];
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (brandId) {
            where.brandId = brandId;
        }
        if (collectionId) {
            where.collectionId = collectionId;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            where.price = {
                ...(minPrice !== undefined && { gte: minPrice }),
                ...(maxPrice !== undefined && { lte: maxPrice }),
            };
        }
        if (status) {
            where.status = status;
        }
        if (featured !== undefined) {
            where.featured = featured;
        }
        if (visibility) {
            where.visibility = visibility;
        }
        let orderBy = { createdAt: 'desc' };
        switch (sort) {
            case 'price_asc':
                orderBy = { price: 'asc' };
                break;
            case 'price_desc':
                orderBy = { price: 'desc' };
                break;
            case 'name_asc':
                orderBy = { name: 'asc' };
                break;
            case 'name_desc':
                orderBy = { name: 'desc' };
                break;
            case 'created_at_asc':
                orderBy = { createdAt: 'asc' };
                break;
            default:
                orderBy = { createdAt: 'desc' };
                break;
        }
        const skip = (page - 1) * limit;
        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    category: true,
                    brand: true,
                    collection: true,
                    images: { orderBy: { sortOrder: 'asc' } },
                    variants: { orderBy: { price: 'asc' } },
                    attributes: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            products,
            total,
            page,
            limit,
            totalPages,
        };
    }
    async softDelete(id) {
        return this.prisma.product.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.ProductRepository = ProductRepository;
