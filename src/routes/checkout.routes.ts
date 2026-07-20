import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { authenticate } from '../middlewares/auth.middleware';
import express from 'express';

const router = Router();

router.post('/create-intent', authenticate, CheckoutController.createIntent);

export default router;
