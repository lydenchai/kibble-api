import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Only admin/staff can access customers
router.use(authenticate);
router.use(authorizeRole('admin', 'staff'));

router.get('/', CustomerController.getCustomers);

export default router;
