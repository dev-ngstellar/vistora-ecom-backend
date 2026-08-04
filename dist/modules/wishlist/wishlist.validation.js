"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addToWishlistSchema = void 0;
const zod_1 = require("zod");
exports.addToWishlistSchema = zod_1.z.object({
    body: zod_1.z.object({
        productId: zod_1.z.string({ required_error: 'Product ID is required' }),
        variantId: zod_1.z.string().nullable().optional(),
    }),
});
