import { Brand } from '@prisma/client';
import { BrandRepository } from '../../repositories/brand.repository';
import { ApiError } from '../../utils/api-error.util';
import { CreateBrandInput, UpdateBrandInput } from './brand.types';

export class BrandService {
  private readonly brandRepository: BrandRepository;

  constructor(brandRepository: BrandRepository = new BrandRepository()) {
    this.brandRepository = brandRepository;
  }

  public async createBrand(input: CreateBrandInput): Promise<Brand> {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);

    const existingSlug = await this.brandRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(`Brand with slug '${slug}' already exists`);
    }

    return this.brandRepository.create({
      name: input.name,
      slug,
      logoUrl: input.logoUrl || null,
      description: input.description || null,
      website: input.website || null,
      status: input.status,
    });
  }

  public async getBrandByIdOrSlug(idOrSlug: string): Promise<Brand> {
    const brand =
      (await this.brandRepository.findByIdActive(idOrSlug)) ||
      (await this.brandRepository.findBySlug(idOrSlug));

    if (!brand) {
      throw ApiError.notFound(`Brand '${idOrSlug}' not found`);
    }

    return brand;
  }

  public async listBrands(): Promise<Brand[]> {
    return this.brandRepository.findManyActive();
  }

  public async updateBrand(id: string, input: UpdateBrandInput): Promise<Brand> {
    const existing = await this.brandRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Brand with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (input.slug || input.name) {
      const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name!);
      if (targetSlug !== existing.slug) {
        const slugOwner = await this.brandRepository.findBySlug(targetSlug);
        if (slugOwner && slugOwner.id !== id) {
          throw ApiError.conflict(`Brand with slug '${targetSlug}' already exists`);
        }
        slug = targetSlug;
      }
    }

    return this.brandRepository.update(id, {
      ...input,
      slug,
    });
  }

  public async deleteBrand(id: string): Promise<Brand> {
    const existing = await this.brandRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Brand with ID '${id}' not found`);
    }

    return this.brandRepository.softDelete(id);
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
