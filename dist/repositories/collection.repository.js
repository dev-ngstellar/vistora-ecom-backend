"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectionRepository = void 0;
const base_repository_1 = require("./base.repository");
class CollectionRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.collection;
    }
    async findBySlug(slug) {
        return this.prisma.collection.findFirst({
            where: { slug: slug.toLowerCase(), deletedAt: null },
        });
    }
    async findByIdActive(id) {
        return this.prisma.collection.findFirst({
            where: { id, deletedAt: null },
        });
    }
    async findManyActive(where) {
        return this.prisma.collection.findMany({
            where: {
                ...where,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async softDelete(id) {
        return this.prisma.collection.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.CollectionRepository = CollectionRepository;
