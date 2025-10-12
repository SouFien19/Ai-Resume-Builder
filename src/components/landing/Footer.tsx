"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { SiReactiveresume } from "react-icons/si";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  Heart,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub", color: "hover:text-gray-900 dark:hover:text-white" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter", color: "hover:text-blue-400" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn", color: "hover:text-blue-600" },
  { icon: Mail, href: "mailto:contact@resumecraft.ai", label: "Email", color: "hover:text-pink-500" },
];

const footerLinks = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "AI Studio", href: "/ai-studio" },
      { label: "Templates", href: "/dashboard/templates" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "#" },
      { label: "Resume Tips", href: "#" },
      { label: "Career Guides", href: "#" },
      { label: "Help Center", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Press Kit", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "#" },
      { label: "GDPR", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50/50 via-orange-50/30 to-purple-50/50 dark:from-pink-950/10 dark:via-orange-950/5 dark:to-purple-950/10" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-500/10 to-purple-500/10 rounded-full blur-3xl" />
      
      <div className="relative container mx-auto px-4 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-orange-500 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity" />
                <SiReactiveresume className="relative h-8 w-8 text-pink-600 dark:text-pink-500" />
              </motion.div>
              <span className="font-bold text-2xl bg-gradient-to-r from-pink-600 to-orange-600 dark:from-pink-500 dark:to-orange-500 bg-clip-text text-transparent">
                ResumeCraft AI
              </span>
            </Link>
            
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs">
              Transform your career with AI-powered resume building. Create professional, 
              ATS-optimized resumes in minutes.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-pink-600 dark:text-pink-500" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Get resume tips & updates
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 dark:focus:ring-pink-500/50"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-shadow"
                >
                  Subscribe
                </motion.button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, idx) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                {section.title}
                <div className="h-px flex-1 bg-gradient-to-r from-pink-500/20 to-transparent max-w-[40px]" />
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="group text-sm text-gray-600 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500 transition-colors inline-flex items-center gap-1"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span>&copy; {new Date().getFullYear()} ResumeCraft AI. All rights reserved.</span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline flex items-center gap-1">
                Made  by Soufiane Labiadh
              </span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={social.href}
                    aria-label={social.label}
                    className={`p-2 rounded-lg text-gray-500 dark:text-gray-400 ${social.color} bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all`}
                  >
                    <social.icon className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-6 flex flex-wrap justify-center items-center gap-4 text-xs text-gray-500 dark:text-gray-500"
          >
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>99.9% Uptime</span>
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              🔒 GDPR Compliant
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              ⚡ Lightning Fast
            </div>
            <div className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800">
              🌍 Global CDN
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
}
