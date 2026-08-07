import { InventoryRepository } from '../../repositories/inventory.repository';
import { prisma } from '../../config/prisma.config';
import { ApiError } from '../../utils/api-error.util';
import { StockMovementType, InventoryAdjustmentType } from '@prisma/client';

export interface StockAdjustmentInput {
  inventoryId: string;
  action: 'ADD' | 'REMOVE' | 'SET';
  quantity: number;
  reason: 'PURCHASE_RECEIVED' | 'SALES_ORDER' | 'RETURN_RESTOCK' | 'INVENTORY_AUDIT' | 'DAMAGE' | 'MANUAL_ADJUSTMENT';
  lowStockThreshold?: number;
  remarks?: string;
  userId?: string;
}

export class InventoryService {
  private readonly inventoryRepository: InventoryRepository;

  constructor(inventoryRepository: InventoryRepository = new InventoryRepository()) {
    this.inventoryRepository = inventoryRepository;
  }

  public async getInventoryList(filters?: { q?: string; stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' }) {
    return this.inventoryRepository.getInventoryList(filters);
  }

  public async adjustStock(input: StockAdjustmentInput) {
    const inv = await prisma.inventory.findUnique({
      where: { id: input.inventoryId },
      include: { variant: true, product: true },
    });

    if (!inv) {
      throw ApiError.notFound('Inventory record not found');
    }

    const previousStock = inv.availableStock;
    let newStock = previousStock;

    if (input.action === 'ADD') {
      newStock = previousStock + input.quantity;
    } else if (input.action === 'REMOVE') {
      newStock = Math.max(0, previousStock - input.quantity);
    } else if (input.action === 'SET') {
      newStock = Math.max(0, input.quantity);
    }

    const newThreshold = input.lowStockThreshold !== undefined ? input.lowStockThreshold : inv.minimumStock;

    // Map reason to movementType & adjustmentType
    let movementType: StockMovementType = StockMovementType.ADJUSTMENT;
    let adjustmentType: InventoryAdjustmentType = InventoryAdjustmentType.STOCK_IN;

    switch (input.reason) {
      case 'PURCHASE_RECEIVED':
        movementType = StockMovementType.PURCHASE;
        adjustmentType = InventoryAdjustmentType.STOCK_IN;
        break;
      case 'SALES_ORDER':
        movementType = StockMovementType.SALE;
        adjustmentType = InventoryAdjustmentType.STOCK_OUT;
        break;
      case 'RETURN_RESTOCK':
        movementType = StockMovementType.RETURN;
        adjustmentType = InventoryAdjustmentType.RETURNED;
        break;
      case 'DAMAGE':
        movementType = StockMovementType.ADJUSTMENT;
        adjustmentType = InventoryAdjustmentType.DAMAGED;
        break;
      case 'INVENTORY_AUDIT':
      case 'MANUAL_ADJUSTMENT':
      default:
        movementType = StockMovementType.ADJUSTMENT;
        adjustmentType = input.action === 'REMOVE' ? InventoryAdjustmentType.STOCK_OUT : InventoryAdjustmentType.STOCK_IN;
        break;
    }

    // Update Inventory record
    const updatedInv = await prisma.inventory.update({
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
      await prisma.productVariant.update({
        where: { id: inv.variantId },
        data: { stock: newStock },
      });
    }

    return updatedInv;
  }
}
