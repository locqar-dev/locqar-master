import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate);

// History
router.get('/history', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.notificationLog.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.notificationLog.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Templates
router.get('/templates', authorize('notifications.send'), async (_req, res, next) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({ orderBy: { name: 'asc' } });
    res.json(success(templates));
  } catch (e) { next(e); }
});

router.post('/templates', authorize('notifications.send'), async (req, res, next) => {
  try {
    const t = await prisma.notificationTemplate.create({ data: req.body });
    res.status(201).json(success(t));
  } catch (e) { next(e); }
});

// Send (queued to notification job in production)
router.post('/send', authorize('notifications.send'), async (req, res, next) => {
  try {
    const log = await prisma.notificationLog.create({
      data: {
        channel: req.body.channel,
        recipient: req.body.recipient,
        subject: req.body.subject,
        body: req.body.body,
        templateId: req.body.templateId,
        status: 'queued',
      },
    });
    // In production: dispatch to SMS/email/WhatsApp service
    res.json(success({ message: 'Notification queued', logId: log.id }));
  } catch (e) { next(e); }
});

export { router as notificationsRouter };
