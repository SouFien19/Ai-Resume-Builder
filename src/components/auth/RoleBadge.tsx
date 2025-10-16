/**
 * Role Badge Component
 * Displays user role badge next to UserButton
 */

'use client';

import { useUserRole } from '@/hooks/useUserRole';
import { Shield, Crown } from 'lucide-react';

export function RoleBadge() {
  const { role, isLoading } = useUserRole();

  if (isLoading || role === 'user') {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {role === 'superadmin' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-semibold rounded-full">
          <Crown className="h-3 w-3" />
          <span>Super Admin</span>
        </div>
      )}
      {role === 'admin' && (
        <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold rounded-full">
          <Shield className="h-3 w-3" />
          <span>Admin</span>
        </div>
      )}
    </div>
  );
}
