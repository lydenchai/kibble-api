import cron from 'node-cron';
import { Subscription } from '../models/Subscription';
import { Order } from '../models/Order';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia' as any
});

export const startCronJobs = () => {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription cron job...');
    
    try {
      const today = new Date();
      // Find all active subscriptions due today or earlier
      const subscriptions = await Subscription.find({
        status: 'active',
        nextOrderDate: { $lte: today }
      });

      console.log(`Found ${subscriptions.length} subscriptions due.`);

      for (const sub of subscriptions) {
        try {
          // In a full app, calculate totals dynamically, check stock, etc.
          const total = sub.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

          // Charge the saved Stripe Customer via SetupIntent
          // Assume the user has a Stripe Customer ID stored, mock for this phase:
          /*
          const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            customer: stripeCustomerId,
            payment_method: savedPaymentMethodId,
            off_session: true,
            confirm: true,
          });
          */

          // Create the Order
          await Order.create({
            user: sub.user,
            items: sub.items,
            shippingAddress: { street: 'Cron St', city: 'Node', state: 'JS', zip: '12345', country: 'USA' }, // Mock
            status: 'processing',
            paymentStatus: 'paid', // Assuming Stripe succeeded
            paymentMethod: 'stripe_subscription',
            subtotal: total,
            tax: 0,
            shipping: 0,
            total: total
          });

          // Advance the next order date
          const nextDate = new Date(sub.nextOrderDate);
          if (sub.frequency === 'weekly') {
            nextDate.setDate(nextDate.getDate() + 7);
          } else if (sub.frequency === 'monthly') {
            nextDate.setMonth(nextDate.getMonth() + 1);
          }
          
          sub.nextOrderDate = nextDate;
          await sub.save();

          console.log(`Successfully processed subscription ${sub._id}`);
        } catch (error) {
          console.error(`Failed to process subscription ${sub._id}:`, error);
          // In a real app, you would notify the customer or retry later
        }
      }
    } catch (error) {
      console.error('Error running subscription cron:', error);
    }
  });

  console.log('Cron jobs scheduled.');
};
