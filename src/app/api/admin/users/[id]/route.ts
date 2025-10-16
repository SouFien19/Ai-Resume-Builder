/**
 * Admin User Details API
 * GET /api/admin/users/[id] - Get user details
 * PUT /api/admin/users/[id] - Update user
 * DELETE /api/admin/users/[id] - Delete user
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import Resume from "@/lib/database/models/Resume";
import AIUsage from "@/lib/database/models/AIUsage";
import { checkAdminRole, logAdminAction } from "@/lib/auth/admin";

// GET user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { id: targetUserId } = await params;

    // Get user details with related data
    const [user, resumes, aiUsage, totalAICost] = await Promise.all([
      User.findById(targetUserId).select('-__v').lean(),
      Resume.find({ userId: targetUserId }).select('title createdAt updatedAt').lean(),
      AIUsage.find({ userId: targetUserId }).sort({ createdAt: -1 }).limit(10).lean(),
      AIUsage.aggregate([
        { $match: { userId: targetUserId } },
        { $group: { _id: null, total: { $sum: '$totalCost' } } }
      ])
    ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const aiUsageStats = await AIUsage.aggregate([
      { $match: { userId: targetUserId } },
      { $group: { 
          _id: '$feature', 
          count: { $sum: 1 },
          totalCost: { $sum: '$totalCost' }
        }
      }
    ]);

    const userDetails = {
      ...user,
      _id: (user as any)._id.toString(),
      stats: {
        totalResumes: resumes.length,
        totalAIRequests: aiUsage.length,
        totalAICost: totalAICost[0]?.total || 0,
        aiUsageByFeature: aiUsageStats,
      },
      resumes: resumes.map((r: any) => ({
        ...r,
        _id: r._id.toString(),
      })),
      recentAIUsage: aiUsage.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
      })),
    };

    return NextResponse.json(userDetails, { status: 200 });

  } catch (error: unknown) {
    console.error("Admin user details error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch user details",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin } = await checkAdminRole(userId);
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await dbConnect();

    const { id: targetUserId } = await params;
    const updates = await request.json();

    // Only allow specific fields to be updated
    const allowedUpdates = ['name', 'plan', 'isActive', 'isSuspended'];
    const filteredUpdates: any = {};

    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      targetUserId,
      { $set: filteredUpdates },
      { new: true, runValidators: true }
    ).select('-__v').lean();

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Log admin action
    const adminUser = await User.findOne({ clerkId: userId });
    if (adminUser) {
      await logAdminAction(
        userId,
        adminUser.email,
        'UPDATE_USER',
        'user',
        targetUserId,
        { updates: filteredUpdates },
        request
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        ...updatedUser,
        _id: (updatedUser as any)._id.toString(),
      }
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { 
        error: "Failed to update user",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { isAdmin, isSuperAdmin } = await checkAdminRole(userId);
    
    // Only superadmin can delete users
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden - Superadmin access required" }, { status: 403 });
    }

    await dbConnect();

    const { id: targetUserId } = await params;

    // Check if user exists
    const user = await User.findById(targetUserId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete user and all related data
    await Promise.all([
      User.findByIdAndDelete(targetUserId),
      Resume.deleteMany({ userId: targetUserId }),
      AIUsage.deleteMany({ userId: targetUserId }),
    ]);

    // Log admin action
    const adminUser = await User.findOne({ clerkId: userId });
    if (adminUser) {
      await logAdminAction(
        userId,
        adminUser.email,
        'DELETE_USER',
        'user',
        targetUserId,
        { deletedEmail: user.email },
        request
      );
    }

    return NextResponse.json({
      success: true,
      message: "User and related data deleted successfully"
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Admin user delete error:", error);
    return NextResponse.json(
      { 
        error: "Failed to delete user",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
