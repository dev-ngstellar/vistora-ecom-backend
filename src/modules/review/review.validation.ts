import { ReviewStatus } from '@prisma/client';
import { z } from 'zod';

const optionalNullableString = (max: number) =>
  z.preprocess(
    (val) => (val === '' || val === undefined ? null : val),
    z.string().max(max).nullable().optional()
  );

export const createReviewSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'Product ID is required'),
    rating: z.coerce
      .number()
      .int('Rating must be an integer')
      .min(1, 'Minimum rating is 1')
      .max(5, 'Maximum rating is 5'),
    title: optionalNullableString(120),
    comment: optionalNullableString(2000),
  }),
});

export const updateReviewStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ReviewStatus),
  }),
});
