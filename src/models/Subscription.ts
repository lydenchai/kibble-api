import mongoose, { Document, Schema } from 'mongoose';
import { IOrderItem } from './Order';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  frequency: 'weekly' | 'monthly';
  nextOrderDate: Date;
  status: 'active' | 'paused' | 'cancelled';
  stripeSetupIntentId: string;
}

const SubscriptionSchema = new Schema<ISubscription>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: { type: Array as any, required: true }, // Simplified for brevity
  frequency: { type: String, enum: ['weekly', 'monthly'], required: true },
  nextOrderDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'paused', 'cancelled'], default: 'active' },
  stripeSetupIntentId: { type: String, required: true }
}, {
  timestamps: true
});

export const Subscription = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
