"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMSService = void 0;
const client_1 = require("@prisma/client");
const cms_repository_1 = require("../../repositories/cms.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class CMSService {
    cmsRepository;
    constructor() {
        this.cmsRepository = new cms_repository_1.CMSRepository();
    }
    async getPages(filters) {
        return this.cmsRepository.findPages(filters);
    }
    async getPageById(id) {
        const page = await this.cmsRepository.findById(id);
        if (!page) {
            throw api_error_util_1.ApiError.notFound('CMS Page not found');
        }
        return page;
    }
    async getPublicPageBySlug(slug) {
        const page = await this.cmsRepository.findBySlug(slug);
        if (!page || page.status !== client_1.CMSPageStatus.PUBLISHED) {
            throw api_error_util_1.ApiError.notFound(`Page '/${slug}' not found or not published`);
        }
        return page;
    }
    async createPage(data) {
        const slug = (data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')).toLowerCase();
        const existing = await this.cmsRepository.findBySlug(slug);
        if (existing) {
            throw api_error_util_1.ApiError.conflict(`Page with slug '${slug}' already exists`);
        }
        return this.cmsRepository.create({
            title: data.title,
            slug,
            content: data.content,
            metaTitle: data.metaTitle || null,
            metaDescription: data.metaDescription || null,
            metaKeywords: data.metaKeywords || null,
            status: data.status || client_1.CMSPageStatus.DRAFT,
            publishedAt: data.status === client_1.CMSPageStatus.PUBLISHED ? new Date() : null,
        });
    }
    async updatePage(id, data) {
        const existing = await this.cmsRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('CMS Page not found');
        }
        let slug = existing.slug;
        if (data.slug && data.slug.toLowerCase() !== existing.slug) {
            slug = data.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const conflict = await this.cmsRepository.findBySlug(slug);
            if (conflict && conflict.id !== id) {
                throw api_error_util_1.ApiError.conflict(`Page with slug '${slug}' already exists`);
            }
        }
        return this.cmsRepository.update(id, {
            ...data,
            slug,
            publishedAt: data.status === client_1.CMSPageStatus.PUBLISHED && !existing.publishedAt ? new Date() : existing.publishedAt,
        });
    }
    async updateStatus(id, status) {
        const existing = await this.cmsRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('CMS Page not found');
        }
        return this.cmsRepository.updateStatus(id, status);
    }
    async deletePage(id) {
        const existing = await this.cmsRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('CMS Page not found');
        }
        return this.cmsRepository.delete(id);
    }
}
exports.CMSService = CMSService;
