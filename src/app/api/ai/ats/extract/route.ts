import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import { checkRateLimit, aiRateLimiter } from "@/lib/middleware/rateLimiter";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check rate limit (10 requests per minute)
  const rateLimitResult = await checkRateLimit(aiRateLimiter, `ai:${userId}`, 10);
  if (!rateLimitResult.success) {
    return NextResponse.json(rateLimitResult.error, {
      status: 429,
      headers: rateLimitResult.headers,
    });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "multipart/form-data required" }, { status: 400 });
    }
    const form = await req.formData();
    const file = form.get("resumeFile");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "resumeFile is required" }, { status: 400 });
    }
    const arrayBuffer = await (file as Blob).arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    const parsed = await pdfParse(buffer);
    const text = (parsed.text || "").slice(0, 12000);
    
    const requestDuration = Date.now() - startTime;
    if (userId) {
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: false,
        success: true,
        requestDuration,
      });
    }
    
    return NextResponse.json({ text, numpages: parsed.numpages || 0 });
  } catch (error) {
    if (userId) {
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return NextResponse.json({ text: "", numpages: 0 }, { status: 200 });
  }
}
