import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { config } from '../../config';

/** Generate a numeric OTP */
export function generateOtp(): string {
  const max = Math.pow(10, config.otp.length);
  return String(crypto.randomInt(max)).padStart(config.otp.length, '0');
}

/** Generate a cryptographically random hex string */
export function generateToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

/** Hash a password */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/** Verify a password against its hash */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Hash an API key for storage (one-way) */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/** Generate a new API key with prefix */
export function generateApiKey(prefix = 'lq'): { key: string; keyHash: string; keyPrefix: string } {
  const raw = `${prefix}_${generateToken(24)}`;
  return {
    key: raw,
    keyHash: hashApiKey(raw),
    keyPrefix: raw.substring(0, 12),
  };
}
