import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

const MODEL_NAME = "gemini-2.0-flash-exp";
const API_KEY = process.env.GOOGLE_AI_API_KEY || 
                 process.env.GEMINI_API_KEY || 
                 process.env.GOOGLE_GEMINI_API_KEY || 
                 '';

async function runWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      if (i === retries - 1) throw error;
      if (error?.status === 429 || error?.status === 503) {
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
    return NextResponse.json({ error: 'API key not found' }, { status: 500 });
  }

  try {
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

Requirements:
- 1–2 sentences only
- Professional tone
- Highlight relevant coursework, achievements, or skills
- Be specific and quantifiable where possible
- ⚠️ Respond ONLY in JSON format:
{
  "description": "..."
}
`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(fullPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ description: string }>(cacheKey);
    if (cached) {
      console.log('[AI Education Description] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Education Description] ⚠️ Cache MISS - Calling AI API');

    const generationFn = async () => {
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      });
      return result.response;
    };

    const response = await runWithRetry(generationFn);
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
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Education Description] ✅ Cached response for 1 hour');
    
    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error: any) {
    console.error('Education description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate education description', details: error.message },
      { status: 500 }
    );
  }
}
