import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '../../../../lib/database/connection';
import User from '../../../../lib/database/models/User';
import AppliedJob from '../../../../lib/database/models/AppliedJob';
import AtsScore from '../../../../lib/database/models/AtsScore';
import { startOfMonth, subMonths, subDays } from 'date-fns';
import { getCache, setCache, CacheKeys } from '@/lib/redis';

export async function GET() {
  try {
    console.log('Analytics API: Starting request...');
    await connectToDatabase();
    console.log('Analytics API: Database connected');
    
    const { userId: clerkId } = await auth();
    console.log('Analytics API: Auth result:', { clerkId: clerkId ? 'present' : 'missing' });

    if (!clerkId) {
      console.log('Analytics API: No clerkId found, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findOne({ clerkId });
    console.log('Analytics API: User lookup result:', { user: user ? 'found' : 'not found' });
    
    if (!user) {
      console.log('Analytics API: User not found in database for clerkId:', clerkId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = user._id;

    // Try Redis cache first (5-minute cache per user)
    const cacheKey = CacheKeys.stats.user(userId.toString());
    const cached = await getCache<any>(cacheKey);
    
    if (cached) {
      console.log('[Dashboard Stats] ✅ Returned from cache (fast!)');
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT', 'X-Cache-Key': cacheKey }
      });
    }
    
    console.log('[Dashboard Stats] ⚠️ Cache MISS - fetching from database (slow)');

    // --- Enhanced Key Stats with Previous Period Comparison ---
    const now = new Date();
    const lastMonth = subMonths(now, 1);
    
    const [currentApplied, lastMonthApplied] = await Promise.all([
      AppliedJob.countDocuments({ userId, appliedAt: { $gte: startOfMonth(now) } }),
      AppliedJob.countDocuments({ 
        userId, 
        appliedAt: { $gte: startOfMonth(lastMonth), $lt: startOfMonth(now) } 
      })
    ]);
    
    const totalJobsApplied = await AppliedJob.countDocuments({ userId });
    const savedJobs = await AppliedJob.countDocuments({ userId, status: 'Saved' });
    const interviews = await AppliedJob.countDocuments({ userId, status: 'Interviewing' });
    const offers = await AppliedJob.countDocuments({ userId, status: 'Offer' });
    
    // Calculate application rate (last 7 days)
    const last7Days = subDays(now, 7);
    const recentApplications = await AppliedJob.countDocuments({ 
      userId, 
      appliedAt: { $gte: last7Days } 
    });
    
    // Average match score calculation
    const avgScoreResult = await AtsScore.aggregate([
      { $match: { userId } },
      { $group: { _id: null, average: { $avg: '$score' } } },
    ]);
    const avgMatchScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].average) : 0;

    // Calculate percentage changes
    const appliedChange = lastMonthApplied > 0 
      ? Math.round(((currentApplied - lastMonthApplied) / lastMonthApplied) * 100)
      : currentApplied > 0 ? 100 : 0;

    // --- Enhanced Application Funnel with Conversion Rates ---
    const funnelData = await AppliedJob.aggregate([
      { $match: { userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = {
      Applied: funnelData.find(s => s._id === 'Applied')?.count || 0,
      Assessment: funnelData.find(s => s._id === 'Assessment')?.count || 0,
      Interviewing: funnelData.find(s => s._id === 'Interviewing')?.count || 0,
      Offer: funnelData.find(s => s._id === 'Offer')?.count || 0,
      Rejected: funnelData.find(s => s._id === 'Rejected')?.count || 0,
      Saved: funnelData.find(s => s._id === 'Saved')?.count || 0,
    };

    // Calculate conversion rates
    const totalActive = statusCounts.Applied + statusCounts.Assessment + statusCounts.Interviewing + statusCounts.Offer;
    const conversionToInterview = totalActive > 0 ? Math.round((statusCounts.Interviewing / totalActive) * 100) : 0;
    const conversionToOffer = totalActive > 0 ? Math.round((statusCounts.Offer / totalActive) * 100) : 0;

    // --- Score Over Time (Last 6 Months) with Individual Scores ---
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));
    
    // Get aggregated monthly data
    const scoreOverTimeData = await AtsScore.aggregate([
      { $match: { userId, createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          averageScore: { $avg: '$score' },
          count: { $sum: 1 }
        },
      },
      { $sort: { _id: 1 } },
    ]);
    
    const scoreOverTime = scoreOverTimeData.map(item => ({
      date: item._id,
      score: Math.round(item.averageScore),
      count: item.count
    }));

    // Get all individual ATS scores with detailed information
    const allAtsScores = await AtsScore.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 scores for performance
      .lean();

    const detailedScores = allAtsScores.map(score => ({
      id: score._id,
      score: score.score,
      date: score.createdAt,
      resumeText: score.resumeText ? score.resumeText.substring(0, 100) + '...' : null,
      jobDescription: score.jobDescription ? score.jobDescription.substring(0, 100) + '...' : null,
      analysis: score.analysis,
      createdAt: score.createdAt,
      daysAgo: Math.floor((now.getTime() - new Date(score.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    // --- Recent Applications with Enhanced Data ---
    const recentApplicationsData = await AppliedJob.find({ userId })
      .sort({ appliedAt: -1 })
      .limit(5)
      .lean();

    // --- Top Companies Applied To ---
    const topCompanies = await AppliedJob.aggregate([
      { $match: { userId } },
      { $group: { _id: '$company', count: { $sum: 1 }, avgScore: { $avg: '$matchScore' } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // --- Weekly Application Trend (Last 4 weeks) ---
    const weeklyTrend = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = subDays(now, (i + 1) * 7);
      const weekEnd = subDays(now, i * 7);
      const weekCount = await AppliedJob.countDocuments({
        userId,
        appliedAt: { $gte: weekStart, $lt: weekEnd }
      });
      weeklyTrend.push({
        week: `Week ${4 - i}`,
        applications: weekCount
      });
    }

    // --- Success Metrics ---
    const responseRate = totalJobsApplied > 0 
      ? Math.round(((statusCounts.Assessment + statusCounts.Interviewing + statusCounts.Offer) / totalJobsApplied) * 100)
      : 0;

    // --- Final Data Structuring ---
    const enhancedStats = [
      { 
        label: "Total Applications", 
        value: totalJobsApplied.toString(), 
        icon: 'Briefcase', 
        change: `${appliedChange >= 0 ? '+' : ''}${appliedChange}%`, 
        changeType: appliedChange >= 0 ? "increase" : "decrease",
        subtext: `${currentApplied} this month`
      },
      { 
        label: "Average Match Score", 
        value: `${avgMatchScore}%`, 
        icon: 'Target', 
        change: avgMatchScore >= 80 ? "Excellent" : avgMatchScore >= 60 ? "Good" : "Improve", 
        changeType: avgMatchScore >= 80 ? "increase" : avgMatchScore >= 60 ? "neutral" : "decrease",
        subtext: `${responseRate}% response rate`
      },
      { 
        label: "Active Interviews", 
        value: interviews.toString(), 
        icon: 'Calendar', 
        change: `${conversionToInterview}%`, 
        changeType: conversionToInterview >= 10 ? "increase" : "neutral",
        subtext: "conversion rate"
      },
      { 
        label: "Saved Jobs", 
        value: savedJobs.toString(), 
        icon: 'BookmarkPlus', 
        change: `${recentApplications}`, 
        changeType: "neutral",
        subtext: "last 7 days"
      },
    ];

    const enhancedApplicationFunnel = [
      { stage: 'Applied', count: statusCounts.Applied, icon: 'Briefcase', percentage: totalActive > 0 ? Math.round((statusCounts.Applied / totalActive) * 100) : 0 },
      { stage: 'Assessment', count: statusCounts.Assessment, icon: 'BrainCircuit', percentage: totalActive > 0 ? Math.round((statusCounts.Assessment / totalActive) * 100) : 0 },
      { stage: 'Interview', count: statusCounts.Interviewing, icon: 'Users', percentage: totalActive > 0 ? Math.round((statusCounts.Interviewing / totalActive) * 100) : 0 },
      { stage: 'Offer', count: statusCounts.Offer, icon: 'Award', percentage: totalActive > 0 ? Math.round((statusCounts.Offer / totalActive) * 100) : 0 },
    ];
    
    const enhancedRecentApplications = recentApplicationsData.map(app => ({
      id: app._id.toString(),
      title: app.title,
      company: app.company,
      score: app.matchScore || 0,
      status: app.status,
      appliedAt: app.appliedAt,
      daysAgo: Math.floor((now.getTime() - new Date(app.appliedAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    const responseData = {
      stats: enhancedStats,
      applicationFunnel: enhancedApplicationFunnel,
      scoreOverTime,
      detailedScores,
      recentApplications: enhancedRecentApplications,
      topCompanies: topCompanies.map(company => ({
        name: company._id,
        applications: company.count,
        avgScore: Math.round(company.avgScore || 0)
      })),
      weeklyTrend,
      insights: {
        totalApplications: totalJobsApplied,
        savedJobs,
        interviews,
        offers,
        rejections: statusCounts.Rejected,
        responseRate,
        conversionToInterview,
        conversionToOffer,
        averageScore: avgMatchScore,
        recentActivity: recentApplications
      }
    };

    // Cache for 5 minutes (300 seconds)
    await setCache(cacheKey, responseData, 300);
    console.log('[Dashboard Stats] ✅ Cached dashboard stats for 5 minutes');

    return NextResponse.json(responseData, {
      headers: { 'X-Cache': 'MISS', 'X-Cache-Key': cacheKey }
    });

  } catch (error) {
    console.error('[ANALYTICS_SUMMARY_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
