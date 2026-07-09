import { Router } from 'express';
import { CheckoutController } from '../controllers/checkout.controller';
import { authenticate } from '../middlewares/auth.middleware';
import express from 'express';

const router = Router();

router.post('/create-intent', authenticate, CheckoutController.createIntent);

// Stripe webhook must use raw body parsing, not express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), CheckoutController.handleWebhook);

export default router;
