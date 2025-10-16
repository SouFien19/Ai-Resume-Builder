import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import dbConnect from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import { startOfMonth, subMonths, format, differenceInMonths } from 'date-fns';

// Plan pricing
const PLAN_PRICES: Record<string, number> = {
  free: 0,
  pro: 9.99,
  enterprise: 29.99
};

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
    const months = parseInt(searchParams.get('months') || '12');

    const now = new Date();
    const startDate = subMonths(now, months);

    // Current plan distribution
    const planDistribution = await User.aggregate([
      {
        $group: {
          _id: '$plan',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate current MRR
    let currentMRR = 0;
    planDistribution.forEach((item: any) => {
      const price = PLAN_PRICES[item._id] || 0;
      currentMRR += price * item.count;
    });

    // Calculate ARR
    const currentARR = currentMRR * 12;

    // Revenue over time (monthly)
    const revenueOverTime = [];
    const planChangesOverTime = [];
    
    for (let i = months - 1; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(now, i));
      const monthEnd = startOfMonth(subMonths(now, i - 1));
      
      // Count users by plan at the start of this month
      const usersAtMonthStart = await User.aggregate([
        {
          $match: {
            createdAt: { $lt: monthEnd }
          }
        },
        {
          $group: {
            _id: '$plan',
            count: { $sum: 1 }
          }
        }
      ]);

      let monthlyRevenue = 0;
      const planBreakdown: Record<string, number> = {
        free: 0,
        pro: 0,
        enterprise: 0
      };

      usersAtMonthStart.forEach((item: any) => {
        const plan = item._id || 'free';
        const price = PLAN_PRICES[plan] || 0;
        const revenue = price * item.count;
        monthlyRevenue += revenue;
        planBreakdown[plan] = item.count;
      });

      revenueOverTime.push({
        month: format(monthStart, 'MMM yyyy'),
        date: format(monthStart, 'yyyy-MM'),
        revenue: monthlyRevenue,
        mrr: monthlyRevenue,
        ...planBreakdown
      });

      planChangesOverTime.push({
        month: format(monthStart, 'MMM yyyy'),
        date: format(monthStart, 'yyyy-MM'),
        ...planBreakdown
      });
    }

    // Calculate churn (users who downgraded or became inactive)
    const lastMonthStart = startOfMonth(subMonths(now, 1));
    const currentMonthStart = startOfMonth(now);

    const [usersLastMonth, usersThisMonth] = await Promise.all([
      User.countDocuments({
        createdAt: { $lt: lastMonthStart },
        isActive: true
      }),
      User.countDocuments({
        createdAt: { $lt: currentMonthStart },
        isActive: true
      })
    ]);

    const churnedUsers = usersLastMonth - usersThisMonth;
    const churnRate = usersLastMonth > 0 ? (churnedUsers / usersLastMonth) * 100 : 0;

    // Calculate LTV (simplified: average revenue per user * average customer lifespan)
    const avgMonthlyRevenuePerUser = currentMRR / (await User.countDocuments({ plan: { $ne: 'free' } }) || 1);
    const avgCustomerLifespanMonths = 12; // Estimate
    const customerLTV = avgMonthlyRevenuePerUser * avgCustomerLifespanMonths;

    // Top paying users
    const paidUsers = await User.find(
      { plan: { $ne: 'free' } },
      { _id: 1, email: 1, name: 1, plan: 1, createdAt: 1 }
    )
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const topPayingUsers = paidUsers.map((user: any) => ({
      userId: user._id.toString(),
      email: user.email,
      name: user.name,
      plan: user.plan,
      monthlyRevenue: PLAN_PRICES[user.plan] || 0,
      lifetimeRevenue: (PLAN_PRICES[user.plan] || 0) * Math.max(1, differenceInMonths(now, new Date(user.createdAt))),
      joinedDate: user.createdAt
    }));

    // Conversion rate (free to paid)
    const [totalUsers, paidUsersCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ plan: { $ne: 'free' } })
    ]);

    const conversionRate = totalUsers > 0 ? (paidUsersCount / totalUsers) * 100 : 0;

    // Revenue trends
    const lastMonthRevenue = revenueOverTime[revenueOverTime.length - 2]?.revenue || 0;
    const currentMonthRevenue = revenueOverTime[revenueOverTime.length - 1]?.revenue || 0;
    const revenueTrend = lastMonthRevenue > 0
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          mrr: currentMRR,
          arr: currentARR,
          churnRate,
          churnedUsers,
          customerLTV,
          conversionRate,
          totalUsers,
          paidUsers: paidUsersCount,
          freeUsers: totalUsers - paidUsersCount
        },
        trends: {
          revenue: revenueTrend,
          mrr: revenueTrend
        },
        planDistribution: planDistribution.map((item: any) => ({
          plan: item._id || 'free',
          count: item.count,
          revenue: (PLAN_PRICES[item._id] || 0) * item.count,
          percentage: totalUsers > 0 ? (item.count / totalUsers) * 100 : 0
        })),
        revenueOverTime,
        planChangesOverTime,
        topPayingUsers: topPayingUsers.sort((a: any, b: any) => b.lifetimeRevenue - a.lifetimeRevenue),
        period: {
          months,
          startDate: format(startDate, 'yyyy-MM'),
          endDate: format(now, 'yyyy-MM')
        }
      }
    });

  } catch (error: any) {
    console.error('Revenue Overview API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
