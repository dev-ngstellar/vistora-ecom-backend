"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const inventory_repository_1 = require("../../repositories/inventory.repository");
const prisma_config_1 = require("../../config/prisma.config");
const api_error_util_1 = require("../../utils/api-error.util");
const client_1 = require("@prisma/client");
class InventoryService {
    inventoryRepository;
    constructor(inventoryRepository = new inventory_repository_1.InventoryRepository()) {
        this.inventoryRepository = inventoryRepository;
    }
    async getInventoryList(filters) {
        return this.inventoryRepository.getInventoryList(filters);
    }
    async adjustStock(input) {
        const inv = await prisma_config_1.prisma.inventory.findUnique({
            where: { id: input.inventoryId },
            include: { variant: true, product: true },
        });
        if (!inv) {
            throw api_error_util_1.ApiError.notFound('Inventory record not found');
        }
        const previousStock = inv.availableStock;
        let newStock = previousStock;
        if (input.action === 'ADD') {
            newStock = previousStock + input.quantity;
        }
        else if (input.action === 'REMOVE') {
            newStock = Math.max(0, previousStock - input.quantity);
        }
        else if (input.action === 'SET') {
            newStock = Math.max(0, input.quantity);
        }
        const newThreshold = input.lowStockThreshold !== undefined ? input.lowStockThreshold : inv.minimumStock;
        // Map reason to movementType & adjustmentType
        let movementType = client_1.StockMovementType.ADJUSTMENT;
        let adjustmentType = client_1.InventoryAdjustmentType.STOCK_IN;
        switch (input.reason) {
            case 'PURCHASE_RECEIVED':
                movementType = client_1.StockMovementType.PURCHASE;
                adjustmentType = client_1.InventoryAdjustmentType.STOCK_IN;
                break;
            case 'SALES_ORDER':
                movementType = client_1.StockMovementType.SALE;
                adjustmentType = client_1.InventoryAdjustmentType.STOCK_OUT;
                break;
            case 'RETURN_RESTOCK':
                movementType = client_1.StockMovementType.RETURN;
                adjustmentType = client_1.InventoryAdjustmentType.RETURNED;
                break;
            case 'DAMAGE':
                movementType = client_1.StockMovementType.ADJUSTMENT;
                adjustmentType = client_1.InventoryAdjustmentType.DAMAGED;
                break;
            case 'INVENTORY_AUDIT':
            case 'MANUAL_ADJUSTMENT':
            default:
                movementType = client_1.StockMovementType.ADJUSTMENT;
                adjustmentType = input.action === 'REMOVE' ? client_1.InventoryAdjustmentType.STOCK_OUT : client_1.InventoryAdjustmentType.STOCK_IN;
                break;
        }
        // Update Inventory record
        const updatedInv = await prisma_config_1.prisma.inventory.update({
            where: { id: inv.id },
            data: {
                availableStock: newStock,
                minimumStock: newThreshold,
                stockMovements: {
                    create: {
                        movementType,
                        quantity: Math.abs(newStock - previousStock),
                        previousStock,
                        currentStock: newStock,
                        remarks: input.remarks || `Reason: ${input.reason}`,
                        createdBy: input.userId || 'System Admin',
                    },
                },
                adjustments: {
                    create: {
                        adjustmentType,
                        quantity: Math.abs(newStock - previousStock),
                        reason: input.reason,
                        adjustedBy: input.userId || 'System Admin',
                    },
                },
            },
            include: {
                stockMovements: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        // Also sync product variant or product stock
        if (inv.variantId) {
            await prisma_config_1.prisma.productVariant.update({
                where: { id: inv.variantId },
                data: { stock: newStock },
            });
        }
        return updatedInv;
    }
}
exports.InventoryService = InventoryService;
