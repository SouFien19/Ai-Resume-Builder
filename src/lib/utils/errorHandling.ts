/**
 * Error Handling Utilities
 * Centralized error handling with Sentry integration
 */

import * as Sentry from '@sentry/nextjs';
import { analytics } from '../analytics/posthog';

export interface ErrorContext {
  userId?: string;
  resumeId?: string;
  feature?: string;
  metadata?: Record<string, any>;
}

/**
 * Capture and log errors
 */
export function captureError(
  error: Error | unknown,
  context?: ErrorContext
) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error('[Error]', errorMessage, context);
  
  // Send to Sentry
  Sentry.captureException(error, {
    tags: {
      feature: context?.feature,
    },
    extra: {
      ...context?.metadata,
      userId: context?.userId,
      resumeId: context?.resumeId,
    },
    level: 'error',
  });
  
  // Track in analytics
  analytics.errorOccurred(errorMessage, {
    feature: context?.feature,
    stack: errorStack,
  });
}

/**
 * Capture API errors
 */
export function captureAPIError(
  error: Error | unknown,
  endpoint: string,
  context?: ErrorContext
) {
  console.error(`[API Error] ${endpoint}:`, error);
  
  Sentry.captureException(error, {
    tags: {
      api_endpoint: endpoint,
      feature: context?.feature,
    },
    extra: {
      ...context?.metadata,
      endpoint,
    },
    level: 'error',
  });
  
  analytics.errorOccurred(`API Error: ${endpoint}`, {
    endpoint,
    ...context,
  });
}

/**
 * Capture AI errors (for monitoring AI service failures)
 */
export function captureAIError(
  error: Error | unknown,
  aiFeature: string,
  context?: ErrorContext
) {
  console.error(`[AI Error] ${aiFeature}:`, error);
  
  Sentry.captureException(error, {
    tags: {
      ai_feature: aiFeature,
      service: 'gemini',
    },
    extra: {
      ...context?.metadata,
      feature: aiFeature,
    },
    level: 'error',
  });
  
  analytics.errorOccurred(`AI Error: ${aiFeature}`, {
    aiFeature,
    ...context,
  });
}

/**
 * Capture performance issues
 */
export function capturePerformanceIssue(
  message: string,
  duration: number,
  context?: ErrorContext
) {
  console.warn(`[Performance] ${message}:`, duration, 'ms');
  
  Sentry.captureMessage(message, {
    level: 'warning',
    tags: {
      type: 'performance',
    },
    extra: {
      duration,
      ...context?.metadata,
    },
  });
}

/**
 * Set user context for error tracking
 */
export function setErrorUserContext(userId: string, email?: string, username?: string) {
  Sentry.setUser({
    id: userId,
    email,
    username,
  });
}

/**
 * Clear user context (on logout)
 */
export function clearErrorUserContext() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Wrap async functions with error handling
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error, context);
      throw error;
    }
  }) as T;
}

/**
 * Wrap API routes with error handling
 */
export async function handleAPIError<T>(
  handler: () => Promise<T>,
  endpoint: string,
  context?: ErrorContext
): Promise<T> {
  try {
    return await handler();
  } catch (error) {
    captureAPIError(error, endpoint, context);
    throw error;
  }
}
