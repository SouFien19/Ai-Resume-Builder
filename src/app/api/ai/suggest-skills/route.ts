import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { getSuggestedSkills, searchSkills } from "@/lib/ai/skill-suggestions";
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

    const startTime = Date.now();
    const { role, industry, seniority, experience } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a list of relevant skills for the following position:
Role: ${role}
Industry: ${industry || 'Technology'}
Seniority: ${seniority || 'Mid-level'}
Experience Context: ${experience || 'Standard professional experience'}

Requirements:
- Return 8-12 most relevant technical and soft skills
- Focus on skills that are commonly required for this role
- Include both hard skills (technical) and soft skills (interpersonal)
- Make skills specific and industry-relevant
- Return as a JSON array of skill names

Example format: ["JavaScript", "Project Management", "Problem Solving", "React", "Communication"]

Return only the JSON array, no other text.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ skills: string[] }>(cacheKey);
    if (cached) {
      console.log('[AI Suggest Skills] ✅ Cache HIT - Saved API cost!');
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
    
    console.log('[AI Suggest Skills] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.7,
      maxTokens: 1000
    });

    try {
      const skills = JSON.parse(text?.trim() || '[]');
      const response = { 
        skills: Array.isArray(skills) ? skills : [] 
      };
      
      const requestDuration = Date.now() - startTime;
      const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil((text || '').length / 4);
      
      await trackAIRequest({
        userId,
        contentType: 'skills-keywords',
        cached: false,
        success: true,
        tokensUsed,
        requestDuration,
      });
      
      // Cache for 1 hour
      await setCache(cacheKey, response, 3600);
      console.log('[AI Suggest Skills] ✅ Cached response for 1 hour');
      
      return NextResponse.json(response, { headers: { 'X-Cache': 'MISS' }});
    } catch {
      // Fallback if JSON parsing fails
      const skillsText = text?.trim() || '';
      const skills = skillsText
        .split(/[,\n]/)
        .map(s => s.replace(/["\[\]]/g, '').trim())
        .filter(s => s.length > 0)
        .slice(0, 12);
      
      return NextResponse.json({ skills });
    }

  } catch (error) {
    console.error('Skills suggestion error:', error);
    
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
    
    // Fallback to rule-based suggestions if provided
    const body = await req.json().catch(() => ({}));
    const { existingSkills } = body;
    
    if (existingSkills && Array.isArray(existingSkills)) {
      console.log('[AI Suggest Skills] Using rule-based fallback');
      const suggestions = getSuggestedSkills(existingSkills, 10);
      return NextResponse.json({ skills: suggestions });
    }
    
    return NextResponse.json(
      { error: 'Failed to generate skills suggestions' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ai/suggest-skills?query=react&limit=10&existingSkills=Python,Django
 * Search for skills (autocomplete) or get suggestions based on existing skills
 * 
 * Query params:
 * - query: string (search query for autocomplete)
 * - limit: number (max results, default: 10)
 * - existingSkills: string (comma-separated list for contextual suggestions)
 * 
 * Response:
 * {
 *   results: string[],
 *   count: number
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const limit = parseInt(searchParams.get("limit") || "10");
    const existingSkillsParam = searchParams.get("existingSkills") || "";
    
    // If existingSkills provided, return contextual suggestions
    if (existingSkillsParam) {
      const existingSkills = existingSkillsParam.split(",").map(s => s.trim()).filter(Boolean);
      const suggestions = getSuggestedSkills(existingSkills, limit);
      
      return NextResponse.json({
        results: suggestions,
        count: suggestions.length,
        source: "contextual"
      });
    }
    
    // Otherwise, do autocomplete search
    const results = searchSkills(query, limit);

    return NextResponse.json({
      results,
      count: results.length,
      source: "search"
    });
  } catch (error) {
    console.error("[Skill Search API] Error:", error);
    return NextResponse.json(
      { error: "Failed to search skills" },
      { status: 500 }
    );
  }
}