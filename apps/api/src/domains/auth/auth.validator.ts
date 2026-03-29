import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token required'),
});

export const sendOtpSchema = z.object({
  phone: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Invalid Ghana phone number'),
  userType: z.enum(['COURIER', 'CUSTOMER']).default('CUSTOMER'),
});

export const verifyOtpSchema = z.object({
  phone: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Invalid Ghana phone number'),
  code: z.string().length(6, 'OTP must be 6 digits'),
  userType: z.enum(['COURIER', 'CUSTOMER']).default('CUSTOMER'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginDto = z.infer<typeof loginSchema>;
export type SendOtpDto = z.infer<typeof sendOtpSchema>;
export type VerifyOtpDto = z.infer<typeof verifyOtpSchema>;
