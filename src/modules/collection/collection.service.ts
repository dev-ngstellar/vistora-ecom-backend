import { Collection } from '@prisma/client';
import { CollectionRepository } from '../../repositories/collection.repository';
import { ApiError } from '../../utils/api-error.util';
import { CreateCollectionInput, UpdateCollectionInput } from './collection.types';

export class CollectionService {
  private readonly collectionRepository: CollectionRepository;

  constructor(collectionRepository: CollectionRepository = new CollectionRepository()) {
    this.collectionRepository = collectionRepository;
  }

  public async createCollection(input: CreateCollectionInput): Promise<Collection> {
    const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);

    const existingSlug = await this.collectionRepository.findBySlug(slug);
    if (existingSlug) {
      throw ApiError.conflict(`Collection with slug '${slug}' already exists`);
    }

    return this.collectionRepository.create({
      name: input.name,
      slug,
      description: input.description || null,
      bannerImage: input.bannerImage || null,
      status: input.status,
    });
  }

  public async getCollectionByIdOrSlug(idOrSlug: string): Promise<Collection> {
    const collection =
      (await this.collectionRepository.findByIdActive(idOrSlug)) ||
      (await this.collectionRepository.findBySlug(idOrSlug));

    if (!collection) {
      throw ApiError.notFound(`Collection '${idOrSlug}' not found`);
    }

    return collection;
  }

  public async listCollections(): Promise<Collection[]> {
    return this.collectionRepository.findManyActive();
  }

  public async updateCollection(id: string, input: UpdateCollectionInput): Promise<Collection> {
    const existing = await this.collectionRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Collection with ID '${id}' not found`);
    }

    let slug = existing.slug;
    if (input.slug || input.name) {
      const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name!);
      if (targetSlug !== existing.slug) {
        const slugOwner = await this.collectionRepository.findBySlug(targetSlug);
        if (slugOwner && slugOwner.id !== id) {
          throw ApiError.conflict(`Collection with slug '${targetSlug}' already exists`);
        }
        slug = targetSlug;
      }
    }

    return this.collectionRepository.update(id, {
      ...input,
      slug,
    });
  }

  public async deleteCollection(id: string): Promise<Collection> {
    const existing = await this.collectionRepository.findByIdActive(id);
    if (!existing) {
      throw ApiError.notFound(`Collection with ID '${id}' not found`);
    }

    return this.collectionRepository.softDelete(id);
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
