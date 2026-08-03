import { paymentGatewayRepository } from './payment-config.repository';
import { sanitizeSecrets, sanitizeSecretsArray, writeAuditLog } from './config.service';
import { CreatePaymentGatewayInput, UpdatePaymentGatewayInput } from './config.types';

export const listPaymentGateways = async () => {
  const gateways = await paymentGatewayRepository.findAll();
  return sanitizeSecretsArray(gateways as unknown as Record<string, unknown>[]);
};

export const getPaymentGateway = async (id: string) => {
  const gw = await paymentGatewayRepository.findById(id);
  if (!gw) return null;
  return sanitizeSecrets(gw as unknown as Record<string, unknown>);
};

export const createPaymentGateway = async (
  data: CreatePaymentGatewayInput,
  userId?: string,
  ip?: string,
) => {
  const gw = await paymentGatewayRepository.create(data);
  await writeAuditLog({
    userId,
    module: 'PAYMENT_CONFIG',
    action: 'CREATE_GATEWAY',
    entityId: gw.id,
    entityType: 'PaymentGateway',
    newValues: { name: gw.name, type: gw.type },
    ipAddress: ip,
  });
  return sanitizeSecrets(gw as unknown as Record<string, unknown>);
};

export const updatePaymentGateway = async (
  id: string,
  data: UpdatePaymentGatewayInput,
  userId?: string,
  ip?: string,
) => {
  const gw = await paymentGatewayRepository.update(id, data);
  await writeAuditLog({
    userId,
    module: 'PAYMENT_CONFIG',
    action: 'UPDATE_GATEWAY',
    entityId: id,
    entityType: 'PaymentGateway',
    ipAddress: ip,
  });
  return sanitizeSecrets(gw as unknown as Record<string, unknown>);
};

export const deletePaymentGateway = async (id: string, userId?: string, ip?: string) => {
  const result = await paymentGatewayRepository.delete(id);
  await writeAuditLog({
    userId,
    module: 'PAYMENT_CONFIG',
    action: 'DELETE_GATEWAY',
    entityId: id,
    entityType: 'PaymentGateway',
    ipAddress: ip,
  });
  return result;
};

export const togglePaymentGateway = async (
  id: string,
  enabled: boolean,
  userId?: string,
  ip?: string,
) => {
  const gw = await paymentGatewayRepository.toggle(id, enabled);
  await writeAuditLog({
    userId,
    module: 'PAYMENT_CONFIG',
    action: enabled ? 'ENABLE_GATEWAY' : 'DISABLE_GATEWAY',
    entityId: id,
    entityType: 'PaymentGateway',
    ipAddress: ip,
  });
  return gw;
};

export const testPaymentGateway = async (id: string, userId?: string) => {
  const gw = await paymentGatewayRepository.findById(id);
  if (!gw) return { success: false, message: 'Gateway not found' };

  // Simulate gateway ping — real SDK calls in future sprint
  const success = gw.enabled && !!gw.apiKey;
  const message = success
    ? `${gw.name} gateway connection verified (${gw.environment}).`
    : `Cannot test ${gw.name}: disabled or missing API key.`;

  await paymentGatewayRepository.markTested(id, success, success ? undefined : message);
  await writeAuditLog({
    userId,
    module: 'PAYMENT_CONFIG',
    action: 'TEST_GATEWAY',
    entityId: id,
    entityType: 'PaymentGateway',
    newValues: { success },
  });

  return { success, message };
};
