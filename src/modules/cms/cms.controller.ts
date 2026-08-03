import { Request, Response } from 'express';
import { CMSPageStatus } from '@prisma/client';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CMSService } from './cms.service';

export class CMSController {
  private cmsService: CMSService;

  constructor() {
    this.cmsService = new CMSService();
  }

  public getPages = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      search: req.query.search as string,
      status: req.query.status as CMSPageStatus,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    const result = await this.cmsService.getPages(filters);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'CMS pages retrieved successfully', result.pages, result.meta);
  };

  public getPublicPageBySlug = async (req: Request, res: Response): Promise<Response> => {
    const slug = req.params['slug'] as string;
    const page = await this.cmsService.getPublicPageBySlug(slug);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Public page retrieved successfully', page);
  };

  public getPageById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const page = await this.cmsService.getPageById(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'CMS page retrieved successfully', page);
  };

  public createPage = async (req: Request, res: Response): Promise<Response> => {
    const page = await this.cmsService.createPage(req.body);
    return ApiResponseHandler.created(res, 'CMS page created successfully', page);
  };

  public updatePage = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const page = await this.cmsService.updatePage(id, req.body);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'CMS page updated successfully', page);
  };

  public updateStatus = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const { status } = req.body;
    const updated = await this.cmsService.updateStatus(id, status);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'CMS page status updated successfully', updated);
  };

  public deletePage = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.cmsService.deletePage(id);
    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'CMS page deleted successfully', null);
  };
}
