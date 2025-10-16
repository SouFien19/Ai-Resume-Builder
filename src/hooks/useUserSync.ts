/**
 * User Auto-Sync Hook
 * Automatically syncs Clerk user to MongoDB on mount
 */

'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';

export function useUserSync() {
  const { user, isLoaded } = useUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session
    if (!isLoaded || !user || hasSynced.current) {
      return;
    }

    const syncUser = async () => {
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            hasSynced.current = true;
          }
        }
      } catch (error) {
        // Silently fail - will retry on next page load
      }
    };

    syncUser();
  }, [isLoaded, user]);
}
