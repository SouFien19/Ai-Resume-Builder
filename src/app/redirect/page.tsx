/**
 * Post-Login Redirect Page
 * Automatically redirects users to their appropriate dashboard based on role
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [redirecting, setRedirecting] = useState(false);
  const [roleInfo, setRoleInfo] = useState<string>('');

  useEffect(() => {
    const handleRedirect = async () => {
      // Wait for Clerk to load
      if (!isLoaded) {
        console.log('[REDIRECT] Waiting for Clerk to load...');
        return;
      }

      // If not signed in, go to sign-in page
      if (!isSignedIn) {
        console.log('[REDIRECT] Not signed in, redirecting to sign-in');
        router.replace('/sign-in');
        return;
      }

      if (redirecting) {
        return; // Prevent double execution
      }

      setRedirecting(true);

      try {
        console.log('[REDIRECT] 🚀 Starting redirect process for:', user?.emailAddresses[0]?.emailAddress);
        
        // Sync user to database
        console.log('[REDIRECT] 📡 Syncing user...');
        await fetch('/api/sync-user', { method: 'POST' });
        
        // Fetch user role
        console.log('[REDIRECT] 🔍 Fetching role...');
        const response = await fetch('/api/auth/redirect');
        
        if (!response.ok) {
          throw new Error('Failed to fetch redirect URL');
        }

        const data = await response.json();
        console.log('[REDIRECT] 👤 Role:', data.role);
        console.log('[REDIRECT] 🎯 Redirecting to:', data.redirectUrl);
        
        setRoleInfo(data.role === 'superadmin' ? '👑 Super Admin' : data.role === 'admin' ? '🛡️ Admin' : '👤 User');
        
        // Small delay to show role
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Redirect to appropriate dashboard
        window.location.href = data.redirectUrl;
      } catch (error) {
        console.error('[REDIRECT] ❌ Error:', error);
        // Default to dashboard on error
        router.replace('/dashboard');
      }
    };

    handleRedirect();
  }, [isLoaded, isSignedIn, user, redirecting, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
        <p className="text-white text-lg font-medium">
          Redirecting to your dashboard...
        </p>
        {roleInfo && (
          <p className="text-pink-400 text-sm">
            {roleInfo}
          </p>
        )}
      </div>
    </div>
  );
}
