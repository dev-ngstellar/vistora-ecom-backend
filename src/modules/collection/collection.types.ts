import { CollectionStatus } from '@prisma/client';

export interface CreateCollectionInput {
  name: string;
  slug?: string;
  description?: string | null;
  bannerImage?: string | null;
  status?: CollectionStatus;
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string | null;
  bannerImage?: string | null;
  status?: CollectionStatus;
}
