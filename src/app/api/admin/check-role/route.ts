/**
 * Check Admin Role API
 * GET /api/admin/check-role
 * Returns the current user's role and admin status
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import dbConnect from '@/lib/database/connection';
import User from '@/lib/database/models/User';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findOne({ clerkId: userId }).select('role email').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = (user as any).role === 'admin' || (user as any).role === 'superadmin';
    const isSuperAdmin = (user as any).role === 'superadmin';

    return NextResponse.json({
      role: (user as any).role,
      isAdmin,
      isSuperAdmin,
      email: (user as any).email,
    });
  } catch (error) {
    console.error('Check role error:', error);
    return NextResponse.json(
      { error: 'Failed to check role' },
      { status: 500 }
    );
  }
}
