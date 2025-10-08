/**
 * Content Generation API
 * Generates resume content using AI
 */

import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateText } from "@/lib/ai/gemini";
import { handleAPIError, APIErrors } from "@/lib/api/error-handler";
import { successResponse } from "@/lib/api/response";
import { AIGenerationSchema } from "@/lib/validation/schemas";
import { sanitizeInput, truncate } from "@/lib/validation/sanitizers";
import { logger } from "@/lib/logger";
import dbConnect from "@/lib/database/connection";
import ContentGeneration from "@/lib/database/models/ContentGeneration";
import { getCache, setCache, CacheKeys } from "@/lib/redis";
import crypto from "crypto";

const MAX_CONTEXT_LENGTH = 5000;

export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = await auth();
    if (!userId) {
      throw APIErrors.Unauthorized();
    }

    // Parse and validate request body
    const body = await req.json();
    const validated = AIGenerationSchema.parse(body);

    // Sanitize inputs
    const prompt = sanitizeInput(validated.prompt);
    const context = validated.context
      ? sanitizeInput(truncate(validated.context, MAX_CONTEXT_LENGTH))
      : "";

    logger.info("Content generation requested", {
      userId,
      promptLength: prompt.length,
      hasContext: !!context,
    });

    // Create cache key from prompt hash (1-hour cache for duplicate prompts)
    const fullPrompt = context ? `${prompt}\n\nContext: ${context}` : prompt;
    const promptHash = crypto.createHash('sha256').update(fullPrompt).digest('hex').substring(0, 16);
    const cacheKey = CacheKeys.ai.response(promptHash);
    
    // Check cache first
    const cached = await getCache<{ content: string; prompt: string }>(cacheKey);
    if (cached) {
      console.log('[AI Generation] ✅ Returned from cache (fast!) - Saved API cost!');
      return successResponse(cached, {
        'X-Cache': 'HIT',
        'X-Cache-Key': cacheKey,
        'X-Cost-Saved': 'true'
      });
    }
    
    console.log('[AI Generation] ⚠️ Cache MISS - calling AI API (slow & costs money)');

    // Generate content with AI
    const text = await generateText(
      fullPrompt,
      {
        maxTokens: validated.maxTokens || 1000,
        temperature: validated.temperature || 0.7,
      }
    );

    logger.info("Content generated", {
      userId,
      outputLength: text.length,
    });

    const result = {
      content: text,
      prompt,
    };

    // Cache AI response for 1 hour (3600 seconds)
    await setCache(cacheKey, result, 3600);
    console.log('[AI Generation] ✅ Cached AI response for 1 hour');

    // Save to database
    try {
      await dbConnect();
      
      await ContentGeneration.create({
        userId, // Use Clerk ID directly (as string)
        contentType: validated.contentType || 'resume-summary',
        prompt,
        generatedContent: text,
        metadata: {
          model: 'gemini-pro',
          tokens: {
            input: prompt.length + (context?.length || 0),
            output: text.length,
            total: prompt.length + (context?.length || 0) + text.length,
          },
          quality: 80,
          processingTime: 0,
        },
      });

      logger.info("Content generation saved to database", { userId });
    } catch (dbError) {
      logger.error("Failed to save content generation", { error: dbError, userId });
    }

    return successResponse(result, {
      'X-Cache': 'MISS',
      'X-Cache-Key': cacheKey
    });
  } catch (error) {
    logger.error("Content generation failed", { error });
    return handleAPIError(error);
  }
}

export async function GET() {
  return successResponse({
    message: "Content generation endpoint - use POST to generate content",
    status: "active",
  });
}
