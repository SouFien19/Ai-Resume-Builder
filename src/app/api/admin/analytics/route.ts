/**
 * Admin Analytics API - User Growth & Engagement
 * GET /api/admin/analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import Resume from "@/lib/database/models/Resume";
import Analytics from "@/lib/database/models/Analytics";
import { checkAdminRole } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User growth data (daily)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 },
          free: {
            $sum: { $cond: [{ $eq: ["$plan", "free"] }, 1, 0] }
          },
          pro: {
            $sum: { $cond: [{ $eq: ["$plan", "pro"] }, 1, 0] }
          },
          enterprise: {
            $sum: { $cond: [{ $eq: ["$plan", "enterprise"] }, 1, 0] }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Resume creation data (daily)
    const resumeActivity = await Resume.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // User engagement by plan
    const planEngagement = await Resume.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $group: {
          _id: '$user.plan',
          totalResumes: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          plan: '$_id',
          totalResumes: 1,
          userCount: { $size: '$uniqueUsers' },
          avgResumesPerUser: {
            $divide: ['$totalResumes', { $size: '$uniqueUsers' }]
          }
        }
      }
    ]);

    // Active users over time
    const activeUsers = await User.aggregate([
      {
        $match: {
          lastActive: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$lastActive" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Retention analysis
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [
      newUsersLast30Days,
      activeFromLast30Days,
      newUsersLast60Days,
      activeFromLast60Days
    ] = await Promise.all([
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      }),
      User.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
      }),
      User.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
        lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    const retention30Day = newUsersLast30Days > 0
      ? (activeFromLast30Days / newUsersLast30Days * 100).toFixed(1)
      : 0;
    
    const retention60Day = newUsersLast60Days > 0
      ? (activeFromLast60Days / newUsersLast60Days * 100).toFixed(1)
      : 0;

    return NextResponse.json({
      userGrowth,
      resumeActivity,
      planEngagement,
      activeUsers,
      retention: {
        thirtyDay: {
          newUsers: newUsersLast30Days,
          activeUsers: activeFromLast30Days,
          rate: parseFloat(retention30Day as string)
        },
        sixtyDay: {
          newUsers: newUsersLast60Days,
          activeUsers: activeFromLast60Days,
          rate: parseFloat(retention60Day as string)
        }
      },
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString()
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch analytics",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
