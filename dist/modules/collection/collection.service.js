"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionService = void 0;
const collection_repository_1 = require("../../repositories/collection.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class CollectionService {
    collectionRepository;
    constructor(collectionRepository = new collection_repository_1.CollectionRepository()) {
        this.collectionRepository = collectionRepository;
    }
    async createCollection(input) {
        const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
        const existingSlug = await this.collectionRepository.findBySlug(slug);
        if (existingSlug) {
            throw api_error_util_1.ApiError.conflict(`Collection with slug '${slug}' already exists`);
        }
        return this.collectionRepository.create({
            name: input.name,
            slug,
            description: input.description || null,
            bannerImage: input.bannerImage || null,
            status: input.status,
        });
    }
    async getCollectionByIdOrSlug(idOrSlug) {
        const collection = (await this.collectionRepository.findByIdActive(idOrSlug)) ||
            (await this.collectionRepository.findBySlug(idOrSlug));
        if (!collection) {
            throw api_error_util_1.ApiError.notFound(`Collection '${idOrSlug}' not found`);
        }
        return collection;
    }
    async listCollections() {
        return this.collectionRepository.findManyActive();
    }
    async updateCollection(id, input) {
        const existing = await this.collectionRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Collection with ID '${id}' not found`);
        }
        let slug = existing.slug;
        if (input.slug || input.name) {
            const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
            if (targetSlug !== existing.slug) {
                const slugOwner = await this.collectionRepository.findBySlug(targetSlug);
                if (slugOwner && slugOwner.id !== id) {
                    throw api_error_util_1.ApiError.conflict(`Collection with slug '${targetSlug}' already exists`);
                }
                slug = targetSlug;
            }
        }
        return this.collectionRepository.update(id, {
            ...input,
            slug,
        });
    }
    async deleteCollection(id) {
        const existing = await this.collectionRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Collection with ID '${id}' not found`);
        }
        return this.collectionRepository.softDelete(id);
    }
    slugify(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
}
exports.CollectionService = CollectionService;
