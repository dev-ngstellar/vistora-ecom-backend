import { Product, ProductImage, ProductVariant } from '@prisma/client';
import { BrandRepository } from '../../repositories/brand.repository';
import { CategoryRepository } from '../../repositories/category.repository';
import { CollectionRepository } from '../../repositories/collection.repository';
import {
  ProductFullDetails,
  ProductQueryFilters,
  ProductRepository,
} from '../../repositories/product.repository';
import { ApiError } from '../../utils/api-error.util';
import { prisma } from '../../config/prisma.config';
import {
  CreateProductInput,
  ProductImageInput,
  ProductVariantInput,
  UpdateProductInput,
} from './product.types';

export class ProductService {
  private readonly productRepository: ProductRepository;
  private readonly categoryRepository: CategoryRepository;
  private readonly brandRepository: BrandRepository;
  private readonly collectionRepository: CollectionRepository;

  constructor(
    productRepository: ProductRepository = new ProductRepository(),
    categoryRepository: CategoryRepository = new CategoryRepository(),
    brandRepository: BrandRepository = new BrandRepository(),
    collectionRepository: CollectionRepository = new CollectionRepository(),
  ) {
    this.productRepository = productRepository;
    this.categoryRepository = categoryRepository;
    this.brandRepository = brandRepository;
    this.collectionRepository = collectionRepository;
  }

  public async createProduct(input: CreateProductInput): Promise<ProductFullDetails> {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);

    const existingSlug = await this.productRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(`Product with slug '${slug}' already exists`);
    }

    const category = await this.categoryRepository.findByIdActive(input.categoryId);
    if (!category) {
      throw ApiError.notFound(`Category with ID '${input.categoryId}' not found`);
    }

    if (input.brandId) {
      const brand = await this.brandRepository.findByIdActive(input.brandId);
      if (!brand) {
        throw ApiError.notFound(`Brand with ID '${input.brandId}' not found`);
      }
    }

    if (input.collectionId) {
      const collection = await this.collectionRepository.findByIdActive(input.collectionId);
      if (!collection) {
        throw ApiError.notFound(`Collection with ID '${input.collectionId}' not found`);
      }
    }

    const createdProduct = await prisma.product.create({
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

    return createdProduct as ProductFullDetails;
  }

  public async getProductByIdOrSlug(idOrSlug: string): Promise<ProductFullDetails> {
    const product =
      (await this.productRepository.findByIdFull(idOrSlug)) ||
      (await this.productRepository.findBySlug(idOrSlug));

    if (!product) {
      throw ApiError.notFound(`Product '${idOrSlug}' not found`);
    }

    return product;
  }

  public async searchAndFilterProducts(filters: ProductQueryFilters) {
    return this.productRepository.searchAndFilterProducts(filters);
  }

  public async updateProduct(id: string, input: UpdateProductInput): Promise<ProductFullDetails> {
    const existing = await this.productRepository.findByIdFull(id);
    if (!existing) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (input.slug || input.name) {
      const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name!);
      if (targetSlug !== existing.slug) {
        const slugOwner = await this.productRepository.findBySlug(targetSlug);
        if (slugOwner && slugOwner.id !== id) {
          throw ApiError.conflict(`Product with slug '${targetSlug}' already exists`);
        }
        slug = targetSlug;
      }
    }

    if (input.categoryId) {
      const category = await this.categoryRepository.findByIdActive(input.categoryId);
      if (!category) {
        throw ApiError.notFound(`Category with ID '${input.categoryId}' not found`);
      }
    }

    const updated = await prisma.product.update({
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

    return updated as ProductFullDetails;
  }

  public async deleteProduct(id: string): Promise<Product> {
    const existing = await this.productRepository.findByIdFull(id);
    if (!existing) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }

    return this.productRepository.softDelete(id);
  }

  public async addProductImage(productId: string, input: ProductImageInput): Promise<ProductImage> {
    const existing = await this.productRepository.findByIdFull(productId);
    if (!existing) {
      throw ApiError.notFound(`Product with ID '${productId}' not found`);
    }

    return prisma.productImage.create({
      data: {
        productId,
        imageUrl: input.imageUrl,
        altText: input.altText || null,
        isPrimary: input.isPrimary ?? false,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  }

  public async deleteProductImage(imageId: string): Promise<void> {
    const image = await prisma.productImage.findUnique({ where: { id: imageId } });
    if (!image) {
      throw ApiError.notFound(`Product image with ID '${imageId}' not found`);
    }

    await prisma.productImage.delete({ where: { id: imageId } });
  }

  public async addProductVariant(
    productId: string,
    input: ProductVariantInput,
  ): Promise<ProductVariant> {
    const existing = await this.productRepository.findByIdFull(productId);
    if (!existing) {
      throw ApiError.notFound(`Product with ID '${productId}' not found`);
    }

    const existingSku = await prisma.productVariant.findUnique({ where: { sku: input.sku } });
    if (existingSku) {
      throw ApiError.conflict(`Variant SKU '${input.sku}' already exists`);
    }

    return prisma.productVariant.create({
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

  public async deleteProductVariant(variantId: string): Promise<void> {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant) {
      throw ApiError.notFound(`Variant with ID '${variantId}' not found`);
    }

    await prisma.productVariant.delete({ where: { id: variantId } });
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
