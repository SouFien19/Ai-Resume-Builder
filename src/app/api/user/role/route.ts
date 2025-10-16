/**
 * Role Check API
 * Returns the current user's role from MongoDB
 * GET /api/user/role
 */

import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserRole } from '@/lib/utils/clerkMetadata';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = await getUserRole();

    return NextResponse.json({
      success: true,
      role,
      redirectUrl: role === 'user' ? '/dashboard' : '/admin',
    });
  } catch (error) {
    console.error('[ROLE API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get user role',
        role: 'user',
        redirectUrl: '/dashboard',
      },
      { status: 500 }
    );
  }
}
