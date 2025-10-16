'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, TrendingUp, FileText, Activity, Loader2 } from 'lucide-react';

interface AnalyticsData {
  engagement: {
    dau: number;
    wau: number;
    mau: number;
    totalUsers: number;
  };
  userGrowth: Array<{ date: string; newUsers: number; totalUsers: number }>;
  resumeGrowth: Array<{ date: string; resumesCreated: number }>;
  activeUsersOverTime: Array<{ date: string; activeUsers: number }>;
  resumes: {
    total: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  templates: Array<{ templateId: string; count: number }>;
}

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/overview?days=${timeRange}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">User engagement and platform insights</p>
        </div>

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
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg'
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
          title="DAU"
          subtitle="Daily Active Users"
          value={data?.engagement.dau || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          delay={0.1}
        />
        <StatsCard
          title="WAU"
          subtitle="Weekly Active Users"
          value={data?.engagement.wau || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="cyan"
          delay={0.2}
        />
        <StatsCard
          title="MAU"
          subtitle="Monthly Active Users"
          value={data?.engagement.mau || 0}
          icon={<Activity className="w-6 h-6" />}
          color="purple"
          delay={0.3}
        />
        <StatsCard
          title="Total Resumes"
          subtitle="All time created"
          value={data?.resumes.total || 0}
          icon={<FileText className="w-6 h-6" />}
          color="pink"
          delay={0.4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="User Growth" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data?.userGrowth || []}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.9} />
                  <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity={0.1} />
                </linearGradient>
                <filter id="userShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#3b82f6" floodOpacity="0.3"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#dbeafe" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#3b82f6" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#93c5fd', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#3b82f6" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#93c5fd', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(59, 130, 246, 0.95)',
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
                dataKey="totalUsers"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorUsers)"
                filter="url(#userShadow)"
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Active Users Trend" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.activeUsersOverTime || []}>
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#06b6d4" />
                  <stop offset="50%" stopColor="#0891b2" />
                  <stop offset="100%" stopColor="#0e7490" />
                </linearGradient>
                <filter id="cyanGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#cffafe" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                stroke="#06b6d4" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#67e8f9', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#06b6d4" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#67e8f9', strokeWidth: 2 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(6, 182, 212, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.2)',
                  padding: '12px 16px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white', fontWeight: 'bold', marginBottom: '4px' }}
                itemStyle={{ color: 'white' }}
              />
              <Line
                type="monotone"
                dataKey="activeUsers"
                stroke="url(#cyanGradient)"
                strokeWidth={4}
                dot={{ fill: '#06b6d4', r: 6, strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#0891b2', strokeWidth: 3, stroke: '#fff', filter: 'url(#cyanGlow)' }}
                filter="url(#cyanGlow)"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Resume Creation Trend" delay={0.7}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.resumeGrowth || []}>
              <defs>
                <linearGradient id="resumeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                </linearGradient>
                <filter id="resumeShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#8b5cf6" floodOpacity="0.4"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#e0e7ff" opacity={0.5} vertical={false} />
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
                cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
              />
              <Bar 
                dataKey="resumesCreated" 
                fill="url(#resumeGradient)" 
                radius={[12, 12, 0, 0]}
                filter="url(#resumeShadow)"
                animationDuration={1200}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Template Popularity" delay={0.8}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="templateShadow">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <Pie
                data={data?.templates || []}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                }}
                label={({ templateId, count, percent }: any) => 
                  `${templateId}: ${count} (${(percent * 100).toFixed(1)}%)`
                }
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}
                dataKey="count"
                animationDuration={1500}
                animationBegin={300}
              >
                {data?.templates.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    filter="url(#templateShadow)"
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
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function StatsCard({ title, subtitle, value, icon, color, delay }: any) {
  const colorClasses: any = {
    blue: { gradient: 'from-blue-500 to-blue-600', bg: 'from-blue-500 to-blue-500' },
    cyan: { gradient: 'from-cyan-500 to-teal-600', bg: 'from-cyan-500 to-teal-500' },
    purple: { gradient: 'from-purple-500 to-indigo-600', bg: 'from-purple-500 to-indigo-500' },
    pink: { gradient: 'from-pink-500 to-rose-600', bg: 'from-pink-500 to-rose-500' }
  };

  const colors = colorClasses[color];

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
            <div>
              <div className="text-gray-700 text-sm font-semibold">{title}</div>
              <div className="text-gray-500 text-xs mt-0.5">{subtitle}</div>
            </div>
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
          <motion.div 
            className={`text-3xl font-bold bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
          >
            {value.toLocaleString()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function ChartCard({ title, children, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/5 to-teal-500/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {children}
      </div>
    </motion.div>
  );
}
