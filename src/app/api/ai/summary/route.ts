import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import { checkRateLimit, aiRateLimiter } from "@/lib/middleware/rateLimiter";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
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

    const { role, seniority, industry, skills, current } = await req.json();
    const skillList = Array.isArray(skills) ? skills.filter(Boolean).slice(0, 12).join(", ") : "";
    const base = current ? `Current draft: "${current.slice(0, 600)}".` : "";
    const prompt = `You are a resume writing assistant. Write a professional, ATS-friendly resume summary.
Context:
- Role: ${role || ""}
- Seniority: ${seniority || ""}
- Industry: ${industry || ""}
- Top skills: ${skillList}
${base}

Rules:
- Use 2-4 concise sentences, no I/we.
- Make it quantifiable where possible (e.g., metrics %, $, time).
- Avoid fluff. Optimize for clarity and impact.
Output only the summary text.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ content: string; summary: string }>(cacheKey);
    if (cached) {
      console.log('[AI Summary] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json({ 
        success: true,
        data: cached
      }, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Summary] ⚠️ Cache MISS - Calling AI API (slow & costs money)');

    const startTime = Date.now();
    const text = await generateText(prompt, { temperature: 0.7, maxTokens: 1000 });
    const requestDuration = Date.now() - startTime;
    
    const content = text?.trim() || "";
    
    const result = {
      content,
      summary: content // Keep for backward compatibility
    };
    
    // Track AI request
    await trackAIRequest({
      userId,
      contentType: 'resume-summary',
      cached: false,
      success: true,
      tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(content.length / 4),
      requestDuration,
    });
    
    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);
    console.log('[AI Summary] ✅ Cached response for 1 hour');
    
    return NextResponse.json({ 
      success: true,
      data: result
    }, { headers: { 'X-Cache': 'MISS' }});
  } catch (error) {
    // Track failed request
    await trackAIRequest({
      userId: (await auth()).userId || 'unknown',
      contentType: 'resume-summary',
      cached: false,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate summary",
      data: { content: "", summary: "" }
    }, { status: 500 });
  }
}
