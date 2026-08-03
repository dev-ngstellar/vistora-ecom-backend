import { z } from 'zod';

export const addToWishlistSchema = z.object({
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }),
    variantId: z.string().nullable().optional(),
  }),
});
