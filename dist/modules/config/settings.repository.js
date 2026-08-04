"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settingsRepository = void 0;
const prisma_config_1 = require("../../config/prisma.config");
exports.settingsRepository = {
    async findAll() {
        return prisma_config_1.prisma.setting.findMany({ orderBy: { key: 'asc' } });
    },
    async findByKey(key) {
        return prisma_config_1.prisma.setting.findUnique({ where: { key } });
    },
    async upsert(data, updatedBy) {
        return prisma_config_1.prisma.setting.upsert({
            where: { key: data.key },
            create: {
                key: data.key,
                value: data.value,
                description: data.description ?? null,
                updatedBy: updatedBy ?? null,
            },
            update: {
                value: data.value,
                description: data.description ?? undefined,
                updatedBy: updatedBy ?? null,
            },
        });
    },
    async bulkUpsert(settings, updatedBy) {
        return prisma_config_1.prisma.$transaction(settings.map((s) => prisma_config_1.prisma.setting.upsert({
            where: { key: s.key },
            create: {
                key: s.key,
                value: s.value,
                description: s.description ?? null,
                updatedBy: updatedBy ?? null,
            },
            update: {
                value: s.value,
                description: s.description ?? undefined,
                updatedBy: updatedBy ?? null,
            },
        })));
    },
    async delete(key) {
        return prisma_config_1.prisma.setting.delete({ where: { key } });
    },
};
