import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";
import { logger } from "@/lib/logger";
import crypto from "crypto";

/**
 * POST /api/resumes/[id]/share
 * Generate a shareable link for a resume
 */
export async function POST(
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

    // Generate or retrieve share token
    let shareToken = resume.shareToken;
    if (!shareToken) {
      shareToken = crypto.randomBytes(32).toString('hex');
      await Resume.updateOne(
        { _id: resolvedParams.id },
        { 
          $set: { 
            shareToken,
            shareEnabled: true,
            updatedAt: new Date()
          } 
        }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/share/${shareToken}`;

    logger.info('Share link generated', { resumeId: resolvedParams.id, shareToken });

    return NextResponse.json({
      success: true,
      shareUrl,
      shareToken,
    });
  } catch (error) {
    logger.error("Error generating share link", { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: "Error generating share link" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resumes/[id]/share
 * Disable sharing for a resume
 */
export async function DELETE(
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

    await Resume.updateOne(
      { _id: resolvedParams.id, userId: user._id },
      { 
        $set: { 
          shareEnabled: false,
          updatedAt: new Date()
        } 
      }
    );

    logger.info('Share link disabled', { resumeId: resolvedParams.id });

    return NextResponse.json({
      success: true,
      message: "Sharing disabled",
    });
  } catch (error) {
    logger.error("Error disabling share link", { error: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json(
      { success: false, error: "Error disabling share link" },
      { status: 500 }
    );
  }
}
