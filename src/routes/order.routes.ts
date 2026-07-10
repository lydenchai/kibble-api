import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/my', OrderController.getMyOrders);
router.get('/my/:id', OrderController.getMyOrderById);

export default router;
