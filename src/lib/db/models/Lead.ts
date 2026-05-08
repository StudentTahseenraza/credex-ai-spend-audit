import mongoose, { Schema, Document } from 'mongoose';

export interface LeadDocument extends Document {
  email: string;
  company?: string;
  role?: string;
  auditId: mongoose.Types.ObjectId;
  savingsAmount?: number;
  consultedBooked: boolean;
  createdAt: Date;
}

const LeadSchema = new Schema({
  email: { type: String, required: true, index: true },
  company: String,
  role: String,
  auditId: { type: Schema.Types.ObjectId, ref: 'Audit', required: true },
  savingsAmount: Number,
  consultedBooked: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, index: true },
});

export const Lead = mongoose.models.Lead || mongoose.model<LeadDocument>('Lead', LeadSchema);