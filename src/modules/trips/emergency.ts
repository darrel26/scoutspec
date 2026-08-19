import crypto from 'node:crypto';

/**
 * Derives a 32-byte key buffer from the given secret or environment variable.
 */
function getKeyBuffer(secretKey?: string): Buffer {
  const key = secretKey || process.env.EMERGENCY_CONTACT_ENC_KEY || 'opensummit-default-emergency-contact-secret-key-32b';
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypts sensitive emergency contact info using AES-256-GCM.
 * Output format: `iv:authTag:encryptedPayload` (all in hex).
 */
export function encryptEmergencyContact(text: string, secretKey?: string): string {
  const key = getKeyBuffer(secretKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts AES-256-GCM encrypted emergency contact payload.
 */
export function decryptEmergencyContact(payload: string, secretKey?: string): string {
  const key = getKeyBuffer(secretKey);
  const parts = payload.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted payload format');
  }
  const [ivHex, authTagHex, encryptedHex] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Checks if the current time is within the active trip emergency access window:
 * [start_time - 24 hours, end_time + 12 hours].
 * If end_time is not specified, start_time is treated as end_time.
 */
export function isWithinEmergencyAccessWindow(
  startTime: string | Date,
  endTime?: string | Date | null,
  now: Date = new Date()
): boolean {
  const startMs = new Date(startTime).getTime();
  const endMs = endTime ? new Date(endTime).getTime() : startMs;
  const nowMs = now.getTime();

  const windowStart = startMs - 24 * 60 * 60 * 1000; // start_time - 24h
  const windowEnd = endMs + 12 * 60 * 60 * 1000;    // end_time + 12h

  return nowMs >= windowStart && nowMs <= windowEnd;
}
