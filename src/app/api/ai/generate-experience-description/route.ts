import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import { checkRateLimit, aiRateLimiter } from "@/lib/middleware/rateLimiter";

// Initialize Gemini AI with fallback to multiple environment variable names
const genAI = new GoogleGenerativeAI(
  process.env.GOOGLE_AI_API_KEY || 
  process.env.GEMINI_API_KEY || 
  process.env.GOOGLE_GEMINI_API_KEY || 
  ""
);

// Retry utility for handling 503/429 errors
async function runWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryableError = error?.status === 429 || error?.status === 503;
      const isLastAttempt = i === retries - 1;

      if (!isRetryableError || isLastAttempt) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = initialDelay * Math.pow(2, i);
      console.log(`[Retry] Attempt ${i + 1}/${retries} failed. Retrying in ${delay}ms...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Max retries reached");
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check rate limit (10 requests per minute)
    const rateLimitResult = await checkRateLimit(aiRateLimiter, `ai:${userId}`, 10);
    if (!rateLimitResult.success) {
      return NextResponse.json(rateLimitResult.error, {
        status: 429,
        headers: rateLimitResult.headers,
      });
    }

    // ✅ Parse request body
    const body = await req.json();
    const {
      company,
      position,
      startDate,
      endDate,
      description,
      industry,
      experienceLevel = "mid-level",
    } = body;

    if (!company || !position) {
      return NextResponse.json(
        { success: false, error: "Company and position are required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // ✅ AI prompt - CONSTRAINED to 2-3 lines
    const systemPrompt = `You are an expert resume writer and career coach. Generate a professional, ATS-optimized work experience description that highlights achievements and impact.

**CRITICAL CONSTRAINTS:**
- Description: MAXIMUM 2-3 SHORT lines (50-80 words total)
- Achievements: EXACTLY 3-4 concise bullet points (15-20 words each)
- Keep it brief, impactful, and scannable

**Guidelines:**
- Start with strong action verbs (Led, Developed, Implemented, Managed, Created, etc.)
- Include quantifiable achievements where possible (percentages, dollar amounts, timeframes)
- Focus on impact and results, not just responsibilities
- Use relevant industry keywords for ATS optimization
- Write in past tense (or present if current role)
- Make it specific and compelling
- Avoid generic descriptions
- Highlight skills and technologies used

**Experience Details:**
- Company: ${company}
- Position: ${position}
- Duration: ${startDate} - ${endDate || "Present"}
- Industry: ${industry || "General"}
- Experience Level: ${experienceLevel}
- Current Description: ${description || "None provided"}

Return strictly JSON:
{
  "description": "Brief 2-3 line role description (50-80 words max)",
  "achievements": ["Short achievement 1 (15-20 words)", "Short achievement 2 (15-20 words)", "Short achievement 3 (15-20 words)"]
}`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Experience Description] ✅ Cache HIT - Saved API cost!');
      
      // 🔥 Track cached AI request
      await trackAIRequest({
        userId,
        contentType: 'experience-description',
        model: 'gemini-2.0-flash-exp',
        cached: true,
      });
      
      return cached;
    }
    
    console.log('[AI Experience Description] ⚠️ Cache MISS - Calling AI API');

    // ✅ Use gemini-2.0-flash-exp (working model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    // ✅ Retry logic for 503/429 errors
    const generationFn = async () => {
      return await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 512, // Reduced from 1024 to force shorter output
        },
        safetySettings,
      });
    };

    let result;
    try {
      result = await runWithRetry(generationFn, 3, 2000);
    } catch (error: any) {
      console.error("Gemini API error after retries:", error);
      
      // Fallback: Return a simple template response
      const fallbackData = {
        description: `Served as ${position} at ${company}, contributing to key business objectives and team success.`,
        achievements: [
          `Executed core responsibilities for ${position} role`,
          `Collaborated with cross-functional teams on projects`,
          `Applied industry best practices and modern technologies`,
        ],
      };
      
      const responseData = NextResponse.json({
        success: true,
        data: {
          description: fallbackData.description,
          achievements: fallbackData.achievements,
          metadata: {
            processingTime: Date.now() - startTime,
            company,
            position,
            experienceLevel,
            fallback: true,
          },
        },
      });
      
      console.log('[AI Experience Description] ⚠️ Using fallback response due to API error');
      return responseData;
    }

    if (!result?.response) {
      throw new Error("No response from Gemini API");
    }

    const generatedContent = result.response.text();
    const processingTime = Date.now() - startTime;

    // ✅ Parse JSON output safely
    let parsedContent;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedContent = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch {
      // ✅ Fallback: convert raw text to structured content
      const lines = generatedContent.split("\n").filter((line) => line.trim());
      const achievements = lines
        .filter(
          (line) =>
            line.trim().startsWith("•") ||
            line.trim().startsWith("-") ||
            line.trim().startsWith("*")
        )
        .map((line) => line.replace(/^[•\-*]\s*/, "").trim())
        .filter((line) => line.length > 0);

      const desc = lines
        .filter(
          (line) =>
            !line.trim().startsWith("•") &&
            !line.trim().startsWith("-") &&
            !line.trim().startsWith("*")
        )
        .join(" ")
        .trim();

      parsedContent = {
        description: desc || `Professional ${position} with experience at ${company}`,
        achievements:
          achievements.length > 0
            ? achievements
            : [
                `Contributed to key projects and initiatives at ${company}`,
                `Collaborated with cross-functional teams to achieve business objectives`,
                `Applied industry best practices and modern technologies`,
              ],
      };
    }

    const responseData = NextResponse.json({
      success: true,
      data: {
        description: parsedContent.description || "",
        achievements: Array.isArray(parsedContent.achievements)
          ? parsedContent.achievements
          : [],
        metadata: {
          processingTime,
          company,
          position,
          experienceLevel,
        },
      },
    });
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Experience Description] ✅ Cached response for 1 hour');
    
    // 🔥 Track AI generation
    await trackAIRequest({
      userId,
      contentType: 'experience-description',
      model: 'gemini-2.0-flash-exp',
      cached: false,
      metadata: { company, position, processingTime },
    });
    
    return responseData;
  } catch (error) {
    console.error("Experience description generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate experience description",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
