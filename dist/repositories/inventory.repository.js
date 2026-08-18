"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryRepository = void 0;
const base_repository_1 = require("./base.repository");
class InventoryRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.inventory;
    }
    async getInventoryList(filters) {
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
                    // 1. Try to find by variantId
                    let inv = await this.prisma.inventory.findUnique({
                        where: { variantId: variant.id },
                        include: {
                            stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                        },
                    });
                    // 2. If not found, try to find by SKU (reconcile variant upgrades/SKU matching)
                    if (!inv) {
                        inv = await this.prisma.inventory.findUnique({
                            where: { sku: variant.sku },
                            include: {
                                stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                            },
                        });
                        if (inv) {
                            inv = await this.prisma.inventory.update({
                                where: { id: inv.id },
                                data: {
                                    variantId: variant.id,
                                    productId: product.id,
                                },
                                include: {
                                    stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                                },
                            });
                        }
                    }
                    // 3. If still not found, create a new one
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
                    else if (inv.sku !== variant.sku) {
                        // Reconcile: variant's SKU has changed, update the inventory SKU to match
                        inv = await this.prisma.inventory.update({
                            where: { id: inv.id },
                            data: { sku: variant.sku },
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
                        stockStatus: inv.availableStock <= 0
                            ? 'OUT_OF_STOCK'
                            : inv.availableStock <= inv.minimumStock
                                ? 'LOW_STOCK'
                                : 'IN_STOCK',
                        updatedAt: inv.updatedAt,
                        stockMovements: inv.stockMovements,
                    });
                }
            }
            else {
                // 1. Try to find by product and variantId null
                let inv = await this.prisma.inventory.findFirst({
                    where: { productId: product.id, variantId: null },
                    include: {
                        stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                    },
                });
                // 2. If not found, try to find by SKU
                if (!inv) {
                    inv = await this.prisma.inventory.findUnique({
                        where: { sku: product.sku },
                        include: {
                            stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                        },
                    });
                    if (inv) {
                        inv = await this.prisma.inventory.update({
                            where: { id: inv.id },
                            data: {
                                productId: product.id,
                                variantId: null,
                            },
                            include: {
                                stockMovements: { orderBy: { createdAt: 'desc' }, take: 5 },
                            },
                        });
                    }
                }
                // 3. If still not found, create a new one
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
                else if (inv.sku !== product.sku) {
                    inv = await this.prisma.inventory.update({
                        where: { id: inv.id },
                        data: { sku: product.sku },
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
                    stockStatus: inv.availableStock <= 0
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
            filtered = filtered.filter((item) => item.productName.toLowerCase().includes(qLower) ||
                item.sku.toLowerCase().includes(qLower) ||
                item.variantName.toLowerCase().includes(qLower));
        }
        if (filters?.stockStatus) {
            filtered = filtered.filter((item) => item.stockStatus === filters.stockStatus);
        }
        return filtered;
    }
}
exports.InventoryRepository = InventoryRepository;
