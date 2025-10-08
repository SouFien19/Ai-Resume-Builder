import { NextRequest, NextResponse } from 'next/server';
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { role, company, industry, requirements } = await req.json();

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a professional job description for the following position:
Role: ${role}
Company: ${company || 'A leading company'}
Industry: ${industry || 'Technology'}
Additional Requirements: ${requirements || 'Standard qualifications'}

Structure the job description with:
1. Brief company overview (1-2 sentences)
2. Role summary (2-3 sentences)
3. Key responsibilities (4-6 bullet points)
4. Required qualifications (4-5 bullet points)
5. Preferred qualifications (2-3 bullet points)

Use professional language and industry-standard terminology. Make it comprehensive but concise.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ jobDescription: string }>(cacheKey);
    if (cached) {
      console.log('[AI Job Description] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Job Description] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.7,
      maxTokens: 1500
    });

    const responseData = { jobDescription: text?.trim() || '' };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Job Description] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Job description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate job description' },
      { status: 500 }
    );
  }
}