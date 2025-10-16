import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import { trackAIRequest } from "@/lib/ai/track-analytics";
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // ✅ Authentication check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const startTime = Date.now();
    const { name, issuer, field } = await req.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Certification name is required' },
        { status: 400 }
      );
    }

    const prompt = `Generate a brief, professional description for this certification entry on a resume:
Certification: ${name}
Issuer: ${issuer || 'Not specified'}
Field/Context: ${field || 'Not specified'}

**CRITICAL CONSTRAINTS:**
- MAXIMUM 1-2 SHORT sentences (20-35 words total)
- Be concise, specific, and impactful
- No lengthy explanations or filler

Requirements:
- Highlight the key skills, knowledge, or expertise gained
- Mention practical applications or industry relevance if notable
- Use professional language suitable for resumes
- Be specific about what this certification demonstrates

Return only the description text (1-2 sentences max), no other formatting.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ description: string }>(cacheKey);
    if (cached) {
      console.log('[AI Certification Description] ✅ Cache HIT - Saved API cost!');
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
    
    console.log('[AI Certification Description] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.7,
      maxTokens: 1000
    });

    const requestDuration = Date.now() - startTime;
    const tokensUsed = Math.ceil(prompt.length / 4) + Math.ceil((text || '').length / 4);
    
    await trackAIRequest({
      userId,
      contentType: 'work-experience',
      cached: false,
      success: true,
      tokensUsed,
      requestDuration,
    });

    const responseData = { 
      description: text?.trim() || '' 
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Certification Description] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Error generating certification description:', error);
    
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
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
}