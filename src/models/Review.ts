import mongoose, { Document, Schema } from 'mongoose';
import { Product } from './Product';
import { Order } from './Order';

export interface IReview extends Document {
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewSchema = new Schema<IReview>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  verifiedPurchase: { type: Boolean, default: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, {
  timestamps: true
});

ReviewSchema.pre('save', async function () {
  if (this.isNew) {
    const hasPurchased = await Order.exists({ user: this.user, 'items.product': this.product, status: 'delivered' });
    this.verifiedPurchase = !!hasPurchased;
  }
});

ReviewSchema.post('save', async function () {
  if (this.status === 'approved') {
    const stats = await mongoose.model('Review').aggregate([
      { $match: { product: this.product, status: 'approved' } },
      { $group: { _id: '$product', ratingAvg: { $avg: '$rating' }, ratingCount: { $sum: 1 } } }
    ]);
    
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(this.product, {
        ratingAvg: Math.round(stats[0].ratingAvg * 10) / 10,
        ratingCount: stats[0].ratingCount
      });
    }
  }
});

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
