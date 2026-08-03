export interface AddToCartInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface MergeCartItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

export interface MergeGuestCartInput {
  guestItems: MergeCartItemInput[];
}

export interface ApplyCouponInput {
  code: string;
}

export interface CartSummaryResponse {
  id: string;
  userId: string;
  status: string;
  couponCode: string | null;
  items: {
    id: string;
    productId: string;
    productName: string;
    productSlug: string;
    imageUrl: string;
    variantId: string | null;
    variantSku: string | null;
    variantColor: string | null;
    variantSize: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    availableStock: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  itemCount: number;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
}
