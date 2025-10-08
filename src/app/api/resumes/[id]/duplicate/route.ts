import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import Resume from "@/lib/database/models/Resume";
import User from "@/lib/database/models/User";

interface LeanResumeDocument {
  _id: string;
  name: string;
  templateId: string;
  data: Record<string, unknown>;
  status?: string;
  atsScore?: number;
  completion?: number;
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  await dbConnect();

  try {
    const resolvedParams = await params;
    const user = await User.findOne({ clerkId: userId });
    if (!user) return new Response("User not found", { status: 404 });

    const original = await Resume.findOne({ _id: resolvedParams.id, userId: user._id }).lean() as unknown as LeanResumeDocument;
    if (!original) return new Response("Resume not found", { status: 404 });

    const copy = new Resume({
      userId: user._id,
      name: `${original.name || 'Untitled Resume'} (Copy)`,
      templateId: original.templateId,
      data: original.data,
      status: original.status || 'draft',
      atsScore: original.atsScore || 0,
      completion: original.completion || 0,
      views: 0,
      downloads: 0,
    });
    await copy.save();

    // Return plain object without virtuals
    const savedCopy = await Resume.findById(copy._id).select('-__v').lean();

    return NextResponse.json(savedCopy, { status: 201 });
  } catch (error) {
    console.error("Error duplicating resume:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
