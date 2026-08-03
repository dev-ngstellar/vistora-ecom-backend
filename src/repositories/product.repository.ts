import {
  Brand,
  Category,
  Collection,
  Product,
  ProductAttribute,
  ProductImage,
  ProductVariant,
  Prisma,
} from '@prisma/client';
import { BaseRepository } from './base.repository';

export type ProductFullDetails = Product & {
  category: Category;
  brand: Brand | null;
  collection: Collection | null;
  images: ProductImage[];
  variants: ProductVariant[];
  attributes: ProductAttribute[];
};

export interface ProductQueryFilters {
  q?: string;
  categoryId?: string;
  brandId?: string;
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  featured?: boolean;
  visibility?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export class ProductRepository extends BaseRepository<Product, Prisma.ProductDelegate> {
  protected readonly model: Prisma.ProductDelegate;

  constructor() {
    super();
    this.model = this.prisma.product;
  }

  public async findBySlug(slug: string): Promise<ProductFullDetails | null> {
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
    }) as Promise<ProductFullDetails | null>;
  }

  public async findByIdFull(id: string): Promise<ProductFullDetails | null> {
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
    }) as Promise<ProductFullDetails | null>;
  }

  public async searchAndFilterProducts(filters: ProductQueryFilters): Promise<{
    products: ProductFullDetails[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      q,
      categoryId,
      brandId,
      collectionId,
      minPrice,
      maxPrice,
      status,
      featured,
      visibility,
      page = 1,
      limit = 12,
      sort = 'created_at_desc',
    } = filters;

    const where: Prisma.ProductWhereInput = {
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
      where.status = status as Prisma.EnumProductStatusFilter;
    }

    if (featured !== undefined) {
      where.featured = featured;
    }

    if (visibility) {
      where.visibility = visibility as Prisma.EnumProductVisibilityFilter;
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' };

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
      }) as Promise<ProductFullDetails[]>,
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

  public async softDelete(id: string): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
