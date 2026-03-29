import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';

const router = Router();
router.use(authenticate, authorize('settings.view'));

// System settings (key-value store)
router.get('/', async (_req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    res.json(success(Object.fromEntries(settings.map(s => [s.key, s.value]))));
  } catch (e) { next(e); }
});

router.put('/:key', async (req, res, next) => {
  try {
    const setting = await prisma.systemSetting.upsert({
      where: { key: req.params.key },
      create: { key: req.params.key, value: req.body.value, description: req.body.description, updatedBy: req.user!.id },
      update: { value: req.body.value, updatedBy: req.user!.id },
    });
    res.json(success(setting));
  } catch (e) { next(e); }
});

// Pricing rules
router.get('/pricing', async (_req, res, next) => {
  try {
    const rules = await prisma.pricingRule.findMany({ orderBy: { name: 'asc' } });
    res.json(success(rules));
  } catch (e) { next(e); }
});

router.post('/pricing', async (req, res, next) => {
  try {
    const rule = await prisma.pricingRule.create({ data: req.body });
    res.status(201).json(success(rule));
  } catch (e) { next(e); }
});

router.patch('/pricing/:id', async (req, res, next) => {
  try {
    const rule = await prisma.pricingRule.update({ where: { id: req.params.id }, data: req.body });
    res.json(success(rule));
  } catch (e) { next(e); }
});

// SLA rules
router.get('/sla', async (_req, res, next) => {
  try {
    const rules = await prisma.slaRule.findMany({ orderBy: { name: 'asc' } });
    res.json(success(rules));
  } catch (e) { next(e); }
});

export { router as settingsRouter };
