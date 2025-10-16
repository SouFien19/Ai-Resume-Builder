import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { generateText, safeJson } from "@/lib/ai/gemini";
import dbConnect from "@/lib/database/connection";
import JobMatch from "@/lib/database/models/JobMatch";
import User from "@/lib/database/models/User";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from "crypto";

type Match = {
  title: string;
  company?: string;
  fitScore: number;
  summary: string;
  keywords?: string[];
  query?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const startTime = Date.now();
    const contentType = req.headers.get("content-type") || "";
    let resumeText = "";
    let location = "";
    let preferences = "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      location = String(form.get("location") || "");
      preferences = String(form.get("preferences") || "");
      const file = form.get("resumeFile");
      if (file && typeof file !== "string") {
        const arr = await (file as Blob).arrayBuffer();
        const buffer = new Uint8Array(arr);
        const parsed = await pdfParse(buffer);
        resumeText = (parsed.text || "").slice(0, 16000);
      }
    } else {
      const body = await req.json();
      resumeText = String(body?.resumeText || "").slice(0, 16000);
      location = String(body?.location || "");
      preferences = String(body?.preferences || "");
    }

    // Validate resume text
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({
        success: false,
        error: "Resume is required",
        matches: [],
        suggestions: ["Upload a resume PDF or paste text to generate matches."],
      }, { status: 400 });
    }

    if (resumeText.trim().length < 50) {
      return NextResponse.json({
        success: false,
        error: "Resume is too short. Please provide at least 50 characters.",
        matches: [],
        suggestions: ["Upload a complete resume to get accurate job matches."],
      }, { status: 400 });
    }

    if (resumeText.length > 20000) {
      return NextResponse.json({
        success: false,
        error: "Resume is too long. Please keep it under 20,000 characters.",
        matches: [],
      }, { status: 400 });
    }

    const prompt = `You are a career assistant. Suggest 6 matching job roles for this candidate based on their resume.
Return strictly JSON: { matches: { title: string, company: string, fitScore: number, summary: string, keywords: string[], query: string }[], suggestions: string[] }.
fitScore is 0-100. Keep summaries concise (1-2 sentences). query should be a boolean search string suitable for job sites.
For company, suggest realistic companies that typically hire for these roles (can be real or realistic company names).
Location (optional): ${location}
Preferences (optional): ${preferences}
RESUME:\n${resumeText}\nJSON:`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Job Match] ✅ Cache HIT - Saved API cost!');
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
    
    console.log('[AI Job Match] ⚠️ Cache MISS - Calling AI API');

    // Use gemini AI
    const text = await generateText(prompt, {
      temperature: 0.35,
      maxTokens: 2000,
    });

    const parsed = safeJson<{ matches: Match[]; suggestions?: string[] }>(text || "");

    // Debug logging
    console.log('[JOB_MATCH_DEBUG] Parsed data:', {
      hasMatches: !!parsed?.matches?.length,
      matchCount: parsed?.matches?.length || 0,
      hasSuggestions: !!parsed?.suggestions?.length,
      suggestionCount: parsed?.suggestions?.length || 0
    });

    if (parsed?.matches?.length) {
      const matches = parsed.matches.slice(0, 8).map((m) => ({
        title: String(m.title || "").slice(0, 80),
        company: m.company ? String(m.company).slice(0, 100) : undefined,
        fitScore: Math.max(0, Math.min(100, Number(m.fitScore) || 0)),
        summary: String(m.summary || "").slice(0, 240),
        keywords: Array.isArray(m.keywords)
          ? m.keywords.slice(0, 10).map((k) => String(k))
          : [],
        query: m.query ? String(m.query).slice(0, 200) : undefined,
      }));

      // Save to database (non-blocking - don't fail request if save fails)
      try {
        await dbConnect();
        const user = await User.findOne({ clerkId: userId });
        if (user) {
          await JobMatch.create({
            userId: user._id,
            resumeText: resumeText.slice(0, 5000), // Store truncated version
            matches: matches.map(m => ({
              title: m.title,
              company: m.company || undefined, // Use AI-generated company or undefined
              location: location || undefined, // Only set if user provided location
              description: m.summary,
              matchScore: m.fitScore,
              matchReason: m.summary,
              matchedSkills: m.keywords || [],
            })),
            searchDate: new Date(),
            preferences: {
              location: location || undefined,
              experienceLevel: preferences || undefined,
            }
          });
          console.log('[JOB_MATCH] Saved to database successfully');
        }
      } catch (dbError) {
        // Log but don't fail the request
        console.error('[JOB_MATCH_DB_ERROR]', dbError instanceof Error ? dbError.message : 'Unknown error');
      }

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

      const response = {
        success: true,
        matches,
        suggestions: parsed.suggestions || [],
        count: matches.length
      };
      
      // Cache for 30 minutes (job matches may change more frequently)
      await setCache(cacheKey, response, 1800);
      console.log('[AI Job Match] ✅ Cached response for 30 minutes');
      
      console.log('[JOB_MATCH_RESPONSE] Sending response:', {
        matchCount: response.count,
        suggestionCount: response.suggestions.length
      });

      return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' }});
    }

    // No matches found
    console.log('[JOB_MATCH_NO_MATCHES] No matches found in parsed data');
    return NextResponse.json({
      success: false,
      matches: [],
      suggestions: ["Try adding preferred location or industry."],
      count: 0
    });
  } catch (err) {
    console.error('[JOB_MATCH_ERROR]', {
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined,
    });
    
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'work-experience',
        cached: false,
        success: false,
        errorMessage: err instanceof Error ? err.message : 'Unknown error',
      });
    }
    
    return NextResponse.json({ 
      success: false,
      error: "Failed to generate job matches. Please try again.",
      matches: [], 
      suggestions: [],
      details: process.env.NODE_ENV === 'development' 
        ? (err instanceof Error ? err.message : String(err))
        : undefined,
    }, { status: 500 });
  }
}
