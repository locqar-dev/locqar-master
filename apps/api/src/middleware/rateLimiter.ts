import rateLimit from 'express-rate-limit';
import { config } from '../config';

const windowMs = config.rateLimit.windowMs;

export const generalLimiter = rateLimit({
  windowMs,
  max: config.rateLimit.maxGeneral,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests', code: 'RATE_LIMITED' },
});

export const authLimiter = rateLimit({
  windowMs,
  max: config.rateLimit.maxAuth,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts', code: 'RATE_LIMITED' },
});

export const otpLimiter = rateLimit({
  windowMs,
  max: config.rateLimit.maxOtp,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many OTP requests', code: 'OTP_RATE_LIMITED' },
});
