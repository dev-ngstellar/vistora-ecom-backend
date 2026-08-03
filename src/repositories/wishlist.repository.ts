import { Prisma, Wishlist, WishlistItem } from '@prisma/client';
import { BaseRepository } from './base.repository';

export type WishlistWithItems = Wishlist & {
  items: (WishlistItem & {
    product: {
      id: string;
      name: string;
      slug: string;
      price: Prisma.Decimal;
      compareAtPrice: Prisma.Decimal | null;
      images: { imageUrl: string; isPrimary: boolean }[];
    };
    variant: {
      id: string;
      sku: string;
      color: string | null;
      size: string | null;
      price: Prisma.Decimal;
    } | null;
  })[];
};

export class WishlistRepository extends BaseRepository<Wishlist, Prisma.WishlistDelegate> {
  protected readonly model: Prisma.WishlistDelegate;

  constructor() {
    super();
    this.model = this.prisma.wishlist;
  }

  public async getOrCreateUserWishlist(userId: string): Promise<WishlistWithItems> {
    let wishlist = await this.prisma.wishlist.findUnique({
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
                compareAtPrice: true,
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
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!wishlist) {
      wishlist = await this.prisma.wishlist.create({
        data: {
          userId,
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
                  compareAtPrice: true,
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
                },
              },
            },
          },
        },
      });
    }

    return wishlist as WishlistWithItems;
  }

  public async addItem(
    wishlistId: string,
    productId: string,
    variantId?: string | null,
  ): Promise<WishlistItem> {
    const existing = await this.prisma.wishlistItem.findFirst({
      where: {
        wishlistId,
        productId,
        variantId: variantId || null,
      },
    });

    if (existing) {
      return existing;
    }

    return this.prisma.wishlistItem.create({
      data: {
        wishlistId,
        productId,
        variantId: variantId || null,
      },
    });
  }

  public async removeItem(itemId: string): Promise<WishlistItem> {
    return this.prisma.wishlistItem.delete({
      where: { id: itemId },
    });
  }

  public async getItemCount(userId: string): Promise<number> {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      select: {
        _count: {
          select: { items: true },
        },
      },
    });

    return wishlist?._count.items || 0;
  }
}
