import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { success } from '../../shared/utils/response';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login(req.body, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
      res.json(success(result));
    } catch (err) { next(err); }
  }

  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.sendOtp(req.body);
      res.json(success(result));
    } catch (err) { next(err); }
  }

  static async verifyOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifyOtp(req.body, {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
      res.json(success(result));
    } catch (err) { next(err); }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.refresh(req.body.refreshToken);
      res.json(success(result));
    } catch (err) { next(err); }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.logout(req.body.refreshToken);
      res.json(success({ message: 'Logged out successfully' }));
    } catch (err) { next(err); }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.forgotPassword(req.body.email);
      res.json(success(result));
    } catch (err) { next(err); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body.token, req.body.password);
      res.json(success({ message: 'Password reset successfully' }));
    } catch (err) { next(err); }
  }

  static async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await AuthService.me(req.user!.id);
      res.json(success(user));
    } catch (err) { next(err); }
  }
}
