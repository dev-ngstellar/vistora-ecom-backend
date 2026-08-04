"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationTemplateRepository = exports.notificationChannelRepository = void 0;
const prisma_config_1 = require("../../config/prisma.config");
const client_1 = require("@prisma/client");
const encryption_util_1 = require("../../utils/encryption.util");
// ==================== NOTIFICATION CHANNEL ====================
exports.notificationChannelRepository = {
    async findAll() {
        return prisma_config_1.prisma.notificationChannel.findMany({
            include: { templates: true },
            orderBy: { type: 'asc' },
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.notificationChannel.findUnique({
            where: { id },
            include: { templates: true },
        });
    },
    async findByType(type) {
        return prisma_config_1.prisma.notificationChannel.findUnique({ where: { type } });
    },
    async upsert(data) {
        const { apiKey, apiSecret, type, ...rest } = data;
        const encryptedKey = (0, encryption_util_1.encryptOptional)(apiKey);
        const encryptedSecret = (0, encryption_util_1.encryptOptional)(apiSecret);
        return prisma_config_1.prisma.notificationChannel.upsert({
            where: { type },
            create: {
                type,
                ...rest,
                apiKey: encryptedKey,
                apiSecret: encryptedSecret,
            },
            update: {
                ...rest,
                ...(Object.prototype.hasOwnProperty.call(data, 'apiKey') && { apiKey: encryptedKey }),
                ...(Object.prototype.hasOwnProperty.call(data, 'apiSecret') && { apiSecret: encryptedSecret }),
            },
            include: { templates: true },
        });
    },
    async toggle(id, enabled) {
        return prisma_config_1.prisma.notificationChannel.update({
            where: { id },
            data: { enabled, status: enabled ? client_1.ProviderStatus.ACTIVE : client_1.ProviderStatus.INACTIVE },
        });
    },
    async markTested(id, success, error) {
        return prisma_config_1.prisma.notificationChannel.update({
            where: { id },
            data: {
                lastTestedAt: new Date(),
                status: success ? client_1.ProviderStatus.ACTIVE : client_1.ProviderStatus.ERROR,
                lastError: success ? null : error,
            },
        });
    },
};
// ==================== NOTIFICATION TEMPLATE ====================
exports.notificationTemplateRepository = {
    async findAll() {
        return prisma_config_1.prisma.notificationTemplate.findMany({
            include: { channel: true },
            orderBy: [{ event: 'asc' }, { channelType: 'asc' }],
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.notificationTemplate.findUnique({
            where: { id },
            include: { channel: true },
        });
    },
    async create(data) {
        return prisma_config_1.prisma.notificationTemplate.create({
            data: {
                event: data.event,
                channelType: data.channelType,
                channelId: data.channelId ?? null,
                subject: data.subject ?? null,
                body: data.body,
                variables: data.variables ?? [],
                enabled: data.enabled ?? true,
            },
            include: { channel: true },
        });
    },
    async update(id, data) {
        return prisma_config_1.prisma.notificationTemplate.update({
            where: { id },
            data: {
                ...data,
                variables: data.variables ?? undefined,
            },
            include: { channel: true },
        });
    },
    async delete(id) {
        return prisma_config_1.prisma.notificationTemplate.delete({ where: { id } });
    },
};
