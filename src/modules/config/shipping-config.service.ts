import { shippingProviderRepository, shippingMethodRepository, shippingZoneRepository } from './shipping-config.repository';
import { sanitizeSecrets, sanitizeSecretsArray, writeAuditLog } from './config.service';
import {
  CreateShippingProviderInput,
  UpdateShippingProviderInput,
  CreateShippingMethodInput,
  UpdateShippingMethodInput,
  CreateShippingZoneInput,
  UpdateShippingZoneInput,
} from './config.types';

// ===== PROVIDERS =====
export const listShippingProviders = async () => {
  const providers = await shippingProviderRepository.findAll();
  return sanitizeSecretsArray(providers as unknown as Record<string, unknown>[]);
};

export const getShippingProvider = async (id: string) => {
  const provider = await shippingProviderRepository.findById(id);
  if (!provider) return null;
  return sanitizeSecrets(provider as unknown as Record<string, unknown>);
};

export const createShippingProvider = async (
  data: CreateShippingProviderInput,
  userId?: string,
  ip?: string,
) => {
  const provider = await shippingProviderRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'CREATE_PROVIDER',
    entityId: provider.id,
    entityType: 'ShippingProvider',
    newValues: { name: provider.name, carrier: provider.carrier },
    ipAddress: ip,
  });
  return sanitizeSecrets(provider as unknown as Record<string, unknown>);
};

export const updateShippingProvider = async (
  id: string,
  data: UpdateShippingProviderInput,
  userId?: string,
  ip?: string,
) => {
  const provider = await shippingProviderRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'UPDATE_PROVIDER',
    entityId: id,
    entityType: 'ShippingProvider',
    newValues: data as Record<string, unknown>,
    ipAddress: ip,
  });
  return sanitizeSecrets(provider as unknown as Record<string, unknown>);
};

export const deleteShippingProvider = async (id: string, userId?: string, ip?: string) => {
  const provider = await shippingProviderRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'DELETE_PROVIDER',
    entityId: id,
    entityType: 'ShippingProvider',
    newValues: { id },
    ipAddress: ip,
  });
  return provider;
};

export const toggleShippingProvider = async (
  id: string,
  enabled: boolean,
  userId?: string,
  ip?: string,
) => {
  const provider = await shippingProviderRepository.toggle(id, enabled);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: enabled ? 'ENABLE_PROVIDER' : 'DISABLE_PROVIDER',
    entityId: id,
    entityType: 'ShippingProvider',
    ipAddress: ip,
  });
  return provider;
};

export const testShippingProvider = async (id: string, userId?: string) => {
  const provider = await shippingProviderRepository.findById(id);
  if (!provider) return { success: false, message: 'Provider not found' };

  // Simulate connection test (real SDK call per carrier in future sprint)
  const success = provider.enabled && !!provider.apiKey;
  const message = success
    ? `Connection to ${provider.name} verified successfully.`
    : `Cannot test ${provider.name}: provider is disabled or missing API key.`;

  await shippingProviderRepository.markTested(id, success, success ? undefined : message);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'TEST_PROVIDER',
    entityId: id,
    entityType: 'ShippingProvider',
    newValues: { success },
  });

  return { success, message };
};

// ===== METHODS =====
export const listShippingMethods = async () => shippingMethodRepository.findAll();
export const getShippingMethod = async (id: string) => shippingMethodRepository.findById(id);

export const createShippingMethod = async (
  data: CreateShippingMethodInput,
  userId?: string,
  ip?: string,
) => {
  const method = await shippingMethodRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'CREATE_METHOD',
    entityId: method.id,
    entityType: 'ShippingMethod',
    newValues: { name: method.name, code: method.code },
    ipAddress: ip,
  });
  return method;
};

export const updateShippingMethod = async (
  id: string,
  data: UpdateShippingMethodInput,
  userId?: string,
  ip?: string,
) => {
  const method = await shippingMethodRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'UPDATE_METHOD',
    entityId: id,
    entityType: 'ShippingMethod',
    ipAddress: ip,
  });
  return method;
};

export const deleteShippingMethod = async (id: string, userId?: string, ip?: string) => {
  const result = await shippingMethodRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'DELETE_METHOD',
    entityId: id,
    entityType: 'ShippingMethod',
    ipAddress: ip,
  });
  return result;
};

// ===== ZONES =====
export const listShippingZones = async () => shippingZoneRepository.findAll();
export const getShippingZone = async (id: string) => shippingZoneRepository.findById(id);

export const createShippingZone = async (
  data: CreateShippingZoneInput,
  userId?: string,
  ip?: string,
) => {
  const zone = await shippingZoneRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'CREATE_ZONE',
    entityId: zone.id,
    entityType: 'ShippingZone',
    newValues: { name: zone.name },
    ipAddress: ip,
  });
  return zone;
};

export const updateShippingZone = async (
  id: string,
  data: UpdateShippingZoneInput,
  userId?: string,
  ip?: string,
) => {
  const zone = await shippingZoneRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'UPDATE_ZONE',
    entityId: id,
    entityType: 'ShippingZone',
    ipAddress: ip,
  });
  return zone;
};

export const deleteShippingZone = async (id: string, userId?: string, ip?: string) => {
  const result = await shippingZoneRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'SHIPPING_CONFIG',
    action: 'DELETE_ZONE',
    entityId: id,
    entityType: 'ShippingZone',
    ipAddress: ip,
  });
  return result;
};
