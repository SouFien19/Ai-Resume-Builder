"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Eye,
  Download,
  Target,
  TrendingUp,
  Clock,
  Share2,
  Calendar,
  Activity,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface AnalyticsData {
  resumeId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  views: number;
  downloads: number;
  atsScore: number;
  completion: number;
  templateId: string;
  shareEnabled: boolean;
  shareToken?: string;
  daysSinceCreation: number;
  daysSinceUpdate: number;
  engagementRate: string;
  status: string;
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        logger.info('Fetching resume analytics', { resumeId: resolvedParams.id });
        const response = await fetch(`/api/resumes/${resolvedParams.id}/analytics`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        
        const data = await response.json();
        setAnalytics(data.analytics);
        logger.info('Analytics loaded successfully');
      } catch (error) {
        logger.error('Error fetching analytics', { error: error instanceof Error ? error.message : 'Unknown error' });
        toast.error("Failed to Load Analytics", {
          description: "Could not load analytics data. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto"
          />
          <p className="text-neutral-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-center">
        <Card className="max-w-md p-8 bg-neutral-900 border-neutral-700">
          <CardContent className="text-center space-y-4">
            <BarChart3 className="h-16 w-16 text-neutral-400 mx-auto" />
            <h2 className="text-xl font-semibold">Analytics Not Available</h2>
            <p className="text-neutral-400">Could not load analytics for this resume.</p>
            <Button onClick={() => router.push('/dashboard/resumes')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Resumes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'published':
        return { color: "bg-green-500/20 text-green-400 border-green-500/30", label: 'Published' };
      case 'archived':
        return { color: "bg-neutral-500/20 text-neutral-400 border-neutral-500/30", label: 'Archived' };
      default:
        return { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: 'Draft' };
    }
  };

  const statusConfig = getStatusConfig(analytics.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/resumes')}
            className="text-neutral-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Resumes
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
                Resume Analytics
              </h1>
              <p className="text-xl text-neutral-300 mt-2">{analytics.name}</p>
            </div>
            
            <Badge variant="outline" className={cn("px-4 py-2 text-sm", statusConfig.color)}>
              {statusConfig.label}
            </Badge>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Total Views</p>
                  <p className="text-3xl font-bold text-white">{analytics.views}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/20">
                  <Eye className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Downloads</p>
                  <p className="text-3xl font-bold text-white">{analytics.downloads}</p>
                </div>
                <div className="p-3 rounded-xl bg-green-500/20">
                  <Download className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">ATS Score</p>
                  <p className="text-3xl font-bold text-white">{analytics.atsScore}%</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-500/20">
                  <Target className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400 mb-1">Engagement</p>
                  <p className="text-3xl font-bold text-white">{analytics.engagementRate}%</p>
                </div>
                <div className="p-3 rounded-xl bg-pink-500/20">
                  <TrendingUp className="h-6 w-6 text-pink-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Detailed Analytics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Completion & Quality */}
          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-400" />
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">Completion</span>
                  <span className="text-lg font-semibold text-white">{analytics.completion}%</span>
                </div>
                <div className="w-full bg-neutral-700/50 rounded-full h-3">
                  <motion.div
                    className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.completion}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-neutral-400">ATS Score</span>
                  <span className="text-lg font-semibold text-white">{analytics.atsScore}%</span>
                </div>
                <div className="w-full bg-neutral-700/50 rounded-full h-3">
                  <motion.div
                    className={cn(
                      "h-3 rounded-full",
                      analytics.atsScore >= 90 ? "bg-gradient-to-r from-green-500 to-emerald-600" :
                      analytics.atsScore >= 75 ? "bg-gradient-to-r from-amber-500 to-orange-600" :
                      "bg-gradient-to-r from-red-500 to-pink-600"
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${analytics.atsScore}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-400">Created</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {new Date(analytics.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {analytics.daysSinceCreation} days ago
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-400">Last Updated</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">
                    {new Date(analytics.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {analytics.daysSinceUpdate} days ago
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm text-neutral-400">Share Status</span>
                </div>
                <Badge variant={analytics.shareEnabled ? "default" : "outline"} className={analytics.shareEnabled ? "bg-green-500/20 text-green-400" : ""}>
                  {analytics.shareEnabled ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-neutral-700 bg-gradient-to-br from-neutral-900 to-neutral-800 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/dashboard/resumes/${analytics.resumeId}/edit`)}
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
              >
                Edit Resume
              </Button>
              <Button
                onClick={() => router.push(`/dashboard/resumes/${analytics.resumeId}/preview`)}
                variant="outline"
                className="border-neutral-600"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={() => router.push('/dashboard/resumes')}
                variant="outline"
                className="border-neutral-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to All Resumes
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
