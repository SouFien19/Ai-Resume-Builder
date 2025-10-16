'use client'

import { useReportWebVitals } from 'next/web-vitals'
import * as Sentry from '@sentry/nextjs';
import { posthog } from '@/lib/analytics/posthog';

/**
 * Web Vitals Performance Monitoring
 * Tracks Core Web Vitals and sends to analytics
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.id,
        non_interaction: true,
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
        metric_rating: metric.rating,
      })
    }
    
    // Send to PostHog
    if (typeof window !== 'undefined') {
      try {
        posthog.capture('web_vital', {
          name: metric.name,
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      } catch (error) {
        console.error('[Web Vitals] PostHog error:', error);
      }
    }
    
    // Send to Sentry
    try {
      Sentry.captureMessage(`Web Vital: ${metric.name}`, {
        level: metric.rating === 'good' ? 'info' : 'warning',
        tags: {
          web_vital: metric.name,
          rating: metric.rating,
        },
        extra: {
          value: metric.value,
          delta: metric.delta,
          id: metric.id,
        },
      });
    } catch (error) {
      console.error('[Web Vitals] Sentry error:', error);
    }

    // Log metrics in development for debugging
    if (process.env.NODE_ENV === 'development') {
      const metrics = {
        name: metric.name,
        value: Math.round(metric.value),
        rating: metric.rating,
        delta: Math.round(metric.delta),
        id: metric.id,
      }

      // Color code based on rating
      const colorMap: Record<string, string> = {
        good: '\x1b[32m',      // Green
        'needs-improvement': '\x1b[33m', // Yellow
        poor: '\x1b[31m',       // Red
      }
      const color = colorMap[metric.rating] || '\x1b[0m'

      console.log(
        `${color}[Web Vitals]`,
        `${metric.name}:`,
        `${Math.round(metric.value)}ms`,
        `(${metric.rating})\x1b[0m`
      )
    }
  })

  return null
}
