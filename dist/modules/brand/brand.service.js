"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandService = void 0;
const brand_repository_1 = require("../../repositories/brand.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class BrandService {
    brandRepository;
    constructor(brandRepository = new brand_repository_1.BrandRepository()) {
        this.brandRepository = brandRepository;
    }
    async createBrand(input) {
        const slug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
        const existingSlug = await this.brandRepository.findBySlug(slug);
        if (existingSlug) {
            throw api_error_util_1.ApiError.conflict(`Brand with slug '${slug}' already exists`);
        }
        return this.brandRepository.create({
            name: input.name,
            slug,
            logoUrl: input.logoUrl || null,
            description: input.description || null,
            website: input.website || null,
            address: input.address || null,
            featured: input.featured ?? false,
            status: input.status,
        });
    }
    async getBrandByIdOrSlug(idOrSlug) {
        const brand = (await this.brandRepository.findByIdActive(idOrSlug)) ||
            (await this.brandRepository.findBySlug(idOrSlug));
        if (!brand) {
            throw api_error_util_1.ApiError.notFound(`Brand '${idOrSlug}' not found`);
        }
        return brand;
    }
    async listBrands() {
        return this.brandRepository.findManyActive();
    }
    async updateBrand(id, input) {
        const existing = await this.brandRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Brand with ID '${id}' not found`);
        }
        let slug = existing.slug;
        if (input.slug || input.name) {
            const targetSlug = input.slug ? this.slugify(input.slug) : this.slugify(input.name);
            if (targetSlug !== existing.slug) {
                const slugOwner = await this.brandRepository.findBySlug(targetSlug);
                if (slugOwner && slugOwner.id !== id) {
                    throw api_error_util_1.ApiError.conflict(`Brand with slug '${targetSlug}' already exists`);
                }
                slug = targetSlug;
            }
        }
        return this.brandRepository.update(id, {
            ...input,
            slug,
        });
    }
    async deleteBrand(id) {
        const existing = await this.brandRepository.findByIdActive(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Brand with ID '${id}' not found`);
        }
        return this.brandRepository.softDelete(id);
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
exports.BrandService = BrandService;
