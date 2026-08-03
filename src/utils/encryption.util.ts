import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY_HEX = process.env['ENCRYPTION_KEY'] || '';

/**
 * Derives a 32-byte Buffer from ENCRYPTION_KEY env var.
 * If the key is a 64-char hex string, parse it directly.
 * Otherwise hash it with SHA-256 to guarantee 32 bytes.
 */
function getKey(): Buffer {
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
export function encrypt(plaintext: string): string {
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
export function decrypt(encryptedPayload: string): string | null {
  try {
    const key = getKey();
    const [ivB64, authTagB64, ciphertext] = encryptedPayload.split(':');

    if (!ivB64 || !authTagB64 || !ciphertext) return null;

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch {
    return null;
  }
}

/** Encrypts if value is truthy, otherwise returns null */
export function encryptOptional(value: string | null | undefined): string | null {
  if (!value) return null;
  return encrypt(value);
}

/** Returns masked value '••••••••' for display, or null if empty */
export function maskSecret(encryptedValue: string | null | undefined): string | null {
  if (!encryptedValue) return null;
  return '••••••••';
}
