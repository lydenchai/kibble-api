import { Request, Response } from 'express';
import { Order } from '../models/Order';
import { Cart } from '../models/Cart';
import { Product } from '../models/Product';
import { Coupon } from '../models/Coupon';
import { sseService } from '../services/sse.service';

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
        const idToFind = item.product || item.productId;
        const product = await Product.findById(idToFind);
        if (!product) throw new Error(`Product not found for ID: ${idToFind}. Your cart might have stale items. Please clear your cart and try again.`);
        
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

      // 5. Create Pending Order for ABA QR Payment
      const order = await Order.create({
        user: userId,
        items: orderItems,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'aba_qr',
        couponCode,
        subtotal,
        tax,
        shipping,
        discount,
        total
      });

      // 6. Decrement stock immediately
      for (const item of order.items) {
        await Product.updateOne(
          { 'variants.sku': item.sku },
          { $inc: { 'variants.$.stock': -item.quantity } }
        );
      }

      // 7. Empty Cart
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });

      // 8. Broadcast new order event to admin
      sseService.broadcast('new_order', {
        orderId: order._id,
        total: order.total,
        customer: req.user.name || 'A customer'
      });

      res.status(200).json({ success: true, data: { orderId: order._id } });
    } catch (error: any) {
      res.status(400).json({ success: false, error: { message: error.message } });
    }
  }
}
