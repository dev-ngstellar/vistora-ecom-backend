"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMSController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const cms_service_1 = require("./cms.service");
class CMSController {
    cmsService;
    constructor() {
        this.cmsService = new cms_service_1.CMSService();
    }
    getPages = async (req, res) => {
        const filters = {
            search: req.query.search,
            status: req.query.status,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 10,
        };
        const result = await this.cmsService.getPages(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'CMS pages retrieved successfully', result.pages, result.meta);
    };
    getPublicPageBySlug = async (req, res) => {
        const slug = req.params['slug'];
        const page = await this.cmsService.getPublicPageBySlug(slug);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Public page retrieved successfully', page);
    };
    getPageById = async (req, res) => {
        const id = req.params['id'];
        const page = await this.cmsService.getPageById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'CMS page retrieved successfully', page);
    };
    createPage = async (req, res) => {
        const page = await this.cmsService.createPage(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'CMS page created successfully', page);
    };
    updatePage = async (req, res) => {
        const id = req.params['id'];
        const page = await this.cmsService.updatePage(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'CMS page updated successfully', page);
    };
    updateStatus = async (req, res) => {
        const id = req.params['id'];
        const { status } = req.body;
        const updated = await this.cmsService.updateStatus(id, status);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'CMS page status updated successfully', updated);
    };
    deletePage = async (req, res) => {
        const id = req.params['id'];
        await this.cmsService.deletePage(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'CMS page deleted successfully', null);
    };
}
exports.CMSController = CMSController;
