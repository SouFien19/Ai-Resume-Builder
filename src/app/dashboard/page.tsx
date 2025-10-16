"use client";

import { motion } from "framer-motion";
import DashboardStats from "@/components/dashboard/DashboardStats";
import QuickActions from "@/components/dashboard/QuickActions";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { PageHeader } from "@/components/ui/modern/page-header";
import { useEffect, useState } from "react";
import { CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2, Sparkles, TrendingUp, Zap, Briefcase, Target, Star, Eye } from "lucide-react";

type CareerIntel = { 
  skillGaps: string[]; 
  salaryInsights: string; 
  progression: string[]; 
  interviewPrep: string[] 
};

type DashboardStatsType = {
  user?: {
    plan: string;
    accountAge: number;
    lastActive: Date;
  };
  resumes?: { total: number; thisMonth: number; trend: number };
  aiGenerations?: { total: number; thisMonth: number; trend: number };
} | null;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0
  },
  transition: { duration: 0.5 }
};

const cardHoverVariants = {
  initial: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02, 
    y: -4
  }
};

export default function Page() {
  const [intel, setIntel] = useState<CareerIntel | null>(null);
  const [loadingIntel, setLoadingIntel] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsType>(null);
  const [expandedSkills, setExpandedSkills] = useState(false);
  const [expandedProgression, setExpandedProgression] = useState(false);
  const [expandedInterview, setExpandedInterview] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Note: Role-based redirect is handled by /api/auth/callback server-side
  // No client-side redirect needed - users land on correct page directly

  const fetchIntel = async () => {
    setLoadingIntel(true);
    try {
      // Try to fetch real career intelligence from API
      const response = await fetch('/api/ai/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: 'Software Engineer',
          experience: '3-5 years',
          skills: ['JavaScript', 'React', 'Node.js'],
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setIntel(data);
        setLastUpdated(new Date());
      } else {
        // Fallback to mock data
        const mockIntel: CareerIntel = {
          skillGaps: [
            "Advanced TypeScript patterns",
            "Cloud infrastructure (AWS/Azure)",
            "System design principles"
          ],
          salaryInsights: "$120k - $160k for senior roles in your location",
          progression: [
            "Senior Engineer → Tech Lead",
            "Consider management track",
            "Specialize in full-stack development"
          ],
          interviewPrep: [
            "Practice system design questions",
            "Review algorithms and data structures",
            "Prepare for behavioral interviews"
          ]
        };
        setIntel(mockIntel);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch career insights:", error);
    } finally {
      setLoadingIntel(false);
    }
  };

  const getTimeAgo = (date: Date | null) => {
    if (!date) return '';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Note: Role-based redirect handled by /api/auth/callback (server-side)
  // Users are sent to correct dashboard on sign-in, no client redirect needed

  useEffect(() => {
    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (response.ok) {
          const result = await response.json();
          setDashboardStats(result.data || result);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchDashboardStats();
    fetchIntel();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white p-4 sm:p-6 lg:p-8">
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-cyan-500/10 rounded-full blur-3xl opacity-30 animation-delay-4000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.03),_transparent_50%)]" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Enhanced Hero Header */}
        <motion.div variants={itemVariants}>
          <PageHeader
            title={dashboardStats?.user ? `Welcome back${dashboardStats.user.plan === 'pro' || dashboardStats.user.plan === 'enterprise' ? ', Pro User' : ''}!` : "Welcome back!"}
            description="Here's an overview of your resume building progress and AI-powered insights."
            badge="Dashboard"
            gradient
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-pink-500/30 transition-all duration-300 text-white"
              >
                <Zap className="mr-2 h-4 w-4" />
                Quick Generate
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-neutral-700/50 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white hover:border-pink-500/30 transition-all"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Portfolio
              </Button>
            </div>
          </PageHeader>
        </motion.div>

        {/* Enhanced Stats */}
        <motion.div variants={itemVariants}>
          <DashboardStats />
        </motion.div>

        {/* Quick Actions with Enhanced Animation */}
        <motion.div variants={itemVariants}>
          <QuickActions />
        </motion.div>

        {/* Enhanced Activity & Insights Grid */}
        <motion.div
          variants={itemVariants}
          className="grid gap-6 lg:grid-cols-7"
        >
          <div className="lg:col-span-4">
            <RecentActivity />
          </div>
          
          {/* Enhanced AI Career Insights Card */}
          <div className="lg:col-span-3">
            <motion.div
              whileHover="hover"
              initial="initial"
              variants={cardHoverVariants}
            >
              <div className="h-full rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-500/30 p-6">
                <div className="flex flex-col space-y-2 pb-4">
                  <div className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                        <Sparkles className="h-5 w-5 text-pink-400" />
                      </div>
                      <CardTitle className="text-lg font-semibold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                        AI Career Insights
                      </CardTitle>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={fetchIntel} 
                      disabled={loadingIntel}
                      className="h-8 w-8 p-0 hover:bg-neutral-700/50"
                    >
                      {loadingIntel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {lastUpdated && (
                    <div className="text-xs text-neutral-500 flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Last updated: {getTimeAgo(lastUpdated)}
                    </div>
                  )}
                </div>
                
                <div className="space-y-6">
                  {!intel && !loadingIntel && (
                    <div className="text-center py-8">
                      <div className="p-4 rounded-full bg-gradient-to-br from-pink-500/10 to-purple-500/10 w-fit mx-auto mb-4">
                        <Target className="h-8 w-8 text-pink-400" />
                      </div>
                      <p className="text-neutral-400 text-sm">
                        Get AI-powered career insights to boost your job search
                      </p>
                      <Button 
                        onClick={fetchIntel}
                        className="mt-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
                      >
                        Generate Insights
                      </Button>
                    </div>
                  )}

                  {loadingIntel && (
                    <div className="text-center py-8 space-y-4">
                      <div className="flex justify-center space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-pink-500 rounded-full"
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                          />
                        ))}
                      </div>
                      <p className="text-neutral-400 text-sm">
                        Analyzing your profile and market trends...
                      </p>
                    </div>
                  )}
                  
                  {intel && !loadingIntel && (
                    <div className="space-y-4">
                      {/* Skill Gaps - Expandable */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <Target className="h-4 w-4 text-pink-400" />
                            Skill Gaps
                          </div>
                          {intel.skillGaps?.length > 3 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedSkills(!expandedSkills)}
                              className="h-6 px-2 text-xs text-pink-400 hover:bg-pink-500/10"
                            >
                              {expandedSkills ? 'Show Less' : `+${intel.skillGaps.length - 3} More`}
                            </Button>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {(expandedSkills ? intel.skillGaps : intel.skillGaps?.slice(0, 3))?.map((skill, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="text-sm text-neutral-300 flex items-center"
                            >
                              <div className="w-1.5 h-1.5 bg-pink-400 rounded-full mr-3 flex-shrink-0" />
                              {skill}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Salary Insights */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 backdrop-blur-sm"
                      >
                        <div className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-blue-400" />
                          Salary Insights
                        </div>
                        <p className="text-sm text-neutral-300">{intel.salaryInsights}</p>
                      </motion.div>

                      {/* Career Progression - Expandable */}
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold text-white flex items-center gap-2">
                            <Star className="h-4 w-4 text-green-400" />
                            Career Progression
                          </div>
                          {intel.progression?.length > 2 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setExpandedProgression(!expandedProgression)}
                              className="h-6 px-2 text-xs text-green-400 hover:bg-green-500/10"
                            >
                              {expandedProgression ? 'Show Less' : `+${intel.progression.length - 2} More`}
                            </Button>
                          )}
                        </div>
                        <ul className="space-y-2">
                          {(expandedProgression ? intel.progression : intel.progression?.slice(0, 2))?.map((step, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 + 0.3 }}
                              className="text-sm text-neutral-300 flex items-center"
                            >
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-3 flex-shrink-0" />
                              {step}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>

                      {/* Interview Prep - NEW! Expandable */}
                      {intel.interviewPrep && intel.interviewPrep.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.3 }}
                          className="p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 backdrop-blur-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-semibold text-white flex items-center gap-2">
                              <Zap className="h-4 w-4 text-amber-400" />
                              Interview Prep
                            </div>
                            {intel.interviewPrep?.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedInterview(!expandedInterview)}
                                className="h-6 px-2 text-xs text-amber-400 hover:bg-amber-500/10"
                              >
                                {expandedInterview ? 'Show Less' : `+${intel.interviewPrep.length - 2} More`}
                              </Button>
                            )}
                          </div>
                          <ul className="space-y-2">
                            {(expandedInterview ? intel.interviewPrep : intel.interviewPrep?.slice(0, 2))?.map((tip, i) => (
                              <motion.li
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 + 0.4 }}
                                className="text-sm text-neutral-300 flex items-center"
                              >
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-3 flex-shrink-0" />
                                {tip}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                      >
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full group border-neutral-600/50 bg-neutral-800/50 text-white hover:bg-neutral-700/50 hover:border-pink-500/50 transition-all" 
                          asChild
                        >
                          <a href="/dashboard/ai-studio" className="inline-flex items-center justify-center">
                            Explore AI Studio
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </a>
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Job Recommendations */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Briefcase className="h-5 w-5 text-pink-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Trending Opportunities</h2>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-neutral-600/50 bg-neutral-800/50 text-neutral-300 hover:bg-neutral-700/50 hover:text-white hover:border-pink-500/50 transition-all"
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { 
                role: "Frontend Engineer", 
                salary: "$90k–$140k", 
                skills: "React, TypeScript, Next.js",
                demand: "high" 
              },
              { 
                role: "Full‑stack Developer", 
                salary: "$100k–$160k", 
                skills: "Node.js, React, PostgreSQL",
                demand: "very high" 
              },
              { 
                role: "Product Designer", 
                salary: "$85k–$130k", 
                skills: "Figma, UX Research, Prototyping",
                demand: "high" 
              }
            ].map((job, idx) => (
              <motion.div
                key={job.role}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * idx }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <div className="h-full rounded-2xl border border-neutral-700/50 bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 backdrop-blur-md shadow-xl hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:border-pink-500/30 p-6">
                  <div className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <CardTitle className="text-lg font-semibold text-white">{job.role}</CardTitle>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    </div>
                    <div className="text-sm text-neutral-400 mb-2">
                      Remote • {job.salary}
                    </div>
                    <div className="text-sm text-neutral-300 mb-4">
                      {job.skills}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 font-medium capitalize">{job.demand} demand</span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 hover:scale-105 shadow-lg hover:shadow-pink-500/30 transition-all duration-300 text-white"
                      asChild
                    >
                      <a href="/dashboard/ai-studio/job-matcher" className="inline-flex items-center justify-center">
                        Match Resume 
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}