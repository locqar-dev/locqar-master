import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditService: AuditService,
  ) {}

  async register(email: string, password: string, name: string, ipAddress?: string, userAgent?: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // Log action
    await this.auditService.log({
      userId: user.id,
      action: 'REGISTER',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    // Create notification preference
    await this.prisma.notificationPreference.create({
      data: {
        userId: user.id,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(email: string, password: string, ipAddress?: string, userAgent?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials or account disabled');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await this.auditService.log({
        userId: user.id,
        action: 'LOGIN_FAILED',
        entityType: 'User',
        entityId: user.id,
        ipAddress,
        userAgent,
        status: 'FAILURE',
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId: user.id },
    });

    if (twoFactorAuth?.enabled) {
      // Return temporary token for 2FA verification
      const tempToken = this.jwtService.sign(
        { sub: user.id, iat: Date.now() },
        { expiresIn: '5m', secret: process.env.JWT_SECRET + '2fa' },
      );
      return {
        requires2FA: true,
        tempToken,
        method: twoFactorAuth.method,
      };
    }

    // Create session
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        deviceName: 'Unknown',
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Generate tokens
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, sessionId: session.id },
      { expiresIn: '7d' },
    );

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log successful login
    await this.auditService.log({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async logout(userId: string, token: string, ipAddress?: string) {
    // Blacklist the token
    const decoded = this.jwtService.decode(token) as any;
    const expiresAt = new Date(decoded.exp * 1000);

    await this.prisma.tokenBlacklist.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    // Log logout
    await this.auditService.log({
      userId,
      action: 'LOGOUT',
      entityType: 'User',
      ipAddress,
    });

    return { success: true };
  }

  // Two-Factor Authentication Methods

  async setupTwoFactor(userId: string) {
    const secret = speakeasy.generateSecret({
      name: `LocQar (${userId})`,
      issuer: 'LocQar',
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      Math.random().toString(36).substring(2, 10).toUpperCase(),
    );

    return {
      secret: secret.base32,
      qrCode,
      backupCodes,
    };
  }

  async confirmTwoFactor(userId: string, secret: string, token: string, backupCodes: string[]) {
    const isValid = speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      throw new BadRequestException('Invalid token');
    }

    // Save 2FA configuration
    await this.prisma.twoFactorAuth.upsert({
      where: { userId },
      create: {
        userId,
        enabled: true,
        secret,
        backupCodes: JSON.stringify(backupCodes),
        method: 'AUTHENTICATOR',
      },
      update: {
        enabled: true,
        secret,
        backupCodes: JSON.stringify(backupCodes),
      },
    });

    await this.auditService.log({
      userId,
      action: 'ENABLE_2FA',
      entityType: 'User',
      entityId: userId,
    });

    return { success: true };
  }

  async verifyTwoFactor(userId: string, token: string) {
    const twoFactorAuth = await this.prisma.twoFactorAuth.findUnique({
      where: { userId },
    });

    if (!twoFactorAuth?.enabled) {
      throw new BadRequestException('2FA not enabled');
    }

    const isValid = speakeasy.totp.verify({
      secret: twoFactorAuth.secret,
      encoding: 'base32',
      token,
      window: 2,
    });

    if (!isValid) {
      // Check backup codes
      const backupCodes = JSON.parse(twoFactorAuth.backupCodes || '[]');
      const codeIndex = backupCodes.indexOf(token.toUpperCase());

      if (codeIndex === -1) {
        throw new UnauthorizedException('Invalid token');
      }

      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      await this.prisma.twoFactorAuth.update({
        where: { userId },
        data: { backupCodes: JSON.stringify(backupCodes) },
      });
    }

    return { verified: true };
  }

  async disableTwoFactor(userId: string) {
    await this.prisma.twoFactorAuth.update({
      where: { userId },
      data: { enabled: false },
    });

    await this.auditService.log({
      userId,
      action: 'DISABLE_2FA',
      entityType: 'User',
    });

    return { success: true };
  }

  // Session Management

  async getSessions(userId: string) {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        deviceName: true,
        ipAddress: true,
        lastActivity: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { lastActivity: 'desc' },
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    await this.auditService.log({
      userId,
      action: 'REVOKE_SESSION',
      entityType: 'Session',
      entityId: sessionId,
    });

    return { success: true };
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await this.prisma.tokenBlacklist.findUnique({
      where: { token },
    });
    return !!blacklistedToken;
  }

  async validateToken(token: string) {
    const isBlacklisted = await this.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }

    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async refreshToken(userId: string, refreshToken: string) {
    try {
      const decoded = this.jwtService.verify(refreshToken) as any;

      if (decoded.sub !== userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const newAccessToken = this.jwtService.sign({
        sub: user.id,
        email: user.email,
        role: user.role,
      });

      return { accessToken: newAccessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
