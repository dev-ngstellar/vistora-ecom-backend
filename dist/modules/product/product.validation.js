"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productQuerySchema = exports.addProductVariantSchema = exports.addProductImageSchema = exports.updateProductSchema = exports.createProductSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const productImageSchema = zod_1.z.object({
    imageUrl: zod_1.z.string().url('Invalid image URL format'),
    altText: zod_1.z.string().nullable().optional(),
    isPrimary: zod_1.z.boolean().optional().default(false),
    sortOrder: zod_1.z.number().int().optional().default(0),
});
const productVariantSchema = zod_1.z.object({
    sku: zod_1.z.string().min(3, 'Variant SKU must be at least 3 characters'),
    barcode: zod_1.z.string().nullable().optional(),
    color: zod_1.z.string().nullable().optional(),
    size: zod_1.z.string().nullable().optional(),
    weight: zod_1.z.number().nullable().optional(),
    dimensions: zod_1.z.string().nullable().optional(),
    price: zod_1.z.number().positive('Price must be greater than 0'),
    compareAtPrice: zod_1.z.number().positive().nullable().optional(),
    stock: zod_1.z.number().int().nonnegative('Stock cannot be negative').default(0),
    status: zod_1.z.nativeEnum(client_1.VariantStatus).optional().default(client_1.VariantStatus.ACTIVE),
});
const productAttributeSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Attribute name is required'),
    type: zod_1.z.nativeEnum(client_1.AttributeType),
    values: zod_1.z.array(zod_1.z.string()).min(1, 'At least one attribute value is required'),
});
exports.createProductSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Product name must be at least 2 characters').max(150),
        slug: zod_1.z.string().optional(),
        shortDescription: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        sku: zod_1.z.string().min(3, 'SKU must be at least 3 characters'),
        barcode: zod_1.z.string().nullable().optional(),
        categoryId: zod_1.z.string({ required_error: 'Category ID is required' }),
        brandId: zod_1.z.string().nullable().optional(),
        collectionId: zod_1.z.string().nullable().optional(),
        costPrice: zod_1.z.number().nonnegative().nullable().optional(),
        price: zod_1.z.number().positive('Price must be a positive number'),
        compareAtPrice: zod_1.z.number().positive().nullable().optional(),
        taxRate: zod_1.z.number().nonnegative().nullable().optional(),
        metaTitle: zod_1.z.string().nullable().optional(),
        metaDescription: zod_1.z.string().nullable().optional(),
        metaKeywords: zod_1.z.string().nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.ProductStatus).optional().default(client_1.ProductStatus.DRAFT),
        visibility: zod_1.z.nativeEnum(client_1.ProductVisibility).optional().default(client_1.ProductVisibility.PUBLIC),
        featured: zod_1.z.boolean().optional().default(false),
        images: zod_1.z.array(productImageSchema).optional().default([]),
        variants: zod_1.z.array(productVariantSchema).optional().default([]),
        attributes: zod_1.z.array(productAttributeSchema).optional().default([]),
    }),
});
exports.updateProductSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(150).optional(),
        slug: zod_1.z.string().optional(),
        shortDescription: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        sku: zod_1.z.string().min(3).optional(),
        barcode: zod_1.z.string().nullable().optional(),
        categoryId: zod_1.z.string().optional(),
        brandId: zod_1.z.string().nullable().optional(),
        collectionId: zod_1.z.string().nullable().optional(),
        costPrice: zod_1.z.number().nonnegative().nullable().optional(),
        price: zod_1.z.number().positive().optional(),
        compareAtPrice: zod_1.z.number().positive().nullable().optional(),
        taxRate: zod_1.z.number().nonnegative().nullable().optional(),
        metaTitle: zod_1.z.string().nullable().optional(),
        metaDescription: zod_1.z.string().nullable().optional(),
        metaKeywords: zod_1.z.string().nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.ProductStatus).optional(),
        visibility: zod_1.z.nativeEnum(client_1.ProductVisibility).optional(),
        featured: zod_1.z.boolean().optional(),
        images: zod_1.z.array(productImageSchema).optional(),
        variants: zod_1.z.array(productVariantSchema).optional(),
        attributes: zod_1.z.array(productAttributeSchema).optional(),
    }),
});
exports.addProductImageSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string(),
    }),
    body: productImageSchema,
});
exports.addProductVariantSchema = zod_1.z.object({
    params: zod_1.z.object({
        productId: zod_1.z.string(),
    }),
    body: productVariantSchema,
});
exports.productQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        q: zod_1.z.string().optional(),
        categoryId: zod_1.z.string().optional(),
        brandId: zod_1.z.string().optional(),
        collectionId: zod_1.z.string().optional(),
        minPrice: zod_1.z.coerce.number().optional(),
        maxPrice: zod_1.z.coerce.number().optional(),
        status: zod_1.z.nativeEnum(client_1.ProductStatus).optional(),
        featured: zod_1.z
            .enum(['true', 'false'])
            .transform((v) => v === 'true')
            .optional(),
        visibility: zod_1.z.nativeEnum(client_1.ProductVisibility).optional(),
        page: zod_1.z.coerce.number().int().positive().optional().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).optional().default(12),
        sort: zod_1.z
            .enum([
            'price_asc',
            'price_desc',
            'name_asc',
            'name_desc',
            'created_at_asc',
            'created_at_desc',
        ])
            .optional()
            .default('created_at_desc'),
    }),
});
