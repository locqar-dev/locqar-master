import Redis from 'ioredis';
import { config } from './index';
import { logger } from '../shared/utils/logger';

export const redis = new Redis(config.redis.url, {
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 100, 3000),
  maxRetriesPerRequest: 3,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { err: err.message }));
