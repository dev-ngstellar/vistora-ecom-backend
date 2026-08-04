"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRepository = void 0;
const base_repository_1 = require("./base.repository");
class BannerRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.banner;
    }
    async findBanners(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.position) {
            where.position = filters.position;
        }
        if (filters.isActive !== undefined) {
            where.isActive = filters.isActive;
        }
        if (filters.search) {
            const search = filters.search.trim();
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { subtitle: { contains: search, mode: 'insensitive' } },
                { buttonText: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [banners, total] = await Promise.all([
            this.prisma.banner.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
            }),
            this.prisma.banner.count({ where }),
        ]);
        return {
            banners,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findActivePublicBanners(position) {
        const now = new Date();
        const where = {
            isActive: true,
            ...(position ? { position } : {}),
            AND: [
                { OR: [{ startDate: null }, { startDate: { lte: now } }] },
                { OR: [{ endDate: null }, { endDate: { gte: now } }] },
            ],
        };
        return this.prisma.banner.findMany({
            where,
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        });
    }
    async toggleActiveStatus(id, isActive) {
        return this.prisma.banner.update({
            where: { id },
            data: { isActive },
        });
    }
}
exports.BannerRepository = BannerRepository;
