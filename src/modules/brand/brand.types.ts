import { BrandStatus } from '@prisma/client';

export interface CreateBrandInput {
  name: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  featured?: boolean;
  status?: BrandStatus;
}

export interface UpdateBrandInput {
  name?: string;
  slug?: string;
  logoUrl?: string | null;
  description?: string | null;
  website?: string | null;
  address?: string | null;
  featured?: boolean;
  status?: BrandStatus;
}
