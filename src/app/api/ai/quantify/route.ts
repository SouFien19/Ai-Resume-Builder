import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import { checkRateLimit, aiRateLimiter } from "@/lib/middleware/rateLimiter";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
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

    const startTime = Date.now();
    const { text } = await req.json();
    const src = (text || "").slice(0, 1200);
    const prompt = `Rewrite the following resume lines with quantified impact.
For each line, produce 1-2 improved options. Return JSON { items: { original: string, options: string[] }[] }.
Keep each option concise, ATS-friendly, and avoid first person.
TEXT:\n${src}\nJSON:`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ items: { original: string; options: string[] }[] }>(cacheKey);
    if (cached) {
      console.log('[AI Quantify] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: true,
        success: true,
        requestDuration,
      });
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Quantify] ⚠️ Cache MISS - Calling AI API');

    const out = await generateText(prompt, { temperature: 0.5 });
    const parsed = safeJson<{ items: { original: string; options: string[] }[] }>(out || "");
    const responseData = parsed || { items: [] };
    
    const requestDuration = Date.now() - startTime;
    const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil((out || '').length / 4);
    
    await trackAIRequest({
      userId,
      contentType: 'work-experience',
      cached: false,
      success: true,
      tokensUsed,
      requestDuration,
    });
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Quantify] ✅ Cached response for 1 hour');
    
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});
  } catch (error) {
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'work-experience',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
