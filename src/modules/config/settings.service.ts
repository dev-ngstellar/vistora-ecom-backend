import { settingsRepository } from './settings.repository';
import { writeAuditLog } from './config.service';
import { UpsertSettingInput, BulkUpsertSettingsInput } from './config.types';

export const listSettings = async () => settingsRepository.findAll();

export const getSetting = async (key: string) => settingsRepository.findByKey(key);

export const upsertSetting = async (
  data: UpsertSettingInput,
  userId?: string,
  ip?: string,
) => {
  const existing = await settingsRepository.findByKey(data.key);
  const setting = await settingsRepository.upsert(data, userId);
  await writeAuditLog({
    userId,
    module: 'SETTINGS',
    action: existing ? 'UPDATE_SETTING' : 'CREATE_SETTING',
    entityId: setting.id,
    entityType: 'Setting',
    oldValues: existing ? { value: existing.value } : undefined,
    newValues: { key: setting.key, value: setting.value },
    ipAddress: ip,
  });
  return setting;
};

export const bulkUpsertSettings = async (
  data: BulkUpsertSettingsInput,
  userId?: string,
  ip?: string,
) => {
  const results = await settingsRepository.bulkUpsert(data.settings, userId);
  await writeAuditLog({
    userId,
    module: 'SETTINGS',
    action: 'BULK_UPSERT_SETTINGS',
    entityType: 'Setting',
    newValues: { count: data.settings.length },
    ipAddress: ip,
  });
  return results;
};

export const deleteSetting = async (key: string, userId?: string, ip?: string) => {
  const result = await settingsRepository.delete(key);
  await writeAuditLog({
    userId,
    module: 'SETTINGS',
    action: 'DELETE_SETTING',
    entityType: 'Setting',
    newValues: { key },
    ipAddress: ip,
  });
  return result;
};
