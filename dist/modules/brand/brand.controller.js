"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const brand_service_1 = require("./brand.service");
class BrandController {
    brandService;
    constructor(brandService = new brand_service_1.BrandService()) {
        this.brandService = brandService;
    }
    createBrand = async (req, res) => {
        const brand = await this.brandService.createBrand(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Brand created successfully', brand);
    };
    getBrand = async (req, res) => {
        const idOrSlug = req.params['idOrSlug'];
        const brand = await this.brandService.getBrandByIdOrSlug(idOrSlug);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Brand retrieved successfully', brand);
    };
    listBrands = async (_req, res) => {
        const brands = await this.brandService.listBrands();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Brands retrieved successfully', brands);
    };
    updateBrand = async (req, res) => {
        const id = req.params['id'];
        const brand = await this.brandService.updateBrand(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Brand updated successfully', brand);
    };
    deleteBrand = async (req, res) => {
        const id = req.params['id'];
        await this.brandService.deleteBrand(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Brand soft-deleted successfully', null);
    };
}
exports.BrandController = BrandController;
