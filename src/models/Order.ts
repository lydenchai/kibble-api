import mongoose, { Document, Schema } from 'mongoose';
import { IAddress } from './User';

export interface IOrderItem {
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  shippingAddress?: IAddress;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  stripePaymentIntentId?: string;
  couponCode?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
}

const OrderItemSchema = new Schema<IOrderItem>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true }
});

const OrderSchema = new Schema<IOrder>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  shippingAddress: { type: Object, required: false },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  paymentMethod: { type: String, required: true, default: 'stripe' },
  stripePaymentIntentId: { type: String },
  couponCode: { type: String },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  shipping: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, {
  timestamps: true
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
