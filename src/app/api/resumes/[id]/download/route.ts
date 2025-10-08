import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";

// POST to increment download count for a resume by ID
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  await dbConnect();

  try {
    const resolvedParams = await params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    const updated = await Resume.findOneAndUpdate(
      { _id: resolvedParams.id, userId: user._id },
      { $inc: { downloads: 1 }, $set: { updatedAt: new Date() } },
      { new: true }
    );

    if (!updated) {
      return new Response("Resume not found", { status: 404 });
    }

    return NextResponse.json({ downloads: updated.downloads });
  } catch (error) {
    console.error("Error incrementing download count:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
