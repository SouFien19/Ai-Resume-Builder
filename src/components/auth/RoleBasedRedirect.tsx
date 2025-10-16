/**
 * Role-Based Redirect Component
 * Automatically redirects users to their appropriate dashboard based on role
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface RoleBasedRedirectProps {
  children?: React.ReactNode;
  fallbackUrl?: string;
}

export function RoleBasedRedirect({ children, fallbackUrl = '/dashboard' }: RoleBasedRedirectProps) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const [syncing, setSyncing] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      return;
    }

    let redirectTimeout: NodeJS.Timeout;

    const syncAndRedirect = async () => {
      try {
        // Set a fallback timeout (10 seconds)
        redirectTimeout = setTimeout(() => {
          router.replace(fallbackUrl);
        }, 10000);

        // First, sync the user to MongoDB
        const syncResponse = await fetch('/api/sync-user', {
          method: 'POST',
        });

        if (!syncResponse.ok) {
          console.error('[RoleBasedRedirect] Failed to sync user:', syncResponse.status);
        }

        // Then, get the user's role
        const roleResponse = await fetch('/api/user/role');
        
        if (roleResponse.ok) {
          const data = await roleResponse.json();
          const userRole = data.role || 'user';
          setRole(userRole);

          // Clear the timeout since we're about to redirect
          clearTimeout(redirectTimeout);

          // Small delay to show the role on screen
          await new Promise(resolve => setTimeout(resolve, 1000));

          // Redirect based on role
          if (userRole === 'admin' || userRole === 'superadmin') {
            window.location.href = '/admin';
          } else {
            window.location.href = '/dashboard';
          }
        } else {
          console.error('[RoleBasedRedirect] Could not fetch role, redirecting to dashboard');
          clearTimeout(redirectTimeout);
          router.replace(fallbackUrl);
        }
      } catch (error) {
        console.error('[RoleBasedRedirect] Error during sync/redirect:', error);
        clearTimeout(redirectTimeout);
        router.replace(fallbackUrl);
      } finally {
        setSyncing(false);
      }
    };

    syncAndRedirect();

    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [isLoaded, isSignedIn, user, router, fallbackUrl]);

  // Show loading state while syncing and determining redirect
  if (!isLoaded || syncing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            {syncing ? 'Setting up your dashboard...' : 'Loading...'}
          </p>
          {role && (
            <p className="text-sm text-gray-500 mt-2">
              {role === 'superadmin' ? '👑 Super Admin' : role === 'admin' ? '🛡️ Admin' : '👤 User'}
            </p>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
