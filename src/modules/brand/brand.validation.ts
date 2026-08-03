import { BrandStatus } from '@prisma/client';
import { z } from 'zod';

export const createBrandSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Brand name must be at least 2 characters').max(100),
    slug: z.string().optional(),
    logoUrl: z.string().url('Invalid logo URL format').nullable().optional(),
    description: z.string().nullable().optional(),
    website: z.string().url('Invalid website URL format').nullable().optional(),
    status: z.nativeEnum(BrandStatus).optional().default(BrandStatus.ACTIVE),
  }),
});

export const updateBrandSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().optional(),
    logoUrl: z.string().url('Invalid logo URL format').nullable().optional(),
    description: z.string().nullable().optional(),
    website: z.string().url('Invalid website URL format').nullable().optional(),
    status: z.nativeEnum(BrandStatus).optional(),
  }),
});
