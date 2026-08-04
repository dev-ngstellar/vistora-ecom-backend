"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class CouponRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.coupon;
    }
    async findByCode(code) {
        return this.prisma.coupon.findFirst({
            where: {
                code: code.toUpperCase(),
            },
        });
    }
    async findActiveCoupons() {
        const now = new Date();
        return this.prisma.coupon.findMany({
            where: {
                status: client_1.CouponStatus.ACTIVE,
                startDate: { lte: now },
                endDate: { gte: now },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAllCoupons(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.type) {
            where.type = filters.type;
        }
        if (filters.search) {
            const search = filters.search.trim();
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [coupons, total] = await Promise.all([
            this.prisma.coupon.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { usages: true },
                    },
                },
            }),
            this.prisma.coupon.count({ where }),
        ]);
        return {
            coupons,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findCouponWithUsages(id) {
        return this.prisma.coupon.findUnique({
            where: { id },
            include: {
                usages: {
                    orderBy: { usedAt: 'desc' },
                    include: {
                        user: {
                            select: {
                                id: true,
                                fullName: true,
                                email: true,
                            },
                        },
                        order: {
                            select: {
                                id: true,
                                orderNumber: true,
                                total: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async incrementUsage(id) {
        return this.prisma.coupon.update({
            where: { id },
            data: {
                usedCount: { increment: 1 },
            },
        });
    }
    async getCouponStats() {
        const now = new Date();
        const [totalCoupons, activeCoupons, expiredCoupons, discountAgg] = await Promise.all([
            this.prisma.coupon.count(),
            this.prisma.coupon.count({
                where: {
                    status: client_1.CouponStatus.ACTIVE,
                    endDate: { gte: now },
                },
            }),
            this.prisma.coupon.count({
                where: {
                    OR: [{ status: client_1.CouponStatus.EXPIRED }, { endDate: { lt: now } }],
                },
            }),
            this.prisma.couponUsage.aggregate({
                _sum: { discount: true },
            }),
        ]);
        return {
            totalCoupons,
            activeCoupons,
            expiredCoupons,
            totalDiscountIssued: Number(discountAgg._sum.discount || 0),
        };
    }
}
exports.CouponRepository = CouponRepository;
