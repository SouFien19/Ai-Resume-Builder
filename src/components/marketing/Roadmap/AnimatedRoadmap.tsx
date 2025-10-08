"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  LayoutTemplate, 
  Edit3, 
  Bot, 
  Download, 
  Briefcase, 
  Trophy 
} from "lucide-react";

const roadmapSteps = [
  {
    icon: LayoutTemplate,
    title: "Choose Template",
    description: "Select from 15+ professional templates",
    color: "from-blue-500 to-cyan-500",
    delay: 0.1,
  },
  {
    icon: Edit3,
    title: "Add Content",
    description: "Fill in your information with our wizard",
    color: "from-purple-500 to-pink-500",
    delay: 0.2,
  },
  {
    icon: Bot,
    title: "AI Optimize",
    description: "Get AI-powered optimization suggestions",
    color: "from-green-500 to-emerald-500",
    delay: 0.3,
  },
  {
    icon: Download,
    title: "Export & Share",
    description: "Download PDF or share online link",
    color: "from-orange-500 to-amber-500",
    delay: 0.4,
  },
  {
    icon: Briefcase,
    title: "Land Your Job",
    description: "Apply with confidence",
    color: "from-red-500 to-rose-500",
    delay: 0.5,
  },
  {
    icon: Trophy,
    title: "Success!",
    description: "Get interviews and job offers",
    color: "from-yellow-500 to-orange-500",
    delay: 0.6,
  },
];

interface RoadmapStepProps {
  step: typeof roadmapSteps[0];
  index: number;
  isLast: boolean;
}

function RoadmapStep({ step, index, isLast }: RoadmapStepProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      className="relative flex items-center gap-6 p-6"
      initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
      transition={{ duration: 0.6, delay: step.delay }}
    >
      {/* Step Number */}
      <motion.div
        className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-900 shadow-lg"
        whileHover={{ scale: 1.1 }}
        animate={isInView ? { scale: [0.8, 1.1, 1] } : { scale: 0.8 }}
        transition={{ duration: 0.5, delay: step.delay + 0.2 }}
      >
        <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg`}>
          <step.icon className="w-6 h-6" />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex-1 min-w-0"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: step.delay + 0.3 }}
      >
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {step.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {step.description}
        </p>
      </motion.div>

      {/* Connecting Line */}
      {!isLast && (
        <motion.div
          className="absolute left-8 top-20 w-0.5 h-16 bg-gradient-to-b from-gray-300 to-transparent dark:from-gray-600"
          initial={{ scaleY: 0 }}
          animate={isInView ? { scaleY: 1 } : { scaleY: 0 }}
          transition={{ duration: 0.8, delay: step.delay + 0.5 }}
          style={{ transformOrigin: "top" }}
        />
      )}

      {/* Floating Animation */}
      <motion.div
        className={`absolute -z-10 w-32 h-32 rounded-full bg-gradient-to-br ${step.color} opacity-10 blur-xl`}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: step.delay,
        }}
      />
    </motion.div>
  );
}

export function AnimatedRoadmap() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-6">
        <motion.div
          ref={ref}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent mb-4">
            How ResumeCraft Works
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            From template selection to landing your dream job in 6 simple steps
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {roadmapSteps.map((step, index) => (
            <RoadmapStep
              key={index}
              step={step}
              index={index}
              isLast={index === roadmapSteps.length - 1}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Start Building Your Resume
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}