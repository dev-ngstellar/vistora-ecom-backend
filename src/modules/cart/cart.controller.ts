import { Request, Response } from 'express';
import { HTTP_STATUS } from '../../constants/http-status.constant';
import { ApiResponseHandler } from '../../utils/api-response.util';
import { CartService } from './cart.service';

export class CartController {
  private readonly cartService: CartService;

  constructor(cartService: CartService = new CartService()) {
    this.cartService = cartService;
  }

  public getCart = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const cart = await this.cartService.getCartSummary(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Shopping cart retrieved successfully',
      cart,
    );
  };

  public addToCart = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const cart = await this.cartService.addToCart(userId, req.body);

    return ApiResponseHandler.created(res, 'Item added to shopping cart successfully', cart);
  };

  public updateCartItem = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const itemId = req.params['itemId'] as string;
    const cart = await this.cartService.updateCartItemQuantity(userId, itemId, req.body);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Cart item quantity updated successfully',
      cart,
    );
  };

  public removeCartItem = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const itemId = req.params['itemId'] as string;
    const cart = await this.cartService.removeCartItem(userId, itemId);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Cart item removed successfully', cart);
  };

  public clearCart = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const cart = await this.cartService.clearCart(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Shopping cart cleared successfully',
      cart,
    );
  };

  public mergeGuestCart = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const cart = await this.cartService.mergeGuestCart(userId, req.body);

    return ApiResponseHandler.success(res, HTTP_STATUS.OK, 'Guest cart merged successfully', cart);
  };

  public applyCoupon = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const { code } = req.body;
    const cart = await this.cartService.applyCoupon(userId, code);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Coupon code applied successfully',
      cart,
    );
  };

  public removeCoupon = async (req: Request, res: Response): Promise<Response> => {
    const userId = req.user!.id;
    const cart = await this.cartService.removeCoupon(userId);

    return ApiResponseHandler.success(
      res,
      HTTP_STATUS.OK,
      'Coupon code removed successfully',
      cart,
    );
  };
}
