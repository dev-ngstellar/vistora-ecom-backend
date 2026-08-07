import { Category } from '@prisma/client';
import { CategoryRepository, CategoryWithChildren } from '../../repositories/category.repository';
import { ApiError } from '../../utils/api-error.util';
import { CreateCategoryInput, UpdateCategoryInput } from './category.types';

export class CategoryService {
  private readonly categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository = new CategoryRepository()) {
    this.categoryRepository = categoryRepository;
  }

  public async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);

    const existingSlug = await this.categoryRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(`Category with slug '${slug}' already exists`);
    }

    if (input.parentId) {
      const parent = await this.categoryRepository.findByIdActive(input.parentId);
      if (!parent) {
        throw ApiError.notFound(`Parent category with ID '${input.parentId}' not found`);
      }
    }

    return this.categoryRepository.create({
      name: input.name,
      slug,
      parentId: input.parentId || null,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      metaTitle: input.metaTitle || null,
      metaDescription: input.metaDescription || null,
      status: input.status,
      sortOrder: input.sortOrder ?? 0,
    });
  }

  public async getCategoryByIdOrSlug(idOrSlug: string): Promise<CategoryWithChildren> {
    const category =
      (await this.categoryRepository.findByIdActive(idOrSlug)) ||
      (await this.categoryRepository.findBySlug(idOrSlug));

    if (!category) {
      throw ApiError.notFound(`Category '${idOrSlug}' not found`);
    }

    return category;
  }

  public async listCategories(): Promise<Category[]> {
    return this.categoryRepository.findManyActive();
  }

  public async getCategoryTree(): Promise<CategoryWithChildren[]> {
    return this.categoryRepository.getCategoryTree();
  }

  public async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const existing = await this.categoryRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Category with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (input.slug || input.name) {
      const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name!);
      if (targetSlug !== existing.slug) {
        const slugOwner = await this.categoryRepository.findBySlug(targetSlug);
        if (slugOwner && slugOwner.id !== id) {
          throw ApiError.conflict(`Category with slug '${targetSlug}' already exists`);
        }
        slug = targetSlug;
      }
    }

    if (input.parentId) {
      if (input.parentId === id) {
        throw ApiError.badRequest('A category cannot be its own parent');
      }
      const parent = await this.categoryRepository.findByIdActive(input.parentId);
      if (!parent) {
        throw ApiError.notFound(`Parent category with ID '${input.parentId}' not found`);
      }
    }

    return this.categoryRepository.update(id, {
      ...input,
      slug,
    });
  }

  public async deleteCategory(id: string): Promise<Category> {
    const existing = await this.categoryRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Category with ID '${id}' not found`);
    }

    return this.categoryRepository.softDelete(id);
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
