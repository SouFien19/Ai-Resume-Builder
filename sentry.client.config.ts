/**
 * Sentry Error Tracking - Client Configuration
 * Captures frontend errors and performance metrics
 */

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NODE_ENV;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Environment
    environment: ENVIRONMENT,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
    
    // Performance Monitoring
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,
    
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Error filtering
    beforeSend(event, hint) {
      // Don't send errors in development
      if (ENVIRONMENT === 'development') {
        console.error('[Sentry]', hint.originalException || hint.syntheticException);
        return null;
      }
      
      // Filter out known issues
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = (error as Error).message;
        
        // Ignore common browser errors
        if (
          message.includes('ResizeObserver loop') ||
          message.includes('Non-Error promise rejection') ||
          message.includes('Loading chunk')
        ) {
          return null;
        }
      }
      
      return event;
    },
    
    // Ignore specific errors
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      /Loading chunk [\d]+ failed/,
      'Network request failed',
      'NetworkError',
    ],
    
    // Debug mode
    debug: ENVIRONMENT === 'development',
  });
  
  console.log('[Sentry] Error tracking initialized');
} else {
  console.warn('[Sentry] DSN not found. Error tracking disabled.');
}
