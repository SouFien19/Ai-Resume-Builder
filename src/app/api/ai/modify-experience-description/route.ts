import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import crypto from 'crypto';

const MODEL_NAME = "gemini-2.0-flash-exp";
const API_KEY = process.env.GOOGLE_GEMINI_API_KEY || '';

async function runWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error;

      if (error?.status === 429 || error?.status === 503) {
        // Exponential backoff
        await new Promise(res => setTimeout(res, delay * (i + 1)));
      } else {
        throw error;
      }
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

  try {
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
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ];

    const fullPrompt = `
You are an expert resume writer. Modify the following job experience based on the user's request.

Current Description:
${description}

Current Achievements:
${(achievements || []).join('\n- ')}

User's Request:
"${prompt}"

⚠️ Respond ONLY with valid JSON in this format:
{
  "description": "Concise professional summary",
  "achievements": ["Bullet point 1", "Bullet point 2", "Bullet point 3"]
}
`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(fullPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Modify Experience] ✅ Cache HIT - Saved API cost!');
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

    const response = await runWithRetry(generationFn);
    const rawText = response.text();

    // Clean output and extract JSON
    const cleanedText = rawText
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    let data;
    try {
      data = JSON.parse(cleanedText);
      
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
    return NextResponse.json(
      { success: false, error: 'Failed to modify description', details: error.message },
      { status: 500 }
    );
  }
}
