/**
 * PostHog Analytics Configuration
 * Client-side analytics for user behavior tracking
 */

import posthog from 'posthog-js';

let posthogInitialized = false;

export function initPostHog() {
  if (typeof window === 'undefined') return;
  if (posthogInitialized) return;
  
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';
  
  if (!apiKey) {
    console.warn('[PostHog] API key not found. Analytics disabled.');
    return;
  }
  
  posthog.init(apiKey, {
    api_host: '/ingest', // Use reverse proxy to bypass ad blockers
    ui_host: apiHost, // Keep original host for UI features
    autocapture: true,
    capture_pageview: true,
    capture_pageleave: true,
    persistence: 'localStorage',
    // Respect user privacy
    respect_dnt: true,
    // Disable in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') {
        posthog.opt_out_capturing();
      }
    },
  });
  
  posthogInitialized = true;
  console.log('[PostHog] Analytics initialized');
}

export { posthog };

/**
 * Analytics Event Tracking
 * Centralized event tracking for the application
 */
export const analytics = {
  // Page Views
  pageView: (url: string) => {
    posthog.capture('$pageview', { url });
  },
  
  // Authentication Events
  signUpStarted: () => {
    posthog.capture('signup_started');
  },
  
  signUpCompleted: (method: string, userId?: string) => {
    posthog.capture('signup_completed', { method });
    if (userId) posthog.identify(userId);
  },
  
  signInCompleted: (method: string, userId?: string) => {
    posthog.capture('signin_completed', { method });
    if (userId) posthog.identify(userId);
  },
  
  signOut: () => {
    posthog.capture('signout');
    posthog.reset();
  },
  
  // Resume Events
  resumeCreationStarted: () => {
    posthog.capture('resume_creation_started');
  },
  
  templateSelected: (templateId: string, templateName?: string) => {
    posthog.capture('template_selected', { 
      templateId, 
      templateName 
    });
  },
  
  resumeSaved: (resumeId: string, isNew: boolean = false) => {
    posthog.capture('resume_saved', { 
      resumeId, 
      isNew,
      action: isNew ? 'create' : 'update'
    });
  },
  
  resumeDeleted: (resumeId: string) => {
    posthog.capture('resume_deleted', { resumeId });
  },
  
  resumeDownloaded: (resumeId: string, format: 'pdf' | 'docx' | 'txt') => {
    posthog.capture('resume_downloaded', { 
      resumeId, 
      format 
    });
  },
  
  resumeShared: (resumeId: string, method: string) => {
    posthog.capture('resume_shared', { resumeId, method });
  },
  
  // AI Feature Events
  aiFeatureUsed: (feature: string, creditsUsed: number = 1) => {
    posthog.capture('ai_feature_used', { 
      feature, 
      creditsUsed 
    });
  },
  
  aiContentGenerated: (contentType: string, wordCount?: number) => {
    posthog.capture('ai_content_generated', { 
      contentType, 
      wordCount 
    });
  },
  
  aiSuggestionAccepted: (suggestionType: string) => {
    posthog.capture('ai_suggestion_accepted', { 
      suggestionType 
    });
  },
  
  aiSuggestionRejected: (suggestionType: string) => {
    posthog.capture('ai_suggestion_rejected', { 
      suggestionType 
    });
  },
  
  // ATS Events
  atsAnalysisStarted: (resumeId: string) => {
    posthog.capture('ats_analysis_started', { resumeId });
  },
  
  atsScoreReceived: (resumeId: string, score: number) => {
    posthog.capture('ats_score_received', { 
      resumeId, 
      score,
      scoreRange: score >= 80 ? 'excellent' : score >= 60 ? 'good' : 'needs_improvement'
    });
  },
  
  // Job Matcher Events
  jobMatchStarted: (resumeId: string) => {
    posthog.capture('job_match_started', { resumeId });
  },
  
  jobMatchCompleted: (resumeId: string, matchScore: number) => {
    posthog.capture('job_match_completed', { 
      resumeId, 
      matchScore 
    });
  },
  
  // Subscription/Payment Events
  pricingPageViewed: () => {
    posthog.capture('pricing_page_viewed');
  },
  
  upgradeButtonClicked: (plan: string) => {
    posthog.capture('upgrade_button_clicked', { plan });
  },
  
  checkoutStarted: (plan: string, price: number) => {
    posthog.capture('checkout_started', { plan, price });
  },
  
  subscriptionCreated: (plan: string, price: number, interval: string) => {
    posthog.capture('subscription_created', { 
      plan, 
      price, 
      interval 
    });
  },
  
  subscriptionCancelled: (plan: string, reason?: string) => {
    posthog.capture('subscription_cancelled', { 
      plan, 
      reason 
    });
  },
  
  // Feature Usage
  featureUsed: (featureName: string, metadata?: Record<string, any>) => {
    posthog.capture('feature_used', { 
      featureName, 
      ...metadata 
    });
  },
  
  // Error Tracking
  errorOccurred: (error: string, context?: Record<string, any>) => {
    posthog.capture('error_occurred', { 
      error, 
      ...context 
    });
  },
  
  // User Properties
  setUserProperties: (properties: Record<string, any>) => {
    posthog.setPersonProperties(properties);
  },
  
  identifyUser: (userId: string, properties?: Record<string, any>) => {
    posthog.identify(userId, properties);
  },
  
  // Custom Events
  track: (eventName: string, properties?: Record<string, any>) => {
    posthog.capture(eventName, properties);
  },
};

/**
 * React Hook for Analytics
 */
export function useAnalytics() {
  return analytics;
}

/**
 * Feature Flag Support
 */
export function useFeatureFlag(flagName: string): boolean {
  if (typeof window === 'undefined') return false;
  return posthog.isFeatureEnabled(flagName) || false;
}

export function getAllFeatureFlags(): Record<string, boolean | string> {
  if (typeof window === 'undefined') return {};
  // PostHog doesn't have a getAll method, so return empty object
  // Users should check individual flags with useFeatureFlag
  return {};
}
