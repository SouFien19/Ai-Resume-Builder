import { NextResponse } from "next/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

function heuristicBullets(jobTitle?: string, resumeText?: string) {
  const text = String(resumeText || "").toLowerCase();
  const words = text.split(/[^a-z0-9+#]+/).filter(w => w.length > 2);
  const stop = new Set(["and","the","for","with","from","that","this","have","has","are","was","were","you","your","our","their","his","her","its","but","not","all","any","can","will","able","into","over","per","each","via","using","used","use","build","built","make","made","work","worked","team","teams","project","projects","lead","led","manage","managed"]);
  const freq: Record<string, number> = {};
  for (const w of words) {
    if (stop.has(w)) continue;
    freq[w] = (freq[w] || 0) + 1;
  }
  const top = Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0, 6).map(([w]) => w);
  const keyLine = top.slice(0, 4).join(", ");
  const title = jobTitle && jobTitle !== "preference-suggestions" ? jobTitle : "the role";
  const bullets = [
    `Delivered outcomes relevant to ${title}, leveraging ${keyLine}.`,
    `Improved ${top.slice(0,2).join(" and ")} with measurable impact (add your metrics).`,
    `Collaborated cross-functionally and shipped features across ${top.slice(2,5).join(", ")}.`
  ];
  return bullets;
}

export async function POST(req: Request) {
  try {
    const { jobTitle, keywords, resumeText } = await req.json();
    const prompt = `You are a resume writer. Create 3-5 concise, strong resume bullets tailored to the role.
Use action verbs, quantify impact, and connect to keywords. Avoid personal pronouns.
Return JSON: { "bullets": string[] }

Role: ${jobTitle || "(unknown)"}
Keywords: ${(keywords || []).join(", ")}
Resume context: ${String(resumeText || "").slice(0, 2000)}`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ bullets: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Tailored Bullets] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Tailored Bullets] ⚠️ Cache MISS - Calling AI API (slow & costs money)');

    const result = await generateText(prompt, { temperature: 0.6 });
    const data = safeJson<{ bullets: string[] }>(result || "");
    const aiBullets = Array.isArray(data?.bullets) ? data!.bullets.slice(0, 6) : [];
    
    if (aiBullets.length > 0) {
      const response = { bullets: aiBullets };
      // Cache for 1 hour
      await setCache(cacheKey, response, 3600);
      console.log('[AI Tailored Bullets] ✅ Cached response for 1 hour');
      return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' }});
    }
    
    // Fallback to heuristic bullets when AI not available or returned unusable output
    return NextResponse.json({ bullets: heuristicBullets(jobTitle, resumeText) });
  } catch {
    // Graceful fallback instead of 500 to keep UX smooth
    return NextResponse.json({ bullets: heuristicBullets(undefined, undefined) });
  }
}
