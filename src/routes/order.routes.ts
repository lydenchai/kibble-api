import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// All order routes require authentication
router.use(authenticate);

router.get('/', OrderController.getAllOrders);
router.get('/my', OrderController.getMyOrders);
router.get('/my/:id', OrderController.getMyOrderById);
router.get('/:id', OrderController.getOrderById);
router.put('/:id/status', OrderController.updateOrderStatus);

export default router;
