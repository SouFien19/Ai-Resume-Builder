"use client";

import { motion } from "framer-motion";
import { StatCard } from "@/components/ui/modern/animated-card";
import { FileText, Zap, Target, Download, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

interface DashboardData {
  resumes: { total: number; thisMonth: number; trend: number };
  aiGenerations: { total: number; thisMonth: number; trend: number };
  atsScores: { total: number; avgScore: number; trend: number };
  downloads: { total: number; thisMonth: number; trend: number };
}

export default function DashboardStats() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          // Handle 401 specifically - user may not be authenticated yet
          if (response.status === 401) {
            setError('Please sign in to view your dashboard stats');
            return;
          }
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const result = await response.json();
        const statsData = result.data || result;
        
        setData(statsData);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    // Small delay to allow auth to initialize
    const timer = setTimeout(() => {
      fetchStats();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-neutral-700/50 bg-neutral-900/90 p-6 space-y-4">
            <Skeleton className="h-4 w-24 bg-neutral-800" />
            <Skeleton className="h-8 w-16 bg-neutral-800" />
            <Skeleton className="h-3 w-32 bg-neutral-800" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const stats = [
    {
      title: "Total Resumes",
      value: data.resumes.total.toString(),
      subtitle: `${data.resumes.thisMonth} created this month`,
      icon: <FileText className="w-full h-full" />,
      trend: { 
        value: Math.abs(data.resumes.trend), 
        direction: data.resumes.trend >= 0 ? "up" as const : "down" as const 
      },
      color: "blue" as const,
    },
    {
      title: "AI Generations",
      value: data.aiGenerations.total.toString(),
      subtitle: `${data.aiGenerations.thisMonth} this month`,
      icon: <Zap className="w-full h-full" />,
      trend: { 
        value: Math.abs(data.aiGenerations.trend), 
        direction: data.aiGenerations.trend >= 0 ? "up" as const : "down" as const 
      },
      color: "purple" as const,
    },
    {
      title: "ATS Score",
      value: data.atsScores.avgScore > 0 ? `${data.atsScores.avgScore}%` : "N/A",
      subtitle: `${data.atsScores.total} scans completed`,
      icon: <Target className="w-full h-full" />,
      trend: data.atsScores.avgScore > 0 ? { 
        value: data.atsScores.avgScore, 
        direction: "up" as const 
      } : undefined,
      color: "green" as const,
    },
    {
      title: "Downloads",
      value: data.downloads.total.toString(),
      subtitle: `${data.downloads.thisMonth} this month`,
      icon: <Download className="w-full h-full" />,
      trend: data.downloads.total > 0 ? { 
        value: data.downloads.thisMonth, 
        direction: "up" as const 
      } : undefined,
      color: "orange" as const,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
    >
      {stats.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          delay={index * 0.1}
        />
      ))}
    </motion.div>
  );
}
