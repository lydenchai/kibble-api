import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/', AuditController.getLogs);

export default router;
