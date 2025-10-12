"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedGradientBackground from "./AnimatedGradientBackground";
import { useEffect, useState } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

// CountUp hook
function useCountUp(end: number, duration: number = 2000, decimals: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      const easeOutQuad = progress * (2 - progress);
      const currentCount = easeOutQuad * end;
      
      setCount(decimals > 0 ? parseFloat(currentCount.toFixed(decimals)) : Math.floor(currentCount));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, decimals, hasStarted]);

  return { count, start: () => setHasStarted(true) };
}

export default function Hero() {
  const resumesCount = useCountUp(10000, 2000);
  const successRate = useCountUp(95, 2000);
  const rating = useCountUp(4.9, 2000, 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      resumesCount.start();
      successRate.start();
      rating.start();
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white dark:bg-gray-950">
      <AnimatedGradientBackground />
      
      {/* Grid Overlay */}
      <div
        className="absolute inset-0 z-10 bg-grid-pattern-light dark:bg-grid-pattern-dark"
        style={{
          maskImage: "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(255,255,255,0.5) 0%, transparent 100%)",
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-white/30 via-white/80 to-white dark:from-gray-950/30 dark:via-gray-950/80 dark:to-gray-950" />

      <div className="relative z-30 container mx-auto px-4 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants}>
            <Badge variant="outline" className="mb-6 py-2 px-4 border-pink-500/50 text-pink-600 dark:text-pink-400">
              <Sparkles className="w-4 h-4 mr-2 text-pink-500" />
              Powered by the latest AI models
            </Badge>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 mb-6"
          >
            Craft Your Future: The Intelligent{" "}
            <span className="relative inline-block">
              Resume
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                className="absolute -bottom-2 left-0 w-full h-2"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M 0 5 Q 50 10 100 5"
                  stroke="url(#gradient)"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="50%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#a855f7" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>{" "}
            Builder
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-10"
          >
            Transform your career path with a resume that stands out. Our AI analyzes your skills and experience to create a perfectly tailored resume for your dream job.
          </motion.p>

          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4 mb-12">
            <Link href="/dashboard" passHref>
              <Button size="lg" className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg shadow-pink-500/30">
                Get Started for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="#features" passHref>
              <Button size="lg" variant="ghost" className="text-gray-700 dark:text-gray-300">
                Learn More
              </Button>
            </Link>
          </motion.div>

          {/* Animated Resume Mockup */}
          <motion.div
            variants={itemVariants}
            className="relative mt-16 max-w-3xl mx-auto"
          >
            <motion.div
              animate={{ 
                rotateY: [0, 2, -2, 0],
                rotateX: [0, -1, 1, 0]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative"
            >
              {/* Resume Card */}
              <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                {/* AI Writing Indicator */}
                <motion.div
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-3 h-3" />
                  AI Writing...
                </motion.div>

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <motion.div 
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-orange-500"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="flex-1">
                      <motion.div 
                        className="h-6 bg-gradient-to-r from-pink-500 to-orange-500 rounded mb-2"
                        initial={{ width: 0 }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1, delay: 0.5 }}
                      />
                      <motion.div 
                        className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
                        initial={{ width: 0 }}
                        animate={{ width: "80%" }}
                        transition={{ duration: 1, delay: 0.8 }}
                      />
                    </div>
                  </div>

                  {/* Content Blocks */}
                  <div className="space-y-4">
                    {[1, 2, 3].map((block) => (
                      <motion.div
                        key={block}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1 + block * 0.3 }}
                      >
                        <motion.div 
                          className="h-3 bg-gray-300 dark:bg-gray-600 rounded mb-2"
                          initial={{ width: 0 }}
                          animate={{ width: "90%" }}
                          transition={{ duration: 0.8, delay: 1.2 + block * 0.3 }}
                        />
                        <motion.div 
                          className="h-3 bg-gray-200 dark:bg-gray-700 rounded"
                          initial={{ width: 0 }}
                          animate={{ width: "70%" }}
                          transition={{ duration: 0.8, delay: 1.4 + block * 0.3 }}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {/* Skills Tags */}
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["React", "TypeScript", "AI/ML", "Node.js"].map((skill, idx) => (
                      <motion.span
                        key={skill}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 2.5 + idx * 0.1 }}
                        className="px-3 py-1 bg-gradient-to-r from-pink-100 to-orange-100 dark:from-pink-900/30 dark:to-orange-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium border border-pink-200 dark:border-pink-800"
                      >
                        {skill}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Glow Effect */}
              <div className="absolute inset-0 -z-10 bg-gradient-to-r from-pink-500/20 via-orange-500/20 to-purple-500/20 blur-3xl" />
            </motion.div>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {resumesCount.count.toLocaleString()}+
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resumes Created</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-pink-500" />
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {successRate.count}%
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-pink-500" />
                <div className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
                  {rating.count}/5
                </div>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">User Rating</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
