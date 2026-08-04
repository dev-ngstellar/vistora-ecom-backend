"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const prisma_config_1 = require("../config/prisma.config");
class BaseRepository {
    prisma;
    constructor(prismaClient = prisma_config_1.prisma) {
        this.prisma = prismaClient;
    }
    async findMany(options) {
        return this.model.findMany(options);
    }
    async findById(id, include) {
        const args = { where: { id } };
        if (include) {
            args['include'] = include;
        }
        return this.model.findUnique(args);
    }
    async findOne(where, include) {
        const args = { where };
        if (include) {
            args['include'] = include;
        }
        return this.model.findFirst(args);
    }
    async create(data, include) {
        const args = { data };
        if (include) {
            args['include'] = include;
        }
        return this.model.create(args);
    }
    async update(id, data, include) {
        const args = {
            where: { id },
            data,
        };
        if (include) {
            args['include'] = include;
        }
        return this.model.update(args);
    }
    async delete(id) {
        return this.model.delete({
            where: { id },
        });
    }
    async count(where) {
        return this.model.count(where ? { where } : undefined);
    }
    async exists(where) {
        const record = await this.model.findFirst({ where });
        return record !== null;
    }
}
exports.BaseRepository = BaseRepository;
