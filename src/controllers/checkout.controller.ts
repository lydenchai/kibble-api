import { Request, Response } from 'express';
import Stripe from 'stripe';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any
});

export class CheckoutController {
  static async createIntent(req: Request, res: Response) {
    try {
      const userId = req.user._id;
      const { couponCode, shippingAddress, items: requestItems } = req.body;

      // 1. Get Cart from DB or Request
      let cartItems = requestItems || [];
      if (!cartItems || cartItems.length === 0) {
        const cart = await Cart.findOne({ user: userId });
        if (cart) cartItems = cart.items;
      }

      if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, error: { message: 'Cart is empty' } });
      }

      // 2. Validate stock and calculate totals server-side
      let subtotal = 0;
      const orderItems = [];

      for (const item of cartItems) {
        const product = await Product.findById(item.product || item.productId);
        if (!product) throw new Error('Product not found');
        
        const variantSku = item.variantSku || item.sku;
        const variant = product.variants.find(v => v.sku === variantSku);
        if (!variant) throw new Error(`Variant ${variantSku} not found`);
        
        if (variant.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        subtotal += variant.price * item.quantity;
        orderItems.push({
          name: product.name,
          sku: variant.sku,
          price: variant.price,
          quantity: item.quantity
        });
      }

      // 3. Apply Coupon
      let discount = 0;
      if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode, isActive: true });
        if (coupon && coupon.expiry > new Date() && subtotal >= coupon.minOrderValue) {
          if (coupon.type === 'percentage') {
            discount = subtotal * (coupon.value / 100);
          } else {
            discount = coupon.value;
          }
        }
      }

      // 4. Calculate Final Total
      const taxRate = 0.08; // 8% dummy tax
      const shipping = subtotal > 50 ? 0 : 10; // Free shipping over $50
      const tax = (subtotal - discount) * taxRate;
      const total = subtotal - discount + tax + shipping;

      // 5. Create Stripe PaymentIntent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(total * 100), // Stripe expects cents
        currency: 'usd',
        metadata: { userId: userId.toString(), couponCode }
      });

      // 6. Create Pending Order
      const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'stripe',
        stripePaymentIntentId: paymentIntent.id,
        couponCode,
        subtotal,
        tax,
        shipping,
        discount,
        total
      });

      res.status(200).json({ success: true, data: { clientSecret: paymentIntent.client_secret, orderId: order._id } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  }

  static async handleWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order && order.paymentStatus === 'pending') {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();

        // Decrement stock
        for (const item of order.items) {
          await Product.updateOne(
            { 'variants.sku': item.sku },
            { $inc: { 'variants.$.stock': -item.quantity } }
          );
        }

        // Empty Cart
        await Cart.findOneAndUpdate({ user: order.user }, { items: [] });
      }
    }

    res.json({ received: true });
  }
}
