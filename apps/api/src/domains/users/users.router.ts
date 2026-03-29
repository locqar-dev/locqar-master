import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { NotFoundError } from '../../shared/errors/AppError';
import { hashPassword } from '../../shared/utils/crypto';
import { auditLog } from '../../middleware/auditLog';
import { z } from 'zod';
import { validate } from '../../middleware/validate';

const router = Router();
router.use(authenticate);

const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
  staffRole: z.enum(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'AGENT', 'SUPPORT', 'VIEWER']),
  terminalId: z.string().uuid().optional(),
  department: z.string().optional(),
  jobTitle: z.string().optional(),
});

const updateStaffSchema = createStaffSchema.omit({ password: true, email: true }).partial();

router.get('/', authorize('staff.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const q = req.query as Record<string, string>;
    const where: any = { userType: 'STAFF' };
    if (q.terminalId) where.terminalId = q.terminalId;
    if (q.staffRole) where.staffRole = q.staffRole;
    if (q.search) where.OR = [
      { name: { contains: q.search, mode: 'insensitive' } },
      { email: { contains: q.search, mode: 'insensitive' } },
    ];

    const [data, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take, orderBy: { name: 'asc' },
        select: {
          id: true, name: true, email: true, phone: true, avatar: true,
          staffRole: true, terminalId: true, department: true, jobTitle: true,
          employeeId: true, isActive: true, createdAt: true,
          terminal: { select: { id: true, name: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.post('/', authorize('staff.create'), validate(createStaffSchema), auditLog('CREATE', 'User'), async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { ...rest, passwordHash, userType: 'STAFF' },
      select: { id: true, name: true, email: true, staffRole: true, terminalId: true },
    });
    res.status(201).json(success(user));
  } catch (e) { next(e); }
});

router.get('/:id', authorize('staff.view'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id as string },
      select: {
        id: true, name: true, email: true, phone: true, avatar: true,
        staffRole: true, terminalId: true, department: true, jobTitle: true,
        employeeId: true, isActive: true, createdAt: true,
        terminal: { select: { id: true, name: true } },
        onboardingRecord: true,
      },
    });
    if (!user) throw new NotFoundError('Staff member not found');
    res.json(success(user));
  } catch (e) { next(e); }
});

router.patch('/:id', authorize('staff.edit'), validate(updateStaffSchema), auditLog('UPDATE', 'User'), async (req, res, next) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id as string },
      data: req.body,
      select: { id: true, name: true, email: true, staffRole: true, isActive: true },
    });
    res.json(success(user));
  } catch (e) { next(e); }
});

router.delete('/:id', authorize('staff.delete'), auditLog('DELETE', 'User'), async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.params.id as string }, data: { isActive: false } });
    res.json(success({ message: 'Staff member deactivated' }));
  } catch (e) { next(e); }
});

export { router as usersRouter };
