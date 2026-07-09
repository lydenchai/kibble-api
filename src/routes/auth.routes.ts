import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit';

const router = Router();

router.use(authRateLimiter);

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh-token', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.profile);

export default router;
