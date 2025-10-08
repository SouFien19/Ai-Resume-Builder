/**
 * ATS Score API
 * Analyzes resume against job description for ATS compatibility
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { generateText, safeJson } from "@/lib/ai/gemini";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { ATSResponseSchema } from "@/lib/validation/schemas";
import { sanitizeInput, truncate } from "@/lib/validation/sanitizers";
import { logger } from "@/lib/logger";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import AtsScore from "@/lib/database/models/AtsScore";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

const MAX_JD_LENGTH = 6000;
const MAX_RESUME_LENGTH = 9000;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface ATSRequest {
  jobDescription: string;
  resume?: {
    content?: Record<string, unknown>;
  };
}

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    let jd = "";
    let allText = "";

    const contentType = req.headers.get("content-type") || "";

    // Handle multipart form data (PDF upload)
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      
      // Validate and sanitize job description
      const rawJd = String(form.get("jobDescription") || "");
      if (!rawJd.trim()) {
        throw APIErrors.BadRequest("Job description is required");
      }
      jd = sanitizeInput(truncate(rawJd, MAX_JD_LENGTH));

      // Handle PDF file upload
      const file = form.get("resumeFile");
      if (file && typeof file !== "string") {
        const blob = file as Blob;
        
        // Validate file size
        if (blob.size > MAX_FILE_SIZE) {
          throw APIErrors.BadRequest("File size exceeds 5MB limit");
        }

        // Validate file type
        if (!blob.type.includes("pdf")) {
          throw APIErrors.BadRequest("Only PDF files are supported");
        }

        const arrayBuffer = await blob.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);
        
        try {
          const parsed = await pdfParse(buffer);
          allText = sanitizeInput(truncate(parsed.text || "", MAX_RESUME_LENGTH));
          
          if (!allText.trim()) {
            throw APIErrors.BadRequest("Unable to extract text from PDF");
          }
        } catch (error) {
          logger.error("PDF parsing failed", { error, userId });
          throw APIErrors.BadRequest("Failed to parse PDF file");
        }
      } else {
        throw APIErrors.BadRequest("Resume file is required");
      }
    } 
    // Handle JSON body
    else {
      const body: ATSRequest = await req.json();
      
      // Validate job description
      if (!body.jobDescription?.trim()) {
        throw APIErrors.BadRequest("Job description is required");
      }
      jd = sanitizeInput(truncate(body.jobDescription, MAX_JD_LENGTH));

      // Validate resume content
      if (!body.resume?.content) {
        throw APIErrors.BadRequest("Resume content is required");
      }
      
      const resumeJson = JSON.stringify(body.resume.content);
      allText = sanitizeInput(truncate(resumeJson, MAX_RESUME_LENGTH));
    }

    logger.info("ATS analysis requested", {
      userId,
      jdLength: jd.length,
      resumeLength: allText.length,
      contentType,
    });

    // Generate ATS analysis with AI
    const prompt = `You are an expert ATS (Applicant Tracking System) analyzer with 10+ years of recruiting experience. Analyze how well this resume matches the job description using industry-standard ATS scoring methodology.

JOB DESCRIPTION:
${jd}

RESUME:
${allText}

ANALYSIS CRITERIA:
1. Keyword Match (30%): Essential keywords, skills, and qualifications from job description
2. Experience Relevance (25%): Years of experience, role alignment, industry match
3. Skills Alignment (25%): Technical skills, soft skills, certifications
4. Format & Structure (10%): ATS-friendly formatting, clear sections, proper keywords placement
5. Achievements & Impact (10%): Quantifiable results, measurable achievements

SCORING GUIDELINES:
- 90-100: Exceptional match, strong candidate
- 80-89: Very good match, highly qualified
- 70-79: Good match, qualified with minor gaps
- 60-69: Moderate match, some relevant experience
- 50-59: Weak match, significant gaps
- Below 50: Poor match, major gaps

Return a JSON object with this exact structure:
{
  "score": <number between 0-100>,
  "missingKeywords": ["keyword1", "keyword2", "keyword3"...],
  "recommendations": ["specific actionable recommendation 1", "recommendation 2", "recommendation 3"...]
}

REQUIREMENTS:
- Score must be realistic and justified
- List 5-10 specific missing keywords/skills from job description
- Provide 4-6 detailed, actionable recommendations with examples
- Be professional, honest, and constructive
- Consider experience level appropriateness

Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI ATS] ✅ Cache HIT - Saved API cost!');
      return cached;
    }
    
    console.log('[AI ATS] ⚠️ Cache MISS - Calling AI API');

    let text = await generateText(prompt, {
      maxTokens: 1500,
      temperature: 0.3,
    });

    // Clean markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    // Parse and validate AI response
    const parsed = safeJson<{
      score: number;
      missingKeywords: string[];
      recommendations: string[];
    }>(text || "");

    if (parsed) {
      // Validate response structure
      const validated = ATSResponseSchema.parse(parsed);
      
      // Connect to database and save the score
      try {
        await dbConnect();
        
        // Get user's MongoDB ID
        const user = await User.findOne({ clerkId: userId }).select('_id');
        
        if (user) {
          // Save ATS score to database
          const atsScore = await AtsScore.create({
            userId: user._id,
            score: validated.score,
            resumeText: allText.substring(0, 1000), // Save first 1000 chars
            jobDescription: jd.substring(0, 1000),
            analysis: {
              missingKeywords: validated.missingKeywords || [],
              recommendations: validated.recommendations || [],
              strengths: [],
              weaknesses: [],
            },
          });

          logger.info("ATS score saved to database", {
            userId,
            atsScoreId: atsScore._id.toString(),
            score: validated.score,
          });
        } else {
          logger.warn("User not found in database, score not saved", { userId });
        }
      } catch (dbError) {
        // Don't fail the request if database save fails
        logger.error("Failed to save ATS score to database", { 
          error: dbError, 
          userId 
        });
      }
      
      logger.info("ATS analysis completed", {
        userId,
        score: validated.score,
        keywordCount: validated.missingKeywords.length,
        recommendationCount: validated.recommendations.length,
      });

      const responseData = successResponse(validated);
      
      // Cache for 1 hour
      await setCache(cacheKey, responseData, 3600);
      console.log('[AI ATS] ✅ Cached response for 1 hour');

      return responseData;
    }

    // Fallback if AI parsing fails
    logger.warn("ATS analysis fallback used", { userId });
    return successResponse({
      score: 60,
      missingKeywords: [],
      recommendations: [
        "Ensure the top 5 job description keywords appear clearly in your summary and skills section.",
      ],
    });
  } catch (error) {
    logger.error("ATS analysis failed", { error });
    return handleAPIError(error);
  }
}
