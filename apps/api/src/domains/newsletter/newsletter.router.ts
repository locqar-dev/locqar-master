import { Router } from 'express';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();

const subscribeSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  source: z.string().optional(),
});

router.post('/subscribe', validate(subscribeSchema), async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email: req.body.email },
      create: { ...req.body },
      update: { isActive: true, unsubscribedAt: null },
    });
    res.json(success({ message: 'Subscribed successfully' }));
  } catch (e) { next(e); }
});

router.post('/unsubscribe', async (req, res, next) => {
  try {
    await prisma.newsletterSubscriber.update({
      where: { email: req.body.email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
    res.json(success({ message: 'Unsubscribed successfully' }));
  } catch (e) { next(e); }
});

export { router as newsletterRouter };
