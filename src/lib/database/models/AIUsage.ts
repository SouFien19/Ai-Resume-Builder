/**
 * AI Usage Model
 * Track AI API usage and costs
 */

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IAIUsage extends Document {
  userId: mongoose.Types.ObjectId;
  provider: 'gemini' | 'openai' | 'anthropic';
  aiModel: string;
  feature: 'content-gen' | 'ats-optimizer' | 'job-matcher' | 'cover-letter' | 'skill-gap';
  tokensUsed?: number;
  cost?: number;
  success: boolean;
  errorMessage?: string;
  requestDuration?: number;
  createdAt: Date;
  updatedAt: Date;
}

const AIUsageSchema = new Schema<IAIUsage>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'anthropic'],
      required: true,
    },
    aiModel: {
      type: String,
      required: true,
    },
    feature: {
      type: String,
      enum: ['content-gen', 'ats-optimizer', 'job-matcher', 'cover-letter', 'skill-gap'],
      required: true,
    },
    tokensUsed: {
      type: Number,
      min: 0,
    },
    cost: {
      type: Number,
      min: 0,
    },
    success: {
      type: Boolean,
      default: true,
    },
    errorMessage: {
      type: String,
    },
    requestDuration: {
      type: Number,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for analytics and performance
AIUsageSchema.index({ createdAt: -1 });
AIUsageSchema.index({ provider: 1, createdAt: -1 });
AIUsageSchema.index({ feature: 1, createdAt: -1 });
// Compound index for user-specific queries with time range
AIUsageSchema.index({ userId: 1, createdAt: -1 });
// Index for success rate analytics
AIUsageSchema.index({ success: 1, createdAt: -1 });

const AIUsage: Model<IAIUsage> = mongoose.models.AIUsage || mongoose.model<IAIUsage>('AIUsage', AIUsageSchema);

export default AIUsage;
