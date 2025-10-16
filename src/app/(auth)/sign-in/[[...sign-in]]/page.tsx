"use client";

import { SignIn } from "@clerk/nextjs";
import { LazyMotion, domAnimation, m } from "@/lib/motion";
import { Sparkles, TrendingUp, Users, Star } from "lucide-react";
import { useEffect, useRef, lazy, Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  setupAuthPreconnect, 
  cleanupStaleAuth, 
  authPerformance,
  optimizedClerkAppearance 
} from "@/lib/utils/authOptimization";
import { idleTaskScheduler, authIdleTasks } from "@/lib/utils/idleTaskScheduler";

// Lazy load heavy components for better performance
const AnimatedBackground = lazy(() => import('@/components/auth/AnimatedBackground'));
const StatsSection = lazy(() => import('@/components/auth/StatsSection'));

export default function SignInPage() {
  const { isLoaded, userId, sessionClaims } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Performance optimizations
    authPerformance.start('sign-in-page-load');
    setupAuthPreconnect();
    cleanupStaleAuth();
    
    // Schedule non-critical tasks during idle time for better performance
    idleTaskScheduler.schedule(authIdleTasks.preloadDashboard, { priority: 'high' });
    idleTaskScheduler.schedule(authIdleTasks.warmupAI, { priority: 'low' });
    idleTaskScheduler.schedule(authIdleTasks.cleanupCache, { priority: 'low' });
    
    return () => {
      authPerformance.end('sign-in-page-load');
    };
  }, []);

  // Smart redirect after sign-in completes (once only)
  const hasRedirected = useRef(false);
  
  useEffect(() => {
    if (isLoaded && userId && sessionClaims && !hasRedirected.current) {
      hasRedirected.current = true;
      const role = (sessionClaims?.metadata as any)?.role || 'user';
      const destination = (role === 'admin' || role === 'superadmin') ? '/admin' : '/dashboard';
      
      console.log(`[SIGN-IN] ⚡ Client-side redirect ${role} to ${destination}`);
      
      // Use replace to avoid back button issues
      router.replace(destination);
    }
  }, [isLoaded, userId, sessionClaims, router]);

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel - Animated Branding with Gradient Background */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 dark:from-blue-700 dark:via-purple-700 dark:to-pink-700 p-12 overflow-hidden">
          {/* Lazy-loaded animated background for performance */}
          <Suspense fallback={<div className="absolute inset-0" />}>
            <AnimatedBackground />
          </Suspense>
          
          {/* Content */}
          <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-lg space-y-8"
        >
          <m.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <m.div 
                className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 0.95, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <m.div
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-10 h-10 text-white" />
                </m.div>
              </m.div>
              <m.h1 
                className="text-5xl font-bold tracking-tight text-white drop-shadow-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Welcome Back
              </m.h1>
            </div>
            <m.p 
              className="text-xl text-white/90 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Continue building your professional future
            </m.p>
          </m.div>
          
          {/* Animated Stats with powerful staggered entrance */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="grid grid-cols-3 gap-6 pt-8"
          >
            {[
              { icon: Users, value: "10K+", label: "Active Users", delay: 0 },
              { icon: TrendingUp, value: "50K+", label: "Resumes", delay: 0.1 },
              { icon: Star, value: "4.9★", label: "Rating", delay: 0.2 }
            ].map((stat, index) => (
              <m.div 
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: 0.5 + stat.delay,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  scale: 1.1, 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
                className="space-y-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-4 hover:bg-white/30 hover:shadow-xl hover:shadow-white/20 transition-all cursor-pointer"
              >
                <m.div 
                  className="w-10 h-10 mx-auto bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/40"
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </m.div>
                <m.div 
                  className="text-3xl font-bold text-white"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.2
                  }}
                >
                  {stat.value}
                </m.div>
                <div className="text-xs text-white/80 font-medium">{stat.label}</div>
              </m.div>
            ))}
          </m.div>

          {/* Features with staggered entrance and hover effects */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="pt-8 space-y-3 text-left"
          >
            {["AI-Powered Content Generation", "ATS-Optimized Templates", "Real-Time Keyword Suggestions"].map((feature, index) => (
              <m.div
                key={feature}
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  delay: 0.7 + index * 0.15,
                  duration: 0.6,
                  ease: "easeOut"
                }}
                whileHover={{ 
                  x: 10,
                  transition: { duration: 0.2 }
                }}
                className="flex items-center gap-3 text-white/90"
              >
                <div className="w-2 h-2 bg-white rounded-full shadow-sm shadow-white/50" />
                <span className="text-sm font-medium">{feature}</span>
              </m.div>
            ))}
          </m.div>
        </m.div>
      </div>

      {/* Right Panel - White/Clean Background with Form */}
      <div className="flex items-center justify-center bg-white dark:bg-gray-950 p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile header */}
          <div className="text-center lg:hidden space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                ResumeCraft AI
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Sign in to your account</p>
          </div>
          
          {/* Clerk Sign In Component - Maximum performance */}
          <SignIn
            appearance={{
              layout: {
                shimmer: false, // Disable for faster render ⚡
                animations: false, // Disable for instant interaction ⚡
              },
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg',
                card: 'shadow-2xl shadow-gray-300/50 dark:shadow-blue-500/20 border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
                headerTitle: 'text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent',
                headerSubtitle: 'text-gray-600 dark:text-gray-400 font-medium text-base',
                socialButtonsBlockButton: 'border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium shadow-sm',
                formFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-colors duration-150 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
                formFieldLabel: 'text-gray-700 dark:text-gray-300 font-semibold',
                footerActionLink: 'text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-bold underline-offset-4 hover:underline transition-all',
                identityPreviewText: 'text-gray-900 dark:text-white font-medium',
                identityPreviewEditButton: 'text-purple-600 dark:text-purple-400 hover:text-pink-600 dark:hover:text-pink-400 font-semibold',
                formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors',
                otpCodeFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-purple-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
                dividerLine: 'bg-gray-300 dark:bg-gray-700',
                dividerText: 'text-gray-500 dark:text-gray-400 font-medium',
              },
            }}
          />
        </div>
      </div>
    </div>
    </LazyMotion>
  );
}

