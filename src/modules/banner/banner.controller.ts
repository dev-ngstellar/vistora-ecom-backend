import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { BannerService } from './banner.service';

export class BannerController {
  private bannerService: BannerService;

  constructor() {
    this.bannerService = new BannerService();
  }

  public getBanners = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query.search as string,
      position: req.query.position as string,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await this.bannerService.getBanners(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Banners retrieved successfully', result.banners, result.meta);
  };

  public getActivePublicBanners = async (req: Request, res: Response): Promise<Response> => {
    const position = req.query.position as string;
    const banners = await this.bannerService.getActivePublicBanners(position);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Public banners retrieved successfully', banners);
  };

  public getBannerById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const banner = await this.bannerService.getBannerById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Banner retrieved successfully', banner);
  };

  public createBanner = async (req: Request, res: Response): Promise<Response> => {
    const banner = await this.bannerService.createBanner(req.body);
    return ApiResponseHandler.created(res, 'Banner created successfully', banner);
  };

  public updateBanner = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const banner = await this.bannerService.updateBanner(id, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Banner updated successfully', banner);
  };

  public toggleActiveStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { isActive } = req.body;
    const updated = await this.bannerService.toggleActiveStatus(id, Boolean(isActive));
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Banner status updated successfully', updated);
  };

  public deleteBanner = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.bannerService.deleteBanner(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Banner deleted successfully', null);
  };
}
