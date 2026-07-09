import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/dashboard', AnalyticsController.getDashboardMetrics);

export default router;
