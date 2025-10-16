import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from "crypto";

const MODEL_NAME = "gemini-2.0-flash-exp";
const API_KEY = process.env.GOOGLE_AI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_GEMINI_API_KEY || 
                 '';

// Enhanced retry with exponential backoff
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

      const delay = initialDelay * Math.pow(2, i);
      console.log(`[Retry] Waiting ${delay}ms before retry...`);
      await new Promise(res => setTimeout(res, delay));
    }
  }
  throw new Error("Max retries reached");
}

export async function POST(req: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  const startTime = Date.now();
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { institution, degree, field } = await req.json();

    if (!institution || !degree) {
      return NextResponse.json(
        { error: 'Institution and degree are required' },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const fullPrompt = `
You are an expert resume writer. Write a concise education entry.

Institution: ${institution}
Degree: ${degree}
Field: ${field || 'Not specified'}

**CRITICAL CONSTRAINTS:**
- MAXIMUM 1-2 SHORT sentences (25-40 words total)
- Be brief, specific, and impactful
- No lengthy explanations

Requirements:
- Professional tone
- Highlight relevant coursework, achievements, or skills if notable
- Be specific and quantifiable where possible
- Keep it scannable and concise

⚠️ Respond ONLY in JSON format:
{
  "description": "Brief 1-2 sentence description (25-40 words max)"
}
`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(fullPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ description: string }>(cacheKey);
    if (cached) {
      console.log('[AI Education Description] ✅ Cache HIT - Saved API cost!');
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
    
    console.log('[AI Education Description] ⚠️ Cache MISS - Calling AI API');

    const generationFn = async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          maxOutputTokens: 256, // Reduced from 1000 for shorter output
        },
      });
      return result.response;
    };

    let response;
    try {
      response = await runWithRetry(generationFn, 3, 2000);
    } catch (error: any) {
      console.error('[AI Education Description] ❌ API failed after retries:', error?.message);
      
      // Fallback: Return simple description
      const fallbackDescription = `${degree} in ${field || 'studies'} from ${institution}.`;
      
      const responseData = { description: fallbackDescription };
      
      await setCache(cacheKey, responseData, 3600);
      console.log('[AI Education Description] ⚠️ Using fallback response');
      
      return NextResponse.json(responseData, { 
        headers: { 'X-Cache': 'MISS', 'X-Fallback': 'true' }
      });
    }
    let rawText = response.text().trim();

    // ✅ Strip Markdown fences (```json ... ```)
    rawText = rawText.replace(/```json|```/gi, "").trim();

    // ✅ Extract JSON object inside text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(`No JSON found in response: ${rawText}`);
    }
    
    let data: any;
    try {
      data = JSON.parse(jsonMatch[0]);
    } catch (err) {
      throw new Error(`Invalid JSON from Gemini: ${jsonMatch[0]}`);
    }
    
    const responseData = { description: data.description || '' };
    
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
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Education Description] ✅ Cached response for 1 hour');
    
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error: any) {
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
    console.error('Education description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate education description', details: error.message },
      { status: 500 }
    );
  }
}
