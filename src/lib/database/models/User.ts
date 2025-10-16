/**
 * User Model
 * Mongoose schema for user documents with comprehensive validation
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  username?: string;
  photo?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  plan: 'free' | 'pro' | 'enterprise';
  role: 'user' | 'admin' | 'superadmin';
  isActive: boolean;
  isSuspended: boolean;
  suspendedReason?: string;
  suspendedAt?: Date;
  suspendedBy?: string; // Clerk ID of admin who suspended
  lastActive: Date;
  
  // Admin tracking metadata
  metadata: {
    lastLogin?: Date;
    loginCount: number;
    signupDate: Date;
    lastActiveAt?: Date;
    ipAddresses: string[];
    userAgent?: string;
  };
  
  // Subscription tracking
  subscription: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodStart?: Date;
    currentPeriodEnd?: Date;
    canceledAt?: Date;
    trialEndsAt?: Date;
  };
  
  // AI Usage tracking for admin monitoring
  aiUsage: {
    totalRequests: number;
    requestsThisMonth: number;
    lastRequestAt?: Date;
    estimatedCost: number; // in USD
    monthlyResetDate?: Date;
  };
  
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
      sparse: true, // Allow null values
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
    role: {
      type: String,
      enum: {
        values: ['user', 'admin', 'superadmin'],
        message: 'Role must be user, admin, or superadmin',
      },
      default: 'user',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isSuspended: {
      type: Boolean,
      default: false,
    },
    suspendedReason: {
      type: String,
      trim: true,
    },
    suspendedAt: {
      type: Date,
    },
    suspendedBy: {
      type: String,
      trim: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    
    // Admin tracking metadata
    metadata: {
      lastLogin: Date,
      loginCount: { type: Number, default: 0 },
      signupDate: { type: Date, default: Date.now },
      lastActiveAt: Date,
      ipAddresses: { type: [String], default: [] },
      userAgent: String,
    },
    
    // Subscription tracking
    subscription: {
      plan: {
        type: String,
        enum: ['free', 'pro', 'enterprise'],
        default: 'free',
      },
      status: {
        type: String,
        enum: ['active', 'canceled', 'past_due', 'trialing'],
        default: 'active',
      },
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      canceledAt: Date,
      trialEndsAt: Date,
    },
    
    // AI Usage tracking
    aiUsage: {
      totalRequests: { type: Number, default: 0 },
      requestsThisMonth: { type: Number, default: 0 },
      lastRequestAt: Date,
      estimatedCost: { type: Number, default: 0 },
      monthlyResetDate: Date,
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
// Note: clerkId already has unique:true index, no need to add another
UserSchema.index({ email: 1 }); // Email lookup
UserSchema.index({ plan: 1, createdAt: -1 }); // Plan-based queries
UserSchema.index({ lastActive: -1 }); // Active user queries
UserSchema.index({ role: 1 }); // Admin queries
UserSchema.index({ isSuspended: 1, isActive: 1 }); // Status queries
UserSchema.index({ 'metadata.lastActiveAt': -1 }); // Recent activity
UserSchema.index({ 'aiUsage.totalRequests': -1 }); // AI usage tracking
UserSchema.index({ 'subscription.status': 1 }); // Subscription queries
UserSchema.index({ role: 1, createdAt: -1 }); // Admin user lists

// Virtual for full name
UserSchema.virtual('fullName').get(function () {
  if (this.firstName && this.lastName) {
    return `${this.firstName} ${this.lastName}`.trim();
  }
  return this.name || this.username || 'User';
});

// Virtual to check if user was recently active (active in last 30 days)
UserSchema.virtual('isRecentlyActive').get(function () {
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

// Admin-specific methods
UserSchema.statics.getAdminStats = async function () {
  const [totalUsers, activeUsers, suspendedUsers, usersByPlan] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isActive: true, isSuspended: false }),
    this.countDocuments({ isSuspended: true }),
    this.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ])
  ]);

  return {
    totalUsers,
    activeUsers,
    suspendedUsers,
    usersByPlan: usersByPlan.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>)
  };
};

// Method to suspend user
UserSchema.methods.suspend = async function (reason: string) {
  this.isSuspended = true;
  this.suspendedReason = reason;
  this.suspendedAt = new Date();
  return this.save();
};

// Method to unsuspend user
UserSchema.methods.unsuspend = async function () {
  this.isSuspended = false;
  this.suspendedReason = undefined;
  this.suspendedAt = undefined;
  return this.save();
};

// Check if user is admin
UserSchema.methods.isAdmin = function () {
  return this.role === 'admin' || this.role === 'superadmin';
};

// Check if user is superadmin
UserSchema.methods.isSuperAdmin = function () {
  return this.role === 'superadmin';
};

// ============================================
// DATABASE INDEXES FOR PERFORMANCE
// ============================================
// Note: role, email, lastActive already have indexes defined above
// Adding only NEW compound indexes here

// Compound index for admin dashboard queries (active users by role)
UserSchema.index({ role: 1, isActive: 1 });

// Index on isSuspended for filtering suspended users
UserSchema.index({ isSuspended: 1 });

// Index on subscription plan for analytics
UserSchema.index({ 'subscription.plan': 1, 'subscription.status': 1 });

// Index on createdAt for sorting by signup date
UserSchema.index({ createdAt: -1 });

const User = (mongoose.models && mongoose.models.User) || model<IUser>('User', UserSchema);

export default User;
