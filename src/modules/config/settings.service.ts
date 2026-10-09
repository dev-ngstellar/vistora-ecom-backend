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

export interface TaxSettingsData {
  taxRate: number;
  taxLabel: string;
  taxInclusive: boolean;
  gstNumber: string;
}

export const getTaxSettings = async (): Promise<TaxSettingsData> => {
  const defaultTax: TaxSettingsData = {
    taxRate: 5,
    taxLabel: 'GST',
    taxInclusive: false,
    gstNumber: '27AABCV1234A1Z5',
  };

  try {
    const setting = await settingsRepository.findByKey('tax_settings');
    if (setting?.value) {
      const parsed = JSON.parse(setting.value);
      return {
        taxRate:
          parsed.taxRate !== undefined && !isNaN(Number(parsed.taxRate))
            ? Number(parsed.taxRate)
            : defaultTax.taxRate,
        taxLabel: parsed.taxLabel || defaultTax.taxLabel,
        taxInclusive:
          parsed.taxInclusive !== undefined
            ? Boolean(parsed.taxInclusive)
            : defaultTax.taxInclusive,
        gstNumber: parsed.gstNumber || defaultTax.gstNumber,
      };
    }
  } catch (err) {}

  return defaultTax;
};

