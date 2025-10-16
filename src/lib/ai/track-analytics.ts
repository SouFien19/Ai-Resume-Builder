/**
 * AI Analytics Tracking Utility
 * Centralized function to track AI generation requests for admin monitoring
 */

import dbConnect from "@/lib/database/connection";
import AIUsage from "@/lib/database/models/AIUsage";
import Analytics from "@/lib/database/models/Analytics";
import User from "@/lib/database/models/User";

interface TrackAIRequestParams {
  userId: string; // Clerk user ID
  contentType: string;
  model?: string;
  cached: boolean;
  success?: boolean;
  tokensUsed?: number;
  requestDuration?: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Track AI generation request in both AIUsage and Analytics
 * - AIUsage: Detailed metrics for AI Monitoring dashboard
 * - Analytics: General event tracking for admin stats
 */
export async function trackAIRequest({
  userId,
  contentType,
  model = 'gemini-pro',
  cached,
  success = true,
  tokensUsed = 0,
  requestDuration,
  errorMessage,
  metadata = {},
}: TrackAIRequestParams): Promise<void> {
  try {
    await dbConnect();
    
    // Find the MongoDB User document by Clerk ID
    const user = await User.findOne({ clerkId: userId });
    
    if (!user) {
      console.warn(`[AI Analytics] ⚠️ User not found for Clerk ID: ${userId}`);
      return; // Skip tracking if user not in our DB yet
    }
    
    // Map contentType to feature enum
    const featureMap: Record<string, string> = {
      'experience-description': 'content-gen',
      'project-description': 'content-gen',
      'summary': 'content-gen',
      'bullets': 'content-gen',
      'tailored-bullets': 'ats-optimizer',
      'keywords': 'ats-optimizer',
      'ats-score': 'ats-optimizer',
      'job-match': 'job-matcher',
      'skill-gap': 'skill-gap',
      'cover-letter': 'cover-letter',
    };
    
    const feature = featureMap[contentType] || 'content-gen';
    
    // Estimate cost for Gemini (rough estimate: $0.00025 per 1K tokens input + $0.0005 per 1K tokens output)
    // Using average of ~1500 tokens per request, ~$0.0006 per request
    const estimatedCost = cached ? 0 : (tokensUsed > 0 ? (tokensUsed / 1000) * 0.0004 : 0.0006);
    
    // Create AIUsage record for detailed AI Monitoring dashboard
    await AIUsage.create({
      userId: user._id,
      provider: 'gemini',
      aiModel: model,
      feature,
      tokensUsed: tokensUsed || 0,
      cost: estimatedCost,
      success,
      errorMessage,
      requestDuration,
    });
    
    // Also track in Analytics for general admin stats
    await Analytics.create({
      userId: user._id,
      clerkUserId: userId,
      event: 'ai_generation',
      properties: {
        contentType,
        model,
        cached,
        feature,
        cost: estimatedCost,
        success,
        ...metadata,
      },
    });
  } catch (error) {
    // Don't throw - tracking failures shouldn't break AI generation
    console.error("[trackAIRequest] Failed to track AI request:", error);
  }
}
