"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  HelpCircle, 
  Shield, 
  Edit3, 
  Target, 
  Copy, 
  DollarSign, 
  Sparkles, 
  Download,
  MessageCircle,
  Zap
} from "lucide-react";

const faqs = [
  {
    question: "How does the AI resume builder work?",
    answer: "Our AI analyzes your profile, work experience, and target job description to generate compelling, ATS-friendly content. It uses advanced natural language processing to create professional resume content tailored to your career goals, ensuring your resume stands out to both recruiters and applicant tracking systems.",
    icon: HelpCircle,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    question: "Is my data secure and private?",
    answer: "Absolutely! We use enterprise-grade encryption (AES-256) to protect your data. Your resume information is never shared with third parties or used for training purposes. We're GDPR and CCPA compliant, and you have full control over your data with the ability to export or delete it at any time.",
    icon: Shield,
    gradient: "from-green-500 to-emerald-500",
  },
  {
    question: "Can I customize the AI-generated content?",
    answer: "Yes! Our AI provides intelligent suggestions, but you have complete control. You can edit, refine, or completely rewrite any content. Think of the AI as your writing assistant - it helps you get started and provides ideas, but the final resume is always yours to customize.",
    icon: Edit3,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    question: "What makes your ATS optimization better?",
    answer: "Our AI is trained on thousands of successful resumes and ATS systems. It analyzes job descriptions to identify critical keywords, optimizes formatting for ATS compatibility, and ensures your resume meets industry standards. We regularly update our algorithm based on the latest ATS requirements from major companies.",
    icon: Target,
    gradient: "from-orange-500 to-red-500",
  },
  {
    question: "Can I create multiple versions of my resume?",
    answer: "Yes! Pro and Enterprise users can create unlimited resume projects. This is perfect for tailoring different versions for various job applications, industries, or career paths. You can duplicate existing resumes and quickly customize them for specific opportunities.",
    icon: Copy,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee for all paid plans. If you're not completely satisfied with our service, simply contact support within 14 days of your purchase for a full refund. We also offer a free plan so you can try the basic features before upgrading.",
    icon: DollarSign,
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    question: "How is this different from other resume builders?",
    answer: "Unlike traditional resume builders that just offer templates, we use advanced AI to actually help write your content. Our platform provides real-time suggestions, ATS optimization, keyword analysis, and cover letter generation. Plus, our templates are designed by professional recruiters and proven to increase interview rates.",
    icon: Sparkles,
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    question: "Can I export my resume to different formats?",
    answer: "Yes! You can export your resume as PDF (recommended for applications), DOCX (for further editing), or even plain text. Our PDF exports are ATS-friendly and preserve all formatting perfectly. Pro users also get access to custom export options and watermark removal.",
    icon: Download,
    gradient: "from-teal-500 to-cyan-500",
  },
];

export default function FAQ() {
  return (
    <section id="faq" className="relative py-20 md:py-28 bg-gradient-to-br from-gray-50 via-pink-50/30 to-orange-50/30 dark:from-gray-950 dark:via-pink-950/10 dark:to-orange-950/10 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      {/* Floating Question Marks */}
      <motion.div
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-40 right-20 text-pink-200 dark:text-pink-900/30 text-6xl font-bold"
      >
        ?
      </motion.div>
      <motion.div
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -5, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-40 left-20 text-orange-200 dark:text-orange-900/30 text-5xl font-bold"
      >
        ?
      </motion.div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
        >
          {/* Animated Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            whileInView={{ scale: 1, rotate: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/50 dark:to-orange-950/50">
              <HelpCircle className="w-4 h-4 mr-2 text-pink-600" />
              FAQ
            </Badge>
          </motion.div>
          
          {/* Animated Title */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
          >
            <span className="inline-block">
              <span className="bg-gradient-to-r from-pink-600 via-orange-600 to-purple-600 dark:from-pink-500 dark:via-orange-500 dark:to-purple-500 bg-clip-text text-transparent">
                Frequently Asked
              </span>
            </span>
            <br />
            <span className="inline-block">
              <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 dark:from-purple-500 dark:via-pink-500 dark:to-orange-500 bg-clip-text text-transparent">
                Questions
              </span>
            </span>
          </motion.h2>
          
          {/* Animated Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-lg text-gray-600 dark:text-gray-400 mb-6"
          >
            Everything you need to know about our{" "}
            <span className="font-semibold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
              AI-powered resume builder
            </span>
          </motion.p>
          
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="flex items-center justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-pink-600" />
              <span className="text-gray-600 dark:text-gray-400">Instant Answers</span>
            </div>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-orange-600" />
              <span className="text-gray-600 dark:text-gray-400">24/7 Support</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="relative bg-white dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 rounded-2xl px-6 overflow-hidden data-[state=open]:border-pink-500 dark:data-[state=open]:border-pink-500 transition-all duration-300 hover:shadow-xl data-[state=open]:shadow-2xl backdrop-blur-sm"
                >
                  {/* Gradient Background on Open */}
                  <motion.div
                    initial={false}
                    className="absolute inset-0 bg-gradient-to-br from-pink-50/50 to-orange-50/50 dark:from-pink-950/20 dark:to-orange-950/20 opacity-0 data-[state=open]:opacity-100 transition-opacity"
                  />
                  
                  {/* Icon with Gradient Background */}
                  <div className="absolute top-6 left-6 opacity-10 dark:opacity-5">
                    <faq.icon className="w-16 h-16" />
                  </div>
                  
                  <AccordionTrigger className="relative text-left hover:no-underline py-6 group">
                    <div className="flex items-start gap-4 pr-4 w-full">
                      {/* Animated Icon */}
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${faq.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}
                      >
                        <faq.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                      </motion.div>
                      
                      {/* Question Text */}
                      <span className="font-semibold text-lg text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-600 group-hover:to-orange-600 transition-all">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  
                  <AccordionContent className="relative text-gray-600 dark:text-gray-400 pb-6 pl-16 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* Enhanced Support CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.7, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
            className="mt-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 via-orange-500 to-purple-500 rounded-2xl blur-xl opacity-20" />
            <div className="relative text-center p-8 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/30 dark:to-orange-950/30 rounded-2xl border-2 border-pink-200 dark:border-pink-800 backdrop-blur-sm">
              {/* Icon */}
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 mb-4 shadow-lg"
              >
                <MessageCircle className="w-8 h-8 text-white" strokeWidth={2.5} />
              </motion.div>
              
              <h3 className="text-2xl font-bold mb-2">
                <span className="bg-gradient-to-r from-pink-600 via-orange-600 to-purple-600 dark:from-pink-500 dark:via-orange-500 dark:to-purple-500 bg-clip-text text-transparent">
                  Still have questions?
                </span>
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Our dedicated support team is available 24/7 to help you succeed with your resume.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.a
                  href="mailto:support@resumecraft.ai"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <MessageCircle className="w-5 h-5" />
                  Contact Support
                </motion.a>
                
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-pink-500 text-pink-600 dark:text-pink-400 font-semibold rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/30 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Live Chat
                </motion.a>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Online Now</span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
                <span>Average response: 2 minutes</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
