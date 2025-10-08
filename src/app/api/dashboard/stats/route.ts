/**
 * Dashboard Stats API
 * Aggregates all dashboard metrics in a single optimized call
 */

import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import ContentGeneration from "@/lib/database/models/ContentGeneration";
import AtsScore from "@/lib/database/models/AtsScore";
import AppliedJob from "@/lib/database/models/AppliedJob";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { logger } from "@/lib/logger";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw APIErrors.Unauthorized();
    }

    await dbConnect();

    // Get user from database
    const user = await User.findOne({ clerkId }).select('_id plan createdAt lastActive');

    if (!user) {
      // User not in local DB yet (webhook pending), return empty stats
      return successResponse({
        resumes: { total: 0, thisMonth: 0, trend: 0 },
        aiGenerations: { total: 0, thisMonth: 0, trend: 0 },
        atsScores: { total: 0, avgScore: 0, trend: 0 },
        downloads: { total: 0, thisMonth: 0, trend: 0 },
        applications: { total: 0, interviews: 0, offers: 0 },
        recentActivity: [],
        plan: 'free',
        accountAge: 0,
      });
    }

    const userId = user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Execute all queries in parallel for maximum performance
    const [
      // Resumes
      totalResumes,
      resumesThisMonth,
      resumesLastMonth,
      
      // AI Generations
      totalAIGenerations,
      aiGenerationsThisMonth,
      aiGenerationsLastMonth,
      
      // ATS Scores
      atsScoresData,
      
      // Downloads
      resumesWithDownloads,
      
      // Applications
      applicationsStats,
      
      // Recent Activity
      recentResumes,
      recentAIGenerations,
    ] = await Promise.all([
      // Resumes count
      Resume.countDocuments({ userId }),
      Resume.countDocuments({ userId, createdAt: { $gte: startOfMonth } }),
      Resume.countDocuments({ 
        userId, 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      
      // AI Generations count
      ContentGeneration.countDocuments({ userId: clerkId }),
      ContentGeneration.countDocuments({ userId: clerkId, createdAt: { $gte: startOfMonth } }),
      ContentGeneration.countDocuments({ 
        userId: clerkId, 
        createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } 
      }),
      
      // ATS Scores
      AtsScore.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgScore: { $avg: '$score' },
          }
        }
      ]),
      
      // Resume downloads
      Resume.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: null,
            totalDownloads: { $sum: '$downloads' },
            downloadsThisMonth: {
              $sum: {
                $cond: [
                  { $gte: ['$lastDownloadedAt', startOfMonth] },
                  '$downloads',
                  0
                ]
              }
            }
          }
        }
      ]),
      
      // Applications statistics
      AppliedJob.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent resumes (last 5)
      Resume.find({ userId })
        .select('name templateId updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean(),
      
      // Recent AI generations (last 5)
      ContentGeneration.find({ userId: clerkId })
        .select('contentType createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Calculate trends (percentage change from last month)
    const resumeTrend = resumesLastMonth > 0 
      ? Math.round(((resumesThisMonth - resumesLastMonth) / resumesLastMonth) * 100)
      : resumesThisMonth > 0 ? 100 : 0;

    const aiTrend = aiGenerationsLastMonth > 0
      ? Math.round(((aiGenerationsThisMonth - aiGenerationsLastMonth) / aiGenerationsLastMonth) * 100)
      : aiGenerationsThisMonth > 0 ? 100 : 0;

    // Process ATS scores
    const atsStats = atsScoresData[0] || { count: 0, avgScore: 0 };
    
    // Process downloads
    const downloadStats = resumesWithDownloads[0] || { totalDownloads: 0, downloadsThisMonth: 0 };

    // Process applications
    const applicationsMap = applicationsStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    const totalApplications = applicationsStats.reduce((sum, item) => sum + item.count, 0);
    const interviews = applicationsMap['Interviewing'] || 0;
    const offers = applicationsMap['Offer'] || 0;

    // Combine recent activity
    const recentActivity = [
      ...recentResumes.map((r: any) => ({
        type: 'resume' as const,
        id: r._id.toString(),
        title: r.name,
        timestamp: r.updatedAt,
        meta: { templateId: r.templateId }
      })),
      ...recentAIGenerations.map((g: any) => ({
        type: 'ai-generation' as const,
        id: g._id.toString(),
        title: `${g.contentType.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
        timestamp: g.createdAt,
        meta: { contentType: g.contentType }
      }))
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    // Calculate account age in days
    const accountAge = Math.floor(
      (now.getTime() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    const stats = {
      resumes: {
        total: totalResumes,
        thisMonth: resumesThisMonth,
        trend: resumeTrend,
      },
      aiGenerations: {
        total: totalAIGenerations,
        thisMonth: aiGenerationsThisMonth,
        trend: aiTrend,
      },
      atsScores: {
        total: atsStats.count,
        avgScore: Math.round(atsStats.avgScore || 0),
        trend: 0, // Can be calculated if needed
      },
      downloads: {
        total: downloadStats.totalDownloads,
        thisMonth: downloadStats.downloadsThisMonth,
        trend: 0, // Can be calculated if needed
      },
      applications: {
        total: totalApplications,
        interviews,
        offers,
        conversionRate: totalApplications > 0 
          ? Math.round((offers / totalApplications) * 100) 
          : 0,
      },
      recentActivity,
      user: {
        plan: user.plan,
        accountAge,
        lastActive: user.lastActive,
      },
    };

    logger.info('Dashboard stats fetched', {
      userId: user._id,
      stats: {
        resumes: stats.resumes.total,
        aiGenerations: stats.aiGenerations.total,
      }
    });

    return successResponse(stats);
  } catch (error) {
    logger.error('Error fetching dashboard stats', { error });
    return handleAPIError(error);
  }
}
