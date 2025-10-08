import { NextRequest, NextResponse } from "next/server";
import { generateText as generateTextFromLib } from "@/lib/ai/gemini";

function safeJson<T = unknown>(text: string): T | null {
  try {
    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) return JSON.parse(arrayMatch[0]);

    const objectMatch = text.match(/\{[\s\S]*\}/);
    if (objectMatch) return JSON.parse(objectMatch[0]);

    return JSON.parse(text);
  } catch (err) {
    console.error("JSON parse error:", err);
    return null;
  }
}

interface JobSuggestion {
  title: string;
  company: string;
  location: string;
  description: string;
  keywords: string[] | string;
  jobDescriptionText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText } = body;

    if (!resumeText || typeof resumeText !== "string") {
      return NextResponse.json({ error: "Missing or invalid resumeText" }, { status: 400 });
    }

    const prompt = `You are a professional career advisor and recruiter. Based on the following resume, suggest 4 diverse, high-quality job opportunities that would be an excellent match for this candidate.

REQUIREMENTS:
- Mix of locations: Include remote-friendly roles, major tech hubs (San Francisco, New York, London, Berlin, etc.), and hybrid options
- Real companies: Use well-known tech companies, startups, or realistic company names
- Professional roles: Match the candidate's experience level and skills
- Competitive compensation: Reflect realistic market rates
- Diverse opportunities: Include different company sizes (startups, mid-size, enterprise)

For each job, provide a JSON object with these exact fields:
{
  "title": "Specific job title matching candidate's level",
  "company": "Real or realistic company name",
  "location": "City, Country (Remote/Hybrid/On-site)",
  "description": "2-3 sentence compelling description of the role and company",
  "keywords": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "jobDescriptionText": "Detailed 4-5 sentence job description including: responsibilities, requirements, tech stack, team structure, and benefits/salary range"
}

Resume:
${resumeText.substring(0, 2000)}

Return ONLY a valid JSON array of 4 job objects. No markdown, no code blocks, just the JSON array.`;

    console.log("🚀 Sending request to Gemini...");
    let text = await generateTextFromLib(prompt, { temperature: 0.7, maxTokens: 1500 });
    console.log("📦 Received from AI:", typeof text, text.substring(0, 300));

    // Clean markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    let jobs: JobSuggestion[] = [];
    try {
      jobs = JSON.parse(text);
      console.log("✅ Parsed as JSON, array?", Array.isArray(jobs), "length:", Array.isArray(jobs) ? jobs.length : 0);
    } catch (parseError) {
      console.log("⚠️ JSON.parse failed, trying safeJson...", parseError);
      const parsed = safeJson<JobSuggestion[]>(text);
      if (parsed) {
        jobs = parsed;
        console.log("✅ safeJson worked, array?", Array.isArray(jobs), "length:", Array.isArray(jobs) ? jobs.length : 0);
      }
    }

    if (!Array.isArray(jobs) || jobs.length === 0) {
      console.error("❌ Final check failed - not array or empty:", Array.isArray(jobs), jobs);
      return NextResponse.json(
        { error: "No valid job suggestions returned by AI", raw: text.substring(0, 500) },
        { status: 500 }
      );
    }

    // Ensure proper defaults and clean data
    const validJobs = jobs
      .filter((job) => job && typeof job === "object")
      .map((job) => ({
        title: job.title || "Professional Role",
        company: job.company || "Various Companies",
        location: job.location || "Remote",
        description: job.description || "Position requiring relevant skills and experience.",
        keywords: Array.isArray(job.keywords)
          ? job.keywords
          : typeof job.keywords === "string"
          ? job.keywords.split(/,\s*/)
          : ["Skills required"],
        jobDescriptionText: job.jobDescriptionText || `Role: ${job.title} at ${job.company}. ${job.description}`,
      }));

    console.log(`✅ Returning ${validJobs.length} AI-generated job suggestions`);
    return NextResponse.json({ jobs: validJobs }, { status: 200 });
  } catch (err) {
    console.error("suggest-jobs error:", err);
    const errorMessage = err instanceof Error ? err.message : "Failed to suggest jobs";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
