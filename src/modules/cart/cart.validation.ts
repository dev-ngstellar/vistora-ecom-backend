import { z } from 'zod';

export const addToCartSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
    variantId: z.string().nullable().optional(),
    quantity: z.number().int().positive('Quantity must be at least 1').default(1),
  }),
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string(),
  }),
  body: z.object({
    quantity: z.number().int().positive('Quantity must be at least 1'),
  }),
});

export const mergeGuestCartSchema = z.object({
  body: z.object({
    guestItems: z.array(
      z.object({
        productId: z.string(),
        variantId: z.string().nullable().optional(),
        quantity: z.number().int().positive(),
      }),
    ),
  }),
});

export const applyCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2, 'Coupon code is required')
      .transform((v) => v.trim().toUpperCase()),
  }),
});
