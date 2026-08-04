"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.encryptOptional = encryptOptional;
exports.maskSecret = maskSecret;
const crypto = __importStar(require("crypto"));
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_HEX = process.env['ENCRYPTION_KEY'] || '';
/**
 * Derives a 32-byte Buffer from ENCRYPTION_KEY env var.
 * If the key is a 64-char hex string, parse it directly.
 * Otherwise hash it with SHA-256 to guarantee 32 bytes.
 */
function getKey() {
    if (!ENCRYPTION_KEY_HEX) {
        throw new Error('ENCRYPTION_KEY environment variable is not set. Please add it to .env');
    }
    if (ENCRYPTION_KEY_HEX.length === 64) {
        return Buffer.from(ENCRYPTION_KEY_HEX, 'hex');
    }
    // Derive 32 bytes via SHA-256 for non-hex keys
    return crypto.createHash('sha256').update(ENCRYPTION_KEY_HEX).digest();
}
/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Returns a single base64 string: iv:authTag:ciphertext
 */
function encrypt(plaintext) {
    const key = getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();
    return [iv.toString('base64'), authTag.toString('base64'), encrypted].join(':');
}
/**
 * Decrypts a base64 payload (iv:authTag:ciphertext) back to plaintext.
 * Returns null if decryption fails (corrupted, wrong key, etc.).
 */
function decrypt(encryptedPayload) {
    try {
        const key = getKey();
        const [ivB64, authTagB64, ciphertext] = encryptedPayload.split(':');
        if (!ivB64 || !authTagB64 || !ciphertext)
            return null;
        const iv = Buffer.from(ivB64, 'base64');
        const authTag = Buffer.from(authTagB64, 'base64');
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch {
        return null;
    }
}
/** Encrypts if value is truthy, otherwise returns null */
function encryptOptional(value) {
    if (!value)
        return null;
    return encrypt(value);
}
/** Returns masked value '••••••••' for display, or null if empty */
function maskSecret(encryptedValue) {
    if (!encryptedValue)
        return null;
    return '••••••••';
}
