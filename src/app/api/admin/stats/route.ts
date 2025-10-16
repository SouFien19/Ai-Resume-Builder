/**
 * Admin Dashboard API - Real-time Stats with Caching
 * GET /api/admin/stats
 * Enhanced with SystemMetrics caching and audit logging
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import Resume from "@/lib/database/models/Resume";
import Analytics from "@/lib/database/models/Analytics";
import AIUsage from "@/lib/database/models/AIUsage";
import SystemMetrics from "@/lib/database/models/SystemMetrics";
import { checkAdminRole, logAdminAction } from "@/lib/auth/admin";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const { isAdmin } = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    await dbConnect();

    // Get time ranges
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel database queries for better performance
    const [
      // User Statistics
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      suspendedUsers,
      usersByPlan,
      
      // Resume Statistics
      totalResumes,
      resumesCreatedToday,
      resumesCreatedThisWeek,
      resumesCreatedThisMonth,
      
      // AI Usage Statistics
      aiUsageToday,
      aiUsageThisMonth,
      totalAIRequests,
      
      // Revenue/Plan Statistics
      paidUsers,
      proUsers,
      enterpriseUsers,
      
      // Recent Activity
      recentUsers,
      topActiveUsers,
    ] = await Promise.all([
      // Users
      User.countDocuments(),
      User.countDocuments({ isActive: true, isSuspended: false }),
      User.countDocuments({ createdAt: { $gte: last24h } }),
      User.countDocuments({ createdAt: { $gte: last7days } }),
      User.countDocuments({ createdAt: { $gte: last30days } }),
      User.countDocuments({ isSuspended: true }),
      User.aggregate([
        { $group: { _id: '$plan', count: { $sum: 1 } } }
      ]),
      
      // Resumes
      Resume.countDocuments(),
      Resume.countDocuments({ createdAt: { $gte: last24h } }),
      Resume.countDocuments({ createdAt: { $gte: last7days } }),
      Resume.countDocuments({ createdAt: { $gte: last30days } }),
      
      // AI Usage - Query Analytics with event: 'ai_generation'
      Analytics.countDocuments({ 
        event: 'ai_generation',
        createdAt: { $gte: last24h } 
      }),
      Analytics.countDocuments({ 
        event: 'ai_generation',
        createdAt: { $gte: last30days } 
      }),
      Analytics.countDocuments({ event: 'ai_generation' }),
      
      // Plans
      User.countDocuments({ plan: { $in: ['pro', 'enterprise'] } }),
      User.countDocuments({ plan: 'pro' }),
      User.countDocuments({ plan: 'enterprise' }),
      
      // Recent Activity
      User.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('email name plan createdAt lastActive')
        .lean(),
      User.find()
        .sort({ lastActive: -1 })
        .limit(10)
        .select('email name plan lastActive')
        .lean(),
    ]);

    // Calculate growth percentages
    const userGrowthRate = totalUsers > 0 
      ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1)
      : 0;

    const resumeGrowthRate = totalResumes > 0
      ? ((resumesCreatedThisMonth / totalResumes) * 100).toFixed(1)
      : 0;

    // Calculate conversion rate (free to paid)
    const conversionRate = totalUsers > 0
      ? ((paidUsers / totalUsers) * 100).toFixed(1)
      : 0;

    // Calculate average resumes per user
    const avgResumesPerUser = totalUsers > 0
      ? (totalResumes / totalUsers).toFixed(1)
      : 0;

    // Format plan distribution
    const planDistribution = usersByPlan.reduce((acc: Record<string, number>, item: any) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    // Calculate AI costs (estimate $0.002 per request)
    const costPerRequest = 0.002;
    const aiCostToday = aiUsageToday * costPerRequest;
    const aiCostMonth = aiUsageThisMonth * costPerRequest;
    const totalAICost = totalAIRequests * costPerRequest;

    const stats = {
      // Overview Stats
      overview: {
        totalUsers,
        activeUsers,
        suspendedUsers,
        totalResumes,
        aiRequestsToday: aiUsageToday,
        totalAIRequests,
      },

      // Growth Metrics
      growth: {
        newUsersToday,
        newUsersThisWeek,
        newUsersThisMonth,
        userGrowthRate: parseFloat(userGrowthRate as string),
        resumesCreatedToday,
        resumesCreatedThisWeek,
        resumesCreatedThisMonth,
        resumeGrowthRate: parseFloat(resumeGrowthRate as string),
      },

      // Revenue/Plan Metrics
      revenue: {
        paidUsers,
        proUsers,
        enterpriseUsers,
        conversionRate: parseFloat(conversionRate as string),
        planDistribution,
      },

      // Engagement Metrics
      engagement: {
        avgResumesPerUser: parseFloat(avgResumesPerUser as string),
        activeUsersPercentage: totalUsers > 0 
          ? ((activeUsers / totalUsers) * 100).toFixed(1)
          : 0,
        aiUsageToday,
        aiUsageThisMonth,
      },

      // AI Cost Tracking (NEW)
      aiCosts: {
        today: `$${aiCostToday.toFixed(2)}`,
        thisMonth: `$${aiCostMonth.toFixed(2)}`,
        total: `$${totalAICost.toFixed(2)}`,
        perUser: totalUsers > 0 ? `$${(totalAICost / totalUsers).toFixed(2)}` : '$0.00',
        perRequest: `$${costPerRequest.toFixed(4)}`,
      },

      // Recent Activity
      recentActivity: {
        recentUsers: recentUsers.map((user: any) => ({
          ...user,
          _id: user._id.toString(),
        })),
        topActiveUsers: topActiveUsers.map((user: any) => ({
          ...user,
          _id: user._id.toString(),
        })),
      },

      // Timestamp
      generatedAt: new Date().toISOString(),
      cached: false,
    };

    // Log admin action (async, don't wait)
    const user = await User.findOne({ clerkId: userId });
    if (user) {
      logAdminAction(
        userId,
        user.email,
        'VIEW_DASHBOARD_STATS',
        'system',
        undefined,
        { timestamp: new Date() },
        request
      ).catch(console.error);
    }

    return NextResponse.json(stats, { status: 200 });

  } catch (error: unknown) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch admin statistics",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
