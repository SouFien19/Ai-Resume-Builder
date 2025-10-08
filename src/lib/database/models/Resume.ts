/**
 * Resume Model
 * Mongoose schema for resume documents with comprehensive validation
 */

import { Schema, model, models, Document } from 'mongoose';

export interface IResume extends Document {
  userId: Schema.Types.ObjectId;
  name: string;
  templateId: string;
  data: Record<string, unknown>;
  downloads: number;
  lastDownloadedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Resume name is required'],
      trim: true,
      minlength: [1, 'Resume name must be at least 1 character'],
      maxlength: [200, 'Resume name cannot exceed 200 characters'],
      validate: {
        validator: function (v: string) {
          // Prevent XSS in resume names
          return !/<script|<iframe|javascript:/i.test(v);
        },
        message: 'Resume name contains invalid characters',
      },
    },
    templateId: {
      type: String,
      required: [true, 'Template ID is required'],
      trim: true,
      default: 'azurill',
      validate: {
        validator: function (v: string) {
          // Validate template ID format (alphanumeric, dash, underscore)
          return /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message: 'Template ID must contain only letters, numbers, dashes, and underscores',
      },
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
      validate: {
        validator: function (v: unknown) {
          // Ensure data is an object
          return typeof v === 'object' && v !== null && !Array.isArray(v);
        },
        message: 'Resume data must be an object',
      },
    },
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative'],
    },
    lastDownloadedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: '__v',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        // Remove sensitive fields from JSON output
        if ('__v' in ret) {
          delete ret.__v;
        }
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Indexes for query optimization
ResumeSchema.index({ userId: 1, updatedAt: -1 }); // List user's resumes
ResumeSchema.index({ userId: 1, name: 1 }, { unique: true }); // Prevent duplicate names per user
ResumeSchema.index({ _id: 1, userId: 1 }); // Owner verification queries
ResumeSchema.index({ createdAt: -1 }); // Recent resumes

// Virtual for formatted creation date
ResumeSchema.virtual('formattedCreatedAt').get(function () {
  const createdAt: Date | undefined = this.createdAt;
  return createdAt instanceof Date ? createdAt.toLocaleDateString() : null;
});

// Virtual for formatted last modified date
ResumeSchema.virtual('formattedUpdatedAt').get(function () {
  const updatedAt: Date | undefined = this.updatedAt;
  return updatedAt instanceof Date ? updatedAt.toLocaleDateString() : null;
});

// Virtual to check if resume is new (created in last 7 days)
ResumeSchema.virtual('isNew').get(function () {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  return this.createdAt > sevenDaysAgo;
});

// Pre-save hook to validate and sanitize data
ResumeSchema.pre('save', function (next) {
  // Trim whitespace from name
  if (this.isModified('name')) {
    this.name = this.name.trim();
  }

  // Ensure templateId is lowercase
  if (this.isModified('templateId')) {
    this.templateId = this.templateId.toLowerCase().trim();
  }

  next();
});

// Pre-update hook to maintain updatedAt
ResumeSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Method to increment download count
ResumeSchema.methods.incrementDownloads = async function () {
  this.downloads += 1;
  this.lastDownloadedAt = new Date();
  return this.save();
};

// Static method to find resumes by user
ResumeSchema.statics.findByUser = function (userId: string) {
  return this.find({ userId }).sort({ updatedAt: -1 });
};

// Static method to find resume by user and name
ResumeSchema.statics.findByUserAndName = function (
  userId: string,
  name: string
) {
  return this.findOne({ userId, name });
};

const Resume = models.Resume || model<IResume>('Resume', ResumeSchema);

export default Resume;
