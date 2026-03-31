import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { generalLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';

// ── Domain routers ────────────────────────────────────────────────────────────
import { authRouter }           from './domains/auth/auth.router';
import { usersRouter }          from './domains/users/users.router';
import { packagesRouter }       from './domains/packages/packages.router';
import { couriersRouter }       from './domains/couriers/couriers.router';
import { tasksRouter }          from './domains/tasks/tasks.router';
import { shiftsRouter }         from './domains/shifts/shifts.router';
import { earningsRouter }       from './domains/earnings/earnings.router';
import { lockersRouter }        from './domains/lockers/lockers.router';
import { terminalsRouter }      from './domains/terminals/terminals.router';
import { fleetRouter }          from './domains/fleet/fleet.router';
import { analyticsRouter }      from './domains/analytics/analytics.router';
import { notificationsRouter }  from './domains/notifications/notifications.router';
import { messagingRouter }      from './domains/messaging/messaging.router';
import { customersRouter }      from './domains/customers/customers.router';
import { walletRouter }         from './domains/wallet/wallet.router';
import { paymentsRouter }       from './domains/payments/payments.router';
import { subscriptionsRouter }  from './domains/subscriptions/subscriptions.router';
import { rewardsRouter }        from './domains/rewards/rewards.router';
import { securityRouter }       from './domains/security/security.router';
import { qrRouter }             from './domains/qr/qr.router';
import { alertsRouter }         from './domains/alerts/alerts.router';
import { bulkShipmentsRouter }  from './domains/bulkShipments/bulkShipments.router';
import { newsletterRouter }     from './domains/newsletter/newsletter.router';
import { hrisRouter }           from './domains/hris/hris.router';
import { payrollRouter }        from './domains/payroll/payroll.router';
import { customerPortalRouter } from './domains/customerPortal/customerPortal.router';
import { settingsRouter }       from './domains/settings/settings.router';
import { exceptionsRouter }     from './domains/exceptions/exceptions.router';
import { podRouter }            from './domains/proofOfDelivery/proofOfDelivery.router';
import { routesRouter }         from './domains/routes/routes.router';
import { driversRouter }        from './domains/drivers/drivers.router';
import { contactsRouter }       from './domains/contacts/contacts.router';
import { winnsenRouter }        from './domains/winnsen/winnsen.router';
import { lockerCommandsRouter } from './domains/lockers/locker-commands.router';

export function createApp() {
  const app = express();

  // ── Security headers ───────────────────────────────────────────────────────
  app.use(helmet());

  // ── CORS ──────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: (origin, cb) => {
      if (!origin || config.cors.origins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }));

  // ── Body parsing + compression ────────────────────────────────────────────
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // ── Logging ───────────────────────────────────────────────────────────────
  if (config.env !== 'test') {
    app.use(morgan(config.env === 'development' ? 'dev' : 'combined'));
  }

  // ── Static files (uploads) ────────────────────────────────────────────────
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // ── Rate limiting ─────────────────────────────────────────────────────────
  app.use(generalLimiter);

  // ── Health check ──────────────────────────────────────────────────────────
  app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

  // ── API v1 routes ─────────────────────────────────────────────────────────
  const v1 = '/api/v1';

  app.use(`${v1}/auth`,           authRouter);
  app.use(`${v1}/users`,          usersRouter);
  app.use(`${v1}/packages`,       packagesRouter);
  app.use(`${v1}/couriers`,       couriersRouter);
  app.use(`${v1}/tasks`,          tasksRouter);
  app.use(`${v1}/shifts`,         shiftsRouter);
  app.use(`${v1}/earnings`,       earningsRouter);
  app.use(`${v1}/lockers`,        lockersRouter);
  app.use(`${v1}/terminals`,      terminalsRouter);
  app.use(`${v1}/fleet`,          fleetRouter);
  app.use(`${v1}/analytics`,      analyticsRouter);
  app.use(`${v1}/notifications`,  notificationsRouter);
  app.use(`${v1}/messaging`,      messagingRouter);
  app.use(`${v1}/customers`,      customersRouter);
  app.use(`${v1}/wallet`,         walletRouter);
  app.use(`${v1}/payments`,       paymentsRouter);
  app.use(`${v1}/subscriptions`,  subscriptionsRouter);
  app.use(`${v1}/rewards`,        rewardsRouter);
  app.use(`${v1}/security`,       securityRouter);
  app.use(`${v1}/qr`,             qrRouter);
  app.use(`${v1}/alerts`,         alertsRouter);
  app.use(`${v1}/bulk-shipments`, bulkShipmentsRouter);
  app.use(`${v1}/newsletter`,     newsletterRouter);
  app.use(`${v1}/hris`,           hrisRouter);
  app.use(`${v1}/payroll`,        payrollRouter);
  app.use(`${v1}/portal`,         customerPortalRouter);
  app.use(`${v1}/settings`,       settingsRouter);
  app.use(`${v1}/exceptions`,     exceptionsRouter);
  app.use(`${v1}/pod`,            podRouter);
  app.use(`${v1}/routes`,         routesRouter);
  app.use(`${v1}/drivers`,        driversRouter);
  app.use(`${v1}/contacts`,       contactsRouter);

  // ── Winnsen integration (no v1 prefix — kiosk uses /api/winnsen directly) ──
  app.use('/api/winnsen',         winnsenRouter);

  // ── Locker command queue (in-house door control, replaces Winnsen cloud) ───
  app.use('/api/locker',          lockerCommandsRouter);

  // ── 404 handler ───────────────────────────────────────────────────────────
  app.use((_req, res) => res.status(404).json({ success: false, error: 'Route not found', code: 'NOT_FOUND' }));

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
}
