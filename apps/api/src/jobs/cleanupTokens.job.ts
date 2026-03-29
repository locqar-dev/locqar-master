import { prisma } from '../config/database';
import { logger } from '../shared/utils/logger';

export async function cleanupTokensJob() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000);

  const [deletedTokens, deletedOtps] = await Promise.all([
    prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: new Date() } },
          { revokedAt: { lte: thirtyDaysAgo } },
        ],
      },
    }),
    prisma.otpCode.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    }),
  ]);

  logger.info(`Token cleanup: ${deletedTokens.count} refresh tokens, ${deletedOtps.count} OTPs removed`);
}
