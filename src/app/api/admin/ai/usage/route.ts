import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import AIUsage from '@/lib/database/models/AIUsage';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import User from '@/lib/database/models/User';
import { startOfDay, subDays, format } from 'date-fns';

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

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const now = new Date();
    const startDate = subDays(now, days);

    // Check if AIUsage collection has data
    const aiUsageCount = await AIUsage.countDocuments();
    
    let usageOverTime, usageByFeature;
    
    if (aiUsageCount > 0) {
      // Use AIUsage data (new tracking system)
      usageOverTime = await AIUsage.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalRequests: { $sum: 1 },
            totalCost: { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: { $sum: { $ifNull: ['$tokensUsed', 0] } },
            successCount: {
              $sum: { $cond: ['$success', 1, 0] }
            },
            errorCount: {
              $sum: { $cond: ['$success', 0, 1] }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Usage by feature
      usageByFeature = await AIUsage.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$feature',
            totalRequests: { $sum: 1 },
            totalCost: { $sum: { $ifNull: ['$cost', 0] } },
            totalTokens: { $sum: { $ifNull: ['$tokensUsed', 0] } },
            avgCost: { $avg: { $ifNull: ['$cost', 0] } },
            avgTokens: { $avg: { $ifNull: ['$tokensUsed', 0] } },
            successCount: {
              $sum: { $cond: ['$success', 1, 0] }
            },
            errorCount: {
              $sum: { $cond: ['$success', 0, 1] }
            }
          }
        },
        { $sort: { totalRequests: -1 } }
      ]);
    } else {
      // Fallback to ContentGeneration data (legacy system)
      usageOverTime = await ContentGeneration.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            },
            totalRequests: { $sum: 1 },
            totalCost: { $sum: 0.0006 }, // Estimated cost
            totalTokens: { $sum: 1500 }, // Estimated tokens
            successCount: { $sum: 1 }, // Assume all successful
            errorCount: { $sum: 0 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Map contentType to feature categories
      usageByFeature = await ContentGeneration.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$contentType',
            totalRequests: { $sum: 1 },
            totalCost: { $sum: 0.0006 },
            totalTokens: { $sum: 1500 },
            avgCost: { $avg: 0.0006 },
            avgTokens: { $avg: 1500 },
            successCount: { $sum: 1 },
            errorCount: { $sum: 0 }
          }
        },
        {
          $project: {
            _id: {
              $switch: {
                branches: [
                  { case: { $in: ['$_id', ['experience-description', 'project-description', 'summary', 'bullets']] }, then: 'content-gen' },
                  { case: { $in: ['$_id', ['tailored-bullets', 'keywords', 'ats-score']] }, then: 'ats-optimizer' },
                  { case: { $eq: ['$_id', 'job-match'] }, then: 'job-matcher' },
                  { case: { $eq: ['$_id', 'cover-letter'] }, then: 'cover-letter' },
                  { case: { $eq: ['$_id', 'skill-gap'] }, then: 'skill-gap' }
                ],
                default: 'content-gen'
              }
            },
            totalRequests: 1,
            totalCost: 1,
            totalTokens: 1,
            avgCost: 1,
            avgTokens: 1,
            successCount: 1,
            errorCount: 1
          }
        },
        {
          $group: {
            _id: '$_id',
            totalRequests: { $sum: '$totalRequests' },
            totalCost: { $sum: '$totalCost' },
            totalTokens: { $sum: '$totalTokens' },
            avgCost: { $avg: '$avgCost' },
            avgTokens: { $avg: '$avgTokens' },
            successCount: { $sum: '$successCount' },
            errorCount: { $sum: '$errorCount' }
          }
        },
        { $sort: { totalRequests: -1 } }
      ]);
    }

    // Usage by hour (peak hours)
    const usageByHour = await AIUsage.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          totalRequests: { $sum: 1 },
          totalCost: { $sum: { $ifNull: ['$cost', 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top users by AI usage
    const topUsers = await AIUsage.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$userId',
          totalRequests: { $sum: 1 },
          totalCost: { $sum: { $ifNull: ['$cost', 0] } },
          totalTokens: { $sum: { $ifNull: ['$tokensUsed', 0] } }
        }
      },
      { $sort: { totalRequests: -1 } },
      { $limit: 10 }
    ]);

    // Fill in missing days with zero values
    const filledUsageOverTime = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      const existingData = usageOverTime.find((item: any) => item._id === date);
      
      filledUsageOverTime.push({
        date,
        totalRequests: existingData?.totalRequests || 0,
        totalCost: existingData?.totalCost || 0,
        totalTokens: existingData?.totalTokens || 0,
        successCount: existingData?.successCount || 0,
        errorCount: existingData?.errorCount || 0,
        successRate: existingData?.totalRequests > 0
          ? (existingData.successCount / existingData.totalRequests) * 100
          : 0
      });
    }

    // Fill in missing hours with zero values
    const filledUsageByHour = Array.from({ length: 24 }, (_, hour) => {
      const existingData = usageByHour.find((item: any) => item._id === hour);
      return {
        hour,
        totalRequests: existingData?.totalRequests || 0,
        totalCost: existingData?.totalCost || 0
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        usageOverTime: filledUsageOverTime,
        usageByFeature: usageByFeature.map((item: any) => ({
          feature: item._id,
          totalRequests: item.totalRequests,
          totalCost: item.totalCost,
          totalTokens: item.totalTokens,
          avgCost: item.avgCost,
          avgTokens: item.avgTokens,
          successCount: item.successCount,
          errorCount: item.errorCount,
          successRate: item.totalRequests > 0
            ? (item.successCount / item.totalRequests) * 100
            : 0
        })),
        usageByHour: filledUsageByHour,
        topUsers: topUsers.map((item: any) => ({
          userId: item._id,
          totalRequests: item.totalRequests,
          totalCost: item.totalCost,
          totalTokens: item.totalTokens
        })),
        period: {
          days,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        }
      }
    });

  } catch (error: any) {
    console.error('AI Usage API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
