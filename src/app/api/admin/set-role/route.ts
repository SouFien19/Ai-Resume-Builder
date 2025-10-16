import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { setUserRole, isSuperAdmin, type UserRole } from '@/lib/utils/clerkMetadata';

/**
 * API Route: Set User Role
 * 
 * This endpoint allows superadmins to promote/demote users
 * 
 * Usage:
 * POST /api/admin/set-role
 * Body: { "userId": "user_xxx", "role": "admin" | "superadmin" | "user" }
 */
export async function POST(req: Request) {
  try {
    // Check if current user is superadmin
    const { userId: currentUserId } = await auth();
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Unauthorized - Not logged in' },
        { status: 401 }
      );
    }
    
    // Only superadmins can change roles
    const isSuperAdminUser = await isSuperAdmin();
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Forbidden - Only superadmins can change roles' },
        { status: 403 }
      );
    }
    
    // Get request body
    const body = await req.json();
    const { userId, role } = body;
    
    // Validate input
    if (!userId || !role) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, role' },
        { status: 400 }
      );
    }
    
    // Validate role
    const validRoles: UserRole[] = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be: user, admin, or superadmin' },
        { status: 400 }
      );
    }
    
    // Set the role
    await setUserRole(userId, role);
    
    return NextResponse.json({
      success: true,
      message: `User role updated to ${role}`,
      userId,
      newRole: role,
    });
    
  } catch (error) {
    console.error('[SET ROLE] ❌ Error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check current user's role
 */
export async function GET() {
  try {
    const { userId, sessionClaims } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const role = (sessionClaims?.metadata as any)?.role || 'user';
    
    return NextResponse.json({
      userId,
      role,
      isSuperAdmin: role === 'superadmin',
      isAdmin: role === 'admin' || role === 'superadmin',
    });
    
  } catch (error) {
    console.error('[GET ROLE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
