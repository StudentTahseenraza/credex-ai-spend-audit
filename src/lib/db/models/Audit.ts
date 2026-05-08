import mongoose, { Schema, Document } from 'mongoose';

export interface ToolRecommendation {
  action: 'downgrade' | 'upgrade' | 'switch' | 'stay' | 'consider_credex';
  suggestedTool?: string;
  suggestedPlan?: string;
  monthlySavings: number;
  reason: string;
}

export interface ToolInput {
  name: string;
  plan: string;
  monthlySpend: number;
  seats: number;
}

export interface ToolResult extends ToolInput {
  recommendation: ToolRecommendation;
}

export interface AuditDocument extends Document {
  shareableId: string;
  email?: string;
  company?: string;
  role?: string;
  teamSize: number;
  useCase: string;
  tools: ToolResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
  ipHash?: string;
  createdAt: Date;
  emailSent: boolean;
  consultationBooked: boolean;
}

const ToolRecommendationSchema = new Schema({
  action: { type: String, enum: ['downgrade', 'upgrade', 'switch', 'stay', 'consider_credex'], required: true },
  suggestedTool: { type: String },
  suggestedPlan: { type: String },
  monthlySavings: { type: Number, required: true },
  reason: { type: String, required: true },
});

const ToolResultSchema = new Schema({
  name: { type: String, required: true },
  plan: { type: String, required: true },
  monthlySpend: { type: Number, required: true },
  seats: { type: Number, required: true },
  recommendation: { type: ToolRecommendationSchema, required: true },
});

const AuditSchema = new Schema({
  shareableId: { type: String, required: true, unique: true, index: true },
  email: { type: String, index: true },
  company: String,
  role: String,
  teamSize: { type: Number, required: true },
  useCase: { type: String, required: true },
  tools: [ToolResultSchema],
  totalMonthlySavings: { type: Number, required: true },
  totalAnnualSavings: { type: Number, required: true },
  aiSummary: String,
  ipHash: String,
  createdAt: { type: Date, default: Date.now, index: true },
  emailSent: { type: Boolean, default: false },
  consultationBooked: { type: Boolean, default: false },
});

export const Audit = mongoose.models.Audit || mongoose.model<AuditDocument>('Audit', AuditSchema);