'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, TrendingDown, Eye, Download,
  Star, Briefcase, ChevronUp, ChevronDown
} from 'lucide-react';

interface AnalyticsData {
  summary: {
    totalViews: number;
    totalDownloads: number;
    avgScore: number;
    totalApplications: number;
    responseRate: number;
    interviewRate: number;
    lastUpdated: string;
  };
  trends: {
    viewsData: Array<{ date: string; views: number; downloads: number }>;
    scoreData: Array<{ date: string; score: number; atsScore: number; designScore: number; contentScore: number }>;
    applicationData: Array<{ month: string; applications: number; responses: number; interviews: number }>;
  };
  breakdown: {
    scoreBreakdown: Array<{ category: string; score: number; maxScore: number }>;
    industryPerformance: Array<{ industry: string; applications: number; responseRate: number }>;
    templateUsage: Array<{ template: string; usage: number; performance: number }>;
  };
  funnel: Array<{ stage: string; count: number; percentage: number }>;
}



export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/analytics/summary?range=${timeRange}`);
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
      setLoading(false);
    };
    
    fetchData();
  }, [timeRange]);



  if (loading) {
    return <AnalyticsLoadingSkeleton />;
  }

  if (!data) {
    return <div className="text-center py-12">Failed to load analytics data</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your resume performance and job application success</p>
          <p className="text-sm text-gray-500">Last updated: {new Date(data.summary.lastUpdated).toLocaleString()}</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 3 months</option>
            <option value="1y">Last year</option>
          </select>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </motion.div>

      {/* Key Metrics Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <MetricCard
          title="Total Views"
          value={data.summary.totalViews}
          trend={12.5}
          icon={Eye}
          color="blue"
        />
        <MetricCard
          title="Downloads"
          value={data.summary.totalDownloads}
          trend={8.3}
          icon={Download}
          color="green"
        />
        <MetricCard
          title="Avg Score"
          value={data.summary.avgScore}
          trend={5.2}
          icon={Star}
          color="yellow"
          suffix="/100"
        />
        <MetricCard
          title="Applications"
          value={data.summary.totalApplications}
          trend={-2.1}
          icon={Briefcase}
          color="purple"
        />
      </motion.div>

      {/* Performance Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Response & Interview Rates */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Rates</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-medium">{data.summary.responseRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.summary.responseRate}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Interview Rate</span>
                <span className="text-sm font-medium">{data.summary.interviewRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${data.summary.interviewRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Application Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Funnel</h3>
          <div className="space-y-3">
            {data.funnel.map((stage, index) => (
              <div key={stage.stage} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                  <span className="text-sm text-gray-500">{stage.count} ({stage.percentage}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 relative overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stage.percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.8 }}
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views & Downloads Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Views & Downloads</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMetric('views')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedMetric === 'views' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Views
              </button>
              <button
                onClick={() => setSelectedMetric('downloads')}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedMetric === 'downloads' 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Downloads
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.trends.viewsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stackId="1"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stackId="2"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Score Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.breakdown.scoreBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Trends Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Score Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.trends.scoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="atsScore"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="designScore"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Industry Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Performance</h3>
          <div className="space-y-4">
            {data.breakdown.industryPerformance.map((industry) => (
              <div key={industry.industry} className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">{industry.industry}</div>
                  <div className="text-sm text-gray-500">{industry.applications} applications</div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{industry.responseRate}%</div>
                  <div className="text-sm text-gray-500">response rate</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Application Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Timeline</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.trends.applicationData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="applications" fill="#3b82f6" name="Applications" />
            <Bar dataKey="responses" fill="#10b981" name="Responses" />
            <Bar dataKey="interviews" fill="#f59e0b" name="Interviews" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Template Usage Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Template Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-sm font-medium text-gray-600">Template</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Usage</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Performance</th>
                <th className="text-center py-2 text-sm font-medium text-gray-600">Trend</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.templateUsage.map((template, index) => (
                <tr key={template.template} className="border-b border-gray-100">
                  <td className="py-3 text-sm font-medium text-gray-900">{template.template}</td>
                  <td className="py-3 text-center text-sm text-gray-600">{template.usage}</td>
                  <td className="py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      template.performance >= 80 
                        ? 'bg-green-100 text-green-800'
                        : template.performance >= 60 
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {template.performance}%
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    {index % 2 === 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number;
  trend: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  suffix?: string;
}

function MetricCard({ title, value, trend, icon: Icon, color, suffix = '' }: MetricCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500 text-blue-600',
    green: 'bg-green-500 text-green-600',
    yellow: 'bg-yellow-500 text-yellow-600',
    purple: 'bg-purple-500 text-purple-600',
  };

  const isPositive = trend > 0;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-opacity-10 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900 mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </div>
        <div className="text-sm text-gray-600">{title}</div>
      </div>
    </motion.div>
  );
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}