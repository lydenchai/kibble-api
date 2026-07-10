import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface IVariant {
  size?: string;
  weight?: string;
  flavor?: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  category: mongoose.Types.ObjectId;
  brand: string;
  images: string[];
  variants: IVariant[];
  petType: 'dog' | 'cat' | 'bird' | 'small-pet' | 'fish' | 'reptile' | 'both' | 'other';
  tags: string[];
  ratingAvg: number;
  ratingCount: number;
  isActive: boolean;
}

const VariantSchema = new Schema<IVariant>({
  size: { type: String },
  weight: { type: String },
  flavor: { type: String },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 }
});

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  images: [{ type: String }],
  variants: [VariantSchema],
  petType: { type: String, enum: ['dog', 'cat', 'bird', 'small-pet', 'fish', 'reptile', 'both', 'other'], required: true },
  tags: [{ type: String }],
  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1, isActive: 1 });
ProductSchema.index({ 'variants.price': 1 });

ProductSchema.pre<IProduct>('save', async function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
