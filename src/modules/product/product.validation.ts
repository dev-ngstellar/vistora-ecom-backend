import { AttributeType, ProductStatus, ProductVisibility, VariantStatus } from '@prisma/client';
import { z } from 'zod';

const coercedNumber = z.coerce.number().nonnegative();
const coercedNullableNumber = z.preprocess(
  (val) => (val === null || val === '' || val === undefined ? null : Number(val)),
  z.number().nonnegative().nullable().optional()
);

const productImageSchema = z.object({
  imageUrl: z.string().min(1, 'Image URL or path is required'),
  altText: z.string().nullable().optional(),
  isPrimary: z.boolean().optional().default(false),
  sortOrder: z.number().int().optional().default(0),
});

const productVariantSchema = z.object({
  sku: z.string().min(1, 'Variant SKU is required'),
  barcode: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  size: z.string().nullable().optional(),
  weight: coercedNullableNumber,
  dimensions: z.string().nullable().optional(),
  price: coercedNumber.optional().default(0),
  compareAtPrice: coercedNullableNumber,
  stock: z.coerce.number().int().nonnegative().optional().default(0),
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
    sku: z.string().min(1, 'SKU is required'),
    barcode: z.string().nullable().optional(),
    categoryId: z.string({ required_error: 'Category ID is required' }),
    brandId: z.string().nullable().optional(),
    collectionId: z.string().nullable().optional(),
    costPrice: coercedNullableNumber,
    price: coercedNumber,
    compareAtPrice: coercedNullableNumber,
    taxRate: coercedNullableNumber,
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
    sku: z.string().min(1).optional(),
    barcode: z.string().nullable().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().nullable().optional(),
    collectionId: z.string().nullable().optional(),
    costPrice: coercedNullableNumber,
    price: coercedNumber.optional(),
    compareAtPrice: coercedNullableNumber,
    taxRate: coercedNullableNumber,
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
