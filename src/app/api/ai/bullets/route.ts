import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
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

    const { role, industry, seniority, skills, context } = await req.json();
    const top = Array.isArray(skills) ? skills.filter(Boolean).slice(0, 10).join(", ") : "";
    const ctx = (context || "").slice(0, 1000);
    const prompt = `You create strong resume bullet points using the STAR method.
Return JSON: { bullets: string[] } with 4-6 concise bullets.
Rules: start with strong verbs, include metrics if possible, avoid pronouns, be ATS-friendly.
Context:\nRole: ${role}\nSeniority: ${seniority}\nIndustry: ${industry}\nKey skills: ${top}\nAdditional info: ${ctx}\nJSON:`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ content: string; bullets: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Bullets] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json({ 
        success: true,
        data: cached
      }, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Bullets] ⚠️ Cache MISS - Calling AI API (slow & costs money)');

    const startTime = Date.now();
    const text = await generateText(prompt, { temperature: 0.6, maxTokens: 1500 });
    const requestDuration = Date.now() - startTime;
    
    const parsed = safeJson<{ bullets: string[] }>(text || "");
    const bullets = parsed?.bullets || [];
    const content = bullets.join('\n\n');
    
    const result = {
      content,
      bullets // Keep for backward compatibility
    };
    
    // Track AI request
    await trackAIRequest({
      userId,
      contentType: 'work-experience',
      cached: false,
      success: true,
      tokensUsed: Math.ceil(prompt.length / 4) + Math.ceil(content.length / 4),
      requestDuration,
    });
    
    // Cache for 1 hour
    await setCache(cacheKey, result, 3600);
    console.log('[AI Bullets] ✅ Cached response for 1 hour');
    
    return NextResponse.json({ 
      success: true,
      data: result
    }, { headers: { 'X-Cache': 'MISS' }});
  } catch (error) {
    // Track failed request
    await trackAIRequest({
      userId: (await auth()).userId || 'unknown',
      contentType: 'work-experience',
      cached: false,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    });
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate bullets",
      data: { content: "", bullets: [] }
    }, { status: 500 });
  }
}
