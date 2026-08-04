"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeAuditLog = writeAuditLog;
exports.sanitizeSecrets = sanitizeSecrets;
exports.sanitizeSecretsArray = sanitizeSecretsArray;
const prisma_config_1 = require("../../config/prisma.config");
const encryption_util_1 = require("../../utils/encryption.util");
/**
 * Writes an audit log entry for config module changes.
 */
async function writeAuditLog(params) {
    try {
        await prisma_config_1.prisma.auditLog.create({
            data: {
                userId: params.userId ?? null,
                module: params.module,
                action: params.action,
                entityId: params.entityId ?? null,
                entityType: params.entityType ?? null,
                oldValues: params.oldValues,
                newValues: params.newValues,
                ipAddress: params.ipAddress ?? null,
            },
        });
    }
    catch {
        // Audit log failures must never break the main flow
    }
}
/**
 * Strips sensitive fields from any config object before returning to client.
 * Replaces encrypted values with '••••••••' mask.
 */
function sanitizeSecrets(entity) {
    const sensitiveKeys = ['apiKey', 'apiSecret', 'webhookSecret', 'config'];
    const result = { ...entity };
    for (const key of sensitiveKeys) {
        if (key in result && result[key] !== null && result[key] !== undefined) {
            result[key] = (0, encryption_util_1.maskSecret)(result[key]);
        }
    }
    return result;
}
function sanitizeSecretsArray(entities) {
    return entities.map(sanitizeSecrets);
}
