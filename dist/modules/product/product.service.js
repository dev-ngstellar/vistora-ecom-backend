"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const brand_repository_1 = require("../../repositories/brand.repository");
const category_repository_1 = require("../../repositories/category.repository");
const collection_repository_1 = require("../../repositories/collection.repository");
const product_repository_1 = require("../../repositories/product.repository");
const api_error_util_1 = require("../../utils/api-error.util");
const prisma_config_1 = require("../../config/prisma.config");
class ProductService {
    productRepository;
    categoryRepository;
    brandRepository;
    collectionRepository;
    constructor(productRepository = new product_repository_1.ProductRepository(), categoryRepository = new category_repository_1.CategoryRepository(), brandRepository = new brand_repository_1.BrandRepository(), collectionRepository = new collection_repository_1.CollectionRepository()) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
        this.collectionRepository = collectionRepository;
    }
    async createProduct(input) {
        const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
        const existingSlug = await this.productRepository.findBySlug(slug);
        if (existingSlug) {
            throw api_error_util_1.ApiError.conflict(`Product with slug '${slug}' already exists`);
        }
        const category = await this.categoryRepository.findByIdActive(input.categoryId);
        if (!category) {
            throw api_error_util_1.ApiError.notFound(`Category with ID '${input.categoryId}' not found`);
        }
        if (input.brandId) {
            const brand = await this.brandRepository.findByIdActive(input.brandId);
            if (!brand) {
                throw api_error_util_1.ApiError.notFound(`Brand with ID '${input.brandId}' not found`);
            }
        }
        if (input.collectionId) {
            const collection = await this.collectionRepository.findByIdActive(input.collectionId);
            if (!collection) {
                throw api_error_util_1.ApiError.notFound(`Collection with ID '${input.collectionId}' not found`);
            }
        }
        const createdProduct = await prisma_config_1.prisma.product.create({
            data: {
                name: input.name,
                slug,
                shortDescription: input.shortDescription || null,
                description: input.description || null,
                sku: input.sku,
                barcode: input.barcode || null,
                categoryId: input.categoryId,
                brandId: input.brandId || null,
                collectionId: input.collectionId || null,
                costPrice: input.costPrice || null,
                price: input.price,
                compareAtPrice: input.compareAtPrice || null,
                taxRate: input.taxRate || null,
                metaTitle: input.metaTitle || null,
                metaDescription: input.metaDescription || null,
                metaKeywords: input.metaKeywords || null,
                status: input.status,
                visibility: input.visibility,
                featured: input.featured ?? false,
                images: {
                    create: input.images?.map((img) => ({
                        imageUrl: img.imageUrl,
                        altText: img.altText || null,
                        isPrimary: img.isPrimary ?? false,
                        sortOrder: img.sortOrder ?? 0,
                    })),
                },
                variants: {
                    create: input.variants?.map((v) => ({
                        sku: v.sku,
                        barcode: v.barcode || null,
                        color: v.color || null,
                        size: v.size || null,
                        weight: v.weight || null,
                        dimensions: v.dimensions || null,
                        price: v.price,
                        compareAtPrice: v.compareAtPrice || null,
                        stock: v.stock ?? 0,
                        status: v.status,
                    })),
                },
                attributes: {
                    create: input.attributes?.map((attr) => ({
                        name: attr.name,
                        type: attr.type,
                        values: {
                            create: attr.values.map((val) => ({ value: val })),
                        },
                    })),
                },
            },
            include: {
                category: true,
                brand: true,
                collection: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { orderBy: { price: 'asc' } },
                attributes: true,
            },
        });
        return createdProduct;
    }
    async getProductByIdOrSlug(idOrSlug) {
        const product = (await this.productRepository.findByIdFull(idOrSlug)) ||
            (await this.productRepository.findBySlug(idOrSlug));
        if (!product) {
            throw api_error_util_1.ApiError.notFound(`Product '${idOrSlug}' not found`);
        }
        return product;
    }
    async searchAndFilterProducts(filters) {
        return this.productRepository.searchAndFilterProducts(filters);
    }
    async updateProduct(id, input) {
        const existing = await this.productRepository.findByIdFull(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Product with ID '${id}' not found`);
        }
        let slug = existing.slug;
        if (input.slug || input.name) {
            const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
            if (targetSlug !== existing.slug) {
                const slugOwner = await this.productRepository.findBySlug(targetSlug);
                if (slugOwner && slugOwner.id !== id) {
                    throw api_error_util_1.ApiError.conflict(`Product with slug '${targetSlug}' already exists`);
                }
                slug = targetSlug;
            }
        }
        if (input.categoryId) {
            const category = await this.categoryRepository.findByIdActive(input.categoryId);
            if (!category) {
                throw api_error_util_1.ApiError.notFound(`Category with ID '${input.categoryId}' not found`);
            }
        }
        const updated = await prisma_config_1.prisma.product.update({
            where: { id },
            data: {
                name: input.name,
                slug,
                shortDescription: input.shortDescription,
                description: input.description,
                sku: input.sku,
                barcode: input.barcode,
                categoryId: input.categoryId,
                brandId: input.brandId,
                collectionId: input.collectionId,
                costPrice: input.costPrice,
                price: input.price,
                compareAtPrice: input.compareAtPrice,
                taxRate: input.taxRate,
                metaTitle: input.metaTitle,
                metaDescription: input.metaDescription,
                metaKeywords: input.metaKeywords,
                status: input.status,
                visibility: input.visibility,
                featured: input.featured,
            },
            include: {
                category: true,
                brand: true,
                collection: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: { orderBy: { price: 'asc' } },
                attributes: true,
            },
        });
        return updated;
    }
    async deleteProduct(id) {
        const existing = await this.productRepository.findByIdFull(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Product with ID '${id}' not found`);
        }
        return this.productRepository.softDelete(id);
    }
    async addProductImage(productId, input) {
        const existing = await this.productRepository.findByIdFull(productId);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Product with ID '${productId}' not found`);
        }
        return prisma_config_1.prisma.productImage.create({
            data: {
                productId,
                imageUrl: input.imageUrl,
                altText: input.altText || null,
                isPrimary: input.isPrimary ?? false,
                sortOrder: input.sortOrder ?? 0,
            },
        });
    }
    async deleteProductImage(imageId) {
        const image = await prisma_config_1.prisma.productImage.findUnique({ where: { id: imageId } });
        if (!image) {
            throw api_error_util_1.ApiError.notFound(`Product image with ID '${imageId}' not found`);
        }
        await prisma_config_1.prisma.productImage.delete({ where: { id: imageId } });
    }
    async addProductVariant(productId, input) {
        const existing = await this.productRepository.findByIdFull(productId);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Product with ID '${productId}' not found`);
        }
        const existingSku = await prisma_config_1.prisma.productVariant.findUnique({ where: { sku: input.sku } });
        if (existingSku) {
            throw api_error_util_1.ApiError.conflict(`Variant SKU '${input.sku}' already exists`);
        }
        return prisma_config_1.prisma.productVariant.create({
            data: {
                productId,
                sku: input.sku,
                barcode: input.barcode || null,
                color: input.color || null,
                size: input.size || null,
                weight: input.weight || null,
                dimensions: input.dimensions || null,
                price: input.price,
                compareAtPrice: input.compareAtPrice || null,
                stock: input.stock ?? 0,
                status: input.status,
            },
        });
    }
    async deleteProductVariant(variantId) {
        const variant = await prisma_config_1.prisma.productVariant.findUnique({ where: { id: variantId } });
        if (!variant) {
            throw api_error_util_1.ApiError.notFound(`Variant with ID '${variantId}' not found`);
        }
        await prisma_config_1.prisma.productVariant.delete({ where: { id: variantId } });
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
exports.ProductService = ProductService;
