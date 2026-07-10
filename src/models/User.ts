import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IAddress {
  street: string;
  houseNumber: string;
  village: string;
  commune: string;
  district: string;
  province: string;
  country: string;
  isDefault: boolean;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'customer' | 'admin' | 'staff';
  isVerified: boolean;
  addresses: IAddress[];
  wishlist: mongoose.Types.ObjectId[];
  refreshToken?: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AddressSchema = new Schema<IAddress>({
  street: { type: String, required: false },
  houseNumber: { type: String, required: false },
  village: { type: String, required: true },
  commune: { type: String, required: true },
  district: { type: String, required: true },
  province: { type: String, required: true },
  country: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String }, // optional for future OAuth support
  phone: { type: String },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  isVerified: { type: Boolean, default: false },
  addresses: [AddressSchema],
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
  refreshToken: { type: String }
}, {
  timestamps: true
});

UserSchema.pre<IUser>('save', async function() {
  if (!this.isModified('password')) return;
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
