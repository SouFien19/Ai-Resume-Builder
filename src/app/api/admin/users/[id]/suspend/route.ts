/**
 * Admin User Actions API - Suspend User
 * POST /api/admin/users/[id]/suspend
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

    const { isAdmin } = await checkAdminRole(adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { reason } = await request.json();

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Suspension reason is required" },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent self-suspension
    if (user.clerkId === adminId) {
      return NextResponse.json(
        { error: "Cannot suspend yourself" },
        { status: 400 }
      );
    }

    // Prevent suspending other admins without superadmin role
    const { isSuperAdmin } = await checkAdminRole(adminId);
    if ((user.role === 'admin' || user.role === 'superadmin') && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Only superadmins can suspend other admins" },
        { status: 403 }
      );
    }

    await user.suspend(reason.trim());

    return NextResponse.json({
      success: true,
      message: "User suspended successfully",
      user: {
        _id: user._id.toString(),
        email: user.email,
        isSuspended: user.isSuspended,
        suspendedReason: user.suspendedReason,
        suspendedAt: user.suspendedAt,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Suspend user error:", error);
    return NextResponse.json(
      { 
        error: "Failed to suspend user",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Unsuspend user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: adminId } = await auth();

    if (!adminId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await checkAdminRole(adminId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await user.unsuspend();

    return NextResponse.json({
      success: true,
      message: "User unsuspended successfully",
      user: {
        _id: user._id.toString(),
        email: user.email,
        isSuspended: user.isSuspended,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Unsuspend user error:", error);
    return NextResponse.json(
      { 
        error: "Failed to unsuspend user",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
