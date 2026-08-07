import { Inventory, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export class InventoryRepository extends BaseRepository<Inventory, Prisma.InventoryDelegate> {
  protected readonly model: Prisma.InventoryDelegate;

  constructor() {
    super();
    this.model = this.prisma.inventory;
  }

  public async getInventoryList(filters?: {
    q?: string;
    stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  }) {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
      include: {
        category: true,
        brand: true,
        variants: { orderBy: { sku: 'asc' } },
        inventories: {
          include: {
            stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    // Ensure each product/variant has an inventory record
    const result = [];
    for (const product of products) {
      if (product.variants && product.variants.length > 0) {
        for (const variant of product.variants) {
          let inv = await this.prisma.inventory.findUnique({
            where: { variantId: variant.id },
            include: {
              stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          });

          if (!inv) {
            inv = await this.prisma.inventory.create({
              data: {
                productId: product.id,
                variantId: variant.id,
                sku: variant.sku,
                availableStock: variant.stock,
                reservedStock: 0,
                soldStock: 0,
                minimumStock: 10,
              },
              include: {
                stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
              },
            });
          }

          result.push({
            id: inv.id,
            productId: product.id,
            productName: product.name,
            variantId: variant.id,
            variantName: `${variant.color || ''} ${variant.size || ''}`.trim() || variant.sku,
            sku: variant.sku,
            categoryName: product.category?.name || 'General',
            brandName: product.brand?.name || 'Unbranded',
            price: Number(variant.price),
            availableStock: inv.availableStock,
            reservedStock: inv.reservedStock,
            soldStock: inv.soldStock,
            lowStockThreshold: inv.minimumStock,
            stockStatus:
              inv.availableStock <= 0
                ? 'OUT_OF_STOCK'
                : inv.availableStock <= inv.minimumStock
                ? 'LOW_STOCK'
                : 'IN_STOCK',
            updatedAt: inv.updatedAt,
            stockMovements: inv.stockMovements,
          });
        }
      } else {
        let inv = await this.prisma.inventory.findFirst({
          where: { productId: product.id, variantId: null },
          include: {
            stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
          },
        });

        if (!inv) {
          inv = await this.prisma.inventory.create({
            data: {
              productId: product.id,
              variantId: null,
              sku: product.sku,
              availableStock: 0,
              reservedStock: 0,
              soldStock: 0,
              minimumStock: 10,
            },
            include: {
              stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
          });
        }

        result.push({
          id: inv.id,
          productId: product.id,
          productName: product.name,
          variantId: null,
          variantName: 'Standard',
          sku: product.sku,
          categoryName: product.category?.name || 'General',
          brandName: product.brand?.name || 'Unbranded',
          price: Number(product.price),
          availableStock: inv.availableStock,
          reservedStock: inv.reservedStock,
          soldStock: inv.soldStock,
          lowStockThreshold: inv.minimumStock,
          stockStatus:
            inv.availableStock <= 0
              ? 'OUT_OF_STOCK'
              : inv.availableStock <= inv.minimumStock
              ? 'LOW_STOCK'
              : 'IN_STOCK',
          updatedAt: inv.updatedAt,
          stockMovements: inv.stockMovements,
        });
      }
    }

    // Filter by keyword if provided
    let filtered = result;
    if (filters?.q) {
      const qLower = filters.q.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.productName.toLowerCase().includes(qLower) ||
          item.sku.toLowerCase().includes(qLower) ||
          item.variantName.toLowerCase().includes(qLower)
      );
    }

    if (filters?.stockStatus) {
      filtered = filtered.filter((item) => item.stockStatus === filters.stockStatus);
    }

    return filtered;
  }
}
