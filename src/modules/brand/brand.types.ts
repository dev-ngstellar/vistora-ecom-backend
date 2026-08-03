import { BrandStatus } from '@prisma/client';

export interface CreateBrandInput {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  status?: BrandStatus;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  status?: BrandStatus;
}
