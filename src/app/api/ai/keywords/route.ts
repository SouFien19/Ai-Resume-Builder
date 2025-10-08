import { NextRequest, NextResponse } from "next/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Keywords] ⚠️ Cache MISS - Calling AI API');

    const out = await generateText(prompt, { temperature: 0.2 });
    const parsed = safeJson<{ keywords: { term: string; count: number }[]; suggestions: string[] }>(out || "");
    
    if (parsed) {
      // Cache for 1 hour
      await setCache(cacheKey, parsed, 3600);
      console.log('[AI Keywords] ✅ Cached response for 1 hour');
      return NextResponse.json(parsed, { headers: { 'X-Cache': 'MISS' }});
    }
    return NextResponse.json({ keywords: [], suggestions: ["Ensure top JD keywords appear clearly in your summary and experience sections."] });
  } catch {
    return NextResponse.json({ keywords: [], suggestions: [] }, { status: 200 });
  }
}
