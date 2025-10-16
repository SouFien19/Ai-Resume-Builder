import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from '@/lib/ai/gemini';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import connectToDatabase from '@/lib/database/connection';
import { logger } from '@/lib/logger';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import { trackAIRequest } from '@/lib/ai/track-analytics';
import { checkRateLimit, aiRateLimiter } from '@/lib/middleware/rateLimiter';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await connectToDatabase();

    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
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

    // Parse request body
    const body = await req.json();
    const { 
      prompt, 
      targetRole, 
      targetCompany, 
      experienceLevel = 'mid',
      industry,
      additionalContext = {}
    } = body;

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Create the AI prompt for cover letter generation
    const systemPrompt = `You are an expert career coach and professional writer specializing in creating compelling cover letters. 

Generate a professional, personalized cover letter based on the following requirements:

**Role**: ${targetRole || 'the position'}
**Company**: ${targetCompany || 'the company'}
**Experience Level**: ${experienceLevel}
**Industry**: ${industry || 'general'}

**Guidelines:**
- Keep it concise and impactful (3-4 paragraphs, 250-400 words)
- Start with a strong opening that grabs attention
- Highlight relevant skills and achievements with specific examples
- Show genuine interest in the company and role
- End with a confident call to action
- Use professional yet engaging tone
- Avoid generic templates - make it personal and specific
- Include quantifiable achievements where possible
- Address potential gaps or career changes positively

**User Input:**
${prompt}

**Additional Context:**
${JSON.stringify(additionalContext, null, 2)}

Generate a professional cover letter that would impress hiring managers and stand out from other applicants.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI Cover Letter] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'cover-letter',
        cached: true,
        success: true,
        requestDuration,
      });
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI Cover Letter] ⚠️ Cache MISS - Calling AI API');

    // Generate using shared library (uses gemini-2.0-flash-exp)
    logger.info('Cover letter generation started', { userId, targetRole, targetCompany });
    
    let generatedContent = await generateText(systemPrompt, {
      temperature: 0.7,
      maxTokens: 1500
    });

    // Clean markdown if present
    generatedContent = generatedContent.replace(/```\s*/g, '').trim();

    const processingTime = Date.now() - startTime;

    // Calculate quality score based on content analysis
    const qualityScore = calculateContentQuality(generatedContent, 'cover-letter');

    // Connect to database and save the generated content
    await connectToDatabase();
    
    const contentRecord = new ContentGeneration({
      userId,
      contentType: 'cover-letter',
      prompt,
      generatedContent,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        processingTime,
        temperature: 0.7,
        qualityScore,
        targetRole,
        targetCompany,
        industry,
        experienceLevel,
        additionalContext,
        tokens: {
          input: systemPrompt.length,
          output: generatedContent.length,
          total: systemPrompt.length + generatedContent.length
        }
      }
    });

    await contentRecord.save();

    const tokensUsed = Math.ceil(systemPrompt.length / 4) + Math.ceil(generatedContent.length / 4);
    
    await trackAIRequest({
      userId,
      contentType: 'cover-letter',
      cached: false,
      success: true,
      tokensUsed,
      requestDuration: processingTime,
    });

    const responseData = {
      success: true,
      data: {
        id: contentRecord._id,
        content: generatedContent,
        metadata: {
          processingTime,
          qualityScore,
          wordCount: generatedContent.split(/\s+/).length,
          characterCount: generatedContent.length
        }
      }
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI Cover Letter] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('Cover letter generation error:', error);
    
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'cover-letter',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate cover letter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    await connectToDatabase();

    const coverLetters = await ContentGeneration.find({
      userId,
      contentType: 'cover-letter'
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .select('generatedContent metadata createdAt userRating isBookmarked');

    const total = await ContentGeneration.countDocuments({
      userId,
      contentType: 'cover-letter'
    });

    return NextResponse.json({
      success: true,
      data: {
        coverLetters,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      }
    });

  } catch (error) {
    console.error('Fetch cover letters error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cover letters' },
      { status: 500 }
    );
  }
}

// Helper function to calculate content quality score
function calculateContentQuality(content: string, contentType: string): number {
  let score = 50; // Base score

  const wordCount = content.split(/\s+/).length;
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);

  // Word count scoring for cover letters
  if (contentType === 'cover-letter') {
    if (wordCount >= 250 && wordCount <= 400) score += 20;
    else if (wordCount >= 200 && wordCount <= 500) score += 10;
    else if (wordCount < 150 || wordCount > 600) score -= 10;
  }

  // Structure scoring
  if (paragraphs.length >= 3 && paragraphs.length <= 5) score += 15;
  else if (paragraphs.length < 2) score -= 15;

  // Sentence variety
  const avgSentenceLength = wordCount / sentences.length;
  if (avgSentenceLength >= 15 && avgSentenceLength <= 25) score += 10;

  // Professional language indicators
  const professionalWords = [
    'experience', 'skills', 'achieved', 'accomplished', 'managed', 'led',
    'developed', 'implemented', 'improved', 'increased', 'successful',
    'expertise', 'proficient', 'responsible', 'collaborated'
  ];
  
  const professionalWordCount = professionalWords.filter(word => 
    content.toLowerCase().includes(word)
  ).length;
  
  score += Math.min(professionalWordCount * 2, 15);

  // Ensure score is within bounds
  return Math.max(0, Math.min(100, Math.round(score)));
}