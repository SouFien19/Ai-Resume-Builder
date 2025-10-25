'use client';

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Zap,
  AlertCircle,
  CheckCircle,
  Activity,
  Clock,
  Users,
  Loader2
} from 'lucide-react';

interface OverviewData {
  today: {
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    successCount: number;
    errorCount: number;
    avgCost: number;
  };
  month: {
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    avgCost: number;
  };
  trends: {
    requests: number;
    cost: number;
  };
  quality: {
    successRate: number;
    errorRate: number;
    successCount: number;
    errorCount: number;
    totalRequests: number;
  };
}

interface UsageData {
  usageOverTime: Array<{
    date: string;
    totalRequests: number;
    totalCost: number;
    totalTokens: number;
    successCount: number;
    errorCount: number;
    successRate: number;
  }>;
  usageByFeature: Array<{
    feature: string;
    totalRequests: number;
    totalCost: number;
    avgCost: number;
    successRate: number;
  }>;
  usageByHour: Array<{
    hour: number;
    totalRequests: number;
    totalCost: number;
  }>;
  topUsers: Array<{
    userId: string;
    totalRequests: number;
    totalCost: number;
  }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316'];

const formatCurrency = (value: number) => `$${value.toFixed(4)}`;
const formatNumber = (value: number) => value.toLocaleString();

// Feature name formatter - convert database codes to readable names
const formatFeatureName = (feature: string): string => {
  const featureNames: Record<string, string> = {
    'content-gen': '✨ Content Generation',
    'ats-optimizer': '🎯 ATS Optimizer',
    'job-matcher': '💼 Job Matcher',
    'cover-letter': '📝 Cover Letter',
    'skill-gap': '📊 Skill Gap Analysis',
  };
  return featureNames[feature] || feature;
};

export default function AIMonitoringPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, usageRes] = await Promise.all([
        fetch('/api/admin/ai/overview'),
        fetch(`/api/admin/ai/usage?days=${timeRange}`)
      ]);

      // Check if responses are OK before parsing JSON
      if (!overviewRes.ok) {
        const errorText = await overviewRes.text();
        console.error('Overview API error:', overviewRes.status, errorText);
        throw new Error(`Overview API failed: ${overviewRes.status}`);
      }

      if (!usageRes.ok) {
        const errorText = await usageRes.text();
        console.error('Usage API error:', usageRes.status, errorText);
        throw new Error(`Usage API failed: ${usageRes.status}`);
      }

      const overviewData = await overviewRes.json();
      const usageData = await usageRes.json();

      if (overviewData.success) {
        setOverview(overviewData.data);
      } else {
        console.error('Overview API returned success: false', overviewData);
        setError(overviewData.error || 'Failed to fetch overview data');
      }

      if (usageData.success) {
        setUsage(usageData.data);
      } else {
        console.error('Usage API returned success: false', usageData);
        setError(usageData.error || 'Failed to fetch usage data');
      }
    } catch (error: any) {
      console.error('Error fetching AI monitoring data:', error);
      setError(error.message || 'Failed to fetch AI monitoring data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent animate-gradient">
            AI Monitoring Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Track AI usage, costs, and performance in real-time</p>
        </div>

        {/* Time Range Selector */}
        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[7, 14, 30, 90].map((days, index) => (
            <motion.button
              key={days}
              onClick={() => setTimeRange(days)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                timeRange === days
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {days}D
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Today's Requests"
          value={formatNumber(overview?.today.totalRequests || 0)}
          trend={overview?.trends.requests || 0}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
          delay={0.1}
        />
        <StatsCard
          title="Today's Cost"
          value={formatCurrency(overview?.today.totalCost || 0)}
          trend={overview?.trends.cost || 0}
          icon={<DollarSign className="w-6 h-6" />}
          color="pink"
          delay={0.2}
        />
        <StatsCard
          title="Success Rate"
          value={`${(overview?.quality.successRate || 0).toFixed(1)}%`}
          trend={overview?.quality.successRate && overview?.quality.successRate > 95 ? 5 : -5}
          icon={<CheckCircle className="w-6 h-6" />}
          color="green"
          delay={0.3}
        />
        <StatsCard
          title="Avg Cost/Request"
          value={formatCurrency(overview?.today.avgCost || 0)}
          trend={0}
          icon={<Zap className="w-6 h-6" />}
          color="orange"
          delay={0.4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage Over Time */}
        <ChartCard title="AI Requests Over Time" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={usage?.usageOverTime || []}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#8b5cf6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.1} />
                </linearGradient>
                <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#8b5cf6" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e7ff" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#8b5cf6" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#c7d2fe', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#8b5cf6" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#c7d2fe', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(139, 92, 246, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
              />
              <Area
                type="monotone"
                dataKey="totalRequests"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRequests)"
                filter="url(#shadow)"
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost Over Time */}
        <ChartCard title="AI Costs Over Time" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={usage?.usageOverTime || []}>
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="50%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#fb923c" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#fce7f3" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#ec4899" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#fbcfe8', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#ec4899" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#fbcfe8', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(236, 72, 153, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
                formatter={(value: any) => formatCurrency(value)}
              />
              <Line
                type="monotone"
                dataKey="totalCost"
                stroke="url(#lineGradient)"
                strokeWidth={4}
                dot={{ fill: '#ec4899', r: 6, strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#f43f5e', strokeWidth: 3, stroke: '#fff', filter: 'url(#glow)' }}
                filter="url(#glow)"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Feature */}
        <ChartCard title="Usage by Feature" delay={0.7}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usage?.usageByFeature.map(f => ({ ...f, feature: formatFeatureName(f.feature) })) || []}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                </linearGradient>
                <filter id="barShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.4"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e7ff" opacity={0.5} vertical={false} />
              <XAxis 
                dataKey="feature" 
                stroke="#8b5cf6" 
                fontSize={10}
                fontWeight={600}
                angle={-45} 
                textAnchor="end" 
                height={100}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#c7d2fe', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#8b5cf6" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#c7d2fe', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(139, 92, 246, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar 
                dataKey="totalRequests" 
                fill="url(#barGradient)" 
                radius={[12, 12, 0, 0]}
                filter="url(#barShadow)"
                animationDuration={1200}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Cost by Feature */}
        <ChartCard title="Cost by Feature" delay={0.8}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="pieShadow">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <Pie
                data={usage?.usageByFeature.map(f => ({ ...f, displayName: formatFeatureName(f.feature) })) || []}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                }}
                label={({ displayName, totalCost, percent }: any) => 
                  `${displayName}: ${formatCurrency(totalCost)} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={90}
                innerRadius={45}
                paddingAngle={3}
                dataKey="totalCost"
                animationDuration={1500}
                animationBegin={300}
              >
                {usage?.usageByFeature.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    filter="url(#pieShadow)"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.3)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold' }}
                formatter={(value: any) => formatCurrency(value)} 
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours */}
        <ChartCard title="Peak Usage Hours" delay={0.9}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usage?.usageByHour || []}>
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.8} />
                </linearGradient>
                <filter id="hourGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#fef3c7" opacity={0.5} vertical={false} />
              <XAxis 
                dataKey="hour" 
                stroke="#f59e0b" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(hour) => `${hour}:00`}
                axisLine={{ stroke: '#fde68a', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#f59e0b" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#fde68a', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(245, 158, 11, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
                labelFormatter={(hour) => `${hour}:00`}
                cursor={{ fill: 'rgba(245, 158, 11, 0.1)' }}
              />
              <Bar 
                dataKey="totalRequests" 
                fill="url(#hourGradient)" 
                radius={[12, 12, 0, 0]}
                filter="url(#hourGlow)"
                animationDuration={1200}
                animationBegin={400}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Feature Performance */}
        <ChartCard title="Feature Success Rates" delay={1.0}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={usage?.usageByFeature.map(f => ({ ...f, feature: formatFeatureName(f.feature) })) || []} layout="vertical">
              <defs>
                <linearGradient id="successGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#34d399" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={1} />
                </linearGradient>
                <filter id="successGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#d1fae5" opacity={0.5} horizontal={false} />
              <XAxis 
                type="number" 
                domain={[0, 100]} 
                stroke="#10b981" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#a7f3d0', strokeWidth: 2 }}
              />
              <YAxis 
                type="category" 
                dataKey="feature" 
                stroke="#10b981" 
                fontSize={11}
                fontWeight={600}
                width={180}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#a7f3d0', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(16, 185, 129, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
                formatter={(value: any) => `${value.toFixed(1)}%`}
                cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              />
              <Bar 
                dataKey="successRate" 
                fill="url(#successGradient)" 
                radius={[0, 12, 12, 0]}
                filter="url(#successGlow)"
                animationDuration={1200}
                animationBegin={500}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* All Features Generated Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.05 }}
        className="bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 rounded-xl shadow-lg p-6 border border-purple-100"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Features Generated from Database
            </h2>
            <p className="text-sm text-gray-600">
              Real-time analytics from your AIUsage collection
            </p>
          </div>
        </div>

        {usage?.usageByFeature && usage.usageByFeature.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {usage.usageByFeature.map((feature, index) => (
              <motion.div
                key={feature.feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.1 + index * 0.05 }}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-purple-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {formatFeatureName(feature.feature)}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      feature.successRate >= 95
                        ? 'bg-green-100 text-green-700'
                        : feature.successRate >= 85
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {feature.successRate.toFixed(0)}%
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Requests:</span>
                    <span className="text-sm font-bold text-purple-600">
                      {formatNumber(feature.totalRequests)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Total Cost:</span>
                    <span className="text-sm font-semibold text-pink-600">
                      {formatCurrency(feature.totalCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600">Avg Cost:</span>
                    <span className="text-sm font-medium text-gray-700">
                      {formatCurrency(feature.avgCost)}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${feature.successRate}%` }}
                      transition={{ delay: 1.2 + index * 0.05, duration: 0.8 }}
                      className={`h-full rounded-full ${
                        feature.successRate >= 95
                          ? 'bg-gradient-to-r from-green-400 to-green-600'
                          : feature.successRate >= 85
                          ? 'bg-gradient-to-r from-yellow-400 to-yellow-600'
                          : 'bg-gradient-to-r from-red-400 to-red-600'
                      }`}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 font-medium">No AI features generated yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start using AI features to see analytics here
            </p>
          </div>
        )}
      </motion.div>

      {/* Feature Details Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Detailed Feature Performance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Requests</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Total Cost</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg Cost</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {usage?.usageByFeature.map((feature, index) => (
                <motion.tr
                  key={feature.feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium">{formatFeatureName(feature.feature)}</td>
                  <td className="py-3 px-4 text-right">{formatNumber(feature.totalRequests)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(feature.totalCost)}</td>
                  <td className="py-3 px-4 text-right">{formatCurrency(feature.avgCost)}</td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        feature.successRate >= 95
                          ? 'bg-green-100 text-green-700'
                          : feature.successRate >= 85
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {feature.successRate.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  trend,
  icon,
  color,
  delay
}: {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}) {
  const colorClasses = {
    purple: { gradient: 'from-purple-500 to-violet-600', bg: 'from-purple-500 to-violet-500' },
    pink: { gradient: 'from-pink-500 to-rose-600', bg: 'from-pink-500 to-rose-500' },
    green: { gradient: 'from-green-500 to-emerald-600', bg: 'from-green-500 to-emerald-500' },
    orange: { gradient: 'from-orange-500 to-amber-600', bg: 'from-orange-500 to-amber-500' }
  };

  const colors = colorClasses[color as keyof typeof colorClasses];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -5 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} rounded-2xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity`} />
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6 overflow-hidden">
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colors.gradient} opacity-10 rounded-full -mr-16 -mt-16`} />
        
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600 text-sm font-semibold">{title}</span>
            <motion.div 
              className={`h-12 w-12 bg-gradient-to-br ${colors.gradient} rounded-xl flex items-center justify-center shadow-lg text-white`}
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
              {icon}
            </motion.div>
          </div>
          
          <div className="flex items-end justify-between">
            <motion.div 
              className={`text-3xl font-bold bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {value}
            </motion.div>
            {trend !== 0 && (
              <motion.div 
                className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-lg ${
                  trend > 0 
                    ? 'text-green-700 bg-green-50' 
                    : 'text-red-700 bg-red-50'
                }`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.3 }}
              >
                {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {Math.abs(trend).toFixed(1)}%
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Chart Card Component
function ChartCard({
  title,
  children,
  delay
}: {
  title: string;
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {children}
      </div>
    </motion.div>
  );
}
