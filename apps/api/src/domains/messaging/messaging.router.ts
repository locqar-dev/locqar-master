import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';

const router = Router();
router.use(authenticate, authorize('messaging.view'));

router.get('/threads', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.chatThread.findMany({ skip, take, orderBy: { updatedAt: 'desc' }, include: { _count: { select: { messages: true } } } }),
      prisma.chatThread.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.get('/threads/:id', async (req, res, next) => {
  try {
    const thread = await prisma.chatThread.findUniqueOrThrow({
      where: { id: req.params.id as string },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    res.json(success(thread));
  } catch (e) { next(e); }
});

router.post('/threads/:id/messages', authorize('messaging.send'), async (req, res, next) => {
  try {
    const msg = await prisma.chatMessage.create({
      data: {
        threadId: req.params.id as string,
        senderId: req.user!.id,
        senderName: req.user!.name,
        senderType: req.user!.userType,
        body: req.body.body,
      },
    });
    await prisma.chatThread.update({ where: { id: req.params.id as string }, data: { updatedAt: new Date() } });
    res.status(201).json(success(msg));
  } catch (e) { next(e); }
});

router.post('/threads', authorize('messaging.send'), async (req, res, next) => {
  try {
    const thread = await prisma.chatThread.create({
      data: { subject: req.body.subject, participants: req.body.participants ?? [], packageId: req.body.packageId },
    });
    res.status(201).json(success(thread));
  } catch (e) { next(e); }
});

export { router as messagingRouter };
