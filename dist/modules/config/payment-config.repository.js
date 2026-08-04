"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentGatewayRepository = void 0;
const prisma_config_1 = require("../../config/prisma.config");
const client_1 = require("@prisma/client");
const encryption_util_1 = require("../../utils/encryption.util");
exports.paymentGatewayRepository = {
    async findAll() {
        return prisma_config_1.prisma.paymentGateway.findMany({
            orderBy: { name: 'asc' },
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.paymentGateway.findUnique({ where: { id } });
    },
    async create(data) {
        const { apiKey, apiSecret, webhookSecret, supportedCurrencies, ...rest } = data;
        return prisma_config_1.prisma.paymentGateway.create({
            data: {
                ...rest,
                apiKey: (0, encryption_util_1.encryptOptional)(apiKey),
                apiSecret: (0, encryption_util_1.encryptOptional)(apiSecret),
                webhookSecret: (0, encryption_util_1.encryptOptional)(webhookSecret),
                supportedCurrencies: supportedCurrencies ?? ['INR'],
            },
        });
    },
    async update(id, data) {
        const updateData = { ...data };
        if (Object.prototype.hasOwnProperty.call(data, 'apiKey')) {
            updateData.apiKey = (0, encryption_util_1.encryptOptional)(data.apiKey);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'apiSecret')) {
            updateData.apiSecret = (0, encryption_util_1.encryptOptional)(data.apiSecret);
        }
        if (Object.prototype.hasOwnProperty.call(data, 'webhookSecret')) {
            updateData.webhookSecret = (0, encryption_util_1.encryptOptional)(data.webhookSecret);
        }
        if (data.supportedCurrencies !== undefined) {
            updateData.supportedCurrencies = data.supportedCurrencies;
        }
        return prisma_config_1.prisma.paymentGateway.update({ where: { id }, data: updateData });
    },
    async delete(id) {
        return prisma_config_1.prisma.paymentGateway.delete({ where: { id } });
    },
    async toggle(id, enabled) {
        return prisma_config_1.prisma.paymentGateway.update({ where: { id }, data: { enabled } });
    },
    async markTested(id, success, error) {
        return prisma_config_1.prisma.paymentGateway.update({
            where: { id },
            data: {
                lastTestedAt: new Date(),
                status: success ? client_1.ProviderStatus.ACTIVE : client_1.ProviderStatus.ERROR,
                lastError: success ? null : error,
            },
        });
    },
};
