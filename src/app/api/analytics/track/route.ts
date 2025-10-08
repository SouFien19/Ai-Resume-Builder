import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import { UserActivity, UserAnalyticsSummary } from '@/lib/database/models/Analytics';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { eventType, metadata = {}, sessionId } = body;

    await dbConnect();

    // Track user activity
    const activity = new UserActivity({
      userId,
      eventType,
      metadata: {
        ...metadata,
        timestamp: new Date(),
      },
      sessionId,
      userAgent: request.headers.get('user-agent'),
      timestamp: new Date(),
    });

    await activity.save();

    // Update analytics summary if needed
    await updateAnalyticsSummary(userId, eventType, metadata);

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function updateAnalyticsSummary(userId: string, eventType: string, metadata: Record<string, unknown>) {
  try {
    const summary = await UserAnalyticsSummary.findOneAndUpdate(
      { userId },
      { 
        $set: { 
          lastActiveDate: new Date(),
          lastUpdated: new Date()
        },
        $setOnInsert: {
          createdAt: new Date(),
          totalResumes: 0,
          totalApplications: 0,
          totalViews: 0,
          totalDownloads: 0,
          interviewRate: 0,
          offerRate: 0,
          averageResponseTime: 0,
          averageAtsScore: 0,
          bestAtsScore: 0,
          loginStreak: 0,
        }
      },
      { 
        upsert: true, 
        new: true 
      }
    );

    // Update specific metrics based on event type
    const updateData: Record<string, number> = {};

    switch (eventType) {
      case 'resume_created':
        updateData.totalResumes = summary.totalResumes + 1;
        break;
      case 'resume_viewed':
        updateData.totalViews = summary.totalViews + 1;
        break;
      case 'resume_downloaded':
        updateData.totalDownloads = summary.totalDownloads + 1;
        break;
      case 'application_submitted':
        updateData.totalApplications = summary.totalApplications + 1;
        break;
      case 'ats_scan_performed':
        if (metadata.score && typeof metadata.score === 'number') {
          const newBestScore = Math.max(summary.bestAtsScore, metadata.score);
          const newAverageScore = ((summary.averageAtsScore * summary.totalViews) + metadata.score) / (summary.totalViews + 1);
          updateData.bestAtsScore = newBestScore;
          updateData.averageAtsScore = newAverageScore;
        }
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await UserAnalyticsSummary.updateOne(
        { userId },
        { $set: updateData }
      );
    }

  } catch (error) {
    console.error('Analytics summary update error:', error);
  }
}