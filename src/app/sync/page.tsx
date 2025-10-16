'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SyncUserPage() {
  const [status, setStatus] = useState<'syncing' | 'success' | 'error'>('syncing');
  const [message, setMessage] = useState('Syncing your account...');
  const router = useRouter();

  useEffect(() => {
    const syncUser = async () => {
      try {
        const response = await fetch('/api/sync-user', {
          method: 'POST',
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus('success');
          setMessage('✅ Account synced successfully!');
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(`❌ Sync failed: ${data.error || 'Unknown error'}`);
        }
      } catch (error) {
        setStatus('error');
        setMessage(`❌ Sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };

    syncUser();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            {status === 'syncing' && (
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            )}
            {status === 'success' && (
              <div className="text-6xl">✅</div>
            )}
            {status === 'error' && (
              <div className="text-6xl">❌</div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {status === 'syncing' && 'Syncing Account'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Error'}
          </h1>

          <p className="text-gray-600 mb-6">
            {message}
          </p>

          {status === 'success' && (
            <p className="text-sm text-gray-500">
              Redirecting to dashboard...
            </p>
          )}

          {status === 'error' && (
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
