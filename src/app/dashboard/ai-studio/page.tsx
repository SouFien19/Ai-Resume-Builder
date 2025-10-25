"use client";

// Force dynamic rendering (no prerendering/SSG)
export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Brain, Target, Sparkles, ArrowRight,
  BarChart3, FileText, Briefcase, Clock,
  Zap, TrendingUp, Award, Lightbulb,
  Play, Star, CheckCircle2, Eye,
  ChevronRight, History, Activity
} from 'lucide-react';

import { PageHeader } from '@/components/ui/modern/page-header';
import { AnimatedCard, StatCard } from '@/components/ui/modern/animated-card';
import { Button } from '@/components/ui/button';
import { CardHeader, CardTitle, CardContent, Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// AI Studio tools configuration
const aiTools = [
  {
    id: 'ats-optimizer',
    title: 'ATS Optimizer',
    description: 'Optimize your resume to pass Applicant Tracking Systems and get more interviews',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    features: ['Keyword Analysis', 'ATS Scoring', 'Format Optimization', 'Industry-specific Tips'],
    route: '/dashboard/ai-studio/ats-optimizer'
  },
  {
    id: 'content-gen',
    title: 'Content Generator',
    description: 'Generate compelling resume content with AI assistance for all sections',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    features: ['Professional Summaries', 'Experience Descriptions', 'Skills Optimization', 'Achievement Highlights'],
    route: '/dashboard/ai-studio/content-gen'
  },
  {
    id: 'job-matcher',
    title: 'Job Matcher',
    description: 'Find jobs that perfectly match your skills and experience with AI-powered matching',
    icon: Briefcase,
    color: 'from-green-500 to-emerald-500',
    features: ['Smart Job Search', 'Compatibility Scoring', 'Application Tracking', 'Market Analysis'],
    route: '/dashboard/ai-studio/job-matcher'
  }
];

// Loading component
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

// Quick Actions Data
const quickActions = [
  {
    id: 'analyze',
    title: 'Analyze Resume',
    description: 'Quick ATS score check',
    icon: Target,
    color: 'from-blue-500 to-cyan-500',
    route: '/dashboard/ai-studio/ats-optimizer'
  },
  {
    id: 'generate',
    title: 'Generate Content',
    description: 'Create resume sections',
    icon: Sparkles,
    color: 'from-purple-500 to-pink-500',
    route: '/dashboard/ai-studio/content-gen'
  },
  {
    id: 'match',
    title: 'Find Jobs',
    description: 'AI-powered job matching',
    icon: Briefcase,
    color: 'from-green-500 to-emerald-500',
    route: '/dashboard/ai-studio/job-matcher'
  },
  {
    id: 'tips',
    title: 'Get Tips',
    description: 'AI recommendations',
    icon: Lightbulb,
    color: 'from-orange-500 to-yellow-500',
    route: '/dashboard/ai-studio/ats-optimizer'
  }
];

// AI Tips Data
const aiTips = [
  {
    id: 1,
    title: 'Optimize for ATS',
    description: 'Use keywords from job descriptions naturally in your resume. ATS systems scan for exact matches.',
    icon: Target,
    color: 'blue'
  },
  {
    id: 2,
    title: 'Quantify Achievements',
    description: 'Include numbers and metrics. "Increased sales by 45%" is more powerful than "Increased sales significantly".',
    icon: TrendingUp,
    color: 'green'
  },
  {
    id: 3,
    title: 'Action Verbs Matter',
    description: 'Start bullet points with strong action verbs like "Led", "Developed", "Achieved" for maximum impact.',
    icon: Zap,
    color: 'purple'
  },
  {
    id: 4,
    title: 'Tailor Each Resume',
    description: 'Customize your resume for each job application. Generic resumes have 50% lower success rates.',
    icon: Award,
    color: 'orange'
  }
];

// Feature card component
function FeatureCard({ tool, index }: { tool: typeof aiTools[0]; index: number }) {
  const router = useRouter();
  const Icon = tool.icon;

  const handleNavigation = () => {
    // Preload the route for faster navigation
    router.prefetch(tool.route);
    router.push(tool.route);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group"
    >
      <AnimatedCard variant="glass" className="h-full">
        <CardHeader className="pb-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-xl mb-2 text-white">{tool.title}</CardTitle>
          <p className="text-neutral-300 text-sm leading-relaxed">
            {tool.description}
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2 mb-6">
            {tool.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-neutral-400">
                <div className="w-1.5 h-1.5 bg-neutral-500 rounded-full"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <Button
            onClick={handleNavigation}
            className="w-full bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700"
          >
            Get Started
            <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      </AnimatedCard>
    </motion.div>
  );
}

export default function AIStudioPage() {
  const router = useRouter();
  const [activeTip, setActiveTip] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Preload all AI Studio routes for faster navigation
  React.useEffect(() => {
    aiTools.forEach(tool => {
      router.prefetch(tool.route);
    });
    
    // Load recent activity from localStorage
    try {
      const saved = localStorage.getItem('aiStudioActivity');
      if (saved) {
        setRecentActivity(JSON.parse(saved).slice(0, 3));
      }
    } catch (error) {
      console.error('Failed to load activity:', error);
    }
  }, [router]);

  // Auto-rotate tips every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTip((prev) => (prev + 1) % aiTips.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen p-6 lg:p-10 overflow-hidden">
      {/* Background decorative blobs (dark theme) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl opacity-50 animate-blob" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl opacity-50 animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-purple-500/10 rounded-full blur-3xl opacity-30 animation-delay-4000" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.06),_transparent_50%)]" />
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
        <PageHeader
          title="AI Studio"
          description="Optimize your resume, generate content, and match jobs with AI-powered tools—all in one place."
          badge="AI Tools"
          gradient
        >
          <div className="flex gap-3">
            <Button size="lg" className="bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-700 hover:to-orange-700" onClick={() => router.push('/dashboard/ai-studio/ats-optimizer')}>
              <Sparkles className="mr-2 h-4 w-4" /> Start with ATS Optimizer
            </Button>
          </div>
        </PageHeader>

        {/* Stats Section (modern) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="AI Models" value="15+" icon={<Brain className="h-5 w-5" />} />
          <StatCard title="Success Rate" value="94%" icon={<FileText className="h-5 w-5" />} />
          <StatCard title="Improvements" value="3.2x" icon={<BarChart3 className="h-5 w-5" />} />
        </motion.div>

        {/* Quick Actions Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Quick Actions</h3>
              <p className="text-neutral-400">Jump into your most common tasks</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => router.push(action.route)}
                    className="w-full bg-neutral-900/50 hover:bg-neutral-800/50 border border-neutral-800 rounded-2xl p-6 text-left transition-all hover:border-neutral-700 group"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h4 className="text-white font-semibold mb-1">{action.title}</h4>
                    <p className="text-neutral-400 text-sm">{action.description}</p>
                  </button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* AI Tips Carousel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.06 }}>
          <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                    <Lightbulb className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      AI Tip of the Moment
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">New</Badge>
                    </h3>
                    <div className="flex gap-1">
                      {aiTips.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveTip(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === activeTip ? 'bg-orange-400 w-6' : 'bg-neutral-600'
                          }`}
                          aria-label={`Go to tip ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTip}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h4 className="text-white font-semibold mb-2">{aiTips[activeTip].title}</h4>
                      <p className="text-neutral-300 text-sm leading-relaxed">{aiTips[activeTip].description}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.07 }}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">Recent Activity</h3>
                <p className="text-neutral-400">Pick up where you left off</p>
              </div>
              <Button variant="ghost" className="text-neutral-400 hover:text-white" onClick={() => router.push('/dashboard/ai-studio/ats-optimizer')}>
                <History className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="bg-neutral-900/50 border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                          {activity.type || 'AI Tool'}
                        </Badge>
                        <span className="text-xs text-neutral-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-2 line-clamp-1 group-hover:text-pink-400 transition-colors">
                        {activity.title || 'Untitled'}
                      </h4>
                      <p className="text-neutral-400 text-sm line-clamp-2 mb-3">
                        {activity.content?.substring(0, 80) || 'Generated content...'}
                      </p>
                      <Button variant="ghost" size="sm" className="w-full text-neutral-400 hover:text-white hover:bg-neutral-800">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI Tools Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Choose Your AI Assistant</h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Each tool helps you tackle a specific step in your job search journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiTools.map((tool, index) => (
              <FeatureCard key={tool.id} tool={tool} index={index} />
            ))}
          </div>
        </motion.div>

        {/* How It Works Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}>
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30">Simple Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
              Get professional results in just 3 simple steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-blue-500/20">
                1
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Upload Your Content</h3>
              <p className="text-neutral-400">
                Paste your resume, job description, or let AI start from scratch
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-purple-500/20">
                2
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analyzes & Optimizes</h3>
              <p className="text-neutral-400">
                Our AI engine processes your content and provides intelligent recommendations
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-green-500/20">
                3
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Download & Apply</h3>
              <p className="text-neutral-400">
                Get your optimized content ready to use in minutes, not hours
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
          <div className="bg-gradient-to-br from-neutral-900/80 to-neutral-900/40 rounded-3xl border border-neutral-800 p-8 md:p-12">
            <div className="text-center mb-10">
              <Badge className="mb-4 bg-pink-500/20 text-pink-300 border-pink-500/30">Why Choose Us</Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Built for Job Seekers</h2>
              <p className="text-lg text-neutral-300 max-w-2xl mx-auto">
                Everything you need to stand out in today's competitive job market
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Zap,
                  title: 'Lightning Fast',
                  description: 'Generate optimized content in seconds, not hours',
                  color: 'from-yellow-500 to-orange-500'
                },
                {
                  icon: Target,
                  title: 'ATS-Optimized',
                  description: '94% pass rate through applicant tracking systems',
                  color: 'from-blue-500 to-cyan-500'
                },
                {
                  icon: Award,
                  title: 'Expert Quality',
                  description: 'Trained on thousands of successful resumes',
                  color: 'from-purple-500 to-pink-500'
                },
                {
                  icon: CheckCircle2,
                  title: 'Always Improving',
                  description: 'Regular updates with latest hiring trends',
                  color: 'from-green-500 to-emerald-500'
                }
              ].map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="text-center"
                  >
                    <div className={`w-14 h-14 mx-auto mb-4 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm">{feature.description}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-center">
          <div className="bg-gradient-to-r from-pink-600 to-orange-600 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Career?</h3>
            <p className="text-lg text-pink-100 mb-8 max-w-2xl mx-auto">
              Join thousands of professionals who accelerated their growth with our AI-powered tools
            </p>
            <Button
              onClick={() => router.push('/dashboard/ai-studio/ats-optimizer')}
              size="lg"
              className="bg-white text-pink-600 hover:bg-white/90"
            >
              Start with ATS Optimizer
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
