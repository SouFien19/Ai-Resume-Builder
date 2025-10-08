/**
 * Career Intelligence API
 * Provides career insights, skill gaps, and salary information
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { sanitizeInput, truncate } from "@/lib/validation/sanitizers";
import { logger } from "@/lib/logger";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

const MAX_SKILLS = 20;
const MAX_RESUME_LENGTH = 4000;

// Request validation schema
const CareerRequestSchema = z.object({
  role: z.string().min(1, "Role is required").max(100),
  location: z.string().max(100).optional(),
  skills: z.array(z.string()).optional(),
  resume: z.record(z.unknown()).optional(),
});

// Response validation schema
const CareerResponseSchema = z.object({
  skillGaps: z.array(z.string()),
  salaryInsights: z.string(),
  progression: z.array(z.string()),
  interviewPrep: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = CareerRequestSchema.parse(body);

    // Sanitize and process inputs
    const role = sanitizeInput(validated.role);
    const location = validated.location ? sanitizeInput(validated.location) : "";
    const skills = Array.isArray(validated.skills)
      ? validated.skills
          .filter(Boolean)
          .map((s) => sanitizeInput(s))
          .slice(0, MAX_SKILLS)
      : [];

    const resumeContext = validated.resume
      ? sanitizeInput(truncate(JSON.stringify(validated.resume), MAX_RESUME_LENGTH))
      : "";

    logger.info("Career intelligence requested", {
      userId,
      role,
      location,
      skillCount: skills.length,
      hasResume: !!validated.resume,
    });

    // Generate career insights with AI
    const prompt = `Provide career intelligence as JSON { skillGaps: string[], salaryInsights: string, progression: string[], interviewPrep: string[] }.
Base on common market expectations. If giving salary, provide a conservative range and mark as estimate-only.
Role: ${role}\nLocation: ${location}\nKnown skills: ${skills.join(", ")}\nResume context: ${resumeContext}\nJSON:`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Career] ✅ Cache HIT - Saved API cost!');
      return successResponse(cached, { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' });
    }
    
    console.log('[AI Career] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, {
      maxTokens: 1500,
      temperature: 0.4,
    });

    // Parse and validate AI response
    const parsed = safeJson<{
      skillGaps: string[];
      salaryInsights: string;
      progression: string[];
      interviewPrep: string[];
    }>(text || "");

    if (parsed) {
      const validated = CareerResponseSchema.parse(parsed);

      logger.info("Career intelligence generated", {
        userId,
        skillGapCount: validated.skillGaps.length,
        progressionSteps: validated.progression.length,
        interviewTips: validated.interviewPrep.length,
      });

      const responseData = successResponse(validated);
      
      // Cache for 1 hour
      await setCache(cacheKey, responseData, 3600);
      console.log('[AI Career] ✅ Cached response for 1 hour');

      return responseData;
    }

    // Fallback response
    logger.warn("Career intelligence fallback used", { userId });
    return successResponse({
      skillGaps: [],
      salaryInsights: "Estimates only. Market data varies by experience and company.",
      progression: [],
      interviewPrep: [],
    });
  } catch (error) {
    logger.error("Career intelligence failed", { error });
    return handleAPIError(error);
  }
}
