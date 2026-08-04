"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrandRepository = void 0;
const base_repository_1 = require("./base.repository");
class BrandRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.brand;
    }
    async findBySlug(slug) {
        return this.prisma.brand.findFirst({
            where: { slug: slug.toLowerCase(), deletedAt: null },
        });
    }
    async findByIdActive(id) {
        return this.prisma.brand.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findManyActive(where) {
        return this.prisma.brand.findMany({
            where: {
                ...where,
                deletedAt: null,
            },
            orderBy: { name: 'asc' },
        });
    }
    async softDelete(id) {
        return this.prisma.brand.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.BrandRepository = BrandRepository;
