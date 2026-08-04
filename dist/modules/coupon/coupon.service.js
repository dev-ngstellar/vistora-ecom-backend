"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponService = void 0;
const client_1 = require("@prisma/client");
const coupon_repository_1 = require("../../repositories/coupon.repository");
const api_error_util_1 = require("../../utils/api-error.util");
class CouponService {
    couponRepository;
    constructor(couponRepository = new coupon_repository_1.CouponRepository()) {
        this.couponRepository = couponRepository;
    }
    async validateCoupon(input) {
        const coupon = await this.couponRepository.findByCode(input.code);
        if (!coupon || coupon.status !== 'ACTIVE') {
            return {
                valid: false,
                code: input.code,
                title: '',
                type: client_1.CouponType.FIXED_AMOUNT,
                value: 0,
                calculatedDiscount: 0,
                message: `Coupon code '${input.code}' is invalid or inactive`,
            };
        }
        const now = new Date();
        if (now < coupon.startDate || now > coupon.endDate) {
            return {
                valid: false,
                code: coupon.code,
                title: coupon.title,
                type: coupon.type,
                value: Number(coupon.value),
                calculatedDiscount: 0,
                message: `Coupon code '${coupon.code}' has expired or is not yet active`,
            };
        }
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
            return {
                valid: false,
                code: coupon.code,
                title: coupon.title,
                type: coupon.type,
                value: Number(coupon.value),
                calculatedDiscount: 0,
                message: `Coupon code '${coupon.code}' total usage limit reached`,
            };
        }
        const minOrder = coupon.minimumOrderAmount ? Number(coupon.minimumOrderAmount) : 0;
        if (input.subtotal < minOrder) {
            return {
                valid: false,
                code: coupon.code,
                title: coupon.title,
                type: coupon.type,
                value: Number(coupon.value),
                calculatedDiscount: 0,
                message: `Requires a minimum order subtotal of $${minOrder.toFixed(2)}`,
            };
        }
        let calculatedDiscount = 0;
        if (coupon.type === client_1.CouponType.PERCENTAGE) {
            calculatedDiscount = (input.subtotal * Number(coupon.value)) / 100;
            if (coupon.maximumDiscount && calculatedDiscount > Number(coupon.maximumDiscount)) {
                calculatedDiscount = Number(coupon.maximumDiscount);
            }
        }
        else {
            calculatedDiscount = Number(coupon.value);
        }
        if (calculatedDiscount > input.subtotal) {
            calculatedDiscount = input.subtotal;
        }
        return {
            valid: true,
            code: coupon.code,
            title: coupon.title,
            type: coupon.type,
            value: Number(coupon.value),
            calculatedDiscount: Number(calculatedDiscount.toFixed(2)),
            message: `Coupon '${coupon.code}' applied successfully! Saved $${calculatedDiscount.toFixed(2)}`,
        };
    }
    async listActiveCoupons() {
        return this.couponRepository.findActiveCoupons();
    }
    async getAllCoupons(filters) {
        return this.couponRepository.findAllCoupons(filters);
    }
    async getCouponById(id) {
        const coupon = await this.couponRepository.findCouponWithUsages(id);
        if (!coupon) {
            throw api_error_util_1.ApiError.notFound(`Coupon with ID '${id}' not found`);
        }
        return coupon;
    }
    async createCoupon(input) {
        const existing = await this.couponRepository.findByCode(input.code);
        if (existing) {
            throw api_error_util_1.ApiError.conflict(`Coupon with code '${input.code}' already exists`);
        }
        return this.couponRepository.create({
            code: input.code.toUpperCase(),
            title: input.title,
            description: input.description || null,
            type: input.type,
            value: input.value,
            minimumOrderAmount: input.minimumOrderAmount || null,
            maximumDiscount: input.maximumDiscount || null,
            usageLimit: input.usageLimit || null,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            status: input.status,
        });
    }
    async updateCoupon(id, input) {
        const existing = await this.couponRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Coupon with ID '${id}' not found`);
        }
        return this.couponRepository.update(id, {
            ...input,
            code: input.code ? input.code.toUpperCase() : undefined,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
        });
    }
    async deleteCoupon(id) {
        const existing = await this.couponRepository.findById(id);
        if (!existing) {
            throw api_error_util_1.ApiError.notFound(`Coupon with ID '${id}' not found`);
        }
        return this.couponRepository.delete(id);
    }
    async getCouponStats() {
        return this.couponRepository.getCouponStats();
    }
}
exports.CouponService = CouponService;
