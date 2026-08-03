import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CollectionService } from './collection.service';

export class CollectionController {
  private readonly collectionService: CollectionService;

  constructor(collectionService: CollectionService = new CollectionService()) {
    this.collectionService = collectionService;
  }

  public createCollection = async (req: Request, res: Response): Promise<Response> => {
    const collection = await this.collectionService.createCollection(req.body);

    return ApiResponseHandler.created(res, 'Collection created successfully', collection);
  };

  public getCollection = async (req: Request, res: Response): Promise<Response> => {
    const idOrSlug = req.params['idOrSlug'] as string;
    const collection = await this.collectionService.getCollectionByIdOrSlug(idOrSlug);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Collection retrieved successfully',
      collection,
    );
  };

  public listCollections = async (_req: Request, res: Response): Promise<Response> => {
    const collections = await this.collectionService.listCollections();

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Collections retrieved successfully',
      collections,
    );
  };

  public updateCollection = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    const collection = await this.collectionService.updateCollection(id, req.body);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Collection updated successfully',
      collection,
    );
  };

  public deleteCollection = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params['id'] as string;
    await this.collectionService.deleteCollection(id);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Collection soft-deleted successfully',
      null,
    );
  };
}
