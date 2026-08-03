import { CategoryStatus } from '@prisma/client';

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status?: CategoryStatus;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  parentId?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  status?: CategoryStatus;
  sortOrder?: number;
}
