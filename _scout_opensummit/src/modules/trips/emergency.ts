import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
// Fixed 32-byte secret key for development/test environment
const SECRET_KEY = Buffer.from('12345678901234567890123456789012');

export function encryptEmergencyContact(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, SECRET_KEY, iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptEmergencyContact(
  encryptedPayload: string,
  tripStartTimeISO: string,
  tripEndTimeISO: string,
  nowDate: Date = new Date()
): string {
  // Check active trip window: start_time - 24h <= now <= end_time + 12h
  const startMs = new Date(tripStartTimeISO).getTime() - 24 * 3600 * 1000;
  const endMs = new Date(tripEndTimeISO).getTime() + 12 * 3600 * 1000;
  const nowMs = nowDate.getTime();

  if (nowMs < startMs || nowMs > endMs) {
    throw new Error('EMERGENCY_CONTACT_LOCKED: Access denied outside active trip window');
  }

  const parts = encryptedPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, SECRET_KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
