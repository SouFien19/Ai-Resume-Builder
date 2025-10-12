"use client";

import { motion, Variants } from "framer-motion";
import { UploadCloud, Bot, FileCheck, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    icon: UploadCloud,
    title: "Upload Your Details",
    description: "Start by uploading your existing resume or simply filling out your personal and professional information.",
  },
  {
    icon: Bot,
    title: "AI Enhancement",
    description: "Our AI gets to work, analyzing your profile, suggesting improvements, and optimizing content for your desired role.",
  },
  {
    icon: FileCheck,
    title: "Choose & Customize",
    description: "Select a professional template and customize the layout, colors, and fonts to match your personal brand.",
  },
  {
    icon: Award,
    title: "Download & Apply",
    description: "Download your new, polished resume as a PDF and start applying for jobs with confidence.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function HowItWorks() {
  return (
    <section className="py-20 md:py-28 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-20">
          <Badge variant="secondary" className="mb-4">
            Simple & Effective
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-50 mb-4">
            Get Your Dream Resume in 4 Easy Steps
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Our intuitive process makes it effortless to create a standout resume that gets results.
          </p>
        </div>

        <div className="relative">
          {/* Animated gradient line connector */}
          <motion.div 
            className="absolute left-1/2 top-12 bottom-12 w-1 bg-gradient-to-b from-pink-500 via-orange-500 to-purple-500 hidden md:block rounded-full opacity-30"
            initial={{ height: 0 }}
            whileInView={{ height: "calc(100% - 6rem)" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-16 md:space-y-0"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex flex-col md:flex-row items-center md:justify-between"
              >
                <div
                  className={`md:w-5/12 ${
                    index % 2 === 0 ? "md:order-1" : "md:order-3"
                  }`}
                >
                  <motion.div 
                    className="text-center md:text-left"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center justify-center md:justify-start mb-4">
                      <motion.div 
                        className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-2xl shadow-lg shadow-pink-500/30"
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      <span className="ml-4 text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">0{index + 1}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{step.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{step.description}</p>
                  </motion.div>
                </div>

                <div className="md:w-2/12 md:order-2 flex justify-center">
                  <motion.div 
                    className="w-12 h-12 bg-gradient-to-br from-pink-500 to-orange-500 rounded-full z-10 flex items-center justify-center shadow-lg shadow-pink-500/30"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
                    whileHover={{ scale: 1.2, rotate: 180 }}
                  >
                    <div className="w-6 h-6 bg-white rounded-full" />
                  </motion.div>
                </div>

                <div className={`md:w-5/12 ${
                    index % 2 === 0 ? "md:order-3" : "md:order-1"
                  }`} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
