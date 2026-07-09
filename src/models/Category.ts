import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: mongoose.Types.ObjectId;
  image?: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, unique: true, index: true },
  parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
  image: { type: String }
}, {
  timestamps: true
});

CategorySchema.pre<ICategory>('save', async function() {
  if (this.isModified('name') || !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
});

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
