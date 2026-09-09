import { Product, ProductImage, ProductVariant, PrismaClient } from '@prisma/client';
import { ProductRepository, ProductFullDetails, ProductQueryFilters } from '../../repositories/product.repository';
import { CategoryRepository } from '../../repositories/category.repository';
import { CreateProductInput, UpdateProductInput, ProductImageInput, ProductVariantInput } from './product.types';
import { ApiError } from '../../utils/api-error.util';

const prisma = new PrismaClient();

export class ProductService {
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;

  constructor() {
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
  }

  public async createProduct(input: CreateProductInput): Promise<ProductFullDetails> {
    const category = await this.categoryRepository.findByIdActive(input.categoryId);
    if (!category) {
      throw ApiError.notFound(`Category with ID '${input.categoryId}' not found`);
    }

    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
    const existing = await this.productRepository.findBySlug(slug);
    if (existing) {
      throw ApiError.conflict(`Product with slug '${slug}' already exists`);
    }

    const product = await prisma.product.create({
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
        images: {
          create: input.images?.map((img, index) => ({
            imageUrl: img.imageUrl,
            altText: img.altText || null,
            isPrimary: img.isPrimary ?? index === 0,
            sortOrder: img.sortOrder ?? index,
          })) || [],
        },
        variants: {
          create: input.variants?.map((v) => {
            const vUrls: string[] = (v as any).imageUrls && (v as any).imageUrls.length > 0
              ? (v as any).imageUrls
              : (v as any).imageUrl
                ? [(v as any).imageUrl]
                : [];

            return {
              sku: v.sku,
              barcode: v.barcode || null,
              color: v.color || null,
              colorHex: (v as any).colorHex || null,
              size: v.size || null,
              weight: v.weight || null,
              dimensions: v.dimensions || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock ?? 0,
              imageUrl: vUrls[0] || null,
              status: v.status || 'ACTIVE',
              images: {
                create: vUrls.map((url, imgIdx) => ({
                  imageUrl: url,
                  isPrimary: imgIdx === 0,
                  sortOrder: imgIdx,
                })),
              },
            };
          }) || [],
        },
      },
      include: {
        category: true,
        brand: true,
        collection: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          orderBy: { price: 'asc' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        },
        attributes: true,
      },
    });

    // Auto-create inventory for each created variant
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        await prisma.inventory.create({
          data: {
            productId: product.id,
            variantId: variant.id,
            sku: variant.sku,
            availableStock: variant.stock ?? 0,
            minimumStock: 5,
            reorderLevel: 10,
          },
        });
      }
    }

    return product as ProductFullDetails;
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

  public async updateProduct(id: string, input: UpdateProductInput & { images?: ProductImageInput[]; variants?: ProductVariantInput[] }): Promise<ProductFullDetails> {
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

    // Optional image sync
    if (input.images && Array.isArray(input.images)) {
      await prisma.productImage.deleteMany({ where: { productId: id } });
      for (let index = 0; index < input.images.length; index++) {
        const img = input.images[index];
        if (!img || !img.imageUrl) continue;
        await prisma.productImage.create({
          data: {
            productId: id,
            imageUrl: img.imageUrl,
            altText: img.altText || null,
            isPrimary: img.isPrimary ?? index === 0,
            sortOrder: img.sortOrder ?? index,
          },
        });
      }
    }

    // Optional variant sync
    if (input.variants && Array.isArray(input.variants)) {
      const existingVariants = await prisma.productVariant.findMany({
        where: { productId: id },
        include: { images: true },
      });

      const inputVariantIds = input.variants.map((v: any) => v.id).filter(Boolean);
      const inputSkus = input.variants.map((v) => v.sku).filter(Boolean);

      const variantsToDelete = existingVariants.filter(
        (ev) => !inputVariantIds.includes(ev.id) && !inputSkus.includes(ev.sku)
      );
      for (const toDelete of variantsToDelete) {
        try {
          await prisma.productVariantImage.deleteMany({ where: { variantId: toDelete.id } });
          await prisma.inventory.deleteMany({ where: { variantId: toDelete.id } });
          await prisma.productVariant.delete({ where: { id: toDelete.id } });
        } catch {
          await prisma.productVariant.update({
            where: { id: toDelete.id },
            data: { status: 'INACTIVE' },
          });
        }
      }

      for (const v of input.variants) {
        const vUrls: string[] = (v as any).imageUrls && (v as any).imageUrls.length > 0
          ? (v as any).imageUrls
          : (v as any).imageUrl
            ? [(v as any).imageUrl]
            : [];

        const existingVar = existingVariants.find(
          (ev) => ((v as any).id && ev.id === (v as any).id) || ev.sku === v.sku
        );

        let targetVariantId: string;

        if (existingVar) {
          targetVariantId = existingVar.id;
          await prisma.productVariant.update({
            where: { id: existingVar.id },
            data: {
              sku: v.sku,
              barcode: v.barcode || null,
              color: v.color || null,
              colorHex: (v as any).colorHex || null,
              size: v.size || null,
              weight: v.weight || null,
              dimensions: v.dimensions || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock ?? 0,
              imageUrl: vUrls[0] || null,
              status: v.status || 'ACTIVE',
            },
          });
        } else {
          const newVar = await prisma.productVariant.create({
            data: {
              productId: id,
              sku: v.sku,
              barcode: v.barcode || null,
              color: v.color || null,
              colorHex: (v as any).colorHex || null,
              size: v.size || null,
              weight: v.weight || null,
              dimensions: v.dimensions || null,
              price: v.price,
              compareAtPrice: v.compareAtPrice || null,
              stock: v.stock ?? 0,
              imageUrl: vUrls[0] || null,
              status: v.status || 'ACTIVE',
            },
          });
          targetVariantId = newVar.id;
        }

        await prisma.productVariantImage.deleteMany({ where: { variantId: targetVariantId } });
        for (let imgIdx = 0; imgIdx < vUrls.length; imgIdx++) {
          const url = vUrls[imgIdx];
          if (!url) continue;
          await prisma.productVariantImage.create({
            data: {
              variantId: targetVariantId,
              imageUrl: url,
              isPrimary: imgIdx === 0,
              sortOrder: imgIdx,
            },
          });
        }
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
        variants: {
          orderBy: { price: 'asc' },
          include: { images: { orderBy: { sortOrder: 'asc' } } },
        },
        attributes: true,
      },
    });

    return updated as ProductFullDetails;
  }

  public async bulkAction(action: string, productIds: string[], targetId?: string): Promise<number> {
    if (!productIds || productIds.length === 0) {
      throw ApiError.badRequest('No product IDs provided for bulk action');
    }

    switch (action) {
      case 'DELETE': {
        // Hard delete related entities first to avoid FK constraint violations
        await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
        await prisma.cartItem.deleteMany({ where: { productId: { in: productIds } } });
        await prisma.wishlistItem.deleteMany({ where: { productId: { in: productIds } } });
        await prisma.inventory.deleteMany({ where: { productId: { in: productIds } } });
        
        const variants = await prisma.productVariant.findMany({ where: { productId: { in: productIds } }, select: { id: true } });
        const variantIds = variants.map(v => v.id);
        if (variantIds.length > 0) {
          await prisma.productVariantImage.deleteMany({ where: { variantId: { in: variantIds } } });
          await prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } });
        }

        await prisma.productImage.deleteMany({ where: { productId: { in: productIds } } });
        await prisma.productAttributeValue.deleteMany({ where: { attribute: { productId: { in: productIds } } } });
        await prisma.productAttribute.deleteMany({ where: { productId: { in: productIds } } });
        await prisma.review.deleteMany({ where: { productId: { in: productIds } } });

        const res = await prisma.product.deleteMany({
          where: { id: { in: productIds } },
        });
        return res.count;
      }
      case 'ACTIVATE': {
        const res = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'ACTIVE' },
        });
        return res.count;
      }
      case 'DEACTIVATE': {
        const res = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { status: 'INACTIVE' },
        });
        return res.count;
      }
      case 'ASSIGN_CATEGORY': {
        if (!targetId) throw ApiError.badRequest('Category ID required for category assignment');
        const res = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { categoryId: targetId },
        });
        return res.count;
      }
      case 'ASSIGN_BRAND': {
        if (!targetId) throw ApiError.badRequest('Brand ID required for brand assignment');
        const res = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { brandId: targetId },
        });
        return res.count;
      }
      default:
        throw ApiError.badRequest(`Unsupported bulk action '${action}'`);
    }
  }

  public async deleteProduct(id: string): Promise<Product> {
    const existing = await this.productRepository.findByIdFull(id);
    if (!existing) {
      throw ApiError.notFound(`Product with ID '${id}' not found`);
    }

    // Hard delete related entities first to ensure permanent deletion
    await prisma.orderItem.deleteMany({ where: { productId: id } });
    await prisma.cartItem.deleteMany({ where: { productId: id } });
    await prisma.wishlistItem.deleteMany({ where: { productId: id } });
    await prisma.inventory.deleteMany({ where: { productId: id } });

    const variants = await prisma.productVariant.findMany({ where: { productId: id }, select: { id: true } });
    const variantIds = variants.map(v => v.id);
    if (variantIds.length > 0) {
      await prisma.productVariantImage.deleteMany({ where: { variantId: { in: variantIds } } });
      await prisma.productVariant.deleteMany({ where: { id: { in: variantIds } } });
    }

    await prisma.productImage.deleteMany({ where: { productId: id } });
    await prisma.productAttributeValue.deleteMany({ where: { attribute: { productId: id } } });
    await prisma.productAttribute.deleteMany({ where: { productId: id } });
    await prisma.review.deleteMany({ where: { productId: id } });

    return prisma.product.delete({
      where: { id },
    });
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
