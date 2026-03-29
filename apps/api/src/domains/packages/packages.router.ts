import { Router } from 'express';
import { PackagesController } from './packages.controller';
import { authenticate } from '../../middleware/authenticate';
import { authorize, requireCourier } from '../../middleware/authorize';
import { validate } from '../../middleware/validate';
import { auditLog } from '../../middleware/auditLog';
import {
  createPackageSchema,
  updateStatusSchema,
  listPackagesSchema,
  assignSchema,
  scanSchema,
} from './packages.validator';

const router = Router();

// Public tracking (no auth)
router.get('/track/:waybill', PackagesController.track);

// Courier scan (mobile)
router.post('/scan', authenticate, requireCourier, validate(scanSchema), PackagesController.scan);

// Staff routes
router.use(authenticate);

router.get('/',                    authorize('packages.view'),   validate(listPackagesSchema, 'query'), PackagesController.list);
router.post('/',                   authorize('packages.create'), validate(createPackageSchema),         auditLog('CREATE', 'Package'), PackagesController.create);
router.get('/:waybill',            authorize('packages.view'),   PackagesController.getByWaybill);
router.patch('/:waybill/status',   authorize('packages.edit'),   validate(updateStatusSchema),          auditLog('UPDATE_STATUS', 'Package'), PackagesController.updateStatus);
router.post('/:waybill/assign',    authorize('packages.edit'),   validate(assignSchema),                auditLog('ASSIGN', 'Package'), PackagesController.assign);
router.delete('/:waybill',         authorize('packages.delete'), auditLog('DELETE', 'Package'),        PackagesController.delete);

export { router as packagesRouter };
