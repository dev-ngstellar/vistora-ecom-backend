import { prisma } from '../../config/prisma.config';
import { maskSecret } from '../../utils/encryption.util';

/**
 * Writes an audit log entry for config module changes.
 */
export async function writeAuditLog(params: {
  userId?: string;
  module: string;
  action: string;
  entityId?: string;
  entityType?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        module: params.module,
        action: params.action,
        entityId: params.entityId ?? null,
        entityType: params.entityType ?? null,
        oldValues: params.oldValues as never,
        newValues: params.newValues as never,
        ipAddress: params.ipAddress ?? null,
      },
    });
  } catch {
    // Audit log failures must never break the main flow
  }
}

/**
 * Strips sensitive fields from any config object before returning to client.
 * Replaces encrypted values with '••••••••' mask.
 */
export function sanitizeSecrets<T extends Record<string, unknown>>(entity: T): T {
  const sensitiveKeys = ['apiKey', 'apiSecret', 'webhookSecret', 'config'];
  const result = { ...entity };
  for (const key of sensitiveKeys) {
    if (key in result && result[key] !== null && result[key] !== undefined) {
      (result as Record<string, unknown>)[key] = maskSecret(result[key] as string);
    }
  }
  return result;
}

export function sanitizeSecretsArray<T extends Record<string, unknown>>(entities: T[]): T[] {
  return entities.map(sanitizeSecrets);
}
