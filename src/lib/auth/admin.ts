/**
 * Admin Authentication & Authorization
 * Middleware to protect admin routes and log admin actions
 */

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import AdminLog from "@/lib/database/models/AdminLog";

export async function requireAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    redirect("/dashboard");
  }

  if (user.role !== 'admin' && user.role !== 'superadmin') {
    redirect("/dashboard");
  }

  return { user, userId };
}

export async function requireSuperAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    redirect("/dashboard");
  }

  if (user.role !== 'superadmin') {
    redirect("/dashboard");
  }

  return { user, userId };
}

/**
 * API Route Admin Auth - Returns NextResponse for API routes
 */
export async function requireAdminAPI(
  minRole: 'admin' | 'superadmin' = 'admin'
): Promise<{ userId: string; email: string; role: string; user: any } | NextResponse> {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  await dbConnect();
  const user = await User.findOne({ clerkId: userId });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  // Check if user is suspended
  if (user.isSuspended) {
    return NextResponse.json(
      { error: 'Account is suspended', reason: user.suspendedReason },
      { status: 403 }
    );
  }

  // Check role hierarchy
  const roleHierarchy: Record<string, number> = {
    user: 0,
    admin: 1,
    superadmin: 2,
  };

  const requiredLevel = minRole === 'superadmin' ? 2 : 1;
  const userLevel = roleHierarchy[user.role] || 0;

  if (userLevel < requiredLevel) {
    return NextResponse.json(
      { error: 'Insufficient permissions', required: minRole, current: user.role },
      { status: 403 }
    );
  }

  return {
    userId: user.clerkId,
    email: user.email,
    role: user.role,
    user,
  };
}

/**
 * Log admin action to audit trail
 */
export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: 'user' | 'resume' | 'template' | 'system' | 'settings' | 'analytics',
  targetId: string | undefined,
  details: Record<string, any>,
  req: NextRequest,
  status: 'success' | 'failed' | 'pending' = 'success',
  errorMessage?: string
) {
  try {
    await dbConnect();
    
    const ipAddress = 
      req.headers.get('x-forwarded-for')?.split(',')[0] ||
      req.headers.get('x-real-ip') ||
      'unknown';
    
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    await AdminLog.create({
      adminId,
      adminEmail,
      action: action.toUpperCase(),
      targetType,
      targetId,
      details,
      ipAddress,
      userAgent,
      status,
      errorMessage,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
    // Don't throw - logging should never break the main flow
  }
}

export async function checkAdminRole(userId: string) {
  await dbConnect();
  const user = await User.findOne({ clerkId: userId });
  
  return {
    isAdmin: user?.role === 'admin' || user?.role === 'superadmin',
    isSuperAdmin: user?.role === 'superadmin',
    role: user?.role || 'user'
  };
}

export async function getUserRole(userId: string) {
  await dbConnect();
  const user = await User.findOne({ clerkId: userId });
  return user?.role || 'user';
}
