import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';
import { authLimiter, otpLimiter } from '../../middleware/rateLimiter';
import {
  loginSchema,
  refreshSchema,
  sendOtpSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validator';

const router = Router();

// Staff auth (email + password)
router.post('/login',           authLimiter, validate(loginSchema),          AuthController.login);
router.post('/refresh',         validate(refreshSchema),                      AuthController.refresh);
router.post('/logout',          validate(refreshSchema),                      AuthController.logout);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema),  AuthController.forgotPassword);
router.post('/reset-password',  validate(resetPasswordSchema),                AuthController.resetPassword);

// Mobile OTP (courier + customer)
router.post('/otp/send',   otpLimiter,  validate(sendOtpSchema),   AuthController.sendOtp);
router.post('/otp/verify', authLimiter, validate(verifyOtpSchema),  AuthController.verifyOtp);

// Current user
router.get('/me', authenticate, AuthController.me);

export { router as authRouter };
