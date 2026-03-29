import cron from 'node-cron';
import { logger } from '../shared/utils/logger';
import { expirePackagesJob } from './expirePackages.job';
import { cleanupTokensJob } from './cleanupTokens.job';

export function startScheduler() {
  // Expire stale packages — every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Running: expirePackages');
    await expirePackagesJob().catch(err => logger.error('expirePackages failed', { err }));
  });

  // Cleanup expired tokens — daily at 2am
  cron.schedule('0 2 * * *', async () => {
    logger.info('Running: cleanupTokens');
    await cleanupTokensJob().catch(err => logger.error('cleanupTokens failed', { err }));
  });

  logger.info('Job scheduler started');
}
