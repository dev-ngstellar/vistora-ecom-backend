import { Cart, CartItem, CartStatus, Prisma } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      price: Prisma.Decimal;
      status: string;
      images: { imageUrl: string; isPrimary: boolean }[];
    };
    variant: {
      id: string;
      sku: string;
      color: string | null;
      size: string | null;
      price: Prisma.Decimal;
      stock: number;
    } | null;
  })[];
};

export class CartRepository extends BaseRepository<Cart, Prisma.CartDelegate> {
  protected readonly model: Prisma.CartDelegate;

  constructor() {
    super();
    this.model = this.prisma.cart;
  }

  public async getOrCreateUserCart(userId: string): Promise<CartWithItems> {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                status: true,
                images: { select: { imageUrl: true, isPrimary: true }, take: 1 },
              },
            },
            variant: {
              select: {
                id: true,
                sku: true,
                color: true,
                size: true,
                price: true,
                stock: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: {
          userId,
          status: CartStatus.ACTIVE,
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  price: true,
                  status: true,
                  images: { select: { imageUrl: true, isPrimary: true }, take: 1 },
                },
              },
              variant: {
                select: {
                  id: true,
                  sku: true,
                  color: true,
                  size: true,
                  price: true,
                  stock: true,
                },
              },
            },
          },
        },
      });
    }

    return cart as CartWithItems;
  }

  public async addOrUpdateCartItem(
    cartId: string,
    productId: string,
    variantId: string | null,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItem> {
    const existing = await this.prisma.cartItem.findFirst({
      where: {
        cartId,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      const newQuantity = existing.quantity + quantity;
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: {
          quantity: newQuantity,
          unitPrice,
          totalPrice: newQuantity * unitPrice,
        },
      });
    }

    return this.prisma.cartItem.create({
      data: {
        cartId,
        productId,
        variantId: variantId || null,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      },
    });
  }

  public async updateItemQuantity(
    itemId: string,
    quantity: number,
    unitPrice: number,
  ): Promise<CartItem> {
    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: {
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      },
    });
  }

  public async removeCartItem(itemId: string): Promise<CartItem> {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  public async clearCart(cartId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { cartId },
    });

    await this.prisma.cart.update({
      where: { id: cartId },
      data: {
        couponCode: null,
        subtotal: 0,
        discount: 0,
        tax: 0,
        shipping: 0,
        total: 0,
      },
    });
  }

  public async updateCartTotals(
    cartId: string,
    totals: {
      subtotal: number;
      discount: number;
      tax: number;
      shipping: number;
      total: number;
      couponCode?: string | null;
    },
  ): Promise<Cart> {
    return this.prisma.cart.update({
      where: { id: cartId },
      data: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        shipping: totals.shipping,
        total: totals.total,
        couponCode: totals.couponCode !== undefined ? totals.couponCode : undefined,
      },
    });
  }
}
