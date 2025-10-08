/**
 * User Model
 * Mongoose schema for user documents with comprehensive validation
 */

import { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username?: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: {
      type: String,
      required: [true, 'Clerk ID is required'],
      unique: true,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Clerk IDs typically start with 'user_'
          return v.startsWith('user_') && v.length > 5;
        },
        message: 'Invalid Clerk ID format',
      },
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v: string) {
          // Email validation regex
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    },
    username: {
      type: String,
      trim: true,
      sparse: true, // Allow null but ensure uniqueness when present
      unique: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      validate: {
        validator: function (v: string) {
          // Username: alphanumeric, dash, underscore
          return !v || /^[a-zA-Z0-9_-]+$/.test(v);
        },
        message: 'Username can only contain letters, numbers, dashes, and underscores',
      },
    },
    photo: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          // Validate URL format if provided
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        message: 'Invalid photo URL',
      },
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    plan: {
      type: String,
      enum: {
        values: ['free', 'pro', 'enterprise'],
        message: 'Plan must be free, pro, or enterprise',
      },
      default: 'free',
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
    versionKey: '__v',
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret: Record<string, unknown>) {
        // Remove sensitive/internal fields from JSON output
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
// Query optimizations
UserSchema.index({ email: 1 }); // Email lookup
UserSchema.index({ plan: 1, createdAt: -1 }); // Plan-based queries
UserSchema.index({ lastActive: -1 }); // Active user queries

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  return this.name || this.username || 'User';
});

// Virtual to check if user is active (active in last 30 days)
UserSchema.virtual('isActive').get(function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return this.lastActive > thirtyDaysAgo;
});

// Virtual to check if user is on paid plan
UserSchema.virtual('isPaidPlan').get(function () {
  return this.plan === 'pro' || this.plan === 'enterprise';
});

// Virtual for account age in days
UserSchema.virtual('accountAgeDays').get(function () {
  const ageMs = Date.now() - this.createdAt.getTime();
  return Math.floor(ageMs / (1000 * 60 * 60 * 24));
});

// Pre-save hook to sanitize and validate data
UserSchema.pre('save', function (next) {
  // Ensure name is set if firstName and lastName are provided
  if (this.isModified('firstName') || this.isModified('lastName')) {
    if (this.firstName && this.lastName && !this.name) {
      this.name = `${this.firstName} ${this.lastName}`.trim();
    }
  }

  // Update lastActive on save
  if (this.isNew) {
    this.lastActive = new Date();
  }

  next();
});

// Pre-update hook to maintain updatedAt
UserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Method to update last active timestamp
UserSchema.methods.updateLastActive = async function () {
  this.lastActive = new Date();
  return this.save();
};

// Static method to find by Clerk ID
UserSchema.statics.findByClerkId = function (clerkId: string) {
  return this.findOne({ clerkId });
};

// Static method to find by email
UserSchema.statics.findByEmail = function (email: string) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to count users by plan
UserSchema.statics.countByPlan = function (plan: string) {
  return this.countDocuments({ plan });
};

// Static method to find active users
UserSchema.statics.findActiveUsers = function (days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return this.find({ lastActive: { $gte: cutoffDate } });
};

const User = models.User || model<IUser>('User', UserSchema);

export default User;
