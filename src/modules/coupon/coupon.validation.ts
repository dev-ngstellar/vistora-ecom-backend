import { CouponStatus, CouponType } from '@prisma/client';
import { z } from 'zod';

export const createCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2, 'Coupon code must be at least 2 characters')
      .transform((v) => v.toUpperCase()),
    title: z.string().min(2, 'Coupon title is required'),
    description: z.string().nullable().optional(),
    type: z.nativeEnum(CouponType),
    value: z.number().positive('Coupon value must be a positive number'),
    minimumOrderAmount: z.number().nonnegative().nullable().optional(),
    maximumDiscount: z.number().nonnegative().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    startDate: z.string({ required_error: 'Start date is required' }),
    endDate: z.string({ required_error: 'End date is required' }),
    status: z.nativeEnum(CouponStatus).optional().default(CouponStatus.ACTIVE),
  }),
});

export const updateCouponSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    code: z
      .string()
      .min(2)
      .transform((v) => v.toUpperCase())
      .optional(),
    title: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    type: z.nativeEnum(CouponType).optional(),
    value: z.number().positive().optional(),
    minimumOrderAmount: z.number().nonnegative().nullable().optional(),
    maximumDiscount: z.number().nonnegative().nullable().optional(),
    usageLimit: z.number().int().positive().nullable().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    status: z.nativeEnum(CouponStatus).optional(),
  }),
});

export const validateCouponSchema = z.object({
  body: z.object({
    code: z
      .string()
      .min(2, 'Coupon code is required')
      .transform((v) => v.toUpperCase()),
    subtotal: z.number().positive('Subtotal must be greater than 0'),
  }),
});
