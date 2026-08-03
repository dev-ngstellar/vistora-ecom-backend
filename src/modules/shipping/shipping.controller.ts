import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { ShippingService } from './shipping.service';

export class ShippingController {
  private readonly shippingService: ShippingService;

  constructor(shippingService: ShippingService = new ShippingService()) {
    this.shippingService = shippingService;
  }

  public estimateShipping = async (req: Request, res: Response): Promise<Response> => {
    const { subtotal, postalCode, country } = req.body;
    const estimate = await this.shippingService.estimateShipping({
      subtotal: Number(subtotal) || 0,
      postalCode,
      country,
    });

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Shipping rates estimated successfully',
      estimate,
    );
  };
}
