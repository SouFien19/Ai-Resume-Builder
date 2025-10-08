"use client";

import { motion, Variants } from "framer-motion";
import { BrainCircuit, Zap, Gem, Palette, FileText, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-white dark:bg-gray-800/50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700/50"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-lg mb-4 border border-blue-200 dark:border-blue-800">
                <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
