import { NextResponse } from "next/server";
import { generateText } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { jobTitle, query, resumeText, location, preferences } = await req.json();

    const prompt = `You are an expert recruiter outreach writer.
Create a concise, friendly outreach message (3-5 sentences) to a hiring manager or recruiter about a role.
Focus on value, credibility, and alignment. Avoid generic fluff and buzzwords. Keep it human.

Return plain text only.

Context:
- Target role: ${jobTitle || "(unknown)"}
- Boolean search query: ${query || "(none)"}
- Candidate summary (from resume text, if any): ${resumeText?.slice(0, 2000) || "(none)"}
- Preferred location: ${location || "(none)"}
- Preferences: ${preferences || "(none)"}`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ message: string }>(cacheKey);
    if (cached) {
      console.log('[AI Outreach] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Outreach] ⚠️ Cache MISS - Calling AI API');

    const result = await generateText(prompt, { temperature: 0.6 });
    const message = (result || "").trim();
    const responseData = { message };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Outreach] ✅ Cached response for 1 hour');
    
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});
  } catch {
    return NextResponse.json({ error: "Failed to generate outreach" }, { status: 500 });
  }
}
