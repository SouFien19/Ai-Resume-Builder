/**
 * Auth Redirect API
 * Determines redirect URL based on user role
 * GET /api/auth/redirect
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/utils/clerkMetadata';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { redirectUrl: '/sign-in' },
        { status: 401 }
      );
    }

    // Get user role from JWT metadata (fast - no DB query)
    const role = await getUserRole();

    // Determine redirect based on role
    const redirectUrl = role === 'user' ? '/dashboard' : '/admin';

    return NextResponse.json({
      success: true,
      role,
      redirectUrl,
    });
  } catch (error) {
    console.error('[AUTH REDIRECT] Error:', error);
    // Default to dashboard on error
    return NextResponse.json({
      success: false,
      redirectUrl: '/dashboard',
    });
  }
}
