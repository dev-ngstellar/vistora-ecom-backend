import { CouponStatus, CouponType } from '@prisma/client';

export interface CreateCouponInput {
  code: string;
  title: string;
  description?: string | null;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number | null;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  startDate: string;
  endDate: string;
  status?: CouponStatus;
}

export interface UpdateCouponInput {
  code?: string;
  title?: string;
  description?: string | null;
  type?: CouponType;
  value?: number;
  minimumOrderAmount?: number | null;
  maximumDiscount?: number | null;
  usageLimit?: number | null;
  startDate?: string;
  endDate?: string;
  status?: CouponStatus;
}

export interface ValidateCouponInput {
  code: string;
  subtotal: number;
}

export interface ValidateCouponResponse {
  valid: boolean;
  code: string;
  title: string;
  type: CouponType;
  value: number;
  calculatedDiscount: number;
  message: string;
}
