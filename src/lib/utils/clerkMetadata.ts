import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export type UserRole = 'user' | 'admin' | 'superadmin';

/**
 * Get user role from Clerk JWT metadata (no DB query needed)
 * This is FAST - role is stored in the JWT token
 */
export async function getUserRole(): Promise<UserRole> {
  const { sessionClaims } = await auth();
  const metadata = sessionClaims?.metadata as { role?: UserRole };
  return metadata?.role || 'user';
}

/**
 * Update user role in Clerk metadata
 * This will be available in JWT immediately after next token refresh
 */
export async function setUserRole(userId: string, role: UserRole): Promise<void> {
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: {
      role,
    },
  });
}

/**
 * Check if current user is admin or superadmin
 */
export async function isAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'admin' || role === 'superadmin';
}

/**
 * Check if current user is superadmin
 */
export async function isSuperAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === 'superadmin';
}

/**
 * Get user ID from current session
 */
export async function getCurrentUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Require admin access - throws error if not admin
 * Use this in server components/actions
 */
export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    throw new Error('Unauthorized: Admin access required');
  }
}

/**
 * Require superadmin access - throws error if not superadmin
 * Use this in server components/actions
 */
export async function requireSuperAdmin() {
  const superadmin = await isSuperAdmin();
  if (!superadmin) {
    throw new Error('Unauthorized: Super admin access required');
  }
}
