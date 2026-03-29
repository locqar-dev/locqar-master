import { Controller, Post, Body, Get, UseGuards, Req, Delete, Param, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; name: string }, @Req() req: Request) {
    return this.authService.register(
      body.email,
      body.password,
      body.name,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }, @Req() req: Request) {
    return this.authService.login(
      body.email,
      body.password,
      req.ip,
      req.headers['user-agent'],
    );
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(req.user.id, token, req.ip);
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }, @Req() req: Request) {
    return this.authService.refreshToken(req.user?.id, body.refreshToken);
  }

  // 2FA Endpoints
  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  async setup2FA(@Req() req: Request) {
    return this.authService.setupTwoFactor(req.user.id);
  }

  @Post('2fa/confirm')
  @UseGuards(JwtAuthGuard)
  async confirm2FA(
    @Body() body: { secret: string; token: string; backupCodes: string[] },
    @Req() req: Request,
  ) {
    return this.authService.confirmTwoFactor(req.user.id, body.secret, body.token, body.backupCodes);
  }

  @Post('2fa/verify')
  async verify2FA(@Body() body: { userId: string; token: string }) {
    return this.authService.verifyTwoFactor(body.userId, body.token);
  }

  @Post('2fa/disable')
  @UseGuards(JwtAuthGuard)
  async disable2FA(@Req() req: Request) {
    return this.authService.disableTwoFactor(req.user.id);
  }

  // Session Management
  @Get('sessions')
  @UseGuards(JwtAuthGuard)
  async getSessions(@Req() req: Request) {
    return this.authService.getSessions(req.user.id);
  }

  @Delete('sessions/:sessionId')
  @UseGuards(JwtAuthGuard)
  async revokeSession(@Param('sessionId') sessionId: string, @Req() req: Request) {
    return this.authService.revokeSession(req.user.id, sessionId);
  }

  @Get('validate')
  @UseGuards(JwtAuthGuard)
  async validateToken(@Req() req: Request) {
    return { valid: true, user: req.user };
  }
}
