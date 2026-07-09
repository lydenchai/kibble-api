import mongoose, { Document, Schema } from 'mongoose';

export interface IShippingZone {
  name: string;
  countries: string[];
  rates: { name: string; price: number; condition?: string }[];
}

export interface ITaxRule {
  country: string;
  rate: number;
}

export interface IStoreSettings extends Document {
  storeName: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  policies: {
    termsOfService?: string;
    privacyPolicy?: string;
    refundPolicy?: string;
  };
  shippingZones: IShippingZone[];
  taxRules: ITaxRule[];
  paymentGateways: {
    stripeEnabled: boolean;
    paypalEnabled: boolean;
  };
}

const StoreSettingsSchema = new Schema<IStoreSettings>({
  storeName: { type: String, required: true, default: 'My Store' },
  logoUrl: { type: String },
  contactEmail: { type: String, required: true, default: 'admin@example.com' },
  contactPhone: { type: String },
  policies: {
    termsOfService: { type: String },
    privacyPolicy: { type: String },
    refundPolicy: { type: String }
  },
  shippingZones: [{
    name: { type: String, required: true },
    countries: [{ type: String }],
    rates: [{
      name: { type: String, required: true },
      price: { type: Number, required: true },
      condition: { type: String }
    }]
  }],
  taxRules: [{
    country: { type: String, required: true },
    rate: { type: Number, required: true }
  }],
  paymentGateways: {
    stripeEnabled: { type: Boolean, default: true },
    paypalEnabled: { type: Boolean, default: false }
  }
}, { timestamps: true });

export const StoreSettings = mongoose.model<IStoreSettings>('StoreSettings', StoreSettingsSchema);
