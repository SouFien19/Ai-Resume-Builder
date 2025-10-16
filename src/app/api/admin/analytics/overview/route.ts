import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Resume from '@/lib/database/models/Resume';
import Analytics from '@/lib/database/models/Analytics';
import { startOfDay, startOfWeek, startOfMonth, subDays, subMonths, format } from 'date-fns';

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

    // Check if user is admin from database
    const user = await User.findOne({ clerkId: userId }).lean() as any;
    
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    await dbConnect();

    const now = new Date();
    const startDate = subDays(now, days);
    const startOfToday = startOfDay(now);
    const startOfThisWeek = startOfWeek(now);
    const startOfThisMonth = startOfMonth(now);

    // User growth over time
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Recent user growth (last 30 days)
    const recentUserGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          newUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Resume creation over time
    const resumeGrowth = await Resume.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          resumesCreated: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // DAU/WAU/MAU calculations
    const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] = await Promise.all([
      Analytics.distinct('userId', { 
        timestamp: { $gte: startOfToday },
        action: { $in: ['page_view', 'resume_create', 'resume_edit', 'resume_export'] }
      }),
      Analytics.distinct('userId', { 
        timestamp: { $gte: startOfThisWeek },
        action: { $in: ['page_view', 'resume_create', 'resume_edit', 'resume_export'] }
      }),
      Analytics.distinct('userId', { 
        timestamp: { $gte: startOfThisMonth },
        action: { $in: ['page_view', 'resume_create', 'resume_edit', 'resume_export'] }
      })
    ]);

    // Active users over time (daily)
    const activeUsersOverTime = await Analytics.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate },
          action: { $in: ['page_view', 'resume_create', 'resume_edit', 'resume_export'] }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            userId: '$userId'
          }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activeUsers: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Fill in missing days for user growth
    const filledUserGrowth = [];
    let cumulativeUsers = 0;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      const existingData = recentUserGrowth.find((item: any) => item._id === date);
      const newUsers = existingData?.newUsers || 0;
      cumulativeUsers += newUsers;
      
      filledUserGrowth.push({
        date,
        newUsers,
        totalUsers: cumulativeUsers
      });
    }

    // Fill in missing days for resumes
    const filledResumeGrowth = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      const existingData = resumeGrowth.find((item: any) => item._id === date);
      
      filledResumeGrowth.push({
        date,
        resumesCreated: existingData?.resumesCreated || 0
      });
    }

    // Fill in missing days for active users
    const filledActiveUsers = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(now, i), 'yyyy-MM-dd');
      const existingData = activeUsersOverTime.find((item: any) => item._id === date);
      
      filledActiveUsers.push({
        date,
        activeUsers: existingData?.activeUsers || 0
      });
    }

    // User stats
    const [totalUsers, activeUsersCount, inactiveUsersCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false })
    ]);

    // Resume stats
    const [totalResumes, resumesToday, resumesThisWeek, resumesThisMonth] = await Promise.all([
      Resume.countDocuments(),
      Resume.countDocuments({ createdAt: { $gte: startOfToday } }),
      Resume.countDocuments({ createdAt: { $gte: startOfThisWeek } }),
      Resume.countDocuments({ createdAt: { $gte: startOfThisMonth } })
    ]);

    // Template popularity
    const templateStats = await Resume.aggregate([
      {
        $group: {
          _id: '$templateId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        engagement: {
          dau: dailyActiveUsers.length,
          wau: weeklyActiveUsers.length,
          mau: monthlyActiveUsers.length,
          totalUsers,
          activeUsers: activeUsersCount,
          inactiveUsers: inactiveUsersCount
        },
        userGrowth: filledUserGrowth,
        resumeGrowth: filledResumeGrowth,
        activeUsersOverTime: filledActiveUsers,
        resumes: {
          total: totalResumes,
          today: resumesToday,
          thisWeek: resumesThisWeek,
          thisMonth: resumesThisMonth
        },
        templates: templateStats.map((item: any) => ({
          templateId: item._id,
          count: item.count
        })),
        period: {
          days,
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(now, 'yyyy-MM-dd')
        }
      }
    });

  } catch (error: any) {
    console.error('Analytics Overview API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
