"use client";

import { motion } from "framer-motion";

export default function LandingPageSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="w-32 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="flex gap-4">
            <div className="w-20 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Hero Skeleton */}
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50/30 to-orange-50/30 dark:from-pink-950/10 dark:to-orange-950/10">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            {/* Badge */}
            <div className="w-64 h-8 bg-gray-200 dark:bg-gray-800 rounded-full mx-auto animate-pulse" />
            
            {/* Title */}
            <div className="space-y-3 max-w-3xl mx-auto">
              <div className="w-full h-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-3/4 h-12 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
            </div>

            {/* Description */}
            <div className="space-y-2 max-w-2xl mx-auto">
              <div className="w-full h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="w-4/5 h-6 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 pt-4">
              <div className="w-48 h-12 bg-gradient-to-r from-pink-200 to-orange-200 dark:from-pink-900/50 dark:to-orange-900/50 rounded-lg animate-pulse" />
              <div className="w-32 h-12 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>

            {/* Resume Mockup */}
            <div className="mt-16 max-w-3xl mx-auto">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-800 animate-pulse">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-orange-200 dark:from-pink-900/50 dark:to-orange-900/50 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="w-1/2 h-6 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="w-4/5 h-3 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center space-y-2">
                  <div className="w-24 h-10 bg-gradient-to-r from-pink-200 to-orange-200 dark:from-pink-900/50 dark:to-orange-900/50 rounded mx-auto animate-pulse" />
                  <div className="w-32 h-4 bg-gray-200 dark:bg-gray-800 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
