import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { BrandService } from './brand.service';

export class BrandController {
  private readonly brandService: BrandService;

  constructor(brandService: BrandService = new BrandService()) {
    this.brandService = brandService;
  }

  public createBrand = async (req: Request, res: Response): Promise<Response> => {
    const brand = await this.brandService.createBrand(req.body);

    return ApiResponseHandler.created(res, 'Brand created successfully', brand);
  };

  public getBrand = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params['idOrSlug'] as string;
    const brand = await this.brandService.getBrandByIdOrSlug(idOrSlug);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Brand retrieved successfully', brand);
  };

  public listBrands = async (_req: Request, res: Response): Promise<Response> => {
    const brands = await this.brandService.listBrands();

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Brands retrieved successfully', brands);
  };

  public updateBrand = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const brand = await this.brandService.updateBrand(id, req.body);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Brand updated successfully', brand);
  };

  public deleteBrand = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.brandService.deleteBrand(id);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Brand soft-deleted successfully', null);
  };
}
