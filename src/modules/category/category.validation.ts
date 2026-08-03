import { CategoryStatus } from '@prisma/client';
import { z } from 'zod';

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters').max(100),
    slug: z.string().optional(),
    parentId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url('Invalid image URL format').nullable().optional(),
    status: z.nativeEnum(CategoryStatus).optional().default(CategoryStatus.ACTIVE),
    sortOrder: z.number().int().optional().default(0),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().optional(),
    parentId: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    imageUrl: z.string().url('Invalid image URL format').nullable().optional(),
    status: z.nativeEnum(CategoryStatus).optional(),
    sortOrder: z.number().int().optional(),
  }),
});
