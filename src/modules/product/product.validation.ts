import { AttributeType, ProductStatus, ProductVisibility, VariantStatus } from '@prisma/client';
import { z } from 'zod';

const productImageSchema = z.object({
  imageUrl: z.string().url('Invalid image URL format'),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

const productVariantSchema = z.object({
  sku: z.string().min(3, 'Variant SKU must be at least 3 characters'),
  barcode: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  weight: z.number().nullable().optional(),
  dimensions: z.string().nullable().optional(),
  price: z.number().positive('Price must be greater than 0'),
  compareAtPrice: z.number().positive().nullable().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  status: z.nativeEnum(VariantStatus).optional().default(VariantStatus.ACTIVE),
});

const productAttributeSchema = z.object({
  name: z.string().min(1, 'Attribute name is required'),
  type: z.nativeEnum(AttributeType),
  values: z.array(z.string()).min(1, 'At least one attribute value is required'),
});

export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters').max(150),
    slug: z.string().optional(),
    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    sku: z.string().min(3, 'SKU must be at least 3 characters'),
    barcode: z.string().nullable().optional(),
    categoryId: z.string({ required_error: 'Category ID is required' }),
    brandId: z.string().nullable().optional(),
    collectionId: z.string().nullable().optional(),
    costPrice: z.number().nonnegative().nullable().optional(),
    price: z.number().positive('Price must be a positive number'),
    compareAtPrice: z.number().positive().nullable().optional(),
    taxRate: z.number().nonnegative().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    metaKeywords: z.string().nullable().optional(),
    status: z.nativeEnum(ProductStatus).optional().default(ProductStatus.DRAFT),
    visibility: z.nativeEnum(ProductVisibility).optional().default(ProductVisibility.PUBLIC),
    featured: z.boolean().optional().default(false),
    images: z.array(productImageSchema).optional().default([]),
    variants: z.array(productVariantSchema).optional().default([]),
    attributes: z.array(productAttributeSchema).optional().default([]),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(150).optional(),
    slug: z.string().optional(),
    shortDescription: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    sku: z.string().min(3).optional(),
    barcode: z.string().nullable().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().nullable().optional(),
    collectionId: z.string().nullable().optional(),
    costPrice: z.number().nonnegative().nullable().optional(),
    price: z.number().positive().optional(),
    compareAtPrice: z.number().positive().nullable().optional(),
    taxRate: z.number().nonnegative().nullable().optional(),
    metaTitle: z.string().nullable().optional(),
    metaDescription: z.string().nullable().optional(),
    metaKeywords: z.string().nullable().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    visibility: z.nativeEnum(ProductVisibility).optional(),
    featured: z.boolean().optional(),
    images: z.array(productImageSchema).optional(),
    variants: z.array(productVariantSchema).optional(),
    attributes: z.array(productAttributeSchema).optional(),
  }),
});

export const addProductImageSchema = z.object({
  params: z.object({
    productId: z.string(),
  }),
  body: productImageSchema,
});

export const addProductVariantSchema = z.object({
  params: z.object({
    productId: z.string(),
  }),
  body: productVariantSchema,
});

export const productQuerySchema = z.object({
  query: z.object({
    q: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    collectionId: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    status: z.nativeEnum(ProductStatus).optional(),
    featured: z
      .enum(['true', 'false'])
      .transform((v) => v === 'true')
      .optional(),
    visibility: z.nativeEnum(ProductVisibility).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(12),
    sort: z
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
