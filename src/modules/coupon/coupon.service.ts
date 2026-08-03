import { Coupon, CouponType } from '@prisma/client';
import { CouponQueryFilters, CouponRepository } from '../../repositories/coupon.repository';
import { ApiError } from '../../utils/api-error.util';
import {
  CreateCouponInput,
  UpdateCouponInput,
  ValidateCouponInput,
  ValidateCouponResponse,
} from './coupon.types';

export class CouponService {
  private readonly couponRepository: CouponRepository;

  constructor(couponRepository: CouponRepository = new CouponRepository()) {
    this.couponRepository = couponRepository;
  }

  public async validateCoupon(input: ValidateCouponInput): Promise<ValidateCouponResponse> {
    const coupon = await this.couponRepository.findByCode(input.code);

    if (!coupon || coupon.status !== 'ACTIVE') {
      return {
        valid: false,
        code: input.code,
        title: '',
        type: CouponType.FIXED_AMOUNT,
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
    if (coupon.type === CouponType.PERCENTAGE) {
      calculatedDiscount = (input.subtotal * Number(coupon.value)) / 100;
      if (coupon.maximumDiscount && calculatedDiscount > Number(coupon.maximumDiscount)) {
        calculatedDiscount = Number(coupon.maximumDiscount);
      }
    } else {
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

  public async listActiveCoupons(): Promise<Coupon[]> {
    return this.couponRepository.findActiveCoupons();
  }

  public async getAllCoupons(filters: CouponQueryFilters) {
    return this.couponRepository.findAllCoupons(filters);
  }

  public async getCouponById(id: string) {
    const coupon = await this.couponRepository.findCouponWithUsages(id);
    if (!coupon) {
      throw ApiError.notFound(`Coupon with ID '${id}' not found`);
    }
    return coupon;
  }

  public async createCoupon(input: CreateCouponInput): Promise<Coupon> {
    const existing = await this.couponRepository.findByCode(input.code);
    if (existing) {
      throw ApiError.conflict(`Coupon with code '${input.code}' already exists`);
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

  public async updateCoupon(id: string, input: UpdateCouponInput): Promise<Coupon> {
    const existing = await this.couponRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Coupon with ID '${id}' not found`);
    }

    return this.couponRepository.update(id, {
      ...input,
      code: input.code ? input.code.toUpperCase() : undefined,
      startDate: input.startDate ? new Date(input.startDate) : undefined,
      endDate: input.endDate ? new Date(input.endDate) : undefined,
    });
  }

  public async deleteCoupon(id: string): Promise<Coupon> {
    const existing = await this.couponRepository.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Coupon with ID '${id}' not found`);
    }

    return this.couponRepository.delete(id);
  }

  public async getCouponStats() {
    return this.couponRepository.getCouponStats();
  }
}
