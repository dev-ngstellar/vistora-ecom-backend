import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CategoryService } from './category.service';

export class CategoryController {
  private readonly categoryService: CategoryService;

  constructor(categoryService: CategoryService = new CategoryService()) {
    this.categoryService = categoryService;
  }

  public createCategory = async (req: Request, res: Response): Promise<Response> => {
    const category = await this.categoryService.createCategory(req.body);

    return ApiResponseHandler.created(res, 'Category created successfully', category);
  };

  public getCategory = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params['idOrSlug'] as string;
    const category = await this.categoryService.getCategoryByIdOrSlug(idOrSlug);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Category retrieved successfully',
      category,
    );
  };

  public listCategories = async (_req: Request, res: Response): Promise<Response> => {
    const categories = await this.categoryService.listCategories();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Categories retrieved successfully',
      categories,
    );
  };

  public getCategoryTree = async (_req: Request, res: Response): Promise<Response> => {
    const tree = await this.categoryService.getCategoryTree();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Category hierarchy tree retrieved successfully',
      tree,
    );
  };

  public updateCategory = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const category = await this.categoryService.updateCategory(id, req.body);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Category updated successfully',
      category,
    );
  };

  public deleteCategory = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.categoryService.deleteCategory(id);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Category soft-deleted successfully',
      null,
    );
  };
}
