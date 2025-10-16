import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const { jobDescription, text } = await req.json();
    const jd = (jobDescription || "").slice(0, 6000);
    const body = (text || "").slice(0, 6000);
    const prompt = `Analyze keyword density and alignment. Return JSON { keywords: { term: string, count: number }[], suggestions: string[] }.
Focus on core hard skills and role-specific terms. Keep suggestions actionable.
JD:\n${jd}\nRESUME-TEXT:\n${body}\nJSON:`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ keywords: { term: string; count: number }[]; suggestions: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Keywords] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'skills-keywords',
        cached: true,
        success: true,
        requestDuration,
      });
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Keywords] ⚠️ Cache MISS - Calling AI API');

    const out = await generateText(prompt, { temperature: 0.2 });
    const parsed = safeJson<{ keywords: { term: string; count: number }[]; suggestions: string[] }>(out || "");
    
    const requestDuration = Date.now() - startTime;
    const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil((out || '').length / 4);
    
    await trackAIRequest({
      userId,
      contentType: 'skills-keywords',
      cached: false,
      success: true,
      tokensUsed,
      requestDuration,
    });
    
    if (parsed) {
      // Cache for 1 hour
      await setCache(cacheKey, parsed, 3600);
      console.log('[AI Keywords] ✅ Cached response for 1 hour');
      return NextResponse.json(parsed, { headers: { 'X-Cache': 'MISS' }});
    }
    return NextResponse.json({ keywords: [], suggestions: ["Ensure top JD keywords appear clearly in your summary and experience sections."] });
  } catch (error) {
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'skills-keywords',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return NextResponse.json({ keywords: [], suggestions: [] }, { status: 200 });
  }
}
