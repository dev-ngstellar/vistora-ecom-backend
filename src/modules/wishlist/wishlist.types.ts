export interface AddToWishlistInput {
  productId: string;
  variantId?: string | null;
}

export interface WishlistSummaryResponse {
  id: string;
  userId: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    price: number;
    compareAtPrice: number | null;
    imageUrl: string;
    variantId: string | null;
    variantSku: string | null;
    variantColor: string | null;
    variantSize: string | null;
  }[];
  itemCount: number;
}
