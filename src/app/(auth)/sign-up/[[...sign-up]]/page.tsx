"use client";

import { SignUp } from "@clerk/nextjs";
import { LazyMotion, domAnimation, m } from "@/lib/motion";
import { Sparkles, Check, Zap, Shield, Clock } from "lucide-react";
import { useEffect, useRef, lazy, Suspense, useState } from "react";
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

export default function SignUpPage() {
  const { isLoaded, userId, sessionClaims } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by only rendering animations after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Performance optimizations
    authPerformance.start('sign-up-page-load');
    setupAuthPreconnect();
    cleanupStaleAuth();
    
    // Schedule non-critical tasks during idle time for better performance
    idleTaskScheduler.schedule(authIdleTasks.preloadDashboard, { priority: 'high' });
    idleTaskScheduler.schedule(authIdleTasks.warmupAI, { priority: 'low' });
    idleTaskScheduler.schedule(authIdleTasks.cleanupCache, { priority: 'low' });
    
    return () => {
      authPerformance.end('sign-up-page-load');
    };
  }, []);

  // Smart redirect after sign-up completes (once only)
  useEffect(() => {
    if (isLoaded && userId && sessionClaims && !hasRedirected.current) {
      hasRedirected.current = true;
      const role = (sessionClaims?.metadata as any)?.role || 'user';
      const destination = (role === 'admin' || role === 'superadmin') ? '/admin' : '/dashboard';
      
      console.log(`[SIGN-UP] ⚡ Client-side redirect ${role} to ${destination}`);
      
      // Use replace to avoid back button issues
      router.replace(destination);
    }
  }, [isLoaded, userId, sessionClaims, router]);

  const features = [
    { icon: Zap, text: "AI-Powered Content Generation", color: "text-blue-600 dark:text-blue-400", bgColor: "from-blue-500/20 to-blue-600/20 dark:from-blue-500/30 dark:to-blue-600/30", borderColor: "border-blue-400/40" },
    { icon: Shield, text: "ATS-Optimized Templates", color: "text-purple-600 dark:text-purple-400", bgColor: "from-purple-500/20 to-purple-600/20 dark:from-purple-500/30 dark:to-purple-600/30", borderColor: "border-purple-400/40" },
    { icon: Clock, text: "Save 80% of Your Time", color: "text-pink-600 dark:text-pink-400", bgColor: "from-pink-500/20 to-pink-600/20 dark:from-pink-500/30 dark:to-pink-600/30", borderColor: "border-pink-400/40" },
  ];

  // Show static content during SSR to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left Panel - Static version for SSR */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 dark:from-purple-700 dark:via-pink-700 dark:to-orange-700 p-12">
          <div className="relative z-10 text-center max-w-lg">
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
                Join ResumeCraft AI
              </h1>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="flex items-center justify-center bg-white dark:bg-gray-950 p-6">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center lg:hidden space-y-3">
              <div className="flex items-center justify-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  ResumeCraft AI
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 font-medium">Create your account</p>
            </div>
            
            <SignUp
              appearance={{
                layout: {
                  shimmer: false,
                  animations: false,
                },
                elements: {
                  formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg',
                  card: 'shadow-2xl shadow-gray-300/50 dark:shadow-purple-500/20 border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
                  headerTitle: 'text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent',
                  headerSubtitle: 'text-gray-600 dark:text-gray-400 font-medium text-base',
                  socialButtonsBlockButton: 'border-2 border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium shadow-sm',
                  formFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-colors duration-150 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  formFieldLabel: 'text-gray-700 dark:text-gray-300 font-semibold',
                  footerActionLink: 'text-pink-600 dark:text-pink-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold underline-offset-4 hover:underline transition-all',
                  identityPreviewText: 'text-gray-900 dark:text-white font-medium',
                  identityPreviewEditButton: 'text-pink-600 dark:text-pink-400 hover:text-orange-600 dark:hover:text-orange-400 font-semibold',
                  formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors',
                  otpCodeFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
                  dividerLine: 'bg-gray-300 dark:bg-gray-700',
                  dividerText: 'text-gray-500 dark:text-gray-400 font-medium',
                },
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <LazyMotion features={domAnimation}>
      <div className="grid min-h-screen lg:grid-cols-2" suppressHydrationWarning>
        {/* Left Panel - Features & Branding with Gradient Background */}
        <div className="relative hidden lg:flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 dark:from-purple-700 dark:via-pink-700 dark:to-orange-700 p-12 overflow-hidden">
          {/* Lazy-loaded animated background for performance */}
          <Suspense fallback={<div className="absolute inset-0" />}>
            <AnimatedBackground />
          </Suspense>
          
          {/* Additional floating particles for depth */}
          <m.div
          className="absolute top-40 right-40 w-32 h-32 bg-white/20 rounded-full blur-2xl"
          animate={{ 
            y: [0, -100, 0],
            x: [0, 50, 0],
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        />
        <m.div
          className="absolute bottom-40 left-40 w-24 h-24 bg-orange-300/10 rounded-full blur-xl"
          animate={{ 
            y: [0, 80, 0],
            x: [0, -40, 0],
            scale: [1, 1.8, 1],
            opacity: [0.15, 0.3, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        />
        
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
                Start Your Journey
              </m.h1>
            </div>
            <m.p 
              className="text-xl text-white/90 font-light"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.4 }}
            >
              Join thousands of professionals creating winning resumes with AI
            </m.p>
          </m.div>
          
          {/* Features List with powerful animations */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-4 pt-8"
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <m.div
                  key={feature.text}
                  initial={{ opacity: 0, x: -30, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.5 + index * 0.15,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.05, 
                    x: 10,
                    transition: { duration: 0.3 }
                  }}
                  className="flex items-center gap-4 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-4 hover:bg-white/30 hover:shadow-xl hover:shadow-white/20 transition-all group cursor-pointer"
                >
                  <m.div 
                    className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <m.div
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.4
                      }}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </m.div>
                  </m.div>
                  <div className="flex items-center gap-2 flex-1">
                    <m.div 
                      className="w-5 h-5 rounded-full bg-white/30 backdrop-blur-sm border border-white/40 flex items-center justify-center"
                      animate={{ 
                        scale: [1, 1.2, 1],
                        rotate: [0, 360]
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.3
                      }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </m.div>
                    <span className="text-white/90 text-sm font-medium">{feature.text}</span>
                  </div>
                </m.div>
              );
            })}
          </m.div>

          {/* Trust Indicators with staggered animations */}
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="pt-8 space-y-3"
          >
            <div className="flex items-center justify-center gap-8">
              {[
                { value: "10K+", label: "Happy Users" },
                { value: "50K+", label: "Resumes Created" },
                { value: "4.9★", label: "User Rating" }
              ].map((stat, index) => (
                <m.div 
                  key={index}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.9 + index * 0.1,
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.15, 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  className="text-center cursor-pointer"
                >
                  <m.div 
                    className="text-3xl font-bold text-white"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ 
                      duration: 2.5,
                      repeat: Infinity,
                      delay: index * 0.3
                    }}
                  >
                    {stat.value}
                  </m.div>
                  <div className="text-xs text-white/80 mt-1 font-medium">{stat.label}</div>
                </m.div>
              ))}
            </div>
          </m.div>
        </m.div>
      </div>

      {/* Right Panel - White/Clean Background with Form */}
      <div className="flex items-center justify-center bg-white dark:bg-gray-950 p-6">
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Mobile header */}
          <div className="text-center lg:hidden space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-xl shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent">
                ResumeCraft AI
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Create your account</p>
          </div>
          
          {/* Clerk Sign Up Component - Maximum performance */}
          <SignUp
            appearance={{
              layout: {
                shimmer: false, // Disable for faster render ⚡
                animations: false, // Disable for instant interaction ⚡
              },
              elements: {
                formButtonPrimary: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold shadow-lg',
                card: 'shadow-2xl shadow-gray-300/50 dark:shadow-purple-500/20 border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900',
                headerTitle: 'text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-400 dark:via-pink-400 dark:to-orange-400 bg-clip-text text-transparent',
                headerSubtitle: 'text-gray-600 dark:text-gray-400 font-medium text-base',
                socialButtonsBlockButton: 'border-2 border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-150 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-medium shadow-sm',
                formFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 focus:ring-4 focus:ring-pink-500/20 transition-colors duration-150 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500',
                formFieldLabel: 'text-gray-700 dark:text-gray-300 font-semibold',
                footerActionLink: 'text-pink-600 dark:text-pink-400 hover:text-orange-600 dark:hover:text-orange-400 font-bold underline-offset-4 hover:underline transition-all',
                identityPreviewText: 'text-gray-900 dark:text-white font-medium',
                identityPreviewEditButton: 'text-pink-600 dark:text-pink-400 hover:text-orange-600 dark:hover:text-orange-400 font-semibold',
                formFieldInputShowPasswordButton: 'text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors',
                otpCodeFieldInput: 'border-2 border-gray-200 dark:border-gray-700 focus:border-pink-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
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

