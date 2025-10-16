import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from "crypto";

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

    // ✅ Parse request body
    const body = await req.json();
    const {
      name,
      technologies = [],
      currentDescription = "",
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Project name is required" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // ✅ AI prompt
    const techStack = Array.isArray(technologies) && technologies.length > 0
      ? technologies.filter(t => t.trim()).join(", ")
      : "modern technologies";

    const systemPrompt = `You are an expert technical writer and software engineer. Generate a compelling, professional project description for a resume.

**Project Details:**
- Project Name: ${name}
- Technologies Used: ${techStack}
- Current Description: ${currentDescription || "None provided"}

**CRITICAL CONSTRAINTS:**
- MAXIMUM 2-3 SHORT sentences (40-60 words total)
- Keep each sentence concise and impactful
- No fluff or filler words

**Guidelines:**
- Focus on what the project does and its impact
- Highlight technical challenges solved
- Include quantifiable results if possible (users, performance, scale)
- Use action verbs (Built, Developed, Implemented, Created, Designed)
- Make it impressive but honest
- Keep it professional and ATS-friendly

Return ONLY the description text (2-3 sentences max), no explanations or markdown formatting.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ description: string }>(cacheKey);
    if (cached) {
      console.log('[AI Project Description] ✅ Cache HIT - Saved API cost!');
      
      // 🔥 Track cached AI request
      await trackAIRequest({
        userId,
        contentType: 'project-description',
        model: 'gemini-2.0-flash-exp',
        cached: true,
      });
      
      return NextResponse.json({
        success: true,
        data: cached,
        processingTime: 0
      }, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Project Description] ⚠️ Cache MISS - Calling AI API');

    // ✅ Use gemini-2.0-flash-exp (working model)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const generationFn = async () => {
      return await model.generateContent({
        contents: [{ role: "user", parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 256, // Reduced from 512 for shorter output
        },
        safetySettings,
      });
    };

    let result;
    try {
      result = await runWithRetry(generationFn, 3, 2000);
    } catch (error: any) {
      console.error("Gemini API error after retries:", error);
      
      // Fallback response
      const fallbackDescription = `${name} - A project built with ${techStack} to solve real-world problems. Demonstrates technical expertise and problem-solving skills.`;
      
      const responseData = {
        description: fallbackDescription,
      };
      
      console.log('[AI Project Description] ⚠️ Using fallback response due to API error');
      return NextResponse.json({
        success: true,
        data: responseData,
        processingTime: Date.now() - startTime,
        fallback: true,
      }, { headers: { 'X-Fallback': 'true' }});
    }

    if (!result?.response) {
      throw new Error("No response from Gemini API");
    }

    const generatedDescription = result.response.text().trim();
    const processingTime = Date.now() - startTime;

    console.log(`✅ Project description generated in ${processingTime}ms`);

    const responseData = {
      description: generatedDescription,
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Project Description] ✅ Cached response for 1 hour');

    // 🔥 Track AI generation
    await trackAIRequest({
      userId,
      contentType: 'project-description',
      model: 'gemini-2.0-flash-exp',
      cached: false,
      metadata: { processingTime },
    });

    return NextResponse.json({
      success: true,
      data: responseData,
      processingTime,
    }, { headers: { 'X-Cache': 'MISS' }});

  } catch (error: any) {
    console.error("Project description generation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to generate project description",
      },
      { status: 500 }
    );
  }
}
