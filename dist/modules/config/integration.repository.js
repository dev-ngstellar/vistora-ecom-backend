"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationRepository = void 0;
const prisma_config_1 = require("../../config/prisma.config");
const client_1 = require("@prisma/client");
const encryption_util_1 = require("../../utils/encryption.util");
exports.integrationRepository = {
    async findAll(category) {
        return prisma_config_1.prisma.integration.findMany({
            where: category ? { category: category } : undefined,
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.integration.findUnique({ where: { id } });
    },
    async findBySlug(slug) {
        return prisma_config_1.prisma.integration.findUnique({ where: { slug } });
    },
    async create(data) {
        const { apiKey, apiSecret, config, ...rest } = data;
        return prisma_config_1.prisma.integration.create({
            data: {
                ...rest,
                apiKey: (0, encryption_util_1.encryptOptional)(apiKey),
                apiSecret: (0, encryption_util_1.encryptOptional)(apiSecret),
                config: config ? (0, encryption_util_1.encryptOptional)(JSON.stringify(config)) : null,
            },
        });
    },
    async update(id, data) {
        const updateData = { ...data };
        if (Object.prototype.hasOwnProperty.call(data, 'apiKey')) {
            updateData['apiKey'] = (0, encryption_util_1.encryptOptional)(data.apiKey);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'apiSecret')) {
            updateData['apiSecret'] = (0, encryption_util_1.encryptOptional)(data.apiSecret);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'config')) {
            updateData['config'] = data.config ? (0, encryption_util_1.encryptOptional)(JSON.stringify(data.config)) : null;
        }
        return prisma_config_1.prisma.integration.update({ where: { id }, data: updateData });
    },
    async delete(id) {
        return prisma_config_1.prisma.integration.delete({ where: { id } });
    },
    async toggle(id, enabled) {
        return prisma_config_1.prisma.integration.update({
            where: { id },
            data: {
                enabled,
                status: enabled ? client_1.IntegrationStatus.CONNECTED : client_1.IntegrationStatus.DISCONNECTED,
            },
        });
    },
    async markTested(id, success, error) {
        return prisma_config_1.prisma.integration.update({
            where: { id },
            data: {
                lastTestedAt: new Date(),
                status: success ? client_1.IntegrationStatus.CONNECTED : client_1.IntegrationStatus.ERROR,
                lastError: success ? null : error,
            },
        });
    },
    async markSynced(id) {
        return prisma_config_1.prisma.integration.update({
            where: { id },
            data: { lastSyncAt: new Date() },
        });
    },
};
