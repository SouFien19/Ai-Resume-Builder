"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AnimatedGradientBackground from "./AnimatedGradientBackground";

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

export default function Hero() {
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
            <Badge variant="outline" className="mb-6 py-2 px-4 border-blue-500/50 text-blue-600 dark:text-blue-400">
              <Sparkles className="w-4 h-4 mr-2 text-blue-500" />
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
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
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

          <motion.div variants={itemVariants} className="flex justify-center items-center gap-4">
            <Link href="/dashboard" passHref>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20">
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
        </motion.div>
      </div>
    </section>
  );
}
