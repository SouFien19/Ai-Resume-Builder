/**
 * Admin Log Model
 * Tracks all administrative actions for audit trail and compliance
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IAdminLog extends Document {
  adminId: string; // Clerk ID of the admin
  adminEmail: string;
  adminName?: string;
  action: string; // e.g., 'BAN_USER', 'PROMOTE_USER', 'DELETE_RESUME'
  targetType: 'user' | 'resume' | 'template' | 'system' | 'settings' | 'analytics';
  targetId?: string; // ID of the affected resource
  targetEmail?: string; // Email of affected user (for user actions)
  details: Record<string, any>; // Additional context
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failed' | 'pending';
  errorMessage?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminLogSchema = new Schema<IAdminLog>(
  {
    adminId: { 
      type: String, 
      required: true, 
      index: true 
    },
    adminEmail: { 
      type: String, 
      required: true,
      lowercase: true,
    },
    adminName: String,
    action: { 
      type: String, 
      required: true, 
      index: true,
      uppercase: true,
    },
    targetType: { 
      type: String, 
      enum: ['user', 'resume', 'template', 'system', 'settings', 'analytics'],
      required: true,
      index: true,
    },
    targetId: { 
      type: String,
      index: true,
    },
    targetEmail: {
      type: String,
      lowercase: true,
    },
    details: { 
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: { 
      type: String,
      required: true,
    },
    userAgent: { 
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
      index: true,
    },
    errorMessage: String,
    timestamp: { 
      type: Date, 
      default: Date.now, 
      index: true 
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound indexes for efficient queries
AdminLogSchema.index({ adminId: 1, timestamp: -1 }); // Admin action history
AdminLogSchema.index({ action: 1, timestamp: -1 }); // Action type filtering
AdminLogSchema.index({ targetType: 1, targetId: 1, timestamp: -1 }); // Target tracking
AdminLogSchema.index({ timestamp: -1 }); // Recent activity

// TTL Index - automatically delete logs older than 1 year (optional)
// AdminLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

// Static method to log an action
AdminLogSchema.statics.logAction = async function (data: {
  adminId: string;
  adminEmail: string;
  adminName?: string;
  action: string;
  targetType: 'user' | 'resume' | 'template' | 'system' | 'settings' | 'analytics';
  targetId?: string;
  targetEmail?: string;
  details?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  status?: 'success' | 'failed' | 'pending';
  errorMessage?: string;
}) {
  try {
    return await this.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create admin log:', error);
    // Don't throw - logging should never break the main flow
    return null;
  }
};

// Static method to get recent logs
AdminLogSchema.statics.getRecentLogs = function (limit = 50) {
  return this.find()
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get logs by admin
AdminLogSchema.statics.getLogsByAdmin = function (adminId: string, limit = 100) {
  return this.find({ adminId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get logs by action type
AdminLogSchema.statics.getLogsByAction = function (action: string, limit = 100) {
  return this.find({ action: action.toUpperCase() })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get logs for a specific target
AdminLogSchema.statics.getLogsForTarget = function (
  targetType: string,
  targetId: string,
  limit = 50
) {
  return this.find({ targetType, targetId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .lean();
};

// Static method to get action statistics
AdminLogSchema.statics.getActionStats = async function (days = 30) {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: cutoffDate } } },
    { 
      $group: { 
        _id: '$action', 
        count: { $sum: 1 },
        admins: { $addToSet: '$adminEmail' }
      } 
    },
    { $sort: { count: -1 } },
  ]);
};

// Virtual for formatted timestamp
AdminLogSchema.virtual('formattedTime').get(function () {
  return this.timestamp.toLocaleString();
});

// Instance method to format log for display
AdminLogSchema.methods.format = function () {
  return {
    id: this._id,
    admin: {
      id: this.adminId,
      email: this.adminEmail,
      name: this.adminName,
    },
    action: this.action,
    target: {
      type: this.targetType,
      id: this.targetId,
      email: this.targetEmail,
    },
    details: this.details,
    meta: {
      ip: this.ipAddress,
      userAgent: this.userAgent,
      status: this.status,
      error: this.errorMessage,
    },
    timestamp: this.timestamp,
    formattedTime: this.formattedTime,
  };
};

const AdminLog = (mongoose.models && mongoose.models.AdminLog) || model<IAdminLog>('AdminLog', AdminLogSchema);

export default AdminLog;
