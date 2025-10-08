import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import ContentGeneration from '@/lib/database/models/ContentGeneration';   
import connectToDatabase from '@/lib/database/connection';

// Type definitions for MongoDB aggregation results
interface ContentStats {
  _id: string;
  count: number;
  totalWords: number;
  avgQualityScore: number;
  avgProcessingTime: number;
  bookmarkedCount: number;
  downloadCount: number;
  copyCount: number;
  avgRating: number;
}

interface ContentTrend {
  _id: { date: string };
  count: number;
  totalWords: number;
  avgQualityScore: number;
  contentTypes: string[];
}

interface ContentDetail {
  _id: string;
  contentType: string;
  createdAt: Date;
  generatedContent: string;
  metadata?: {
    qualityScore?: number;
    processingTime?: number;
  };
  isBookmarked?: boolean;
  downloadCount?: number;
  copyCount?: number;
  rating?: number;
}

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const timeRange = url.searchParams.get('range') || '30d';
    const contentType = url.searchParams.get('type') || 'all';
    const detailed = url.searchParams.get('detailed') === 'true';

    // Calculate date range
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    await connectToDatabase();

    // Build match criteria
    const matchCriteria: Record<string, unknown> = {
      userId,
      createdAt: { $gte: startDate, $lte: now }
    };

    if (contentType !== 'all') {
      matchCriteria.contentType = contentType;
    }

    // Get overall statistics
    const [
      overallStats,
      contentTypeStats,
      dailyTrends,
      qualityDistribution,
      topContent
    ] = await Promise.all([
      // Overall statistics
      ContentGeneration.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: null,
            totalGenerated: { $sum: 1 },
            totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } },
            avgQualityScore: { $avg: '$metadata.qualityScore' },
            avgProcessingTime: { $avg: '$metadata.processingTime' },
            totalBookmarked: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
            totalDownloads: { $sum: '$downloadCount' },
            totalCopied: { $sum: '$copyCount' },
            avgRating: { $avg: '$userRating' },
            ratedCount: { 
              $sum: { 
                $cond: [{ $ne: ['$userRating', null] }, 1, 0] 
              } 
            }
          }
        }
      ]),

      // Content type breakdown
      ContentGeneration.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: '$contentType',
            count: { $sum: 1 },
            totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } },
            avgQualityScore: { $avg: '$metadata.qualityScore' },
            avgProcessingTime: { $avg: '$metadata.processingTime' },
            bookmarkedCount: { $sum: { $cond: ['$isBookmarked', 1, 0] } },
            downloadCount: { $sum: '$downloadCount' },
            copyCount: { $sum: '$copyCount' },
            avgRating: { $avg: '$userRating' },
            lastGenerated: { $max: '$createdAt' }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Daily trends
      ContentGeneration.aggregate([
        { $match: matchCriteria },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt'
                }
              }
            },
            count: { $sum: 1 },
            totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } },
            avgQualityScore: { $avg: '$metadata.qualityScore' },
            contentTypes: { $addToSet: '$contentType' }
          }
        },
        { $sort: { '_id.date': 1 } }
      ]),

      // Quality score distribution
      ContentGeneration.aggregate([
        { $match: matchCriteria },
        {
          $bucket: {
            groupBy: '$metadata.qualityScore',
            boundaries: [0, 20, 40, 60, 80, 100],
            default: 'Unknown',
            output: {
              count: { $sum: 1 },
              contentTypes: { $addToSet: '$contentType' }
            }
          }
        }
      ]),

      // Top performing content (if detailed requested)
      detailed ? ContentGeneration.find(matchCriteria)
        .sort({ 
          'metadata.qualityScore': -1, 
          downloadCount: -1, 
          copyCount: -1 
        })
        .limit(10)
        .select('contentType generatedContent metadata createdAt userRating downloadCount copyCount isBookmarked')
        : []
    ]);

    // Calculate growth trends
    const previousPeriodStart = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    const previousPeriodStats = await ContentGeneration.aggregate([
      { 
        $match: { 
          userId, 
          createdAt: { $gte: previousPeriodStart, $lt: startDate } 
        } 
      },
      {
        $group: {
          _id: null,
          totalGenerated: { $sum: 1 },
          totalWords: { $sum: { $size: { $split: ['$generatedContent', ' '] } } }
        }
      }
    ]);

    const currentTotal = overallStats[0]?.totalGenerated || 0;
    const previousTotal = previousPeriodStats[0]?.totalGenerated || 0;
    const growthRate = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;

    // Most active hours analysis
    const hourlyActivity = await ContentGeneration.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Response structure
    const response = {
      success: true,
      data: {
        summary: {
          timeRange,
          totalGenerated: currentTotal,
          totalWords: overallStats[0]?.totalWords || 0,
          avgQualityScore: Math.round((overallStats[0]?.avgQualityScore || 0) * 10) / 10,
          avgProcessingTime: Math.round(overallStats[0]?.avgProcessingTime || 0),
          totalBookmarked: overallStats[0]?.totalBookmarked || 0,
          totalDownloads: overallStats[0]?.totalDownloads || 0,
          totalCopied: overallStats[0]?.totalCopied || 0,
          avgRating: Math.round((overallStats[0]?.avgRating || 0) * 10) / 10,
          ratedPercentage: currentTotal > 0 ? Math.round(((overallStats[0]?.ratedCount || 0) / currentTotal) * 100) : 0,
          growthRate: Math.round(growthRate * 10) / 10,
          lastUpdated: new Date().toISOString()
        },
        
        contentTypes: contentTypeStats.map((stat: ContentStats & { lastGenerated?: Date }) => ({
          type: stat._id,
          count: stat.count,
          totalWords: stat.totalWords,
          avgWords: Math.round(stat.totalWords / stat.count),
          avgQualityScore: Math.round((stat.avgQualityScore || 0) * 10) / 10,
          avgProcessingTime: Math.round(stat.avgProcessingTime || 0),
          bookmarkedCount: stat.bookmarkedCount,
          downloadCount: stat.downloadCount,
          copyCount: stat.copyCount,
          avgRating: Math.round((stat.avgRating || 0) * 10) / 10,
          lastGenerated: stat.lastGenerated,
          engagementRate: stat.count > 0 ? Math.round(((stat.downloadCount + stat.copyCount) / stat.count) * 100) / 100 : 0
        })),

        trends: {
          daily: dailyTrends.map((trend: ContentTrend) => ({
            date: trend._id.date,
            count: trend.count,
            totalWords: trend.totalWords,
            avgWords: Math.round(trend.totalWords / trend.count),
            avgQualityScore: Math.round((trend.avgQualityScore || 0) * 10) / 10,
            uniqueContentTypes: trend.contentTypes.length
          })),
          
          hourly: Array.from({ length: 24 }, (_, hour) => {
            const activity = hourlyActivity.find(h => h._id === hour);
            return {
              hour,
              count: activity?.count || 0
            };
          })
        },

        qualityDistribution: qualityDistribution.map((bucket: Record<string, unknown>) => ({
          range: typeof bucket._id === 'number' ? `${bucket._id}-${bucket._id + 19}` : bucket._id,
          count: bucket.count,
          contentTypes: bucket.contentTypes
        })),

        ...(detailed && {
          topContent: topContent.map((content: ContentDetail & { userRating?: number }) => ({
            id: content._id,
            type: content.contentType,
            preview: content.generatedContent.substring(0, 200) + (content.generatedContent.length > 200 ? '...' : ''),
            qualityScore: content.metadata?.qualityScore || 0,
            processingTime: content.metadata?.processingTime || 0,
            userRating: content.userRating,
            downloadCount: content.downloadCount,
            copyCount: content.copyCount,
            isBookmarked: content.isBookmarked,
            createdAt: content.createdAt,
            wordCount: content.generatedContent.split(/\s+/).length
          }))
        })
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Content analytics error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch content analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET specific content details
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { contentIds } = body;

    if (!contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json(
        { success: false, error: 'Content IDs array is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const detailedContent = await ContentGeneration.find({
      _id: { $in: contentIds },
      userId
    }).select('contentType prompt generatedContent metadata createdAt userRating isBookmarked downloadCount copyCount editCount');

    return NextResponse.json({
      success: true,
      data: {
        content: detailedContent.map(item => ({
          id: item._id,
          type: item.contentType,
          prompt: item.prompt,
          content: item.generatedContent,
          metadata: item.metadata,
          userRating: item.userRating,
          isBookmarked: item.isBookmarked,
          downloadCount: item.downloadCount,
          copyCount: item.copyCount,
          editCount: item.editCount,
          createdAt: item.createdAt,
          wordCount: item.generatedContent.split(/\s+/).length,
          characterCount: item.generatedContent.length
        }))
      }
    });

  } catch (error) {
    console.error('Content details error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch content details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}