"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shippingZoneRepository = exports.shippingMethodRepository = exports.shippingProviderRepository = void 0;
const prisma_config_1 = require("../../config/prisma.config");
const client_1 = require("@prisma/client");
const encryption_util_1 = require("../../utils/encryption.util");
// ==================== SHIPPING PROVIDER REPOSITORY ====================
exports.shippingProviderRepository = {
    async findAll() {
        return prisma_config_1.prisma.shippingProvider.findMany({
            include: { methods: true },
            orderBy: { priority: 'asc' },
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.shippingProvider.findUnique({
            where: { id },
            include: { methods: true },
        });
    },
    async create(data) {
        return prisma_config_1.prisma.shippingProvider.create({
            data: {
                ...data,
                apiKey: (0, encryption_util_1.encryptOptional)(data.apiKey),
                apiSecret: (0, encryption_util_1.encryptOptional)(data.apiSecret),
            },
            include: { methods: true },
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
        return prisma_config_1.prisma.shippingProvider.update({
            where: { id },
            data: updateData,
            include: { methods: true },
        });
    },
    async delete(id) {
        return prisma_config_1.prisma.shippingProvider.delete({ where: { id } });
    },
    async toggle(id, enabled) {
        return prisma_config_1.prisma.shippingProvider.update({
            where: { id },
            data: { enabled },
        });
    },
    async markTested(id, success, error) {
        return prisma_config_1.prisma.shippingProvider.update({
            where: { id },
            data: {
                lastTestedAt: new Date(),
                status: success ? client_1.ProviderStatus.ACTIVE : client_1.ProviderStatus.ERROR,
                lastError: success ? null : error,
            },
        });
    },
};
// ==================== SHIPPING METHOD REPOSITORY ====================
exports.shippingMethodRepository = {
    async findAll() {
        return prisma_config_1.prisma.shippingMethod.findMany({
            include: { provider: true, zoneAssignments: { include: { zone: true } } },
            orderBy: { name: 'asc' },
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.shippingMethod.findUnique({
            where: { id },
            include: { provider: true },
        });
    },
    async create(data) {
        const { baseRate, freeThreshold, ...rest } = data;
        return prisma_config_1.prisma.shippingMethod.create({
            data: {
                ...rest,
                baseRate: baseRate ? new client_1.Prisma.Decimal(baseRate) : new client_1.Prisma.Decimal(0),
                freeThreshold: freeThreshold ? new client_1.Prisma.Decimal(freeThreshold) : null,
            },
            include: { provider: true },
        });
    },
    async update(id, data) {
        const { baseRate, freeThreshold, ...rest } = data;
        return prisma_config_1.prisma.shippingMethod.update({
            where: { id },
            data: {
                ...rest,
                ...(baseRate !== undefined && { baseRate: new client_1.Prisma.Decimal(baseRate) }),
                ...(freeThreshold !== undefined && {
                    freeThreshold: freeThreshold ? new client_1.Prisma.Decimal(freeThreshold) : null,
                }),
            },
            include: { provider: true },
        });
    },
    async delete(id) {
        return prisma_config_1.prisma.shippingMethod.delete({ where: { id } });
    },
};
// ==================== SHIPPING ZONE REPOSITORY ====================
exports.shippingZoneRepository = {
    async findAll() {
        return prisma_config_1.prisma.shippingZone.findMany({
            include: { methods: { include: { method: true } } },
            orderBy: { name: 'asc' },
        });
    },
    async findById(id) {
        return prisma_config_1.prisma.shippingZone.findUnique({
            where: { id },
            include: { methods: { include: { method: true } } },
        });
    },
    async create(data) {
        const { methodIds = [], countries, states, ...rest } = data;
        return prisma_config_1.prisma.shippingZone.create({
            data: {
                ...rest,
                countries: countries ?? [],
                states: states ?? [],
                methods: {
                    create: methodIds.map((methodId) => ({ methodId })),
                },
            },
            include: { methods: { include: { method: true } } },
        });
    },
    async update(id, data) {
        const { methodIds, countries, states, ...rest } = data;
        const updateData = { ...rest };
        if (countries !== undefined)
            updateData.countries = countries;
        if (states !== undefined)
            updateData.states = states;
        if (methodIds !== undefined) {
            await prisma_config_1.prisma.shippingZoneMethod.deleteMany({ where: { zoneId: id } });
            updateData.methods = {
                create: methodIds.map((methodId) => ({ methodId })),
            };
        }
        return prisma_config_1.prisma.shippingZone.update({
            where: { id },
            data: updateData,
            include: { methods: { include: { method: true } } },
        });
    },
    async delete(id) {
        return prisma_config_1.prisma.shippingZone.delete({ where: { id } });
    },
};
