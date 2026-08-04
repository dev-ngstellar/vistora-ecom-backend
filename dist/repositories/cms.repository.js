"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CMSRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class CMSRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.cMSPage;
    }
    async findPages(filters) {
        const page = filters.page && filters.page > 0 ? filters.page : 1;
        const limit = filters.limit && filters.limit > 0 ? filters.limit : 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.search) {
            const search = filters.search.trim();
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { content: { contains: search, mode: 'insensitive' } },
                { metaTitle: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [pages, total] = await Promise.all([
            this.prisma.cMSPage.findMany({
                where,
                skip,
                take: limit,
                orderBy: { updatedAt: 'desc' },
            }),
            this.prisma.cMSPage.count({ where }),
        ]);
        return {
            pages,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findBySlug(slug) {
        return this.prisma.cMSPage.findUnique({
            where: { slug: slug.toLowerCase() },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.cMSPage.update({
            where: { id },
            data: {
                status,
                ...(status === client_1.CMSPageStatus.PUBLISHED ? { publishedAt: new Date() } : {}),
            },
        });
    }
}
exports.CMSRepository = CMSRepository;
