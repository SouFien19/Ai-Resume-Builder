 /**
 * Admin User Management API
 * GET /api/admin/users - List users with filters
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import dbConnect from "@/lib/database/connection";
import User from "@/lib/database/models/User";
import { checkAdminRole } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const plan = searchParams.get('plan') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    if (plan) {
      filter.plan = plan;
    }

    if (role) {
      filter.role = role;
    }

    if (status === 'active') {
      filter.isActive = true;
      filter.isSuspended = false;
    } else if (status === 'suspended') {
      filter.isSuspended = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query with pagination
    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-__v')
        .lean(),
      User.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      users: users.map((user: any) => ({
        ...user,
        _id: user._id.toString(),
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        limit,
        hasMore: page < totalPages,
      },
    }, { status: 200 });

  } catch (error: unknown) {
    console.error("Admin users list error:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch users",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
