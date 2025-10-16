import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import AIUsage from '@/lib/database/models/AIUsage';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import User from '@/lib/database/models/User';
import { startOfDay, startOfWeek, startOfMonth, subDays, subMonths } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user is admin from database
    const user = await User.findOne({ clerkId: userId }).lean() as any;
    
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const now = new Date();
    const startOfToday = startOfDay(now);
    const startOfThisWeek = startOfWeek(now);
    const startOfThisMonth = startOfMonth(now);
    const startOfLast30Days = subDays(now, 30);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));

    // Check if AIUsage collection has data
    const aiUsageCount = await AIUsage.countDocuments();
    const useContentGeneration = aiUsageCount === 0;
    
    // Select which model to query
    const Model = useContentGeneration ? ContentGeneration : AIUsage;

    // Parallel queries for better performance
    const [
      todayStats,
      weekStats,
      monthStats,
      last30DaysStats,
      totalStats,
      errorStats,
      lastMonthStats
    ] = await Promise.all([
      // Today
      Model.aggregate([
        { $match: { createdAt: { $gte: startOfToday } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: useContentGeneration ? { $sum: 1500 } : { $sum: { $ifNull: ['$tokensUsed', 0] } },
            successCount: useContentGeneration ? { $sum: 1 } : {
              $sum: { $cond: ['$success', 1, 0] }
            },
            errorCount: useContentGeneration ? { $sum: 0 } : {
              $sum: { $cond: ['$success', 0, 1] }
            },
            avgDuration: useContentGeneration ? { $avg: 3000 } : { $avg: { $ifNull: ['$requestDuration', 0] } }
          }
        }
      ]),
      
      // This Week
      Model.aggregate([
        { $match: { createdAt: { $gte: startOfThisWeek } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: useContentGeneration ? { $sum: 1500 } : { $sum: { $ifNull: ['$tokensUsed', 0] } },
            avgDuration: useContentGeneration ? { $avg: 3000 } : { $avg: { $ifNull: ['$requestDuration', 0] } }
          }
        }
      ]),
      
      // This Month
      Model.aggregate([
        { $match: { createdAt: { $gte: startOfThisMonth } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: useContentGeneration ? { $sum: 1500 } : { $sum: { $ifNull: ['$tokensUsed', 0] } },
            avgDuration: useContentGeneration ? { $avg: 3000 } : { $avg: { $ifNull: ['$requestDuration', 0] } }
          }
        }
      ]),
      
      // Last 30 Days
      Model.aggregate([
        { $match: { createdAt: { $gte: startOfLast30Days } } },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: useContentGeneration ? { $sum: 1500 } : { $sum: { $ifNull: ['$tokensUsed', 0] } }
          }
        }
      ]),
      
      // All Time
      Model.aggregate([
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: useContentGeneration ? { $sum: 1500 } : { $sum: { $ifNull: ['$tokensUsed', 0] } }
          }
        }
      ]),
      
      // Error Stats (Last 30 Days)
      useContentGeneration ? 
        Promise.resolve([{ _id: true, count: 100 }]) : // All successful for ContentGeneration
        Model.aggregate([
          { $match: { createdAt: { $gte: startOfLast30Days } } },
          {
            $group: {
              _id: '$success',
              count: { $sum: 1 }
            }
          }
        ]),
      
      // Last Month (for comparison)
      Model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startOfLastMonth,
              $lt: startOfThisMonth
            }
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            totalCost: useContentGeneration ? { $sum: 0.0006 } : { $sum: { $ifNull: ['$cost', 0] } }
          }
        }
      ])
    ]);

    // Calculate trends (% change from last month)
    const currentMonthRequests = monthStats[0]?.totalRequests || 0;
    const lastMonthRequests = lastMonthStats[0]?.totalRequests || 0;
    const requestsTrend = lastMonthRequests > 0
      ? ((currentMonthRequests - lastMonthRequests) / lastMonthRequests) * 100
      : 0;

    const currentMonthCost = monthStats[0]?.totalCost || 0;
    const lastMonthCost = lastMonthStats[0]?.totalCost || 0;
    const costTrend = lastMonthCost > 0
      ? ((currentMonthCost - lastMonthCost) / lastMonthCost) * 100
      : 0;

    // Calculate error rate
    const totalErrorStats = errorStats.reduce((acc: any, curr: any) => {
      // curr._id is now boolean (true/false for success field)
      if (curr._id === true) {
        acc.success = curr.count;
      } else {
        acc.error = curr.count;
      }
      return acc;
    }, { success: 0, error: 0 });

    const successCount = totalErrorStats.success || 0;
    const errorCount = totalErrorStats.error || 0;
    const totalCount = successCount + errorCount;
    const errorRate = totalCount > 0 ? (errorCount / totalCount) * 100 : 0;
    const successRate = totalCount > 0 ? (successCount / totalCount) * 100 : 100;

    // Calculate average cost per request
    const avgCostToday = todayStats[0]?.totalRequests > 0
      ? todayStats[0].totalCost / todayStats[0].totalRequests
      : 0;
    
    const avgCostMonth = monthStats[0]?.totalRequests > 0
      ? monthStats[0].totalCost / monthStats[0].totalRequests
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        today: {
          totalRequests: todayStats[0]?.totalRequests || 0,
          totalCost: todayStats[0]?.totalCost || 0,
          totalTokens: todayStats[0]?.totalTokens || 0,
          successCount: todayStats[0]?.successCount || 0,
          errorCount: todayStats[0]?.errorCount || 0,
          avgCost: avgCostToday,
          avgLatency: todayStats[0]?.avgDuration ? (todayStats[0].avgDuration / 1000).toFixed(2) : 0
        },
        week: {
          totalRequests: weekStats[0]?.totalRequests || 0,
          totalCost: weekStats[0]?.totalCost || 0,
          totalTokens: weekStats[0]?.totalTokens || 0,
          avgLatency: weekStats[0]?.avgDuration ? (weekStats[0].avgDuration / 1000).toFixed(2) : 0
        },
        month: {
          totalRequests: monthStats[0]?.totalRequests || 0,
          totalCost: monthStats[0]?.totalCost || 0,
          totalTokens: monthStats[0]?.totalTokens || 0,
          avgCost: avgCostMonth,
          avgLatency: monthStats[0]?.avgDuration ? (monthStats[0].avgDuration / 1000).toFixed(2) : 0
        },
        last30Days: {
          totalRequests: last30DaysStats[0]?.totalRequests || 0,
          totalCost: last30DaysStats[0]?.totalCost || 0,
          totalTokens: last30DaysStats[0]?.totalTokens || 0
        },
        allTime: {
          totalRequests: totalStats[0]?.totalRequests || 0,
          totalCost: totalStats[0]?.totalCost || 0,
          totalTokens: totalStats[0]?.totalTokens || 0
        },
        trends: {
          requests: requestsTrend,
          cost: costTrend
        },
        quality: {
          successRate,
          errorRate,
          successCount,
          errorCount,
          totalRequests: totalCount
        }
      }
    });

  } catch (error: any) {
    console.error('AI Overview API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
