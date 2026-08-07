import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { InventoryService } from './inventory.service';

export class InventoryController {
  private readonly inventoryService: InventoryService;

  constructor(inventoryService: InventoryService = new InventoryService()) {
    this.inventoryService = inventoryService;
  }

  public getInventoryList = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      q: req.query['q'] as string,
      stockStatus: req.query['stockStatus'] as 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK',
    };

    const items = await this.inventoryService.getInventoryList(filters);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Inventory list retrieved successfully', items);
  };

  public adjustStock = async (req: Request, res: Response): Promise<Response> => {
    const updated = await this.inventoryService.adjustStock({
      ...req.body,
      userId: (req as any).user?.id || 'System Admin',
    });

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Stock adjusted successfully', updated);
  };
}
