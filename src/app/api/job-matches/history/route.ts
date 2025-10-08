import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import JobMatch from "@/lib/database/models/JobMatch";
import User from "@/lib/database/models/User";

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse query parameters for pagination
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "10", 10), 50); // Max 50
    const skip = Math.max(parseInt(searchParams.get("skip") || "0", 10), 0);

    // Connect to database
    await dbConnect();

    // Find user
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ 
        success: false,
        error: "User not found",
        matches: [],
        total: 0,
      }, { status: 404 });
    }

    // Get total count for pagination
    const total = await JobMatch.countDocuments({ userId: user._id });

    // Fetch job match history
    const matches = await JobMatch.find({ userId: user._id })
      .sort({ searchDate: -1 }) // Most recent first
      .skip(skip)
      .limit(limit)
      .select('-resumeText') // Don't send full resume text in list view
      .lean(); // Convert to plain JS objects for better performance

    return NextResponse.json({
      success: true,
      matches: matches.map(match => ({
        id: match._id,
        searchDate: match.searchDate,
        matchCount: match.matches?.length || 0,
        matches: match.matches?.map(m => ({
          title: m.title,
          company: m.company,
          location: m.location,
          matchScore: m.matchScore,
          url: m.url,
        })) || [],
        preferences: match.preferences,
      })),
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('[JOB_MATCH_HISTORY_ERROR]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json({ 
      success: false,
      error: "Failed to fetch job match history. Please try again.",
      matches: [],
      total: 0,
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.message : String(error))
        : undefined,
    }, { status: 500 });
  }
}
