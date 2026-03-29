import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError, BadRequestError } from '../../shared/errors/AppError';
import { calcPayroll } from '../../shared/utils/ghana';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate, authorize('payroll.view'));

const periodSchema = z.object({
  label: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
});

// Pay periods
router.get('/periods', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.payPeriod.findMany({ skip, take, orderBy: { startDate: 'desc' }, include: { _count: { select: { records: true } } } }),
      prisma.payPeriod.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/periods', authorize('payroll.process'), validate(periodSchema), async (req, res, next) => {
  try {
    const period = await prisma.payPeriod.create({
      data: { ...req.body, startDate: new Date(req.body.startDate), endDate: new Date(req.body.endDate) },
    });
    res.status(201).json(success(period));
  } catch (e) { next(e); }
});

router.get('/periods/:id', async (req, res, next) => {
  try {
    const period = await prisma.payPeriod.findUnique({
      where: { id: req.params.id as string },
      include: { records: true },
    });
    if (!period) throw new NotFoundError('Pay period not found');
    res.json(success(period));
  } catch (e) { next(e); }
});

// Generate payroll records for a period using salary configs
router.post('/periods/:id/generate', authorize('payroll.process'), async (req, res, next) => {
  try {
    const period = await prisma.payPeriod.findUniqueOrThrow({ where: { id: req.params.id as string } });
    if (period.status !== 'draft') throw new BadRequestError('Can only generate for draft periods');

    const configs = await (prisma.salaryConfig.findMany as any)({
      include: { user: { select: { name: true, staffRole: true, department: true, jobTitle: true } } },
    });

    const records = configs.map((c: any) => {
      const gross = c.baseSalary + c.transportAllowance + c.housingAllowance + c.otherAllowances;
      const { ssnitEmployee, ssnitEmployer, incomeTax, net } = calcPayroll(gross);
      return {
        periodId: period.id,
        userId: c.userId,
        employeeName: c.user.name,
        role: c.user.staffRole ?? 'STAFF',
        department: c.user.department ?? null,
        baseSalary: c.baseSalary,
        transportAllowance: c.transportAllowance,
        housingAllowance: c.housingAllowance,
        otherAllowances: c.otherAllowances,
        grossSalary: gross,
        ssnitEmployee,
        ssnitEmployer,
        incomeTax,
        netSalary: net,
      };
    });

    await prisma.$transaction([
      prisma.payrollRecord.deleteMany({ where: { periodId: period.id } }),
      prisma.payrollRecord.createMany({ data: records }),
      prisma.payPeriod.update({ where: { id: period.id }, data: { status: 'processing' } }),
    ]);

    res.json(success({ generated: records.length }));
  } catch (e) { next(e); }
});

// Advance period status
router.patch('/periods/:id/status', authorize('payroll.process'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const data: any = { status };
    if (status === 'approved') data.approvedAt = new Date(), data.approvedBy = req.user!.id;
    if (status === 'paid') data.paidAt = new Date();
    const period = await prisma.payPeriod.update({ where: { id: req.params.id as string }, data });
    res.json(success(period));
  } catch (e) { next(e); }
});

// Payroll records
router.get('/records', async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const where: any = {};
    if (req.query.periodId) where.periodId = req.query.periodId as string;
    const [data, total] = await Promise.all([
      prisma.payrollRecord.findMany({ where, skip, take, orderBy: { employeeName: 'asc' } }),
      prisma.payrollRecord.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

// Salary configs
router.get('/salary-configs', async (req, res, next) => {
  try {
    const configs = await prisma.salaryConfig.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(success(configs));
  } catch (e) { next(e); }
});

router.post('/salary-configs', authorize('payroll.process'), async (req, res, next) => {
  try {
    const config = await prisma.salaryConfig.upsert({
      where: { userId: req.body.userId },
      update: req.body,
      create: { ...req.body, effectiveFrom: new Date(req.body.effectiveFrom ?? Date.now()) },
    });
    res.json(success(config));
  } catch (e) { next(e); }
});

export { router as payrollRouter };
