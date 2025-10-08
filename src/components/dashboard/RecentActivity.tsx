"use client";

import { motion } from "framer-motion";
import { FileText, Sparkles, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface ActivityItem {
  type: "resume" | "ai-generation";
  id: string;
  title: string;
  timestamp: Date;
  meta: Record<string, unknown>;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "resume":
      return <FileText className="h-4 w-4 text-blue-400" />;
    case "ai-generation":
      return <Sparkles className="h-4 w-4 text-purple-400" />;
    default:
      return <Clock className="h-4 w-4 text-neutral-400" />;
  }
};

const getActivityLabel = (type: string) => {
  switch (type) {
    case "resume":
      return "Resume Updated";
    case "ai-generation":
      return "AI Generated";
    default:
      return "Activity";
  }
};

const ActivityItemComponent = ({ 
  activity, 
  index 
}: { 
  activity: ActivityItem; 
  index: number;
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3, delay: index * 0.05 }}
    className="flex items-start space-x-3 p-3 hover:bg-neutral-800/50 rounded-lg transition-all duration-200 group cursor-pointer"
  >
    <motion.div
      whileHover={{ scale: 1.2, rotate: 5 }}
      className="mt-1 p-2 rounded-lg bg-neutral-800/80"
    >
      {getActivityIcon(activity.type)}
    </motion.div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white truncate group-hover:text-pink-400 transition-colors">
          {activity.title}
        </p>
        <span className="text-xs text-neutral-500 ml-2 shrink-0">
          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
        </span>
      </div>
      <p className="text-xs text-neutral-400 mt-0.5">{getActivityLabel(activity.type)}</p>
    </div>
  </motion.div>
);

export default function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/dashboard/stats');
        
        if (!response.ok) {
          // Handle 401 specifically - user may not be authenticated yet
          if (response.status === 401) {
            setError('Please sign in to view recent activity');
            return;
          }
          throw new Error('Failed to fetch activity');
        }
        
        const result = await response.json();
        const data = result.data || result;
        
        setActivities(data.recentActivity || []);
      } catch (err) {
        console.error('Error fetching recent activity:', err);
        setError(err instanceof Error ? err.message : 'Failed to load activity');
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="h-full"
    >
      <div className="h-full rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-500/30">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Clock className="h-5 w-5 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
            </div>
            <Link href="/dashboard/resumes">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-neutral-400 hover:text-white hover:bg-neutral-700/50 transition-all group"
              >
                View All
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-1">
            {loading && (
              <>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-start space-x-3 p-3">
                    <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-neutral-800" />
                      <Skeleton className="h-3 w-1/2 bg-neutral-800" />
                    </div>
                  </div>
                ))}
              </>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {!loading && !error && activities.length === 0 && (
              <div className="text-center py-12">
                <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 w-fit mx-auto mb-4">
                  <FileText className="h-8 w-8 text-pink-400" />
                </div>
                <p className="text-neutral-400 text-sm mb-4">No activity yet</p>
                <Link href="/dashboard/resumes/create">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                  >
                    Create Your First Resume
                  </Button>
                </Link>
              </div>
            )}

            {!loading && !error && activities.length > 0 && (
              <>
                {activities.slice(0, 6).map((activity, index) => (
                  <ActivityItemComponent
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
