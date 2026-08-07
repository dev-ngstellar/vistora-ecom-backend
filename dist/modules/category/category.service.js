"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const category_repository_1 = require("../../repositories/category.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class CategoryService {
    categoryRepository;
    constructor(categoryRepository = new category_repository_1.CategoryRepository()) {
        this.categoryRepository = categoryRepository;
    }
    async createCategory(input) {
        const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
        const existingSlug = await this.categoryRepository.findBySlug(slug);
        if (existingSlug) {
            throw api_error_util_1.ApiError.conflict(`Category with slug '${slug}' already exists`);
        }
        if (input.parentId) {
            const parent = await this.categoryRepository.findByIdActive(input.parentId);
            if (!parent) {
                throw api_error_util_1.ApiError.notFound(`Parent category with ID '${input.parentId}' not found`);
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
    async getCategoryByIdOrSlug(idOrSlug) {
        const category = (await this.categoryRepository.findByIdActive(idOrSlug)) ||
            (await this.categoryRepository.findBySlug(idOrSlug));
        if (!category) {
            throw api_error_util_1.ApiError.notFound(`Category '${idOrSlug}' not found`);
        }
        return category;
    }
    async listCategories() {
        return this.categoryRepository.findManyActive();
    }
    async getCategoryTree() {
        return this.categoryRepository.getCategoryTree();
    }
    async updateCategory(id, input) {
        const existing = await this.categoryRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Category with ID '${id}' not found`);
        }
        let slug = existing.slug;
        if (input.slug || input.name) {
            const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
            if (targetSlug !== existing.slug) {
                const slugOwner = await this.categoryRepository.findBySlug(targetSlug);
                if (slugOwner && slugOwner.id !== id) {
                    throw api_error_util_1.ApiError.conflict(`Category with slug '${targetSlug}' already exists`);
                }
                slug = targetSlug;
            }
        }
        if (input.parentId) {
            if (input.parentId === id) {
                throw api_error_util_1.ApiError.badRequest('A category cannot be its own parent');
            }
            const parent = await this.categoryRepository.findByIdActive(input.parentId);
            if (!parent) {
                throw api_error_util_1.ApiError.notFound(`Parent category with ID '${input.parentId}' not found`);
            }
        }
        return this.categoryRepository.update(id, {
            ...input,
            slug,
        });
    }
    async deleteCategory(id) {
        const existing = await this.categoryRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Category with ID '${id}' not found`);
        }
        return this.categoryRepository.softDelete(id);
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
exports.CategoryService = CategoryService;
