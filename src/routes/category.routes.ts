import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware';
import { auditLogMiddleware } from '../middlewares/audit.middleware';

const router = Router();

router.get('/', CategoryController.getCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin / Staff only
router.use(authenticate, authorizeRole('admin', 'staff'), auditLogMiddleware('Category'));
router.post('/', CategoryController.createCategory);
router.put('/:id', CategoryController.updateCategory);
router.delete('/:id', CategoryController.deleteCategory);

export default router;
