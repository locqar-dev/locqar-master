import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { prisma } from '../../config/database';
import { redis } from '../../config/redis';
import { config } from '../../config';
import { logger } from '../../shared/utils/logger';
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  TooManyRequestsError,
} from '../../shared/errors/AppError';
import { hashPassword, verifyPassword, generateOtp, generateToken } from '../../shared/utils/crypto';
import { normalisePhone } from '../../shared/utils/ghana';
import { AuthUser } from '../../shared/types/express';
import type { LoginDto, SendOtpDto, VerifyOtpDto } from './auth.validator';

// ── JWT helpers ───────────────────────────────────────────────────────────────

function signAccessToken(user: AuthUser): string {
  return jwt.sign(user, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiry } as jwt.SignOptions);
}

function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry } as jwt.SignOptions);
}

async function buildUserPayload(userId: string): Promise<AuthUser> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  return {
    id: user.id,
    userType: user.userType,
    staffRole: user.staffRole,
    name: user.name,
    email: user.email,
    phone: user.phone,
    terminalId: user.terminalId,
  };
}

async function issueTokenPair(userId: string, meta: { userAgent?: string; ip?: string } = {}) {
  const payload = await buildUserPayload(userId);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(userId);

  // Store refresh token in DB
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt,
      userAgent: meta.userAgent,
      ipAddress: meta.ip,
    },
  });

  return { accessToken, refreshToken, user: payload };
}

// ── Auth service ──────────────────────────────────────────────────────────────

export class AuthService {
  /** Email + password login (staff) */
  static async login(dto: LoginDto, meta: { userAgent?: string; ip?: string } = {}) {
    const user = await prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is disabled');
    }

    if (user.userType !== 'STAFF') {
      throw new UnauthorizedError('Use phone login for courier/customer accounts');
    }

    const valid = await verifyPassword(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password');

    return issueTokenPair(user.id, meta);
  }

  /** Phone OTP — send */
  static async sendOtp(dto: SendOtpDto) {
    const phone = normalisePhone(dto.phone);
    const redisKey = `otp:attempts:${phone}`;

    // Rate-limit OTP sends per phone
    const attempts = parseInt((await redis.get(redisKey)) ?? '0', 10);
    if (attempts >= config.otp.maxAttempts) {
      throw new TooManyRequestsError('Too many OTP requests. Try again in 15 minutes.');
    }

    // Find or create user by phone
    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      // Auto-register new mobile user
      user = await prisma.user.create({
        data: {
          userType: dto.userType,
          phone,
          name: phone, // placeholder; updated on profile setup
          isActive: true,
        },
      });
    }

    if (user.userType !== dto.userType) {
      throw new BadRequestError('Phone registered as a different user type');
    }

    const code = generateOtp();
    const expiresAt = new Date(Date.now() + config.otp.ttlSeconds * 1000);

    // Invalidate old OTPs for this user
    await prisma.otpCode.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    await prisma.otpCode.create({
      data: { userId: user.id, code, phone, expiresAt },
    });

    // Increment rate-limit counter (TTL = 15 min)
    await redis.multi().incr(redisKey).expire(redisKey, 900).exec();

    // In production: send SMS via Arkesel
    // await smsService.send(phone, `Your LocQar code is ${code}. Expires in 3 minutes.`);

    logger.info(`OTP for ${phone}: ${code}`); // Remove in production
    return { message: 'OTP sent successfully' };
  }

  /** Phone OTP — verify */
  static async verifyOtp(dto: VerifyOtpDto, meta: { userAgent?: string; ip?: string } = {}) {
    const phone = normalisePhone(dto.phone);

    const user = await prisma.user.findUnique({ where: { phone } });
    if (!user) throw new UnauthorizedError('Phone not registered');

    const otp = await prisma.otpCode.findFirst({
      where: {
        userId: user.id,
        code: dto.code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!otp) throw new UnauthorizedError('Invalid or expired OTP');

    // Mark OTP used
    await prisma.otpCode.update({ where: { id: otp.id }, data: { usedAt: new Date() } });

    // Clear rate limit
    await redis.del(`otp:attempts:${phone}`);

    return issueTokenPair(user.id, meta);
  }

  /** Refresh access token */
  static async refresh(token: string) {
    let payload: { userId: string };
    try {
      payload = jwt.verify(token, config.jwt.refreshSecret) as { userId: string };
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or revoked');
    }

    // Rotate: revoke old, issue new
    await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });

    return issueTokenPair(payload.userId);
  }

  /** Logout — revoke refresh token */
  static async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.updateMany({
      where: { token: refreshToken },
      data: { revokedAt: new Date() },
    });
  }

  /** Forgot password — generate reset token */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If that email exists, a reset link has been sent' };

    const token = generateToken();
    const redisKey = `pwd_reset:${token}`;
    await redis.setex(redisKey, 3600, user.id); // 1 hour TTL

    // In production: send email with reset link
    logger.info(`Password reset token for ${email}: ${token}`);

    return { message: 'If that email exists, a reset link has been sent' };
  }

  /** Reset password with token */
  static async resetPassword(token: string, password: string): Promise<void> {
    const redisKey = `pwd_reset:${token}`;
    const userId = await redis.get(redisKey);
    if (!userId) throw new BadRequestError('Invalid or expired reset token');

    const hash = await hashPassword(password);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    await redis.del(redisKey);

    // Revoke all refresh tokens for security
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Get currently logged-in user */
  static async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, userType: true, staffRole: true, name: true,
        email: true, phone: true, avatar: true, terminalId: true,
        department: true, jobTitle: true, employeeId: true, isActive: true,
        createdAt: true,
        terminal: { select: { id: true, name: true, code: true } },
      },
    });

    if (!user) throw new NotFoundError('User not found');
    return user;
  }
}
