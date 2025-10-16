import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { generateText } from '@/lib/ai/gemini';
import ContentGeneration from '@/lib/database/models/ContentGeneration';
import connectToDatabase from '@/lib/database/connection';
import { logger } from '@/lib/logger';
import { getCache, setCache, CacheKeys } from '@/lib/redis';
import { trackAIRequest } from '@/lib/ai/track-analytics';
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

    // Parse request body
    const body = await req.json();
    const { 
      prompt, 
      postType = 'professional-update',
      tone = 'professional',
      includeHashtags = true,
      targetAudience = 'professional-network',
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

    // Create the AI system prompt
    const systemPrompt = `You are a LinkedIn content strategist and social media expert specializing in professional networking content.

Generate an engaging LinkedIn post based on the following requirements:

**Post Type**: ${postType}
**Tone**: ${tone}
**Target Audience**: ${targetAudience}
**Industry**: ${industry || 'general professional'}
**Include Hashtags**: ${includeHashtags ? 'Yes' : 'No'}

... (rest of your guidelines here) ...

**User Input:**
${prompt}

**Additional Context:**
${JSON.stringify(additionalContext, null, 2)}

Generate a LinkedIn post that would generate meaningful engagement and reflect well on the author's professional brand.`;

    // Create cache key from prompt hash
    const promptHash = crypto.createHash('sha256').update(systemPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<any>(cacheKey);
    if (cached) {
      console.log('[AI LinkedIn Post] ✅ Cache HIT - Saved API cost!');
      const requestDuration = Date.now() - startTime;
      await trackAIRequest({
        userId,
        contentType: 'linkedin-post',
        cached: true,
        success: true,
        requestDuration,
      });
      return NextResponse.json(cached, { headers: { 'X-Cache': 'HIT', 'X-Cost-Saved': 'true' }});
    }
    
    console.log('[AI LinkedIn Post] ⚠️ Cache MISS - Calling AI API');

    // Generate using shared library (uses gemini-2.0-flash-exp)
    logger.info('LinkedIn post generation started', { userId, postType });
    
    let generatedContent = await generateText(systemPrompt, {
      temperature: 0.8,
      maxTokens: 1500
    });

    // Clean markdown if present
    generatedContent = generatedContent.replace(/```\s*/g, '').trim();
    const processingTime = Date.now() - startTime;

    // Quality score
    const qualityScore = calculateLinkedInQuality(generatedContent);

    // Save to database
    await connectToDatabase();
    const contentRecord = new ContentGeneration({
      userId,
      contentType: 'linkedin-post',
      prompt,
      generatedContent,
      metadata: {
        model: 'gemini-2.0-flash-exp',
        processingTime,
        temperature: 0.8,
        qualityScore,
        industry,
        additionalContext: {
          ...additionalContext,
          postType,
          tone,
          includeHashtags,
          targetAudience
        },
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
      contentType: 'linkedin-post',
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
          characterCount: generatedContent.length,
          hasHashtags: generatedContent.includes('#'),
          estimatedReach: calculateEstimatedReach(generatedContent)
        }
      }
    };
    
    // Cache for 1 hour
    await setCache(cacheKey, responseData, 3600);
    console.log('[AI LinkedIn Post] ✅ Cached response for 1 hour');

    return NextResponse.json(responseData, { headers: { 'X-Cache': 'MISS' }});

  } catch (error) {
    console.error('LinkedIn post generation error:', error);
    
    const { userId: errorUserId } = await auth();
    if (errorUserId) {
      await trackAIRequest({
        userId: errorUserId,
        contentType: 'linkedin-post',
        cached: false,
        success: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate LinkedIn post',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions (unchanged)
function calculateLinkedInQuality(content: string): number {
  let score = 50;
  const wordCount = content.split(/\s+/).length;
  const lines = content.split('\n').filter(line => line.trim().length > 0);
  const hasHashtags = content.includes('#');
  const hasMention = content.includes('@');
  const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);

  if (wordCount >= 100 && wordCount <= 300) score += 20;
  else if (wordCount >= 50 && wordCount <= 400) score += 10;
  else if (wordCount < 30 || wordCount > 500) score -= 15;

  if (lines.length >= 3) score += 10;
  if (content.includes('?')) score += 5;
  if (hasHashtags) score += 10;
  if (hasMention) score += 5;
  if (hasEmoji) score += 5;

  const engagementWords = [
    'what do you think', 'share your', 'comment below', 'thoughts?',
    'experience', 'agree?', 'perspective', 'insights', 'discussion'
  ];
  const engagementScore = engagementWords.filter(word => 
    content.toLowerCase().includes(word.toLowerCase())
  ).length;
  score += Math.min(engagementScore * 3, 15);

  const professionalWords = [
    'career', 'growth', 'leadership', 'team', 'success', 'achievement',
    'learning', 'innovation', 'collaboration', 'opportunity', 'network'
  ];
  const professionalScore = professionalWords.filter(word => 
    content.toLowerCase().includes(word.toLowerCase())
  ).length;
  score += Math.min(professionalScore * 2, 10);

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateEstimatedReach(content: string): string {
  const wordCount = content.split(/\s+/).length;
  const hasHashtags = content.includes('#');
  const hasQuestion = content.includes('?');
  const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(content);

  let reachScore = 0;
  if (wordCount >= 100 && wordCount <= 300) reachScore += 3;
  if (hasHashtags) reachScore += 2;
  if (hasQuestion) reachScore += 2;
  if (hasEmoji) reachScore += 1;

  if (reachScore >= 6) return 'High';
  else if (reachScore >= 4) return 'Medium';
  else return 'Low';
}
