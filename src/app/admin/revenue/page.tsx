'use client';

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';


import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Users, Loader2, CreditCard } from 'lucide-react';

interface RevenueData {
  overview: {
    mrr: number;
    arr: number;
    churnRate: number;
    customerLTV: number;
    conversionRate: number;
    totalUsers: number;
    paidUsers: number;
    freeUsers: number;
  };
  trends: {
    revenue: number;
    mrr: number;
  };
  planDistribution: Array<{
    plan: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  revenueOverTime: Array<{
    month: string;
    revenue: number;
    free: number;
    pro: number;
    enterprise: number;
  }>;
  topPayingUsers: Array<{
    userId: string;
    email: string;
    plan: string;
    lifetimeRevenue: number;
  }>;
}

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function RevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(12);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/revenue/overview?months=${timeRange}`);
      const result = await res.json();
      if (result.success) setData(result.data);
    } catch (error) {
      console.error('Error fetching revenue:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
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
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent animate-gradient">
            Revenue Dashboard
          </h1>
          <p className="text-gray-600 mt-3 text-lg">Financial metrics and subscription insights</p>
        </div>

        <motion.div 
          className="flex gap-2"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[3, 6, 12, 24].map((months, index) => (
            <motion.button
              key={months}
              onClick={() => setTimeRange(months)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                timeRange === months
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              {months}M
            </motion.button>
          ))}
        </motion.div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="MRR"
          subtitle="Monthly Recurring Revenue"
          value={formatCurrency(data?.overview.mrr || 0)}
          trend={data?.trends.mrr || 0}
          icon={<DollarSign className="w-6 h-6" />}
          color="green"
          delay={0.1}
        />
        <StatsCard
          title="ARR"
          subtitle="Annual Recurring Revenue"
          value={formatCurrency(data?.overview.arr || 0)}
          trend={data?.trends.revenue || 0}
          icon={<TrendingUp className="w-6 h-6" />}
          color="emerald"
          delay={0.2}
        />
        <StatsCard
          title="Paid Users"
          subtitle={`${data?.overview.conversionRate.toFixed(1)}% conversion`}
          value={data?.overview.paidUsers || 0}
          trend={0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
          delay={0.3}
        />
        <StatsCard
          title="Customer LTV"
          subtitle="Lifetime Value"
          value={formatCurrency(data?.overview.customerLTV || 0)}
          trend={0}
          icon={<CreditCard className="w-6 h-6" />}
          color="purple"
          delay={0.4}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Over Time" delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data?.revenueOverTime || []}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <filter id="revenueGlow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#d1fae5" opacity={0.5} />
              <XAxis 
                dataKey="month" 
                stroke="#10b981" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#a7f3d0', strokeWidth: 2 }}
              />
              <YAxis 
                stroke="#10b981" 
                fontSize={11}
                fontWeight={600}
                tick={{ fill: '#6b7280' }}
                axisLine={{ stroke: '#a7f3d0', strokeWidth: 2 }}
              />
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
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
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="url(#revenueGradient)"
                strokeWidth={4}
                dot={{ fill: '#10b981', r: 6, strokeWidth: 3, stroke: '#fff' }}
                activeDot={{ r: 8, fill: '#059669', strokeWidth: 3, stroke: '#fff', filter: 'url(#revenueGlow)' }}
                filter="url(#revenueGlow)"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Distribution" delay={0.6}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="planShadow">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <Pie
                data={data?.planDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                }}
                label={({ plan, count, percentage }: any) => 
                  `${plan}: ${count} (${percentage.toFixed(1)}%)`
                }
                outerRadius={90}
                innerRadius={50}
                paddingAngle={4}
                dataKey="count"
                animationDuration={1500}
                animationBegin={300}
              >
                {data?.planDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    filter="url(#planShadow)"
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

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue by Plan" delay={0.7}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.revenueOverTime || []}>
              <defs>
                <linearGradient id="proGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#60a5fa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="enterpriseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                </linearGradient>
                <filter id="stackShadow">
                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <CartesianGrid strokeDasharray="5 5" stroke="#dbeafe" opacity={0.5} vertical={false} />
              <XAxis 
                dataKey="month" 
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
                formatter={(value: any) => formatCurrency(value)}
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
                cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
              />
              <Bar 
                dataKey="pro" 
                stackId="a" 
                fill="url(#proGradient)" 
                radius={[0, 0, 0, 0]}
                filter="url(#stackShadow)"
                animationDuration={1200}
              />
              <Bar 
                dataKey="enterprise" 
                stackId="a" 
                fill="url(#enterpriseGradient)" 
                radius={[12, 12, 0, 0]}
                filter="url(#stackShadow)"
                animationDuration={1200}
                animationBegin={200}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Plan Revenue Distribution" delay={0.8}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <defs>
                <filter id="revenuePieShadow">
                  <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.2"/>
                </filter>
              </defs>
              <Pie
                data={data?.planDistribution || []}
                cx="50%"
                cy="50%"
                labelLine={{
                  stroke: '#94a3b8',
                  strokeWidth: 2,
                }}
                label={({ plan, revenue, percentage }: any) => 
                  `${plan}: ${formatCurrency(revenue)} (${percentage.toFixed(1)}%)`
                }
                outerRadius={90}
                innerRadius={45}
                paddingAngle={3}
                dataKey="revenue"
                animationDuration={1500}
                animationBegin={400}
              >
                {data?.planDistribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    filter="url(#revenuePieShadow)"
                    style={{
                      filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
                      cursor: 'pointer'
                    }}
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(value)}
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

      {/* Top Paying Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Top Paying Customers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Lifetime Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data?.topPayingUsers.slice(0, 10).map((user, index) => (
                <motion.tr
                  key={user.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0 + index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                        user.plan === 'enterprise'
                          ? 'bg-purple-100 text-purple-700'
                          : user.plan === 'pro'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-green-600">
                    {formatCurrency(user.lifetimeRevenue)}
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

function StatsCard({ title, subtitle, value, trend, icon, color, delay }: any) {
  const colorClasses: any = {
    green: { gradient: 'from-green-500 to-green-600', bg: 'from-green-500 to-green-500' },
    emerald: { gradient: 'from-emerald-500 to-teal-600', bg: 'from-emerald-500 to-teal-500' },
    blue: { gradient: 'from-blue-500 to-cyan-600', bg: 'from-blue-500 to-cyan-500' },
    purple: { gradient: 'from-purple-500 to-indigo-600', bg: 'from-purple-500 to-indigo-500' }
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
          <div className="flex items-end justify-between">
            <motion.div 
              className={`text-2xl font-bold bg-gradient-to-br ${colors.gradient} bg-clip-text text-transparent`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {typeof value === 'number' ? value.toLocaleString() : value}
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

function ChartCard({ title, children, delay }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow p-6">
        <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
          {title}
        </h2>
        {children}
      </div>
    </motion.div>
  );
}
