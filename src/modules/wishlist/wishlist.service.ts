import { CartRepository } from '../../repositories/cart.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { WishlistRepository } from '../../repositories/wishlist.repository';
import { ApiError } from '../../utils/api-error.util';
import { AddToWishlistInput, WishlistSummaryResponse } from './wishlist.types';

export class WishlistService {
  private readonly wishlistRepository: WishlistRepository;
  private readonly productRepository: ProductRepository;
  private readonly cartRepository: CartRepository;

  constructor(
    wishlistRepository: WishlistRepository = new WishlistRepository(),
    productRepository: ProductRepository = new ProductRepository(),
    cartRepository: CartRepository = new CartRepository(),
  ) {
    this.wishlistRepository = wishlistRepository;
    this.productRepository = productRepository;
    this.cartRepository = cartRepository;
  }

  public async getWishlistSummary(userId: string): Promise<WishlistSummaryResponse> {
    const rawWishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);

    const items = rawWishlist.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      productSlug: item.product.slug,
      price: item.variant ? Number(item.variant.price) : Number(item.product.price),
      compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
      imageUrl: item.product.images[0]?.imageUrl || '',
      variantId: item.variantId,
      variantSku: item.variant?.sku || null,
      variantColor: item.variant?.color || null,
      variantSize: item.variant?.size || null,
    }));

    return {
      id: rawWishlist.id,
      userId,
      items,
      itemCount: items.length,
    };
  }

  public async addToWishlist(
    userId: string,
    input: AddToWishlistInput,
  ): Promise<WishlistSummaryResponse> {
    const product = await this.productRepository.findByIdFull(input.productId);
    if (!product) {
      throw ApiError.notFound(`Product with ID '${input.productId}' not found`);
    }

    const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
    await this.wishlistRepository.addItem(wishlist.id, input.productId, input.variantId);

    return this.getWishlistSummary(userId);
  }

  public async removeFromWishlist(
    userId: string,
    itemId: string,
  ): Promise<WishlistSummaryResponse> {
    const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
    const item = wishlist.items.find((i) => i.id === itemId);

    if (!item) {
      throw ApiError.notFound(`Wishlist item '${itemId}' not found in user wishlist`);
    }

    await this.wishlistRepository.removeItem(itemId);

    return this.getWishlistSummary(userId);
  }

  public async moveToCart(userId: string, itemId: string): Promise<WishlistSummaryResponse> {
    const wishlist = await this.wishlistRepository.getOrCreateUserWishlist(userId);
    const item = wishlist.items.find((i) => i.id === itemId);

    if (!item) {
      throw ApiError.notFound(`Wishlist item '${itemId}' not found in user wishlist`);
    }

    const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
    const cart = await this.cartRepository.getOrCreateUserCart(userId);

    // Add 1 unit to cart
    await this.cartRepository.addOrUpdateCartItem(
      cart.id,
      item.productId,
      item.variantId,
      1,
      unitPrice,
    );

    // Remove from wishlist
    await this.wishlistRepository.removeItem(itemId);

    return this.getWishlistSummary(userId);
  }

  public async getItemCount(userId: string): Promise<number> {
    return this.wishlistRepository.getItemCount(userId);
  }
}
