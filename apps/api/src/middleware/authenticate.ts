import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from '../shared/errors/AppError';
import { AuthUser } from '../shared/types/express';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser & { iat: number; exp: number };

    req.user = {
      id: payload.id,
      userType: payload.userType,
      staffRole: payload.staffRole,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      terminalId: payload.terminalId,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      next(new UnauthorizedError('Token expired'));
    } else if (err instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError('Invalid token'));
    } else {
      next(err);
    }
  }
}

/** Same as authenticate but doesn't throw — attaches user if token present */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return next();
    const token = header.slice(7);
    const payload = jwt.verify(token, config.jwt.accessSecret) as AuthUser;
    req.user = payload;
  } catch {
    // silently ignore — no user attached
  }
  next();
}
