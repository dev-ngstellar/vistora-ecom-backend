import { CouponRepository } from '../../repositories/coupon.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { CartRepository } from '../../repositories/cart.repository';
import { ApiError } from '../../utils/api-error.util';
import {
  AddToCartInput,
  CartSummaryResponse,
  MergeGuestCartInput,
  UpdateCartItemInput,
} from './cart.types';

const TAX_RATE = 0.08; // 8% sales tax
const STANDARD_SHIPPING_FEE = 15.0; // $15 standard shipping
const FREE_SHIPPING_THRESHOLD = 150.0; // Free shipping for orders >= $150

export class CartService {
  private readonly cartRepository: CartRepository;
  private readonly productRepository: ProductRepository;
  private readonly couponRepository: CouponRepository;

  constructor(
    cartRepository: CartRepository = new CartRepository(),
    productRepository: ProductRepository = new ProductRepository(),
    couponRepository: CouponRepository = new CouponRepository(),
  ) {
    this.cartRepository = cartRepository;
    this.productRepository = productRepository;
    this.couponRepository = couponRepository;
  }

  public async getCartSummary(userId: string): Promise<CartSummaryResponse> {
    const rawCart = await this.cartRepository.getOrCreateUserCart(userId);

    let subtotal = 0;

    const formattedItems = rawCart.items.map((item) => {
      const currentUnitPrice = item.variant
        ? Number(item.variant.price)
        : Number(item.product.price);

      const availableStock = item.variant ? item.variant.stock : 999;
      const itemTotal = currentUnitPrice * item.quantity;
      subtotal += itemTotal;

      return {
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        productSlug: item.product.slug,
        imageUrl: item.product.images[0]?.imageUrl || '',
        variantId: item.variantId,
        variantSku: item.variant?.sku || null,
        variantColor: item.variant?.color || null,
        variantSize: item.variant?.size || null,
        quantity: item.quantity,
        unitPrice: currentUnitPrice,
        totalPrice: itemTotal,
        availableStock,
      };
    });

    // Recalculate discount if a coupon is applied
    let discount = 0;
    let validCouponCode = rawCart.couponCode;

    if (validCouponCode) {
      const coupon = await this.couponRepository.findByCode(validCouponCode);
      if (coupon && coupon.status === 'ACTIVE' && new Date() <= coupon.endDate) {
        const minOrder = coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : 0;
        if (subtotal >= minOrder) {
          if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * Number(coupon.value)) / 100;
            if (coupon.maximumDiscount && discount > Number(coupon.maximumDiscount)) {
              discount = Number(coupon.maximumDiscount);
            }
          } else {
            discount = Number(coupon.value);
          }
          if (discount > subtotal) discount = subtotal;
        } else {
          validCouponCode = null; // Minimum order threshold not met
        }
      } else {
        validCouponCode = null; // Expired or invalid coupon
      }
    }

    const taxableAmount = Math.max(0, subtotal - discount);
    const tax = Number((taxableAmount * TAX_RATE).toFixed(2));
    const freeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;
    const shipping = subtotal > 0 ? (freeShippingEligible ? 0 : STANDARD_SHIPPING_FEE) : 0;
    const total = Number((taxableAmount + tax + shipping).toFixed(2));

    // Sync recalculated totals back to cart database record
    await this.cartRepository.updateCartTotals(rawCart.id, {
      subtotal,
      discount,
      tax,
      shipping,
      total,
      couponCode: validCouponCode,
    });

    return {
      id: rawCart.id,
      userId,
      status: rawCart.status,
      couponCode: validCouponCode,
      items: formattedItems,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      itemCount: formattedItems.reduce((acc, item) => acc + item.quantity, 0),
      freeShippingEligible,
      freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    };
  }

  public async addToCart(userId: string, input: AddToCartInput): Promise<CartSummaryResponse> {
    const product = await this.productRepository.findByIdFull(input.productId);
    if (!product || product.status !== 'ACTIVE') {
      throw ApiError.badRequest('Selected product is currently unavailable or inactive');
    }

    let unitPrice = Number(product.price);

    if (input.variantId) {
      const variant = product.variants.find((v) => v.id === input.variantId);
      if (!variant || variant.status !== 'ACTIVE') {
        throw ApiError.badRequest('Selected product variant is unavailable');
      }
      if (variant.stock < input.quantity) {
        throw ApiError.badRequest(`Insufficient stock for variant (Available: ${variant.stock})`);
      }
      unitPrice = Number(variant.price);
    }

    const cart = await this.cartRepository.getOrCreateUserCart(userId);
    await this.cartRepository.addOrUpdateCartItem(
      cart.id,
      input.productId,
      input.variantId || null,
      input.quantity,
      unitPrice,
    );

    return this.getCartSummary(userId);
  }

  public async updateCartItemQuantity(
    userId: string,
    itemId: string,
    input: UpdateCartItemInput,
  ): Promise<CartSummaryResponse> {
    const cart = await this.cartRepository.getOrCreateUserCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw ApiError.notFound(`Cart item '${itemId}' not found in user cart`);
    }

    if (item.variant && item.variant.stock < input.quantity) {
      throw ApiError.badRequest(
        `Insufficient stock for variant (Available: ${item.variant.stock})`,
      );
    }

    const unitPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);

    await this.cartRepository.updateItemQuantity(itemId, input.quantity, unitPrice);

    return this.getCartSummary(userId);
  }

  public async removeCartItem(userId: string, itemId: string): Promise<CartSummaryResponse> {
    const cart = await this.cartRepository.getOrCreateUserCart(userId);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      throw ApiError.notFound(`Cart item '${itemId}' not found in user cart`);
    }

    await this.cartRepository.removeCartItem(itemId);

    return this.getCartSummary(userId);
  }

  public async clearCart(userId: string): Promise<CartSummaryResponse> {
    const cart = await this.cartRepository.getOrCreateUserCart(userId);
    await this.cartRepository.clearCart(cart.id);

    return this.getCartSummary(userId);
  }

  public async mergeGuestCart(
    userId: string,
    input: MergeGuestCartInput,
  ): Promise<CartSummaryResponse> {
    const cart = await this.cartRepository.getOrCreateUserCart(userId);

    for (const guestItem of input.guestItems) {
      try {
        const product = await this.productRepository.findByIdFull(guestItem.productId);
        if (product && product.status === 'ACTIVE') {
          const unitPrice = Number(product.price);
          await this.cartRepository.addOrUpdateCartItem(
            cart.id,
            guestItem.productId,
            guestItem.variantId || null,
            guestItem.quantity,
            unitPrice,
          );
        }
      } catch {
        // Skip invalid guest items gracefully
      }
    }

    return this.getCartSummary(userId);
  }

  public async applyCoupon(userId: string, code: string): Promise<CartSummaryResponse> {
    const coupon = await this.couponRepository.findByCode(code);
    if (!coupon || coupon.status !== 'ACTIVE') {
      throw ApiError.badRequest(`Coupon code '${code}' is invalid or inactive`);
    }

    if (new Date() > coupon.endDate) {
      throw ApiError.badRequest(`Coupon code '${code}' has expired`);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw ApiError.badRequest(`Coupon code '${code}' usage limit reached`);
    }

    const cart = await this.cartRepository.getOrCreateUserCart(userId);

    await this.cartRepository.updateCartTotals(cart.id, {
      subtotal: Number(cart.subtotal),
      discount: Number(cart.discount),
      tax: Number(cart.tax),
      shipping: Number(cart.shipping),
      total: Number(cart.total),
      couponCode: coupon.code,
    });

    return this.getCartSummary(userId);
  }

  public async removeCoupon(userId: string): Promise<CartSummaryResponse> {
    const cart = await this.cartRepository.getOrCreateUserCart(userId);

    await this.cartRepository.updateCartTotals(cart.id, {
      subtotal: Number(cart.subtotal),
      discount: 0,
      tax: Number(cart.tax),
      shipping: Number(cart.shipping),
      total: Number(cart.total),
      couponCode: null,
    });

    return this.getCartSummary(userId);
  }
}
