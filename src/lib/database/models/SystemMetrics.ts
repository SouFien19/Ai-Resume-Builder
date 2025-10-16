/**
 * System Metrics Model
 * Caches dashboard statistics to reduce expensive aggregation queries
 * Metrics are computed daily and cached for fast admin dashboard loading
 */

import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface ISystemMetrics extends Document {
  date: Date; // Date of the metrics snapshot (stored at midnight UTC)
  
  // User metrics
  users: {
    total: number;
    active: number; // Active in last 30 days
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    suspended: number;
    byRole: {
      user: number;
      admin: number;
      superadmin: number;
    };
    byPlan: {
      free: number;
      pro: number;
      enterprise: number;
    };
  };
  
  // Resume metrics
  resumes: {
    total: number;
    createdToday: number;
    createdThisWeek: number;
    createdThisMonth: number;
    averagePerUser: number;
    byTemplate: Array<{
      templateId: string;
      templateName?: string;
      count: number;
      percentage: number;
    }>;
  };
  
  // AI usage metrics
  ai: {
    requestsToday: number;
    requestsThisWeek: number;
    requestsThisMonth: number;
    totalRequests: number;
    costToday: number; // USD
    costThisWeek: number;
    costThisMonth: number;
    totalCost: number;
    averageCostPerRequest: number;
    averageCostPerUser: number;
    topUsers: Array<{
      userId: string;
      email: string;
      requestCount: number;
      estimatedCost: number;
    }>;
  };
  
  // System health
  system: {
    errorCount: number;
    errorRate: number; // errors per 1000 requests
    avgResponseTime: number; // milliseconds
    status: 'healthy' | 'warning' | 'critical';
    uptime: number; // percentage
  };
  
  // Growth metrics
  growth: {
    userGrowthRate: number; // percentage
    revenueGrowthRate: number; // percentage
    engagementRate: number; // percentage of active users
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const SystemMetricsSchema = new Schema<ISystemMetrics>(
  {
    date: { 
      type: Date, 
      required: true, 
      unique: true, 
      index: true 
    },
    
    users: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      newToday: { type: Number, default: 0 },
      newThisWeek: { type: Number, default: 0 },
      newThisMonth: { type: Number, default: 0 },
      suspended: { type: Number, default: 0 },
      byRole: {
        user: { type: Number, default: 0 },
        admin: { type: Number, default: 0 },
        superadmin: { type: Number, default: 0 },
      },
      byPlan: {
        free: { type: Number, default: 0 },
        pro: { type: Number, default: 0 },
        enterprise: { type: Number, default: 0 },
      },
    },
    
    resumes: {
      total: { type: Number, default: 0 },
      createdToday: { type: Number, default: 0 },
      createdThisWeek: { type: Number, default: 0 },
      createdThisMonth: { type: Number, default: 0 },
      averagePerUser: { type: Number, default: 0 },
      byTemplate: [
        {
          templateId: String,
          templateName: String,
          count: Number,
          percentage: Number,
        }
      ],
    },
    
    ai: {
      requestsToday: { type: Number, default: 0 },
      requestsThisWeek: { type: Number, default: 0 },
      requestsThisMonth: { type: Number, default: 0 },
      totalRequests: { type: Number, default: 0 },
      costToday: { type: Number, default: 0 },
      costThisWeek: { type: Number, default: 0 },
      costThisMonth: { type: Number, default: 0 },
      totalCost: { type: Number, default: 0 },
      averageCostPerRequest: { type: Number, default: 0 },
      averageCostPerUser: { type: Number, default: 0 },
      topUsers: [
        {
          userId: String,
          email: String,
          requestCount: Number,
          estimatedCost: Number,
        }
      ],
    },
    
    system: {
      errorCount: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 },
      avgResponseTime: { type: Number, default: 0 },
      status: {
        type: String,
        enum: ['healthy', 'warning', 'critical'],
        default: 'healthy',
      },
      uptime: { type: Number, default: 100 },
    },
    
    growth: {
      userGrowthRate: { type: Number, default: 0 },
      revenueGrowthRate: { type: Number, default: 0 },
      engagementRate: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for efficient date range queries
SystemMetricsSchema.index({ date: -1 });

// Static method to get today's metrics
SystemMetricsSchema.statics.getToday = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return this.findOne({ date: today });
};

// Static method to get latest metrics
SystemMetricsSchema.statics.getLatest = function () {
  return this.findOne().sort({ date: -1 });
};

// Static method to get metrics for date range
SystemMetricsSchema.statics.getRange = function (startDate: Date, endDate: Date) {
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    }
  }).sort({ date: -1 });
};

// Static method to get last N days of metrics
SystemMetricsSchema.statics.getLastDays = function (days = 30) {
  const endDate = new Date();
  endDate.setHours(0, 0, 0, 0);
  
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    date: {
      $gte: startDate,
      $lte: endDate,
    }
  }).sort({ date: -1 });
};

// Static method to compute and cache metrics (to be run daily via cron)
SystemMetricsSchema.statics.computeAndCache = async function () {
  const User = (await import('./User')).default;
  const Resume = (await import('./Resume')).default;
  const Analytics = (await import('./Analytics')).default;
  
  const now = new Date();
  const today = new Date(now.setHours(0, 0, 0, 0));
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setDate(monthAgo.getDate() - 30);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  try {
    // Parallel queries for better performance
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      suspendedUsers,
      usersByRole,
      usersByPlan,
      totalResumes,
      resumesToday,
      resumesWeek,
      resumesMonth,
      topTemplates,
      aiRequestsToday,
      aiRequestsWeek,
      aiRequestsMonth,
      totalAIRequests,
      errorCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ 'metadata.lastActiveAt': { $gte: thirtyDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ createdAt: { $gte: monthAgo } }),
      User.countDocuments({ isSuspended: true }),
      
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } }
      ]),
      
      Resume.countDocuments(),
      Resume.countDocuments({ createdAt: { $gte: today } }),
      Resume.countDocuments({ createdAt: { $gte: weekAgo } }),
      Resume.countDocuments({ createdAt: { $gte: monthAgo } }),
      
      Resume.aggregate([
        { $group: { _id: '$templateId', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      
      Analytics.countDocuments({ 
        event: 'ai_generation', // Note: old schema uses 'event' not 'eventType'
        createdAt: { $gte: today }
      }),
      Analytics.countDocuments({ 
        event: 'ai_generation',
        createdAt: { $gte: weekAgo }
      }),
      Analytics.countDocuments({ 
        event: 'ai_generation',
        createdAt: { $gte: monthAgo }
      }),
      Analytics.countDocuments({ event: 'ai_generation' }),
      
      Analytics.countDocuments({
        event: { $in: ['error', 'api_error'] },
        createdAt: { $gte: today }
      }),
    ]);
    
    // Get top AI users
    const topAIUsers = await User.find()
      .sort({ 'aiUsage.totalRequests': -1 })
      .limit(10)
      .select('clerkId email aiUsage')
      .lean();
    
    // Calculate costs (assuming $0.002 per AI request)
    const costPerRequest = 0.002;
    const aiCostToday = aiRequestsToday * costPerRequest;
    const aiCostWeek = aiRequestsWeek * costPerRequest;
    const aiCostMonth = aiRequestsMonth * costPerRequest;
    const totalAICost = totalAIRequests * costPerRequest;
    
    // Calculate rates
    const avgResumesPerUser = totalUsers > 0 ? totalResumes / totalUsers : 0;
    const errorRate = aiRequestsToday > 0 ? (errorCount / aiRequestsToday) * 1000 : 0;
    const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    
    // Get yesterday's metrics for growth calculation
    const yesterdayMetrics = await this.findOne({ date: yesterday });
    const userGrowthRate = yesterdayMetrics && yesterdayMetrics.users.total > 0
      ? ((totalUsers - yesterdayMetrics.users.total) / yesterdayMetrics.users.total) * 100
      : 0;
    
    // Build metrics object
    const metrics = {
      date: today,
      users: {
        total: totalUsers,
        active: activeUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        suspended: suspendedUsers,
        byRole: {
          user: usersByRole.find((r: any) => r._id === 'user')?.count || 0,
          admin: usersByRole.find((r: any) => r._id === 'admin')?.count || 0,
          superadmin: usersByRole.find((r: any) => r._id === 'superadmin')?.count || 0,
        },
        byPlan: {
          free: usersByPlan.find((p: any) => p._id === 'free')?.count || 0,
          pro: usersByPlan.find((p: any) => p._id === 'pro')?.count || 0,
          enterprise: usersByPlan.find((p: any) => p._id === 'enterprise')?.count || 0,
        },
      },
      resumes: {
        total: totalResumes,
        createdToday: resumesToday,
        createdThisWeek: resumesWeek,
        createdThisMonth: resumesMonth,
        averagePerUser: avgResumesPerUser,
        byTemplate: topTemplates.map((t: any) => ({
          templateId: t._id,
          count: t.count,
          percentage: (t.count / totalResumes) * 100,
        })),
      },
      ai: {
        requestsToday: aiRequestsToday,
        requestsThisWeek: aiRequestsWeek,
        requestsThisMonth: aiRequestsMonth,
        totalRequests: totalAIRequests,
        costToday: aiCostToday,
        costThisWeek: aiCostWeek,
        costThisMonth: aiCostMonth,
        totalCost: totalAICost,
        averageCostPerRequest: costPerRequest,
        averageCostPerUser: totalUsers > 0 ? totalAICost / totalUsers : 0,
        topUsers: topAIUsers.map(u => ({
          userId: u.clerkId,
          email: u.email,
          requestCount: u.aiUsage.totalRequests,
          estimatedCost: u.aiUsage.estimatedCost || u.aiUsage.totalRequests * costPerRequest,
        })),
      },
      system: {
        errorCount,
        errorRate,
        avgResponseTime: 0, // TODO: Implement response time tracking
        status: errorRate < 10 ? 'healthy' : errorRate < 50 ? 'warning' : 'critical',
        uptime: 99.9, // TODO: Implement uptime tracking
      },
      growth: {
        userGrowthRate,
        revenueGrowthRate: 0, // TODO: Implement revenue tracking
        engagementRate,
      },
    };
    
    // Upsert metrics
    return await this.findOneAndUpdate(
      { date: today },
      metrics,
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error('Failed to compute system metrics:', error);
    throw error;
  }
};

const SystemMetrics = (mongoose.models && mongoose.models.SystemMetrics) || model<ISystemMetrics>('SystemMetrics', SystemMetricsSchema);

export default SystemMetrics;
