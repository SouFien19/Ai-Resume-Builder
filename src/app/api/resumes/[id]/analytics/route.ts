import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import { logger } from "@/lib/logger";

/**
 * GET /api/resumes/[id]/analytics
 * Get analytics data for a specific resume
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const resolvedParams = await params;
    await dbConnect();

    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const resume = await Resume.findOne({
      _id: resolvedParams.id,
      userId: user._id,
    });

    if (!resume) {
      return new Response("Resume not found", { status: 404 });
    }

    // Calculate analytics
    const analytics = {
      resumeId: resume._id,
      name: resume.name,
      createdAt: resume.createdAt,
      updatedAt: resume.updatedAt,
      
      // Basic stats
      views: resume.views || 0,
      downloads: resume.downloads || 0,
      atsScore: resume.atsScore || 0,
      completion: resume.completion || 0,
      
      // Template info
      templateId: resume.templateId,
      
      // Sharing info
      shareEnabled: resume.shareEnabled || false,
      shareToken: resume.shareToken,
      
      // Time-based analytics
      daysSinceCreation: Math.floor((Date.now() - new Date(resume.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      daysSinceUpdate: Math.floor((Date.now() - new Date(resume.updatedAt).getTime()) / (1000 * 60 * 60 * 24)),
      
      // Engagement metrics
      engagementRate: resume.views > 0 ? ((resume.downloads || 0) / resume.views * 100).toFixed(2) : '0.00',
      
      // Status
      status: resume.status || 'draft',
    };

    logger.info('Analytics fetched', { resumeId: resolvedParams.id });

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (error) {
    logger.error("Error fetching analytics", { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: "Error fetching analytics" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/resumes/[id]/analytics/track
 * Track an event (view, download, etc.)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const body = await request.json();
    const { event } = body;

    if (!event || !['view', 'download'].includes(event)) {
      return NextResponse.json(
        { success: false, error: "Invalid event type" },
        { status: 400 }
      );
    }

    await dbConnect();

    const updateField = event === 'view' ? 'views' : 'downloads';
    
    const resume = await Resume.findByIdAndUpdate(
      resolvedParams.id,
      { 
        $inc: { [updateField]: 1 },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    );

    if (!resume) {
      return new Response("Resume not found", { status: 404 });
    }

    logger.info('Event tracked', { resumeId: resolvedParams.id, event });

    return NextResponse.json({
      success: true,
      [updateField]: resume[updateField],
    });
  } catch (error) {
    logger.error("Error tracking event", { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: "Error tracking event" },
      { status: 500 }
    );
  }
}
