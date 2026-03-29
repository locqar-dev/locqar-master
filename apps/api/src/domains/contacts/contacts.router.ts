import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { requireCustomer } from '../../middleware/authorize';
import { prisma } from '../../config/database';
import { success } from '../../shared/utils/response';

const router = Router();
router.use(authenticate, requireCustomer);

router.get('/', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const contacts = await prisma.crmContact.findMany({ where: { customerId: customer.id } });
    res.json(success(contacts));
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const customer = await prisma.customer.findUniqueOrThrow({ where: { userId: req.user!.id } });
    const contact = await prisma.crmContact.create({ data: { ...req.body, customerId: customer.id } });
    res.status(201).json(success(contact));
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.crmContact.delete({ where: { id: req.params.id } });
    res.json(success({ message: 'Contact deleted' }));
  } catch (e) { next(e); }
});

export { router as contactsRouter };
