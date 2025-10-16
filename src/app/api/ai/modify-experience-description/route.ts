import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import { trackAIRequest } from "@/lib/ai/track-analytics";
import { checkRateLimit, aiRateLimiter } from "@/lib/middleware/rateLimiter";
import crypto from 'crypto';

const MODEL_NAME = "gemini-2.0-flash-exp";
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || '';

// Enhanced retry with exponential backoff and better logging
async function runWithRetry<T>(fn: () => Promise<T>, retries = 3, initialDelay = 2000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetryableError = error?.status === 429 || error?.status === 503;
      const isLastAttempt = i === retries - 1;

      console.log(`[Retry] Attempt ${i + 1}/${retries} - Error: ${error?.status} ${error?.statusText || error?.message}`);

      if (!isRetryableError || isLastAttempt) {
        throw error;
      }

      // Exponential backoff: 2s, 4s, 8s
      const delay = initialDelay * Math.pow(2, i);
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Max retries reached");
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { success: false, error: 'API key not found' },
      { status: 500 }
    );
  }

  const startTime = Date.now();
  try {
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

    const { description, achievements, prompt } = await req.json();

    if (!description || !prompt) {
      return NextResponse.json(
        { success: false, error: 'Missing description or prompt' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.7,
      topK: 1,
      topP: 1,
      maxOutputTokens: 512, // Reduced from 2048 to force shorter output
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const fullPrompt = `
You are an expert resume writer. Modify the following job experience based on the user's request.

**CRITICAL CONSTRAINTS:**
- Description: Keep to 2-3 SHORT lines (50-80 words max)
- Achievements: EXACTLY 3-4 concise bullet points (15-20 words each)
- Be brief, impactful, and scannable

Current Description:
${description}

Current Achievements:
${(achievements || []).join('\n- ')}

User's Request:
"${prompt}"

⚠️ Respond ONLY with valid JSON in this format:
{
  "description": "Brief 2-3 line professional summary (50-80 words max)",
  "achievements": ["Short bullet 1 (15-20 words)", "Short bullet 2 (15-20 words)", "Short bullet 3 (15-20 words)"]
}
`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(fullPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Modify Experience] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: true,
        success: true,
        requestDuration,
      });
      return cached;
    }
    
    console.log('[AI Modify Experience] ⚠️ Cache MISS - Calling AI API');

    const generationFn = async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig,
        safetySettings,
      });
      return result.response;
    };

    let response;
    try {
      response = await runWithRetry(generationFn, 3, 2000);
    } catch (error: any) {
      console.error('[AI Modify Experience] ❌ API failed after retries:', error?.message);
      
      // Fallback: Return original content with slight modification
      const responseData = NextResponse.json({
        success: true,
        data: {
          description: description,
          achievements: achievements || [],
        },
        fallback: true,
        message: 'Using original content due to API unavailability',
      });
      
      return responseData;
    }
    
    const rawText = response.text();

    // Clean output and extract JSON
    const cleanedText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
      
      const requestDuration = Date.now() - startTime;
      const tokensUsed = Math.ceil(fullPrompt.length / 4) + Math.ceil(rawText.length / 4);
      
      await trackAIRequest({
        userId,
        contentType: 'work-experience',
        cached: false,
        success: true,
        tokensUsed,
        requestDuration,
      });
      
      // Prepare response
      const responseData = NextResponse.json({
        success: true,
        data: {
          description: data.description || description,
          achievements: Array.isArray(data.achievements) ? data.achievements : achievements || [],
        },
      });
      
      // Cache for 1 hour
      await setCache(cacheKey, responseData, 3600);
      console.log('[AI Modify Experience] ✅ Cached response for 1 hour');
      
      return responseData;
    } catch {
      throw new Error(`Invalid JSON from Gemini: ${cleanedText}`);
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error('Error modifying experience description:', error);
    
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'work-experience',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to modify description', details: error.message },
      { status: 500 }
    );
  }
}
