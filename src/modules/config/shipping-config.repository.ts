import { prisma } from '../../config/prisma.config';
import { Prisma, ProviderStatus } from '@prisma/client';
import {
  CreateShippingProviderInput,
  UpdateShippingProviderInput,
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
  CreateShippingZoneInput,
  UpdateShippingZoneInput,
} from './config.types';
import { encryptOptional } from '../../utils/encryption.util';

// ==================== SHIPPING PROVIDER REPOSITORY ====================
export const shippingProviderRepository = {
  async findAll() {
    return prisma.shippingProvider.findMany({
      include: { methods: true },
      orderBy: { priority: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.shippingProvider.findUnique({
      where: { id },
      include: { methods: true },
    });
  },

  async create(data: CreateShippingProviderInput) {
    return prisma.shippingProvider.create({
      data: {
        ...data,
        apiKey: encryptOptional(data.apiKey),
        apiSecret: encryptOptional(data.apiSecret),
      },
      include: { methods: true },
    });
  },

  async update(id: string, data: UpdateShippingProviderInput) {
    const updateData: Prisma.ShippingProviderUpdateInput = { ...data };
    if (Object.prototype.hasOwnProperty.call(data, 'apiKey')) {
      updateData.apiKey = encryptOptional(data.apiKey);
    }
    if (Object.prototype.hasOwnProperty.call(data, 'apiSecret')) {
      updateData.apiSecret = encryptOptional(data.apiSecret);
    }
    return prisma.shippingProvider.update({
      where: { id },
      data: updateData,
      include: { methods: true },
    });
  },

  async delete(id: string) {
    return prisma.shippingProvider.delete({ where: { id } });
  },

  async toggle(id: string, enabled: boolean) {
    return prisma.shippingProvider.update({
      where: { id },
      data: { enabled },
    });
  },

  async markTested(id: string, success: boolean, error?: string) {
    return prisma.shippingProvider.update({
      where: { id },
      data: {
        lastTestedAt: new Date(),
        status: success ? ProviderStatus.ACTIVE : ProviderStatus.ERROR,
        lastError: success ? null : error,
      },
    });
  },
};

// ==================== SHIPPING METHOD REPOSITORY ====================
export const shippingMethodRepository = {
  async findAll() {
    return prisma.shippingMethod.findMany({
      include: { provider: true, zoneAssignments: { include: { zone: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.shippingMethod.findUnique({
      where: { id },
      include: { provider: true },
    });
  },

  async create(data: CreateShippingMethodInput) {
    const { baseRate, freeThreshold, ...rest } = data;
    return prisma.shippingMethod.create({
      data: {
        ...rest,
        baseRate: baseRate ? new Prisma.Decimal(baseRate) : new Prisma.Decimal(0),
        freeThreshold: freeThreshold ? new Prisma.Decimal(freeThreshold) : null,
      },
      include: { provider: true },
    });
  },

  async update(id: string, data: UpdateShippingMethodInput) {
    const { baseRate, freeThreshold, ...rest } = data;
    return prisma.shippingMethod.update({
      where: { id },
      data: {
        ...rest,
        ...(baseRate !== undefined && { baseRate: new Prisma.Decimal(baseRate) }),
        ...(freeThreshold !== undefined && {
          freeThreshold: freeThreshold ? new Prisma.Decimal(freeThreshold) : null,
        }),
      },
      include: { provider: true },
    });
  },

  async delete(id: string) {
    return prisma.shippingMethod.delete({ where: { id } });
  },
};

// ==================== SHIPPING ZONE REPOSITORY ====================
export const shippingZoneRepository = {
  async findAll() {
    return prisma.shippingZone.findMany({
      include: { methods: { include: { method: true } } },
      orderBy: { name: 'asc' },
    });
  },

  async findById(id: string) {
    return prisma.shippingZone.findUnique({
      where: { id },
      include: { methods: { include: { method: true } } },
    });
  },

  async create(data: CreateShippingZoneInput) {
    const { methodIds = [], countries, states, ...rest } = data;
    return prisma.shippingZone.create({
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

  async update(id: string, data: UpdateShippingZoneInput) {
    const { methodIds, countries, states, ...rest } = data;
    const updateData: Prisma.ShippingZoneUpdateInput = { ...rest };
    if (countries !== undefined) updateData.countries = countries;
    if (states !== undefined) updateData.states = states;

    if (methodIds !== undefined) {
      await prisma.shippingZoneMethod.deleteMany({ where: { zoneId: id } });
      updateData.methods = {
        create: methodIds.map((methodId) => ({ methodId })),
      };
    }

    return prisma.shippingZone.update({
      where: { id },
      data: updateData,
      include: { methods: { include: { method: true } } },
    });
  },

  async delete(id: string) {
    return prisma.shippingZone.delete({ where: { id } });
  },
};
