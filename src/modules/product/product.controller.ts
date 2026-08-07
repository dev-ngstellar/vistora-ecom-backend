import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { ProductService } from './product.service';

export class ProductController {
  private readonly productService: ProductService;

  constructor(productService: ProductService = new ProductService()) {
    this.productService = productService;
  }

  public createProduct = async (req: Request, res: Response): Promise<Response> => {
    const product = await this.productService.createProduct(req.body);

    return ApiResponseHandler.created(res, 'Product created successfully', product);
  };

  public getProduct = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params['idOrSlug'] as string;
    const product = await this.productService.getProductByIdOrSlug(idOrSlug);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Product retrieved successfully',
      product,
    );
  };

  public listProducts = async (req: Request, res: Response): Promise<Response> => {
    const filters = {
      q: req.query['q'] as string,
      categoryId: req.query['categoryId'] as string,
      brandId: req.query['brandId'] as string,
      collectionId: req.query['collectionId'] as string,
      minPrice: req.query['minPrice'] ? Number(req.query['minPrice']) : undefined,
      maxPrice: req.query['maxPrice'] ? Number(req.query['maxPrice']) : undefined,
      status: req.query['status'] as string,
      featured: req.query['featured'] !== undefined ? req.query['featured'] === 'true' : undefined,
      visibility: req.query['visibility'] as string,
      page: req.query['page'] ? Number(req.query['page']) : 1,
      limit: req.query['limit'] ? Number(req.query['limit']) : 12,
      sort: req.query['sort'] as string,
    };

    const result = await this.productService.searchAndFilterProducts(filters);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Products retrieved successfully',
      result.products,
      {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    );
  };

  public updateProduct = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const product = await this.productService.updateProduct(id, req.body);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Product updated successfully', product);
  };

  public deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.productService.deleteProduct(id);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Product soft-deleted successfully',
      null,
    );
  };

  public addProductImage = async (req: Request, res: Response): Promise<Response> => {
    const productId = req.params['productId'] as string;
    const image = await this.productService.addProductImage(productId, req.body);

    return ApiResponseHandler.created(res, 'Product image added successfully', image);
  };

  public deleteProductImage = async (req: Request, res: Response): Promise<Response> => {
    const imageId = req.params['imageId'] as string;
    await this.productService.deleteProductImage(imageId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Product image removed successfully',
      null,
    );
  };

  public addProductVariant = async (req: Request, res: Response): Promise<Response> => {
    const productId = req.params['productId'] as string;
    const variant = await this.productService.addProductVariant(productId, req.body);

    return ApiResponseHandler.created(res, 'Product variant added successfully', variant);
  };

  public deleteProductVariant = async (req: Request, res: Response): Promise<Response> => {
    const variantId = req.params['variantId'] as string;
    await this.productService.deleteProductVariant(variantId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Product variant removed successfully',
      null,
    );
  };

  public bulkAction = async (req: Request, res: Response): Promise<Response> => {
    const { action, productIds, targetId } = req.body;
    const affectedCount = await this.productService.bulkAction(action, productIds, targetId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      `Bulk action '${action}' completed successfully`,
      { affectedCount },
    );
  };
}
