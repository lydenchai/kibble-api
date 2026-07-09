import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.get('/', ProductController.getProducts);
router.get('/:slug', ProductController.getProductBySlug);

// Admin / Staff only
router.use(authenticate, authorizeRole('admin', 'staff'), auditLogMiddleware('Product'));
router.post('/', ProductController.createProduct);
router.get('/admin/:id', ProductController.getProductById);
router.put('/:id', ProductController.updateProduct);
router.delete('/:id', ProductController.deleteProduct);

export default router;
