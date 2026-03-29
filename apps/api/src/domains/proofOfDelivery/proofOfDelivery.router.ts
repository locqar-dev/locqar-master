import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCourier, authorize } from '../../middleware/authorize';
import { upload } from '../../middleware/upload';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';
import { NotFoundError } from '../../shared/errors/AppError';
import path from 'path';

const router = Router();
router.use(authenticate);

// Courier submits proof of delivery
router.post('/', requireCourier, upload.single('photo'), async (req, res, next) => {
  try {
    const { packageId, barcodeScan, notes, lat, lng } = req.body;

    const photoUrl = req.file
      ? `/uploads/${path.basename(req.file.path)}`
      : undefined;

    const pod = await prisma.proofOfDelivery.upsert({
      where: { packageId },
      create: {
        packageId,
        photoUrl,
        barcodeScan,
        notes,
        lat: lat ? parseFloat(lat) : undefined,
        lng: lng ? parseFloat(lng) : undefined,
        submittedBy: req.user!.id,
      },
      update: { photoUrl, barcodeScan, notes, submittedBy: req.user!.id },
    });

    res.status(201).json(success(pod));
  } catch (e) { next(e); }
});

// Get POD for a package
router.get('/package/:packageId', authorize('packages.view'), async (req, res, next) => {
  try {
    const pod = await prisma.proofOfDelivery.findUnique({ where: { packageId: req.params.packageId as string } });
    if (!pod) throw new NotFoundError('Proof of delivery not found');
    res.json(success(pod));
  } catch (e) { next(e); }
});

export { router as podRouter };
