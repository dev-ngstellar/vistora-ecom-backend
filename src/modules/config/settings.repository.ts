import { prisma } from '../../config/prisma.config';
import { UpsertSettingInput } from './config.types';

export const settingsRepository = {
  async findAll() {
    return prisma.setting.findMany({ orderBy: { key: 'asc' } });
  },

  async findByKey(key: string) {
    return prisma.setting.findUnique({ where: { key } });
  },

  async upsert(data: UpsertSettingInput, updatedBy?: string) {
    return prisma.setting.upsert({
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

  async bulkUpsert(settings: UpsertSettingInput[], updatedBy?: string) {
    return prisma.$transaction(
      settings.map((s) =>
        prisma.setting.upsert({
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
        }),
      ),
    );
  },

  async delete(key: string) {
    return prisma.setting.delete({ where: { key } });
  },
};
