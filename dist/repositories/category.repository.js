"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const client_1 = require("@prisma/client");
const base_repository_1 = require("./base.repository");
class CategoryRepository extends base_repository_1.BaseRepository {
    model;
    constructor() {
        super();
        this.model = this.prisma.category;
    }
    async findBySlug(slug) {
        return this.prisma.category.findFirst({
            where: { slug: slug.toLowerCase(), deletedAt: null },
            include: {
                parent: true,
                children: { where: { deletedAt: null } },
            },
        });
    }
    async findByIdActive(id) {
        return this.prisma.category.findFirst({
            where: { id, deletedAt: null },
            include: {
                parent: true,
                children: { where: { deletedAt: null } },
            },
        });
    }
    async findManyActive(where) {
        return this.prisma.category.findMany({
            where: {
                ...where,
                deletedAt: null,
            },
            orderBy: { sortOrder: 'asc' },
        });
    }
    async getCategoryTree() {
        return this.prisma.category.findMany({
            where: { parentId: null, deletedAt: null, status: client_1.CategoryStatus.ACTIVE },
            orderBy: { sortOrder: 'asc' },
            include: {
                children: {
                    where: { deletedAt: null, status: client_1.CategoryStatus.ACTIVE },
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        children: {
                            where: { deletedAt: null, status: client_1.CategoryStatus.ACTIVE },
                            orderBy: { sortOrder: 'asc' },
                        },
                    },
                },
            },
        });
    }
    async softDelete(id) {
        return this.prisma.category.update({
            where: { id },
            data: { deletedAt: new Date() },
        });
    }
}
exports.CategoryRepository = CategoryRepository;
