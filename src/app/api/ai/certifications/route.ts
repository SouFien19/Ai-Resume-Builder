import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

type CertItem = { name: string; issuer?: string; date?: string; credential?: string };

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, industry, skills } = await req.json();
    const key = `${(industry || "").toLowerCase()}|${(role || "").toLowerCase()}`;

    const prompt = `Suggest 5 relevant professional certifications for a candidate.
Return JSON with shape { items: { name: string, issuer?: string }[] } only.
Consider role, industry, and skills. Avoid duplicates and vendor-specific levels unless common (e.g., Associate).
ROLE: ${role}
INDUSTRY: ${industry}
SKILLS: ${(skills || []).join(", ")}
JSON:`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ items: CertItem[] }>(cacheKey);
    if (cached) {
      console.log('[AI Certifications] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Certifications] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { temperature: 0.4, maxTokens: 1000 });
    const parsed = safeJson<{ items: CertItem[] }>(text || "");
    if (parsed?.items?.length) {
      // basic sanitize
      const items = parsed.items.map(i => ({ name: (i.name || "").trim(), issuer: i.issuer?.trim() })).filter(i => i.name);
      if (items.length) {
        const responseData = { items };
        await setCache(cacheKey, responseData, 3600);
        console.log('[AI Certifications] ✅ Cached response for 1 hour');
        return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});
      }
    }

    // Fallbacks by domain
    const fallbacks: Record<string, CertItem[]> = {
      "software|": [
        { name: "AWS Certified Cloud Practitioner", issuer: "Amazon" },
        { name: "Microsoft Azure Fundamentals (AZ-900)", issuer: "Microsoft" },
        { name: "Google Associate Cloud Engineer", issuer: "Google" },
        { name: "Scrum Master (PSM I)", issuer: "Scrum.org" },
        { name: "Kubernetes Application Developer (CKAD)", issuer: "CNCF" },
      ],
      "software|devops": [
        { name: "Docker Certified Associate", issuer: "Docker" },
        { name: "Kubernetes Administrator (CKA)", issuer: "CNCF" },
        { name: "HashiCorp Terraform Associate", issuer: "HashiCorp" },
        { name: "AWS Solutions Architect – Associate", issuer: "Amazon" },
        { name: "Azure Administrator Associate (AZ-104)", issuer: "Microsoft" },
      ],
      "data|": [
        { name: "Google Data Analytics Professional Certificate", issuer: "Google" },
        { name: "Databricks Lakehouse Fundamentals", issuer: "Databricks" },
        { name: "AWS Certified Data Analytics – Specialty", issuer: "Amazon" },
        { name: "IBM Data Science Professional Certificate", issuer: "IBM" },
        { name: "Microsoft Power BI Data Analyst Associate", issuer: "Microsoft" },
      ],
      "product|": [
        { name: "Professional Scrum Product Owner (PSPO I)", issuer: "Scrum.org" },
        { name: "AIPMM Certified Product Manager (CPM)", issuer: "AIPMM" },
        { name: "Pragmatic Institute PMC", issuer: "Pragmatic Institute" },
        { name: "SAFe Product Owner/Product Manager (POPM)", issuer: "Scaled Agile" },
        { name: "Product Marketing Core", issuer: "Product Marketing Alliance" },
      ],
      "design|": [
        { name: "NN/g UX Certification", issuer: "Nielsen Norman Group" },
        { name: "Google UX Design Professional Certificate", issuer: "Google" },
        { name: "Interaction Design Foundation Courses", issuer: "IDF" },
        { name: "Certified Usability Analyst (CUA)", issuer: "HFI" },
        { name: "Accessibility Core Competencies", issuer: "IAAP" },
      ],
    };

    const domain = Object.keys(fallbacks).find(k => key.includes(k.split("|")[0])) || "software|";
    return NextResponse.json({ items: fallbacks[domain] });
  } catch {
    return NextResponse.json({ items: [] }, { status: 200 });
  }
}
