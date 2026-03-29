import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';

const router = Router();
router.use(authenticate, authorize('hris.view'));

// ── Onboarding ────────────────────────────────────────────────────────────────

router.get('/onboarding', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.onboardingRecord.findMany({
        skip, take, orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true, phone: true, staffRole: true, terminalId: true, terminal: { select: { name: true } } } },
          documents: true,
        },
      }),
      prisma.onboardingRecord.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/onboarding', authorize('hris.edit'), async (req, res, next) => {
  try {
    const record = await prisma.onboardingRecord.create({
      data: {
        userId: req.body.userId,
        startDate: new Date(req.body.startDate),
        hiredBy: req.body.hiredBy,
        checklist: req.body.checklist ?? {},
        accessSetup: req.body.accessSetup ?? {},
      },
    });
    res.status(201).json(success(record));
  } catch (e) { next(e); }
});

router.get('/onboarding/:id', async (req, res, next) => {
  try {
    const r = await prisma.onboardingRecord.findUnique({
      where: { id: req.params.id as string },
      include: { user: true, documents: true },
    });
    if (!r) throw new NotFoundError('Onboarding record not found');
    res.json(success(r));
  } catch (e) { next(e); }
});

router.patch('/onboarding/:id', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.onboardingRecord.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(r));
  } catch (e) { next(e); }
});

router.patch('/onboarding/:id/checklist', authorize('hris.edit'), async (req, res, next) => {
  try {
    const existing = await prisma.onboardingRecord.findUniqueOrThrow({ where: { id: req.params.id as string } });
    const checklist = { ...(existing.checklist as object), ...req.body.checklist };
    const vals = Object.values(checklist) as boolean[];
    const isComplete = vals.every(Boolean);
    const r = await prisma.onboardingRecord.update({
      where: { id: req.params.id as string },
      data: { checklist, isComplete, completedAt: isComplete ? new Date() : null },
    });
    res.json(success(r));
  } catch (e) { next(e); }
});

// Documents
router.patch('/onboarding/:id/documents/:docId', authorize('hris.edit'), async (req, res, next) => {
  try {
    const doc = await prisma.hrisDocument.update({
      where: { id: req.params.docId as string },
      data: { status: req.body.status, uploadedAt: req.body.status === 'submitted' ? new Date() : undefined },
    });
    res.json(success(doc));
  } catch (e) { next(e); }
});

// ── Offboarding ───────────────────────────────────────────────────────────────

router.get('/offboarding', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.offboardingRecord.findMany({
        skip, take, orderBy: { exitDate: 'asc' },
        include: { user: { select: { name: true, email: true, staffRole: true } } },
      }),
      prisma.offboardingRecord.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/offboarding', authorize('hris.edit'), async (req, res, next) => {
  try {
    const record = await prisma.offboardingRecord.create({
      data: {
        userId: req.body.userId,
        exitDate: new Date(req.body.exitDate),
        exitType: req.body.exitType,
        initiatedBy: req.body.initiatedBy,
        checklist: req.body.checklist ?? {},
        exitInterview: {},
        settlement: req.body.settlement ?? {},
      },
    });
    res.status(201).json(success(record));
  } catch (e) { next(e); }
});

router.patch('/offboarding/:id', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.offboardingRecord.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(r));
  } catch (e) { next(e); }
});

router.patch('/offboarding/:id/checklist', authorize('hris.edit'), async (req, res, next) => {
  try {
    const existing = await prisma.offboardingRecord.findUniqueOrThrow({ where: { id: req.params.id as string } });
    const checklist = { ...(existing.checklist as object), ...req.body.checklist };
    const r = await prisma.offboardingRecord.update({ where: { id: req.params.id as string }, data: { checklist } });
    res.json(success(r));
  } catch (e) { next(e); }
});

router.patch('/offboarding/:id/interview', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.offboardingRecord.update({
      where: { id: req.params.id as string },
      data: { exitInterview: req.body },
    });
    res.json(success(r));
  } catch (e) { next(e); }
});

router.patch('/offboarding/:id/settlement', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.offboardingRecord.update({
      where: { id: req.params.id as string },
      data: { settlement: req.body },
    });
    res.json(success(r));
  } catch (e) { next(e); }
});

// ── Alumni ────────────────────────────────────────────────────────────────────

router.get('/alumni', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = {};
    if (q.rehireEligible !== undefined) where.rehireEligible = q.rehireEligible === 'true';
    if (q.search) where.name = { contains: q.search, mode: 'insensitive' };

    const [data, total] = await Promise.all([
      prisma.alumniRecord.findMany({ where, skip, take, orderBy: { exitDate: 'desc' } }),
      prisma.alumniRecord.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/alumni', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.alumniRecord.create({
      data: { ...req.body, exitDate: new Date(req.body.exitDate), joinDate: req.body.joinDate ? new Date(req.body.joinDate) : undefined },
    });
    res.status(201).json(success(r));
  } catch (e) { next(e); }
});

router.patch('/alumni/:id', authorize('hris.edit'), async (req, res, next) => {
  try {
    const r = await prisma.alumniRecord.update({ where: { id: req.params.id as string }, data: req.body });
    res.json(success(r));
  } catch (e) { next(e); }
});

export { router as hrisRouter };
