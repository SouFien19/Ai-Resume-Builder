/**
 * Analytics Provider Component
 * Initializes PostHog analytics on client-side
 */

'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { initPostHog, analytics, posthog } from '@/lib/analytics/posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoaded } = useUser();
  
  // Initialize PostHog
  useEffect(() => {
    initPostHog();
  }, []);
  
  // Track page views
  useEffect(() => {
    if (pathname) {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
      analytics.pageView(url);
    }
  }, [pathname, searchParams]);
  
  // Identify user when loaded
  useEffect(() => {
    if (isLoaded && user) {
      analytics.identifyUser(user.id, {
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        createdAt: user.createdAt,
      });
    }
  }, [isLoaded, user]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        posthog.reset();
      }
    };
  }, []);
  
  return <>{children}</>;
}
