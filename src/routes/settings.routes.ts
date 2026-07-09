import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.get('/', SettingsController.getSettings);

router.use(authenticate, authorizeRole('admin'), auditLogMiddleware('StoreSettings'));

router.put('/', SettingsController.updateSettings);

export default router;
