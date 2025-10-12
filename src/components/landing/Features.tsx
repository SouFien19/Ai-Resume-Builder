"use client";

import { motion, Variants } from "framer-motion";
import { BrainCircuit, Zap, Gem, Palette, FileText, ShieldCheck, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const featureItems = [
  {
    icon: BrainCircuit,
    title: "AI-Powered Content",
    description: "Our AI analyzes your profile and generates compelling resume content tailored to your target job.",
  },
  {
    icon: Zap,
    title: "Real-Time Suggestions",
    description: "Get instant feedback and suggestions to improve your resume's impact and readability as you type.",
  },
  {
    icon: Palette,
    title: "Professional Templates",
    description: "Choose from a library of modern, professionally designed templates that are proven to impress recruiters.",
  },
  {
    icon: Gem,
    title: "Keyword Optimization",
    description: "Beat the applicant tracking systems (ATS) with AI-driven keyword optimization based on job descriptions.",
  },
  {
    icon: FileText,
    title: "Cover Letter Generator",
    description: "Create persuasive cover letters in minutes. Our AI crafts a unique letter for each application.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy Focused",
    description: "Your data is yours. We are committed to protecting your privacy and ensuring your information is secure.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
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
      damping: 12,
    },
  },
};

function FeatureCard({ feature, index }: { feature: typeof featureItems[0]; index: number }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -8 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700/50 overflow-hidden cursor-pointer"
    >
      {/* Gradient overlay on hover */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-orange-500/5 dark:from-pink-500/10 dark:to-orange-500/10"
      />

      <div className="relative z-10">
        {/* Icon with gradient background */}
        <motion.div
          animate={{
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl mb-4 shadow-lg shadow-pink-500/20 group-hover:shadow-pink-500/40"
        >
          <feature.icon className="w-7 h-7 text-white" />
        </motion.div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-orange-500 group-hover:bg-clip-text transition-all duration-300">
          {feature.title}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-4">{feature.description}</p>

        {/* Arrow appears on hover */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -10 }}
          transition={{ duration: 0.2 }}
          className="flex items-center text-pink-600 dark:text-pink-400 font-medium text-sm"
        >
          Learn more <ArrowRight className="w-4 h-4 ml-1" />
        </motion.div>
      </div>

      {/* Shimmer effect */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 0.6 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{ transform: "skewX(-20deg)" }}
      />
    </motion.div>
  );
}

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
          <Badge variant="secondary" className="mb-4">
            Why Choose Us?
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Our platform is packed with intelligent features designed to give you a competitive edge in your job search.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {featureItems.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
