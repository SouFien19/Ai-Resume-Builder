"use client";

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

/**
 * Admin Dashboard - Main Overview Page
 * Real-time statistics and monitoring
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  TrendingUp, 
  DollarSign,
  Activity,
  UserCheck,
  UserX,
  Zap,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    suspendedUsers: number;
    totalResumes: number;
    aiRequestsToday: number;
    totalAIRequests: number;
  };
  growth: {
    newUsersToday: number;
    newUsersThisWeek: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
    resumesCreatedToday: number;
    resumesCreatedThisWeek: number;
    resumesCreatedThisMonth: number;
    resumeGrowthRate: number;
  };
  revenue: {
    paidUsers: number;
    proUsers: number;
    enterpriseUsers: number;
    conversionRate: number;
    planDistribution: Record<string, number>;
  };
  engagement: {
    avgResumesPerUser: number;
    activeUsersPercentage: string;
    aiUsageToday: number;
    aiUsageThisMonth: number;
  };
  aiCosts?: {
    today: string;
    thisMonth: string;
    total: string;
    perUser: string;
    perRequest: string;
  };
  recentActivity: {
    recentUsers: any[];
    topActiveUsers: any[];
  };
  generatedAt: string;
  cached?: boolean;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/stats");
      
      if (!response.ok) {
        throw new Error("Failed to fetch stats");
      }

      const data = await response.json();
      setStats(data);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load stats");
    } finally {
      setLoading(false);
    }
  };

  // Note: Role-based redirect handled by /api/auth/callback (server-side)
  // Admin layout also has requireAdmin() protection

  useEffect(() => {
    fetchStats();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <RefreshCw className="h-12 w-12 animate-spin text-pink-500 mx-auto" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: "Total Users",
      value: stats.overview.totalUsers.toLocaleString(),
      change: `+${stats.growth.newUsersToday} today`,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      title: "Active Users",
      value: stats.overview.activeUsers.toLocaleString(),
      change: `${stats.engagement.activeUsersPercentage}% of total`,
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
    },
    {
      title: "Total Resumes",
      value: stats.overview.totalResumes.toLocaleString(),
      change: `+${stats.growth.resumesCreatedToday} today`,
      icon: FileText,
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
    },
    {
      title: "Paid Users",
      value: stats.revenue.paidUsers.toLocaleString(),
      change: `${stats.revenue.conversionRate}% conversion`,
      icon: DollarSign,
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
    },
    {
      title: "AI Requests Today",
      value: stats.overview.aiRequestsToday.toLocaleString(),
      change: `${stats.overview.totalAIRequests.toLocaleString()} total`,
      icon: Zap,
      gradient: "from-yellow-500 to-orange-500",
      bgGradient: "from-yellow-50 to-orange-50",
    },
    {
      title: "Suspended Users",
      value: stats.overview.suspendedUsers.toLocaleString(),
      change: "Requires attention",
      icon: UserX,
      gradient: "from-red-500 to-pink-500",
      bgGradient: "from-red-50 to-pink-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-600 via-orange-600 to-red-600 bg-clip-text text-transparent animate-gradient">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-3 text-lg">
            Real-time monitoring and analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "flex items-center space-x-2 px-4 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg",
              autoRefresh
                ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            )}
          >
            <Activity className={cn("h-4 w-4", autoRefresh && "animate-pulse")} />
            <span>{autoRefresh ? "Live" : "Paused"}</span>
          </button>

          {/* Manual refresh */}
          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-orange-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 shadow-md"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Last Update */}
      <div className="flex items-center gap-2 text-sm">
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
        <p className="text-gray-600 font-medium">
          Last updated: {lastUpdate.toLocaleTimeString()}
          {autoRefresh && " • Auto-refreshes every 30s"}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5, ease: 'easeOut' }}
            whileHover={{ scale: 1.03, y: -5 }}
            className="relative group"
          >
            <div className={cn(
              "absolute inset-0 bg-gradient-to-br rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity",
              card.gradient
            )} />
            <div className={cn(
              "relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-6 shadow-lg hover:shadow-xl transition-shadow"
            )}
            >
              {/* Decorative blob */}
              <div className={cn(
                "absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-10",
                card.gradient
              )} />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <motion.div 
                    className={cn(
                      "h-14 w-14 rounded-xl bg-gradient-to-br p-3 shadow-lg flex items-center justify-center",
                      card.gradient
                    )}
                    animate={{ 
                      y: [0, -8, 0],
                      rotate: [0, 5, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  >
                    <card.icon className="h-7 w-7 text-white" />
                  </motion.div>
                </div>

                <h3 className="text-sm font-semibold text-gray-600 mb-2">
                  {card.title}
                </h3>
                <motion.p 
                  className={cn(
                    "text-3xl font-bold bg-gradient-to-br bg-clip-text text-transparent mb-2",
                    card.gradient
                  )}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  {card.value}
                </motion.p>
                <p className="text-sm text-gray-500 font-medium">
                  {card.change}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* AI Cost Tracking (NEW) */}
      {stats.aiCosts && (
        <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">💰 AI Cost Tracking</h3>
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Gemini API
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.aiCosts.today}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">This Month</p>
              <p className="text-2xl font-bold text-red-600">{stats.aiCosts.thisMonth}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-gray-900">{stats.aiCosts.total}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Per User</p>
              <p className="text-xl font-bold text-gray-700">{stats.aiCosts.perUser}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Per Request</p>
              <p className="text-xl font-bold text-gray-700">{stats.aiCosts.perRequest}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-orange-200">
            <p className="text-xs text-gray-600">
              💡 Estimated costs based on Gemini API usage. Monitor this to manage your budget.
            </p>
          </div>
        </div>
      )}

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">User Growth</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Today</span>
              <span className="font-bold text-gray-900">
                +{stats.growth.newUsersToday}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Week</span>
              <span className="font-bold text-gray-900">
                +{stats.growth.newUsersThisWeek}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">This Month</span>
              <span className="font-bold text-gray-900">
                +{stats.growth.newUsersThisMonth}
              </span>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 font-medium">Growth Rate</span>
                <span className="text-green-600 font-bold text-lg">
                  +{stats.growth.userGrowthRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {Object.entries(stats.revenue.planDistribution).map(([plan, count]) => {
              const percentage = (count / stats.overview.totalUsers * 100).toFixed(1);
              return (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 capitalize">{plan}</span>
                    <span className="font-bold text-gray-900">
                      {count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentActivity.recentUsers.slice(0, 5).map((user) => (
                <tr key={user._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{user.name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={cn(
                      "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                      user.plan === 'free' && "bg-gray-100 text-gray-700",
                      user.plan === 'pro' && "bg-blue-100 text-blue-700",
                      user.plan === 'enterprise' && "bg-purple-100 text-purple-700"
                    )}>
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

