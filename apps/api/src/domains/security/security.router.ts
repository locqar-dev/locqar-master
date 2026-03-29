import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { BadRequestError } from '../../shared/errors/AppError';
import { hashPassword, verifyPassword } from '../../shared/utils/crypto';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate);

const changePwdSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

// Change password
router.post('/change-password', validate(changePwdSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.user!.id } });
    if (!user.passwordHash) throw new BadRequestError('No password set — use OTP login');

    const valid = await verifyPassword(req.body.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestError('Current password is incorrect');

    const newHash = await hashPassword(req.body.newPassword);
    await prisma.user.update({ where: { id: req.user!.id }, data: { passwordHash: newHash } });

    // Revoke all refresh tokens
    await prisma.refreshToken.updateMany({
      where: { userId: req.user!.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    res.json(success({ message: 'Password changed. Please log in again.' }));
  } catch (e) { next(e); }
});

// List active sessions
router.get('/sessions', async (req, res, next) => {
  try {
    const sessions = await prisma.refreshToken.findMany({
      where: { userId: req.user!.id, revokedAt: null, expiresAt: { gt: new Date() } },
      select: { id: true, createdAt: true, expiresAt: true, userAgent: true, ipAddress: true },
    });
    res.json(success(sessions));
  } catch (e) { next(e); }
});

// Revoke a session
router.delete('/sessions/:id', async (req, res, next) => {
  try {
    await prisma.refreshToken.update({
      where: { id: req.params.id },
      data: { revokedAt: new Date() },
    });
    res.json(success({ message: 'Session revoked' }));
  } catch (e) { next(e); }
});

// Revoke all other sessions
router.post('/sessions/revoke-all', async (req, res, next) => {
  try {
    await prisma.refreshToken.updateMany({
      where: { userId: req.user!.id, revokedAt: null, token: { not: req.body.currentToken } },
      data: { revokedAt: new Date() },
    });
    res.json(success({ message: 'All other sessions revoked' }));
  } catch (e) { next(e); }
});

export { router as securityRouter };
