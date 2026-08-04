"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponController = void 0;
const http_status_constant_1 = require("../../constants/http-status.constant");
const api_response_util_1 = require("../../utils/api-response.util");
const coupon_service_1 = require("./coupon.service");
class CouponController {
    couponService;
    constructor(couponService = new coupon_service_1.CouponService()) {
        this.couponService = couponService;
    }
    validateCoupon = async (req, res) => {
        const result = await this.couponService.validateCoupon(req.body);
        if (!result.valid) {
            return api_response_util_1.ApiResponseHandler.error(res, http_status_constant_1.HTTP_STATUS.BAD_REQUEST, result.message, []);
        }
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, result.message, result);
    };
    listActiveCoupons = async (_req, res) => {
        const coupons = await this.couponService.listActiveCoupons();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Active coupons retrieved successfully', coupons);
    };
    getAllCoupons = async (req, res) => {
        const filters = {
            search: req.query['search'],
            status: req.query['status'],
            type: req.query['type'],
            page: req.query['page'] ? parseInt(req.query['page'], 10) : 1,
            limit: req.query['limit'] ? parseInt(req.query['limit'], 10) : 10,
        };
        const result = await this.couponService.getAllCoupons(filters);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupons retrieved successfully', result.coupons, result.meta);
    };
    getCouponById = async (req, res) => {
        const id = req.params['id'];
        const coupon = await this.couponService.getCouponById(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon retrieved successfully', coupon);
    };
    createCoupon = async (req, res) => {
        const coupon = await this.couponService.createCoupon(req.body);
        return api_response_util_1.ApiResponseHandler.created(res, 'Coupon created successfully', coupon);
    };
    updateCoupon = async (req, res) => {
        const id = req.params['id'];
        const coupon = await this.couponService.updateCoupon(id, req.body);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon updated successfully', coupon);
    };
    deleteCoupon = async (req, res) => {
        const id = req.params['id'];
        await this.couponService.deleteCoupon(id);
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon deleted successfully', null);
    };
    getCouponStats = async (_req, res) => {
        const stats = await this.couponService.getCouponStats();
        return api_response_util_1.ApiResponseHandler.success(res, http_status_constant_1.HTTP_STATUS.OK, 'Coupon statistics retrieved successfully', stats);
    };
}
exports.CouponController = CouponController;
