/**
 * User Role Hook
 * Get current user's role from MongoDB and handle role-based redirects
 */

'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';

export type UserRole = 'user' | 'admin' | 'superadmin';

interface UseUserRoleReturn {
  role: UserRole | null;
  isLoading: boolean;
  isUser: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  redirectToDashboard: () => void;
}

export function useUserRole(): UseUserRoleReturn {
  const { user, isLoaded } = useUser();
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !user) {
      setIsLoading(false);
      return;
    }

    const fetchRole = async () => {
      try {
        const response = await fetch('/api/user/role');
        const data = await response.json();

        if (data.success && data.role) {
          setRole(data.role);
        } else {
          setRole('user'); // Default fallback
        }
      } catch (error) {
        console.error('[useUserRole] Failed to fetch user role:', error);
        setRole('user'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    };

    fetchRole();
  }, [isLoaded, user]);

  const redirectToDashboard = () => {
    if (role === 'user') {
      if (!pathname?.startsWith('/dashboard')) {
        router.push('/dashboard');
      }
    } else if (role === 'admin' || role === 'superadmin') {
      if (!pathname?.startsWith('/admin')) {
        router.push('/admin');
      }
    }
  };

  return {
    role,
    isLoading,
    isUser: role === 'user',
    isAdmin: role === 'admin',
    isSuperAdmin: role === 'superadmin',
    redirectToDashboard,
  };
}
