"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBrandSchema = exports.createBrandSchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createBrandSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Brand name must be at least 2 characters').max(100),
        slug: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().url('Invalid logo URL format').nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        website: zod_1.z.string().url('Invalid website URL format').nullable().optional(),
        address: zod_1.z.string().max(255).nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.BrandStatus).optional().default(client_1.BrandStatus.ACTIVE),
    }),
});
exports.updateBrandSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        slug: zod_1.z.string().optional(),
        logoUrl: zod_1.z.string().url('Invalid logo URL format').nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        website: zod_1.z.string().url('Invalid website URL format').nullable().optional(),
        address: zod_1.z.string().max(255).nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.BrandStatus).optional(),
    }),
});
