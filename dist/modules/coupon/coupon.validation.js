"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateCouponSchema = exports.updateCouponSchema = exports.createCouponSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(2, 'Coupon code must be at least 2 characters')
            .transform((v) => v.toUpperCase()),
        title: zod_1.z.string().min(2, 'Coupon title is required'),
        description: zod_1.z.string().nullable().optional(),
        type: zod_1.z.nativeEnum(client_1.CouponType),
        value: zod_1.z.number().positive('Coupon value must be a positive number'),
        minimumOrderAmount: zod_1.z.number().nonnegative().nullable().optional(),
        maximumDiscount: zod_1.z.number().nonnegative().nullable().optional(),
        usageLimit: zod_1.z.number().int().positive().nullable().optional(),
        startDate: zod_1.z.string({ required_error: 'Start date is required' }),
        endDate: zod_1.z.string({ required_error: 'End date is required' }),
        status: zod_1.z.nativeEnum(client_1.CouponStatus).optional().default(client_1.CouponStatus.ACTIVE),
    }),
});
exports.updateCouponSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(2)
            .transform((v) => v.toUpperCase())
            .optional(),
        title: zod_1.z.string().min(2).optional(),
        description: zod_1.z.string().nullable().optional(),
        type: zod_1.z.nativeEnum(client_1.CouponType).optional(),
        value: zod_1.z.number().positive().optional(),
        minimumOrderAmount: zod_1.z.number().nonnegative().nullable().optional(),
        maximumDiscount: zod_1.z.number().nonnegative().nullable().optional(),
        usageLimit: zod_1.z.number().int().positive().nullable().optional(),
        startDate: zod_1.z.string().optional(),
        endDate: zod_1.z.string().optional(),
        status: zod_1.z.nativeEnum(client_1.CouponStatus).optional(),
    }),
});
exports.validateCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(2, 'Coupon code is required')
            .transform((v) => v.toUpperCase()),
        subtotal: zod_1.z.number().positive('Subtotal must be greater than 0'),
    }),
});
