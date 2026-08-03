import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { WishlistService } from './wishlist.service';

export class WishlistController {
  private readonly wishlistService: WishlistService;

  constructor(wishlistService: WishlistService = new WishlistService()) {
    this.wishlistService = wishlistService;
  }

  public getWishlist = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const wishlist = await this.wishlistService.getWishlistSummary(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Wishlist retrieved successfully',
      wishlist,
    );
  };

  public getWishlistCount = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const count = await this.wishlistService.getItemCount(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Wishlist count retrieved successfully',
      { count },
    );
  };

  public addToWishlist = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const wishlist = await this.wishlistService.addToWishlist(userId, req.body);

    return ApiResponseHandler.created(res, 'Item added to wishlist successfully', wishlist);
  };

  public removeFromWishlist = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const itemId = req.params['itemId'] as string;
    const wishlist = await this.wishlistService.removeFromWishlist(userId, itemId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Item removed from wishlist successfully',
      wishlist,
    );
  };

  public moveToCart = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const itemId = req.params['itemId'] as string;
    const wishlist = await this.wishlistService.moveToCart(userId, itemId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Item moved to cart successfully',
      wishlist,
    );
  };
}
