/**
 * Admin Authentication Hook
 * Client-side hook to check admin role and permissions
 */

'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export type UserRole = 'user' | 'admin' | 'superadmin';

interface AdminAuthState {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  role: UserRole;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const { user, isLoaded } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkRole = async () => {
    if (!isLoaded || !user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const response = await fetch('/api/admin/check-role');
      
      if (response.ok) {
        const data = await response.json();
        setRole(data.role);
        setIsAdmin(data.isAdmin);
        setIsSuperAdmin(data.isSuperAdmin);
      } else {
        setError('Failed to check admin role');
        setRole('user');
        setIsAdmin(false);
        setIsSuperAdmin(false);
      }
    } catch (err) {
      console.error('Failed to check admin role:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setRole('user');
      setIsAdmin(false);
      setIsSuperAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRole();
  }, [isLoaded, user?.id]);

  return {
    isAdmin,
    isSuperAdmin,
    role,
    loading,
    error,
    refetch: checkRole,
  };
}

/**
 * Hook to check if current user has specific permission
 */
export function useAdminPermission(requiredRole: UserRole = 'admin'): boolean {
  const { role } = useAdminAuth();

  const roleHierarchy: Record<UserRole, number> = {
    user: 0,
    admin: 1,
    superadmin: 2,
  };

  return roleHierarchy[role] >= roleHierarchy[requiredRole];
}
