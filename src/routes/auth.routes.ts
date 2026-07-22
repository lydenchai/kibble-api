import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimit';

const router = Router();

router.post('/register', authRateLimiter, AuthController.register);
router.post('/login', authRateLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refresh);
router.post('/logout', authenticate, AuthController.logout);
router.get('/profile', authenticate, AuthController.profile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.get('/wishlist', authenticate, AuthController.getWishlist);
router.post('/wishlist/:productId', authenticate, AuthController.toggleWishlist);

export default router;
