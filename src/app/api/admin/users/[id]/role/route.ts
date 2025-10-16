/**
 * Admin User Actions API - Change User Role (Superadmin Only)
 * POST /api/admin/users/[id]/role
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import { checkAdminRole } from "@/lib/auth/admin";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only superadmins can change roles
    const { isSuperAdmin } = await checkAdminRole(adminId);
    if (!isSuperAdmin) {
      return NextResponse.json(
        { error: "Forbidden - Superadmin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { role } = await request.json();

    if (!role || !['user', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be: user, admin, or superadmin" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent changing own role
    if (user.clerkId === adminId) {
      return NextResponse.json(
        { error: "Cannot change your own role" },
        { status: 400 }
      );
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log the role change (you can add to audit log later)
    console.log(`Role changed: ${user.email} from ${oldRole} to ${role} by admin ${adminId}`);

    return NextResponse.json({
      success: true,
      message: `User role changed from ${oldRole} to ${role}`,
      user: {
        _id: user._id.toString(),
        email: user.email,
        role: user.role,
        oldRole,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Change role error:", error);
    return NextResponse.json(
      { 
        error: "Failed to change user role",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
