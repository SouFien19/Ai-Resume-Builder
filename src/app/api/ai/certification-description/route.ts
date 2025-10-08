import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from '@/lib/ai/gemini';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
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

Requirements:
- 1-2 sentences maximum
- Highlight the skills, knowledge, or expertise gained
- Mention practical applications or industry relevance
- Use professional language suitable for resumes
- Be specific about what this certification demonstrates
- Include any notable achievements or recognition if relevant

Return only the description text, no other formatting.`;

    // Check cache
    const promptHash = crypto.createHash('sha256').update(prompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    const cached = await getCache<{ description: string }>(cacheKey);
    if (cached) {
      console.log('[AI Certification Description] ✅ Cache HIT - Saved API cost!');
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Certification Description] ⚠️ Cache MISS - Calling AI API');

    const text = await generateText(prompt, { 
      temperature: 0.7,
      maxTokens: 1000
    });

    const responseData = { 
      description: text?.trim() || '' 
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Certification Description] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Certification description generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate certification description' },
      { status: 500 }
    );
  }
}