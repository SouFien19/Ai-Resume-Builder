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
  resumeText?: string; // Direct text from frontend
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

      // Handle direct resumeText (from ATS optimizer page)
      if (body.resumeText) {
        allText = sanitizeInput(truncate(body.resumeText, MAX_RESUME_LENGTH));
      }
      // Handle resume.content object (from other sources)
      else if (body.resume?.content) {
        const resumeJson = JSON.stringify(body.resume.content);
        allText = sanitizeInput(truncate(resumeJson, MAX_RESUME_LENGTH));
      }
      // No resume provided
      else {
        throw APIErrors.BadRequest("Resume content is required");
      }
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

Return a JSON object with this ENHANCED structure:
{
  "score": <number between 0-100>,
  "categoryScores": {
    "contactInfo": <0-100>,
    "workExperience": <0-100>,
    "education": <0-100>,
    "skills": <0-100>,
    "formatting": <0-100>,
    "keywords": <0-100>
  },
  "keywordAnalysis": {
    "totalKeywords": <number>,
    "matchedKeywords": ["keyword1", "keyword2"...],
    "missingKeywords": ["keyword1", "keyword2"...],
    "matchPercentage": <0-100>
  },
  "atsCompatibility": {
    "hasProblems": <boolean>,
    "issues": ["issue1", "issue2"...],
    "warnings": ["warning1", "warning2"...],
    "goodPoints": ["good1", "good2"...]
  },
  "recommendations": [
    {
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "category": "keywords" | "experience" | "formatting" | "skills" | "education",
      "issue": "Brief description of the issue",
      "action": "Specific actionable fix",
      "impact": "Expected improvement"
    }
  ],
  "sectionAnalysis": {
    "summary": { "status": "good" | "needs-work" | "missing", "feedback": "..." },
    "experience": { "status": "good" | "needs-work" | "missing", "feedback": "..." },
    "education": { "status": "good" | "needs-work" | "missing", "feedback": "..." },
    "skills": { "status": "good" | "needs-work" | "missing", "feedback": "..." }
  }
}

REQUIREMENTS:
- Overall score must match category average
- Separate technical keywords from soft skills
- List 5-10 specific missing keywords
- Provide 5-8 prioritized recommendations (2-3 HIGH, 2-3 MEDIUM, 1-2 LOW)
- Identify ATS formatting issues (tables, columns, images, headers/footers)
- Give constructive section-by-section feedback
- Be professional, honest, and actionable

Return ONLY valid JSON. No markdown, no explanations, just the JSON object.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI ATS] ✅ Cache HIT - Saved API cost!');
      return successResponse(cached, { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' });
    }
    
    console.log('[AI ATS] ⚠️ Cache MISS - Calling AI API');

    let text: string;
    try {
      text = await generateText(prompt, {
        maxTokens: 1500,
        temperature: 0.3,
      });
    } catch (aiError: any) {
      // Handle quota exceeded error with ENHANCED intelligent fallback
      if (aiError?.status === 429 || aiError?.isQuotaError || aiError?.message?.includes('QUOTA_EXCEEDED')) {
        logger.warn('Gemini API quota exceeded, using enhanced intelligent fallback', { userId });
        
        // Advanced keyword analysis
        const jdKeywords: string[] = jd.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const resumeKeywords: string[] = allText.toLowerCase().match(/\b\w{4,}\b/g) || [];
        const matchingKeywords = jdKeywords.filter(kw => resumeKeywords.includes(kw));
        const missingKeywords = jdKeywords.filter(kw => !resumeKeywords.includes(kw)).slice(0, 10);
        const matchRate = matchingKeywords.length / Math.max(jdKeywords.length, 1);
        const keywordScore = Math.round(matchRate * 100);
        
        // Calculate category scores
        const hasContact = /email|phone|linkedin/i.test(allText);
        const hasExperience = /experience|work|employment|position/i.test(allText);
        const hasEducation = /education|degree|university|college/i.test(allText);
        const hasSkills = /skills|technologies|tools|proficient/i.test(allText);
        
        const categoryScores = {
          contactInfo: hasContact ? 90 : 50,
          workExperience: hasExperience ? 75 : 40,
          education: hasEducation ? 80 : 45,
          skills: hasSkills ? keywordScore : 50,
          formatting: 70, // Assume decent formatting
          keywords: keywordScore
        };
        
        const avgScore = Math.round(
          Object.values(categoryScores).reduce((a, b) => a + b, 0) / 6
        );
        
        const fallbackResponse = {
          score: avgScore,
          categoryScores,
          keywordAnalysis: {
            totalKeywords: jdKeywords.length,
            matchedKeywords: matchingKeywords.slice(0, 15),
            missingKeywords,
            matchPercentage: Math.round(matchRate * 100)
          },
          atsCompatibility: {
            hasProblems: false,
            issues: [],
            warnings: [
              "⚠️ This is a fallback analysis due to API quota limits."
            ],
            goodPoints: [
              "Standard text format detected",
              "No obvious formatting issues found"
            ]
          },
          recommendations: [
            {
              priority: "HIGH",
              category: "keywords",
              issue: "Missing critical keywords from job description",
              action: `Add these keywords: ${missingKeywords.slice(0, 3).join(', ')}`,
              impact: "Could improve match score by 10-15%"
            },
            {
              priority: "HIGH",
              category: "experience",
              issue: "Need to quantify achievements",
              action: "Add metrics and numbers to at least 5 bullet points",
              impact: "Makes accomplishments more compelling"
            },
            {
              priority: "MEDIUM",
              category: "skills",
              issue: "Skills section needs expansion",
              action: "Add relevant technical skills from job description",
              impact: "Improves keyword matching"
            },
            {
              priority: "MEDIUM",
              category: "formatting",
              issue: "⚠️ Fallback analysis - limited format check",
              action: "Ensure standard ATS-friendly formatting (no tables/columns)",
              impact: "Prevents parsing issues"
            },
            {
              priority: "LOW",
              category: "keywords",
              issue: "API quota exceeded",
              action: "Wait 24 hours for quota reset or upgrade to paid tier",
              impact: "Get full AI-powered analysis"
            }
          ],
          sectionAnalysis: {
            summary: {
              status: hasContact ? "good" : "needs-work",
              feedback: hasContact ? "Contact information found" : "Add clear contact information"
            },
            experience: {
              status: hasExperience ? "good" : "needs-work",
              feedback: hasExperience ? "Work experience detected" : "Add detailed work experience"
            },
            education: {
              status: hasEducation ? "good" : "needs-work",
              feedback: hasEducation ? "Education section found" : "Include education details"
            },
            skills: {
              status: keywordScore > 60 ? "good" : "needs-work",
              feedback: keywordScore > 60 ? 
                `Good keyword match: ${Math.round(matchRate * 100)}%` : 
                "Add more relevant skills from job description"
            }
          }
        };
        
        logger.info('Returning enhanced fallback ATS analysis', { score: avgScore, userId });
        return successResponse(fallbackResponse, { 'X-Cache': 'FALLBACK', 'X-Quota-Exceeded': 'true' });
      }
      
      // Re-throw other errors
      throw aiError;
    }

    // Clean markdown code blocks if present
    text = text.replace(/```json\s*/g, '').replace(/```\s*$/g, '').trim();

    // Parse and validate AI response
    const parsed = safeJson<any>(text || "");

    if (parsed) {
      // Validate response structure
      const validated = ATSResponseSchema.parse(parsed);
      
      // Extract missing keywords (supports both new and legacy format)
      const missingKeywords = 
        validated.keywordAnalysis?.missingKeywords || 
        validated.missingKeywords || 
        [];
      
      // Extract recommendations (convert to strings for database)
      const recommendationStrings = validated.recommendations?.map(
        r => `[${r.priority}] ${r.category}: ${r.action}`
      ) || [];
      
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
              missingKeywords,
              recommendations: recommendationStrings,
              strengths: validated.atsCompatibility?.goodPoints || [],
              weaknesses: validated.atsCompatibility?.issues || [],
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
        keywordCount: missingKeywords.length,
        recommendationCount: validated.recommendations?.length || 0,
      });

      // Cache the validated data (not the full response)
      await setCache(cacheKey, validated, 3600);
      console.log('[AI ATS] ✅ Cached response for 1 hour');

      return successResponse(validated, { 'X-Cache': 'MISS' });
    }

    // Fallback if AI parsing fails
    logger.warn("ATS analysis fallback used", { userId });
    const fallbackResponse = {
      score: 60,
      keywordAnalysis: {
        totalKeywords: 0,
        matchedKeywords: [],
        missingKeywords: [],
        matchPercentage: 60,
      },
      recommendations: [
        {
          priority: "HIGH" as const,
          category: "keywords" as const,
          issue: "Unable to perform detailed analysis",
          action: "Ensure the top 5 job description keywords appear clearly in your summary and skills section",
          impact: "Improves keyword matching and ATS score"
        }
      ],
    };
    return successResponse(fallbackResponse);
  } catch (error) {
    logger.error("ATS analysis failed", { error });
    return handleAPIError(error);
  }
}
