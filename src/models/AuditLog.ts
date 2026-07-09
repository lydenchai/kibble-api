import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  user: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  details: string; // JSON string or description
}

const AuditLogSchema = new Schema<IAuditLog>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  details: { type: String }
}, {
  timestamps: true
});

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
