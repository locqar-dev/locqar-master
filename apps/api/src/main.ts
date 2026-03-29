import 'dotenv/config';
import http from 'http';
import { Server as SocketServer } from 'socket.io';
import { createApp } from './app';
import { config } from './config';
import { prisma } from './config/database';
import { redis } from './config/redis';
import { logger } from './shared/utils/logger';
import { startScheduler } from './jobs/scheduler';
import { eventBus } from './shared/events/eventBus';

async function bootstrap() {
  // ── Database ────────────────────────────────────────────────────────────────
  try {
    await prisma.$connect();
    logger.info('Database connected');
  } catch (err) {
    logger.error('Database connection failed', { err });
    process.exit(1);
  }

  // ── Redis (non-fatal — degrades gracefully) ──────────────────────────────
  try {
    await redis.connect();
  } catch {
    logger.warn('Redis not available — OTP and rate limiting degraded');
  }

  // ── Express app ──────────────────────────────────────────────────────────
  const app = createApp();
  const server = http.createServer(app);

  // ── Socket.IO ────────────────────────────────────────────────────────────
  const io = new SocketServer(server, {
    cors: { origin: config.cors.origins, credentials: true },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    socket.on('join:terminal', (terminalId: string) => {
      socket.join(`terminal:${terminalId}`);
    });

    socket.on('join:courier', (courierId: string) => {
      socket.join(`courier:${courierId}`);
    });

    socket.on('join:customer', (customerId: string) => {
      socket.join(`customer:${customerId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  // ── Forward internal events to Socket.IO rooms ───────────────────────────
  eventBus.on('package:status_changed', (data) => {
    io.to(`terminal:${data.terminalId}`).emit('package:status', data);
    if (data.customerId) io.to(`customer:${data.customerId}`).emit('package:status', data);
    if (data.courierId) io.to(`courier:${data.courierId}`).emit('package:status', data);
  });

  eventBus.on('task:assigned', (data) => {
    io.to(`courier:${data.courierId}`).emit('task:assigned', data);
  });

  eventBus.on('locker:door', (data) => {
    io.to(`terminal:${data.terminalId}`).emit('locker:door', data);
  });

  // ── Background jobs ──────────────────────────────────────────────────────
  if (config.env !== 'test') {
    startScheduler();
  }

  // ── Listen ───────────────────────────────────────────────────────────────
  server.listen(config.port, () => {
    logger.info(`LocQar API running on port ${config.port} [${config.env}]`);
    logger.info(`Base URL: ${config.apiBaseUrl}/api/v1`);
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await prisma.$disconnect();
      await redis.quit();
      logger.info('Shutdown complete');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Bootstrap failed', { err });
  process.exit(1);
});
