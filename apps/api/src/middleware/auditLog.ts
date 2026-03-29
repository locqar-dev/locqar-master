import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { logger } from '../shared/utils/logger';

export function auditLog(action: string, resource: string) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            userId: req.user.id,
            action,
            resource,
            resourceId: (req.params.id as string) ?? (req.params.waybill as string) ?? undefined,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] as string | undefined,
          },
        });
      }
    } catch (err) {
      logger.warn('Audit log failed', { err });
    }
    next();
  };
}
