import { AttributeType, ProductStatus, ProductVisibility, VariantStatus } from '@prisma/client';

export interface ProductImageInput {
  imageUrl: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface ProductVariantInput {
  sku: string;
  barcode?: string | null;
  color?: string | null;
  size?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  imageUrl?: string | null;
  imageUrls?: string[];
  images?: ProductImageInput[];
  status?: VariantStatus;
}

export interface ProductAttributeInput {
  name: string;
  type: AttributeType;
  values: string[];
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  sku: string;
  barcode?: string | null;
  categoryId: string;
  brandId?: string | null;
  collectionId?: string | null;
  costPrice?: number | null;
  price: number;
  compareAtPrice?: number | null;
  taxRate?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  featured?: boolean;
  images?: ProductImageInput[];
  variants?: ProductVariantInput[];
  attributes?: ProductAttributeInput[];
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  sku?: string;
  barcode?: string | null;
  categoryId?: string;
  brandId?: string | null;
  collectionId?: string | null;
  costPrice?: number | null;
  price?: number;
  compareAtPrice?: number | null;
  taxRate?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  featured?: boolean;
  images?: ProductImageInput[];
  variants?: ProductVariantInput[];
  attributes?: ProductAttributeInput[];
}
