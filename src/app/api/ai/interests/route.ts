import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const { role, summary } = await req.json();
    const prompt = `Propose 6 concise resume interests or extracurriculars aligned to the candidate's role and summary.
Return strictly JSON: { items: string[] } with short noun phrases (2-4 words each), no emojis.
ROLE: ${role}
SUMMARY: ${summary}
JSON:`;
    
    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ items: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Interests] ✅ Cache HIT - Saved API cost!');
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
    
    console.log('[AI Interests] ⚠️ Cache MISS - Calling AI API');
    
    const text = await generateText(prompt, { temperature: 0.5, maxTokens: 1000 });
    const parsed = safeJson<{ items: string[] }>(text || "");
    if (Array.isArray(parsed?.items) && parsed!.items.length) {
      const items = parsed!.items.map(s => (s || "").trim()).filter(Boolean).slice(0, 8);
      if (items.length) {
        const requestDuration = Date.now() - startTime;
        const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil((text || '').length / 4);
        
        await trackAIRequest({
          userId,
          contentType: 'work-experience',
          cached: false,
          success: true,
          tokensUsed,
          requestDuration,
        });
        
        const responseData = { items };
        await setCache(cacheKey, responseData, 3600);
        console.log('[AI Interests] ✅ Cached response for 1 hour');
        return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});
      }
    }

    // Simple fallbacks by broad role families
    const roleLower = String(role || "").toLowerCase();
    const common = [
      "Open-source contributions",
      "Mentoring and coaching",
      "Technical blogging",
      "Meetups and talks",
      "Hackathons",
      "Reading and research",
    ];
    const dev = [
      "System design practice",
      "Algorithm challenges",
      "Dev tooling experiments",
      "Cloud labs",
      "UI/UX prototyping",
      "Home lab projects",
    ];
    const product = [
      "Customer interviews",
      "Roadmap workshops",
      "Strategy case studies",
      "A/B test design",
      "Market research",
      "Data storytelling",
    ];
    const design = [
      "Design systems",
      "Accessibility advocacy",
      "Visual storytelling",
      "Prototyping sprints",
      "Usability testing",
      "Illustration",
    ];
    const data = [
      "Kaggle competitions",
      "Data viz projects",
      "ML reading group",
      "Open datasets",
      "ETL tinkering",
      "Statistics practice",
    ];
    let items: string[] = common;
    if (roleLower.includes("product")) items = common.concat(product);
    else if (roleLower.includes("design") || roleLower.includes("ux")) items = common.concat(design);
    else if (roleLower.includes("data")) items = common.concat(data);
    else items = common.concat(dev);
    return NextResponse.json({ items: items.slice(0, 8) });
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
