import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Resume from '@/lib/database/models/Resume';
import { startOfDay } from 'date-fns';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user is admin
    const user = await User.findOne({ clerkId: userId }).lean() as any;
    
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const template = searchParams.get('template') || 'all';

    // Build query
    const query: any = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    if (template !== 'all') {
      query.templateId = template;
    }

    // Get resumes with pagination
    const [resumes, total] = await Promise.all([
      Resume.find(query)
        .populate({
          path: 'userId',
          select: 'email name photo clerkId',
          model: 'User'
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .catch((err) => {
          console.error('Error populating userId:', err);
          // Fallback: return resumes without population
          return Resume.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();
        }),
      Resume.countDocuments(query)
    ]);

    // Get statistics
    const todayStart = startOfDay(new Date());
    
    const [totalResumes, totalDownloads, resumesToday, topTemplate] = await Promise.all([
      Resume.countDocuments(),
      Resume.aggregate([
        { $group: { _id: null, total: { $sum: '$downloads' } } }
      ]),
      Resume.countDocuments({ createdAt: { $gte: todayStart } }),
      Resume.aggregate([
        {
          $group: {
            _id: '$templateId',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ])
    ]);

    return NextResponse.json({
      success: true,
      data: {
        resumes,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        },
        stats: {
          totalResumes,
          totalDownloads: totalDownloads[0]?.total || 0,
          resumesToday,
          topTemplate: topTemplate[0]?._id || 'N/A'
        }
      }
    });

  } catch (error: any) {
    console.error('Admin Resumes API Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code
    });
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
