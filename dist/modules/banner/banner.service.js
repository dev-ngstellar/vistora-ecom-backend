"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const banner_repository_1 = require("../../repositories/banner.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class BannerService {
    bannerRepository;
    constructor() {
        this.bannerRepository = new banner_repository_1.BannerRepository();
    }
    async getBanners(filters) {
        return this.bannerRepository.findBanners(filters);
    }
    async getActivePublicBanners(position) {
        return this.bannerRepository.findActivePublicBanners(position);
    }
    async getBannerById(id) {
        const banner = await this.bannerRepository.findById(id);
        if (!banner) {
            throw api_error_util_1.ApiError.notFound('Banner not found');
        }
        return banner;
    }
    async createBanner(data) {
        return this.bannerRepository.create({
            title: data.title,
            subtitle: data.subtitle || null,
            imageUrl: data.imageUrl,
            mobileImageUrl: data.mobileImageUrl || null,
            position: data.position || 'HERO_SLIDER',
            buttonText: data.buttonText || null,
            buttonLink: data.buttonLink || null,
            sortOrder: data.sortOrder || 0,
            isActive: data.isActive !== undefined ? data.isActive : true,
            startDate: data.startDate ? new Date(data.startDate) : null,
            endDate: data.endDate ? new Date(data.endDate) : null,
        });
    }
    async updateBanner(id, data) {
        const existing = await this.bannerRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Banner not found');
        }
        return this.bannerRepository.update(id, {
            ...data,
            startDate: data.startDate ? new Date(data.startDate) : undefined,
            endDate: data.endDate ? new Date(data.endDate) : undefined,
        });
    }
    async toggleActiveStatus(id, isActive) {
        const existing = await this.bannerRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Banner not found');
        }
        return this.bannerRepository.toggleActiveStatus(id, isActive);
    }
    async deleteBanner(id) {
        const existing = await this.bannerRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound('Banner not found');
        }
        return this.bannerRepository.delete(id);
    }
}
exports.BannerService = BannerService;
