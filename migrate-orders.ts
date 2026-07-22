import mongoose from 'mongoose';
import { Order } from './src/models/Order';
import { Product } from './src/models/Product';
import dotenv from 'dotenv';
dotenv.config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');
    
    const orders = await Order.find({});
    for (const order of orders) {
      let changed = false;
      for (const item of order.items) {
        if (!item.image || !item.slug || !item.product) {
          const product = await Product.findOne({ 'variants.sku': item.sku });
          if (product) {
            item.product = product._id as any;
            item.slug = product.slug;
            item.image = product.images?.[0] || '';
            changed = true;
          }
        }
      }
      if (changed) {
        await order.save();
        console.log(`Updated order ${order._id}`);
      }
    }
    console.log('Migration complete');
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

migrate();
