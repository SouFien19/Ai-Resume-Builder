"use client";

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Activity, Loader2, RefreshCw, BarChart2, Clock, Briefcase, Target, Calendar, BookmarkPlus, TrendingUp, MessageSquare, Users, Search, FileText, Star, Download, Copy, Eye } from 'lucide-react';
import PerformanceMonitor from '@/components/performance/PerformanceMonitor';

// Lazy load heavy components
const ChartSelector = lazy(() => import('@/components/charts/ChartSelector').then(module => ({ default: module.ChartSelector })));
const ScoreHistory = lazy(() => import('@/components/analytics/ScoreHistory'));

// Loading skeleton components
const ChartSkeleton = () => (
  <div className="bg-neutral-800/30 rounded-xl border border-neutral-700/50 p-6 space-y-4">
    <div className="flex gap-3 mb-6">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="h-10 w-24 bg-neutral-700/50 rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="h-96 bg-neutral-700/30 rounded-lg animate-pulse" />
  </div>
);

const ScoreHistorySkeleton = () => (
  <div className="bg-neutral-800/30 rounded-xl border border-neutral-700/50 p-6 space-y-4">
    <div className="h-8 w-48 bg-neutral-700/50 rounded animate-pulse mb-6" />
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-neutral-700/30 rounded-lg animate-pulse" />
      ))}
    </div>
  </div>
);

interface AnalyticsData {
  stats: Array<{
    label: string;
    value: string;
    icon: string;
    change: string;
    changeType: string;
    subtext?: string;
  }>;
  applicationFunnel?: Array<{
    stage: string;
    count: number;
    icon: string;
    percentage: number;
  }>;
  recentApplications: Array<{
    id: string;
    title: string;
    company: string;
    score: number;
    status: string;
    daysAgo?: number;
  }>;
  topCompanies?: Array<{
    name: string;
    applications: number;
    avgScore: number;
  }>;
  weeklyTrend?: Array<{
    week: string;
    applications: number;
  }>;
  insights?: {
    totalApplications: number;
    savedJobs: number;
    interviews: number;
    offers: number;
    rejections: number;
    responseRate: number;
    conversionToInterview: number;
    conversionToOffer: number;
    averageScore: number;
    recentActivity: number;
  };
  scoreOverTime?: Array<{
    date: string;
    score: number;
    count?: number;
  }>;
  detailedScores?: Array<{
    id: string;
    score: number;
    date: string;
    resumeText?: string;
    jobDescription?: string;
    analysis?: Record<string, unknown>;
    createdAt: string;
    daysAgo: number;
  }>;
  error?: string;
}

// Content Generation Analytics Component
interface ContentAnalyticsData {
  success: boolean;
  data: {
    summary: {
      totalGenerated: number;
      totalWords: number;
      avgQualityScore: number;
      avgProcessingTime: number;
      totalBookmarked: number;
      totalDownloads: number;
      totalCopied: number;
      avgRating: number;
      ratedPercentage: number;
      growthRate: number;
      lastUpdated: string;
    };
    contentTypes: Array<{
      type: string;
      count: number;
      totalWords: number;
      avgWords: number;
      avgQualityScore: number;
      avgProcessingTime: number;
      bookmarkedCount: number;
      downloadCount: number;
      copyCount: number;
      avgRating: number;
      lastGenerated: string;
      engagementRate: number;
    }>;
    topContent?: Array<{
      id: string;
      type: string;
      preview: string;
      qualityScore: number;
      processingTime: number;
      userRating: number;
      downloadCount: number;
      copyCount: number;
      isBookmarked: boolean;
      createdAt: string;
      wordCount: number;
    }>;
  };
}

const ContentGenerationAnalytics = () => {
  const [contentData, setContentData] = useState<ContentAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [showDetailed, setShowDetailed] = useState(false);

  const fetchContentAnalytics = async (timeRange = '30d', detailed = false) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        range: timeRange,
        detailed: detailed.toString()
      });
      
      const response = await fetch(`/api/analytics/content-generation?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContentData(data);
      }
    } catch (error) {
      console.error('Failed to fetch content generation analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContentAnalytics(selectedTimeRange, showDetailed);
  }, [selectedTimeRange, showDetailed]);

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="bg-neutral-800/30 rounded-xl border border-neutral-700/50 p-6">
          <div className="h-8 w-64 bg-neutral-700/50 rounded animate-pulse mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-neutral-700/30 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!contentData || !contentData.success) return null;

  const { data } = contentData;
  const contentTypeIcons = {
    'cover-letter': MessageSquare,
    'linkedin-post': Users,
    'job-description': Briefcase,
    'skills-keywords': Search
  };

  const formatContentType = (type: string) => {
    return type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <section className="mb-8">
      <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-2xl overflow-hidden">
        <div className="p-6 pb-2 bg-gradient-to-r from-neutral-800/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                AI Content Generation
              </h3>
              <p className="text-sm text-neutral-400 mt-1">Your AI-powered content creation activity</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {data.summary.totalGenerated || 0}
              </div>
              <div className="text-xs text-neutral-500">Total Generated</div>
            </div>
          </div>
          
          {/* Time Range and View Toggle Buttons */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedTimeRange === range
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50 hover:text-white'
                  }`}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDetailed(!showDetailed)}
              className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
                showDetailed
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25'
                  : 'bg-neutral-700/50 text-neutral-300 hover:bg-neutral-600/50 hover:text-white'
              }`}
            >
              {showDetailed ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
        </div>

        {/* Content Type Stats */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {data.contentTypes?.map((type) => {
              const Icon = contentTypeIcons[type.type as keyof typeof contentTypeIcons] || FileText;
              return (
                <div key={type.type} className="p-4 rounded-xl bg-gradient-to-br from-neutral-800/60 to-neutral-700/30 border border-neutral-600/30 hover:border-blue-500/30 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-blue-400" />
                      <div className="text-sm font-medium text-neutral-300 capitalize">
                        {formatContentType(type.type)}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-blue-400">{type.count}</div>
                  </div>
                  <div className="text-xs text-neutral-500">
                    Avg Quality: {type.avgQualityScore?.toFixed(1) || 'N/A'}%
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {type.avgWords} avg words • {type.engagementRate}% engagement
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-400">Avg Quality Score</span>
              </div>
              <div className="text-2xl font-bold text-green-400">
                {data.summary.avgQualityScore?.toFixed(1) || 0}%
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Total Words</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {data.summary.totalWords?.toLocaleString() || 0}
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Avg Processing</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {data.summary.avgProcessingTime || 0}ms
              </div>
            </div>
          </div>

          {/* User Engagement Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Avg Rating</span>
              </div>
              <div className="text-2xl font-bold text-blue-400">
                {data.summary.avgRating?.toFixed(1) || 0}/5
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Download className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-400">Downloads</span>
              </div>
              <div className="text-2xl font-bold text-purple-400">
                {data.summary.totalDownloads || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Copy className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-indigo-400">Copies</span>
              </div>
              <div className="text-2xl font-bold text-indigo-400">
                {data.summary.totalCopied || 0}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-red-500/10 border border-pink-500/20">
              <div className="flex items-center gap-2 mb-2">
                <BookmarkPlus className="h-4 w-4 text-pink-400" />
                <span className="text-sm font-medium text-pink-400">Bookmarks</span>
              </div>
              <div className="text-2xl font-bold text-pink-400">
                {data.summary.totalBookmarked || 0}
              </div>
            </div>
          </div>

          {/* Detailed Content List */}
          {showDetailed && data.topContent && data.topContent.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-400" />
                Recent Generated Content
              </h4>
              <div className="space-y-4">
                {data.topContent.map((content) => {
                  const Icon = contentTypeIcons[content.type as keyof typeof contentTypeIcons] || FileText;
                  return (
                    <div key={content.id} className="p-4 rounded-xl bg-gradient-to-br from-neutral-800/60 to-neutral-700/30 border border-neutral-600/30 hover:border-blue-500/30 transition-all group">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
                            <Icon className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <h5 className="font-medium text-white capitalize">
                              {formatContentType(content.type)}
                            </h5>
                            <p className="text-xs text-neutral-400">
                              {new Date(content.createdAt).toLocaleDateString()} • {content.wordCount} words
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <div className="text-center">
                            <div className="text-green-400 font-bold">{content.qualityScore}%</div>
                            <div className="text-neutral-500">Quality</div>
                          </div>
                          <div className="text-center">
                            <div className="text-blue-400 font-bold">{content.downloadCount}</div>
                            <div className="text-neutral-500">Downloads</div>
                          </div>
                          <div className="text-center">
                            <div className="text-purple-400 font-bold">{content.copyCount}</div>
                            <div className="text-neutral-500">Copies</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-neutral-300 bg-neutral-900/50 rounded-lg p-3 border border-neutral-700/30">
                        <p className="line-clamp-3">{content.preview}</p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          {content.isBookmarked && (
                            <BookmarkPlus className="h-4 w-4 text-yellow-400" />
                          )}
                          {content.userRating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-xs text-neutral-400">{content.userRating}/5</span>
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-neutral-500">
                          Generated in {content.processingTime}ms
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // First ensure user is synced to database
      console.log('Syncing user to database...');
      const { syncUser } = await import('@/lib/api-client');
      const syncResult = await syncUser();
      
      console.log('Sync result received:', syncResult);
      
      if (!syncResult || !syncResult.success) {
        console.error('Sync failed, result:', syncResult);
        throw new Error(`Failed to sync user to database: ${JSON.stringify(syncResult)}`);
      }
      
      console.log('User synced successfully:', syncResult.user);
      
      // Use AbortController for cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      console.log('Fetching analytics data...');
      const response = await fetch('/api/analytics/summary', {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication required - please sign in again');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result);
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Request was cancelled');
        return;
      }
      
      console.error('Failed to fetch analytics:', error);
      
      // Handle authentication errors specially
      if (error instanceof Error && error.message.includes('Authentication required')) {
        // Redirect to sign-in if authentication failed
        window.location.href = '/sign-in';
        return;
      }
      
      // Set fallback data
      setData({
        stats: [
          { label: "Total Applications", value: "0", icon: 'Briefcase', change: "0%", changeType: "neutral", subtext: "Getting started" },
          { label: "Average Match Score", value: "0%", icon: 'Target', change: "No data", changeType: "neutral", subtext: "Upload resume to begin" },
          { label: "Active Interviews", value: "0", icon: 'Calendar', change: "0%", changeType: "neutral", subtext: "Keep applying!" },
          { label: "Saved Jobs", value: "0", icon: 'BookmarkPlus', change: "0", changeType: "neutral", subtext: "Save jobs to track" },
        ],
        applicationFunnel: [
          { stage: 'Applied', count: 0, icon: 'Briefcase', percentage: 0 },
          { stage: 'Assessment', count: 0, icon: 'BrainCircuit', percentage: 0 },
          { stage: 'Interview', count: 0, icon: 'Users', percentage: 0 },
          { stage: 'Offer', count: 0, icon: 'Award', percentage: 0 },
        ],
        scoreOverTime: [],
        detailedScores: [],
        recentApplications: [],
        topCompanies: [],
        weeklyTrend: [
          { week: 'Week 1', applications: 0 },
          { week: 'Week 2', applications: 0 },
          { week: 'Week 3', applications: 0 },
          { week: 'Week 4', applications: 0 },
        ],
        insights: {
          totalApplications: 0,
          savedJobs: 0,
          interviews: 0,
          offers: 0,
          rejections: 0,
          responseRate: 0,
          conversionToInterview: 0,
          conversionToOffer: 0,
          averageScore: 0,
          recentActivity: 0
        }
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch data when Clerk has loaded and user is signed in
    if (isLoaded && isSignedIn) {
      fetchData();
    } else if (isLoaded && !isSignedIn) {
      // If loaded but not signed in, show fallback data
      setIsLoading(false);
    }
  }, [isLoaded, isSignedIn, fetchData]);

  const getIcon = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      Briefcase, Target, Calendar, BookmarkPlus, BarChart2,
    };
    return icons[iconName] || Briefcase;
  };

  // Show loading state when authentication is still loading or data is being fetched
  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-pink-500 mx-auto mb-6" />
            <div className="absolute inset-0 h-16 w-16 mx-auto animate-pulse">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 blur-xl"></div>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            {!isLoaded ? 'Authenticating...' : 'Loading Analytics'}
          </h2>
          <p className="text-neutral-400">
            {!isLoaded ? 'Verifying your identity...' : 'Fetching your latest job search data...'}
          </p>
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show unauthenticated state if user is not signed in
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-6">🔒</div>
          <h2 className="text-xl font-semibold mb-2 text-red-400">Authentication Required</h2>
          <p className="text-neutral-400 mb-6">Please sign in to view your analytics dashboard.</p>
          <button 
            onClick={() => window.location.href = '/sign-in'}
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg font-medium hover:from-pink-600 hover:to-purple-600 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!data || data.stats.every(stat => stat.value === "0")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="relative mb-8">
            <Activity className="h-20 w-20 text-neutral-600 mx-auto" />
            <div className="absolute inset-0 h-20 w-20 mx-auto animate-pulse">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-neutral-600/20 to-neutral-500/20 blur-xl"></div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-3 bg-gradient-to-r from-neutral-300 to-neutral-500 bg-clip-text text-transparent">
            No Analytics Data Yet
          </h2>
          <p className="text-neutral-400 mb-6 leading-relaxed">
            Start your job search journey to see powerful analytics and insights here!
          </p>
          <div className="space-y-3 text-sm text-neutral-500">
            <div className="flex items-center justify-center gap-2">
              <Briefcase className="h-4 w-4" />
              <span>Apply to jobs using Job Matcher</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Target className="h-4 w-4" />
              <span>Optimize your resume with ATS tools</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Track your progress and success rates</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header */}
      <header className="mb-10 flex justify-between items-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Analytics Dashboard
            </span>
          </h1>
          <p className="text-neutral-400 text-lg">
            Real-time insights into your job search performance and ATS optimization progress
          </p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 rounded-xl text-pink-400 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-pink-500/25"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </button>
      </header>

      {/* Enhanced Stats Grid */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {data.stats.map((stat, index) => {
          const IconComponent = getIcon(stat.icon);
          return (
            <div 
              key={stat.label} 
              className="group rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:scale-105 hover:border-pink-500/30"
              style={{
                animationDelay: `${index * 100}ms`
              }}
            >
              <div className="flex flex-row items-center justify-between p-6 pb-2">
                <h3 className="text-sm font-medium text-neutral-400 group-hover:text-neutral-300 transition-colors">{stat.label}</h3>
                <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-500/20 group-hover:from-pink-500/30 group-hover:to-purple-500/30 transition-all">
                  <IconComponent className="h-5 w-5 text-pink-400" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-medium ${
                    stat.changeType === 'increase' ? 'text-green-400' : 
                    stat.changeType === 'decrease' ? 'text-red-400' : 'text-neutral-400'
                  }`}>
                    {stat.changeType === 'increase' ? '↗' : stat.changeType === 'decrease' ? '↘' : '→'}
                  </span>
                  <span className={`text-xs ${
                    stat.changeType === 'increase' ? 'text-green-400' : 
                    stat.changeType === 'decrease' ? 'text-red-400' : 'text-neutral-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ATS Score Trend Section - Enhanced */}
      {data.scoreOverTime && data.scoreOverTime.length > 0 && (
        <section className="mb-8">
          <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-2xl overflow-hidden">
            <div className="p-6 pb-2 bg-gradient-to-r from-neutral-800/50 to-transparent">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Individual ATS Scores
                  </h3>
                  <p className="text-sm text-neutral-400 mt-1">All your resume analysis results over time</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
                    {data.detailedScores && data.detailedScores.length > 0 ? 
                      data.detailedScores[data.detailedScores.length - 1]?.score || 0 : 
                      data.scoreOverTime && data.scoreOverTime.length > 0 ? 
                        data.scoreOverTime[data.scoreOverTime.length - 1]?.score || 0 : 0}%
                  </div>
                  <div className="text-xs text-neutral-500">Latest Score</div>
                </div>
              </div>
            </div>
            
            {/* Chart Container with multiple chart options */}
            <div className="px-3 pb-3">
              <div className="w-full relative">
                <Suspense fallback={<ChartSkeleton />}>
                  <ChartSelector 
                    data={data.scoreOverTime || []} 
                    detailedScores={data.detailedScores || []}
                    height={400}
                  />
                </Suspense>
              </div>
            </div>
            
            {/* Enhanced Stats Footer */}
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between pt-4 border-t border-neutral-700/50">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">
                      {data.detailedScores && data.detailedScores.length > 0 ? 
                        Math.max(...data.detailedScores.map(d => d.score)) :
                        data.scoreOverTime && data.scoreOverTime.length > 0 ? 
                          Math.max(...data.scoreOverTime.map(d => d.score)) : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">Peak Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-400">
                      {data.detailedScores && data.detailedScores.length > 0 ? 
                        Math.round(data.detailedScores.reduce((sum, item) => sum + item.score, 0) / data.detailedScores.length) :
                        data.scoreOverTime && data.scoreOverTime.length > 0 ? 
                          Math.round(data.scoreOverTime.reduce((sum, item) => sum + item.score, 0) / data.scoreOverTime.length) : 0}%
                    </div>
                    <div className="text-xs text-neutral-500">Average</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {data.detailedScores && data.detailedScores.length > 0 ? 
                        data.detailedScores.length :
                        data.scoreOverTime && data.scoreOverTime.length > 0 ? 
                          data.scoreOverTime.reduce((sum, item) => sum + (item.count || 0), 0) : 0}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {data.detailedScores && data.detailedScores.length > 0 ? 'Individual Scores' : 'Total Analyses'}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400"></div>
                  <span>Score Trend</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Enhanced Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Applications - Enhanced */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl">
            <div className="p-6 pb-4 bg-gradient-to-r from-neutral-800/50 to-transparent">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                Recent Applications
              </h3>
              <p className="text-sm text-neutral-400 mt-1">Your latest job application activity</p>
            </div>
            <div className="p-6 pt-0 max-h-96 overflow-y-auto">
              {data.recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {data.recentApplications.map((app, index) => (
                    <div 
                      key={app.id} 
                      className="p-4 rounded-xl bg-gradient-to-r from-neutral-800/80 to-neutral-800/40 border border-neutral-700/50 hover:border-pink-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white text-sm group-hover:text-pink-300 transition-colors">
                          {app.title}
                        </h4>
                        <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                          app.status === 'Applied' ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-pink-500/25' :
                          app.status === 'Saved' ? 'bg-gradient-to-r from-neutral-600 to-neutral-700 text-neutral-200' :
                          app.status === 'Interviewing' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/25' :
                          'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-neutral-400 font-medium">{app.company}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500"></div>
                          <span className="text-pink-400 font-medium">{app.score}% match</span>
                        </div>
                      </div>
                      {app.daysAgo !== undefined && (
                        <div className="text-xs text-neutral-500 mt-2 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {app.daysAgo === 0 ? 'Applied today' : `Applied ${app.daysAgo} days ago`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-neutral-500 py-12 px-4">
                  <Briefcase className="h-12 w-12 mx-auto mb-3 text-neutral-600" />
                  <p className="text-lg font-medium mb-1">No applications yet</p>
                  <p className="text-sm">Start applying to jobs to see your activity here!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Insights Panel */}
        <div>
          {data.insights && (
            <div className="rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl">
              <div className="p-6 pb-4 bg-gradient-to-r from-neutral-800/50 to-transparent">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                    <BarChart2 className="h-5 w-5 text-white" />
                  </div>
                  Performance Insights
                </h3>
                <p className="text-sm text-neutral-400 mt-1">Key metrics at a glance</p>
              </div>
              <div className="p-6 pt-0 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-blue-400">Average ATS Score</div>
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                    {data.insights.averageScore}%
                  </div>
                  <div className="text-xs text-neutral-500">Resume optimization performance</div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-green-400">Response Rate</div>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-1">
                    {data.insights.responseRate}%
                  </div>
                  <div className="text-xs text-neutral-500">
                    From {data.insights.totalApplications} applications
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-purple-400">Interview Rate</div>
                    <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">
                    {data.insights.conversionToInterview}%
                  </div>
                  <div className="text-xs text-neutral-500">
                    {data.insights.interviews} interviews secured
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-yellow-400">Recent Activity</div>
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  </div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-1">
                    {data.insights.recentActivity}
                  </div>
                  <div className="text-xs text-neutral-500">applications in last 7 days</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Content Generation Analytics Section */}
      <ContentGenerationAnalytics />

      {/* Score History Section */}
      {data.detailedScores && data.detailedScores.length > 0 && (
        <section className="mt-8">
          <Suspense fallback={<ScoreHistorySkeleton />}>
            <ScoreHistory scores={data.detailedScores} />
          </Suspense>
        </section>
      )}
      
      {/* Performance Monitor - Development Only */}
      {process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor componentName="Analytics Page" />
      )}
    </div>
  );
}