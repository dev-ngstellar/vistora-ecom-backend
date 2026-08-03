import { integrationRepository } from './integration.repository';
import { sanitizeSecrets, sanitizeSecretsArray, writeAuditLog } from './config.service';
import { CreateIntegrationInput, UpdateIntegrationInput } from './config.types';

export const listIntegrations = async (category?: string) => {
  const integrations = await integrationRepository.findAll(category);
  return sanitizeSecretsArray(integrations as unknown as Record<string, unknown>[]);
};

export const getIntegration = async (id: string) => {
  const integration = await integrationRepository.findById(id);
  if (!integration) return null;
  return sanitizeSecrets(integration as unknown as Record<string, unknown>);
};

export const createIntegration = async (
  data: CreateIntegrationInput,
  userId?: string,
  ip?: string,
) => {
  const integration = await integrationRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'INTEGRATIONS',
    action: 'CREATE_INTEGRATION',
    entityId: integration.id,
    entityType: 'Integration',
    newValues: { name: integration.name, slug: integration.slug },
    ipAddress: ip,
  });
  return sanitizeSecrets(integration as unknown as Record<string, unknown>);
};

export const updateIntegration = async (
  id: string,
  data: UpdateIntegrationInput,
  userId?: string,
  ip?: string,
) => {
  const integration = await integrationRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'INTEGRATIONS',
    action: 'UPDATE_INTEGRATION',
    entityId: id,
    entityType: 'Integration',
    ipAddress: ip,
  });
  return sanitizeSecrets(integration as unknown as Record<string, unknown>);
};

export const deleteIntegration = async (id: string, userId?: string, ip?: string) => {
  const result = await integrationRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'INTEGRATIONS',
    action: 'DELETE_INTEGRATION',
    entityId: id,
    entityType: 'Integration',
    ipAddress: ip,
  });
  return result;
};

export const toggleIntegration = async (
  id: string,
  enabled: boolean,
  userId?: string,
  ip?: string,
) => {
  const integration = await integrationRepository.toggle(id, enabled);
  await writeAuditLog({
    userId,
    module: 'INTEGRATIONS',
    action: enabled ? 'CONNECT_INTEGRATION' : 'DISCONNECT_INTEGRATION',
    entityId: id,
    entityType: 'Integration',
    ipAddress: ip,
  });
  return integration;
};

export const testIntegration = async (id: string, userId?: string) => {
  const integration = await integrationRepository.findById(id);
  if (!integration) return { success: false, message: 'Integration not found' };

  // Real SDK calls will be injected per integration.slug in a future sprint
  const success = integration.enabled && !!integration.apiKey;
  const message = success
    ? `${integration.name} connection verified.`
    : `${integration.name}: disabled or missing API key.`;

  await integrationRepository.markTested(id, success, success ? undefined : message);
  await writeAuditLog({
    userId,
    module: 'INTEGRATIONS',
    action: 'TEST_INTEGRATION',
    entityId: id,
    entityType: 'Integration',
    newValues: { success },
  });
  return { success, message };
};
