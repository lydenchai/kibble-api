import { Router } from 'express';
import { MarketingController } from '../controllers/marketing.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';

const router = Router();

// Only admin/staff can access marketing features
router.use(authenticate);
router.use(authorizeRole('admin', 'staff'));

router.get('/coupons', MarketingController.getCoupons);
router.post('/coupons', MarketingController.createCoupon);
router.put('/coupons/:id', MarketingController.updateCoupon);
router.delete('/coupons/:id', MarketingController.deleteCoupon);

export default router;
