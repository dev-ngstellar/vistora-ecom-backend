"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCategorySchema = exports.createCategorySchema = void 0;
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
exports.createCategorySchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Category name must be at least 2 characters').max(100),
        slug: zod_1.z.string().optional(),
        parentId: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        imageUrl: zod_1.z.string().url('Invalid image URL format').nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.CategoryStatus).optional().default(client_1.CategoryStatus.ACTIVE),
        sortOrder: zod_1.z.number().int().optional().default(0),
    }),
});
exports.updateCategorySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string(),
    }),
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        slug: zod_1.z.string().optional(),
        parentId: zod_1.z.string().nullable().optional(),
        description: zod_1.z.string().nullable().optional(),
        imageUrl: zod_1.z.string().url('Invalid image URL format').nullable().optional(),
        status: zod_1.z.nativeEnum(client_1.CategoryStatus).optional(),
        sortOrder: zod_1.z.number().int().optional(),
    }),
});
