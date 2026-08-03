import { CollectionStatus } from '@prisma/client';
import { z } from 'zod';

export const createCollectionSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Collection name must be at least 2 characters').max(100),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    bannerImage: z.string().url('Invalid banner image URL format').nullable().optional(),
    status: z.nativeEnum(CollectionStatus).optional().default(CollectionStatus.ACTIVE),
  }),
});

export const updateCollectionSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    slug: z.string().optional(),
    description: z.string().nullable().optional(),
    bannerImage: z.string().url('Invalid banner image URL format').nullable().optional(),
    status: z.nativeEnum(CollectionStatus).optional(),
  }),
});
