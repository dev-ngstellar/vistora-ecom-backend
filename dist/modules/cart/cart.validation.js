"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyCouponSchema = exports.mergeGuestCartSchema = exports.updateCartItemSchema = exports.addToCartSchema = void 0;
const zod_1 = require("zod");
exports.addToCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string({ required_error: 'Product ID is required' }),
        variantId: zod_1.z.string().nullable().optional(),
        quantity: zod_1.z.number().int().positive('Quantity must be at least 1').default(1),
    }),
});
exports.updateCartItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        itemId: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        quantity: zod_1.z.number().int().positive('Quantity must be at least 1'),
    }),
});
exports.mergeGuestCartSchema = zod_1.z.object({
    body: zod_1.z.object({
        guestItems: zod_1.z.array(zod_1.z.object({
            productId: zod_1.z.string(),
            variantId: zod_1.z.string().nullable().optional(),
            quantity: zod_1.z.number().int().positive(),
        })),
    }),
});
exports.applyCouponSchema = zod_1.z.object({
    body: zod_1.z.object({
        code: zod_1.z
            .string()
            .min(2, 'Coupon code is required')
            .transform((v) => v.trim().toUpperCase()),
    }),
});
