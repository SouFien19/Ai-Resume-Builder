import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import { logger } from "@/lib/logger";

/**
 * GET /api/resumes/[id]/pdf
 * Get resume data for PDF generation (client-side)
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

    logger.info('Fetching resume for PDF generation', { resumeId: resolvedParams.id });

    // Return resume data for client-side PDF generation
    return NextResponse.json({
      success: true,
      resume: {
        _id: resume._id,
        name: resume.name,
        templateId: resume.templateId,
        data: resume.data,
      }
    });
  } catch (error) {
    logger.error("Error fetching resume for PDF", { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: "Error fetching resume" },
      { status: 500 }
    );
  }
}
