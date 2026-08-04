"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const banner_service_1 = require("./banner.service");
class BannerController {
    bannerService;
    constructor() {
        this.bannerService = new banner_service_1.BannerService();
    }
    getBanners = async (req, res) => {
        const filters = {
            search: req.query.search,
            position: req.query.position,
            isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const result = await this.bannerService.getBanners(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Banners retrieved successfully', result.banners, result.meta);
    };
    getActivePublicBanners = async (req, res) => {
        const position = req.query.position;
        const banners = await this.bannerService.getActivePublicBanners(position);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Public banners retrieved successfully', banners);
    };
    getBannerById = async (req, res) => {
        const id = req.params['id'];
        const banner = await this.bannerService.getBannerById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Banner retrieved successfully', banner);
    };
    createBanner = async (req, res) => {
        const banner = await this.bannerService.createBanner(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Banner created successfully', banner);
    };
    updateBanner = async (req, res) => {
        const id = req.params['id'];
        const banner = await this.bannerService.updateBanner(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Banner updated successfully', banner);
    };
    toggleActiveStatus = async (req, res) => {
        const id = req.params['id'];
        const { isActive } = req.body;
        const updated = await this.bannerService.toggleActiveStatus(id, Boolean(isActive));
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Banner status updated successfully', updated);
    };
    deleteBanner = async (req, res) => {
        const id = req.params['id'];
        await this.bannerService.deleteBanner(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Banner deleted successfully', null);
    };
}
exports.BannerController = BannerController;
