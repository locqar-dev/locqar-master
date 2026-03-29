import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCustomer } from '../../middleware/authorize';
import { upload } from '../../middleware/upload';
import { prisma } from '../../config/database';
import { success, paginated } from '../../shared/utils/response';
import { parsePagination } from '../../shared/utils/pagination';
import { v4 as uuid } from 'uuid';

const router = Router();
router.use(authenticate);

// Customer creates bulk shipment (CSV upload)
router.post('/', requireCustomer, upload.single('file'), async (req, res, next) => {
  try {
    const reference = `BS-${Date.now()}-${uuid().slice(0, 6).toUpperCase()}`;
    const shipment = await prisma.bulkShipment.create({
      data: {
        reference,
        customerName: req.user!.name,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        status: 'draft',
      },
    });
    res.status(201).json(success(shipment));
  } catch (e) { next(e); }
});

router.get('/', authorize('packages.view'), async (req, res, next) => {
  try {
    const { skip, take, page, pageSize } = parsePagination(req);
    const [data, total] = await Promise.all([
      prisma.bulkShipment.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.bulkShipment.count(),
    ]);
    res.json(paginated(data, total, page, pageSize));
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const shipment = await prisma.bulkShipment.findUniqueOrThrow({ where: { id: req.params.id } });
    res.json(success(shipment));
  } catch (e) { next(e); }
});

router.patch('/:id/submit', async (req, res, next) => {
  try {
    const shipment = await prisma.bulkShipment.update({
      where: { id: req.params.id },
      data: { status: 'validated', submittedAt: new Date() },
    });
    res.json(success(shipment));
  } catch (e) { next(e); }
});

export { router as bulkShipmentsRouter };
