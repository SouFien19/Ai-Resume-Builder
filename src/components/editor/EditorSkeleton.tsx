"use client";

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-neutral-800/50",
        className
      )}
    />
  );
}

function ShimmerSkeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-neutral-800/50",
        className
      )}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-neutral-700/30 to-transparent" />
    </div>
  );
}

export function EditorSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 p-6"
    >
      {/* Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <ShimmerSkeleton className="h-10 w-10 rounded-lg" />
          <ShimmerSkeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-3">
          <ShimmerSkeleton className="h-10 w-24" />
          <ShimmerSkeleton className="h-10 w-24" />
          <ShimmerSkeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar */}
        <div className="w-60 space-y-3">
          {/* Progress Section */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 space-y-3">
            <ShimmerSkeleton className="h-4 w-24" />
            <ShimmerSkeleton className="h-2 w-full rounded-full" />
            <ShimmerSkeleton className="h-3 w-32" />
          </div>

          {/* Navigation Items */}
          <div className="space-y-2">
            {[...Array(7)].map((_, i) => (
              <ShimmerSkeleton
                key={i}
                className="h-10 w-full rounded-lg"
              />
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="pt-4 space-y-2">
            <ShimmerSkeleton className="h-10 w-full rounded-lg" />
            <ShimmerSkeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 space-y-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-8 w-8 rounded" />
              <ShimmerSkeleton className="h-8 w-8 rounded" />
              <div className="w-px h-6 bg-neutral-800 mx-2" />
              <ShimmerSkeleton className="h-8 w-24 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-8 w-20 rounded" />
              <ShimmerSkeleton className="h-8 w-20 rounded" />
              <ShimmerSkeleton className="h-8 w-20 rounded" />
            </div>
          </div>

          {/* Form Fields */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
            <ShimmerSkeleton className="h-8 w-48" />
            
            <div className="space-y-4">
              {/* Input Field 1 */}
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-24" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Input Field 2 */}
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-32" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Input Field 3 */}
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-28" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Input Field 4 */}
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-20" />
                <ShimmerSkeleton className="h-12 w-full rounded-lg" />
              </div>

              {/* Textarea */}
              <div className="space-y-2">
                <ShimmerSkeleton className="h-4 w-36" />
                <ShimmerSkeleton className="h-32 w-full rounded-lg" />
              </div>
            </div>
          </div>

          {/* Additional Section */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <ShimmerSkeleton className="h-6 w-40" />
              <ShimmerSkeleton className="h-9 w-32 rounded-lg" />
            </div>
            <div className="space-y-3">
              <ShimmerSkeleton className="h-24 w-full rounded-lg" />
              <ShimmerSkeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>

        {/* Preview Panel */}
        <div className="w-[420px] space-y-4">
          {/* Preview Controls */}
          <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/50 p-3">
            <ShimmerSkeleton className="h-8 w-32 rounded" />
            <div className="flex items-center gap-2">
              <ShimmerSkeleton className="h-8 w-8 rounded" />
              <ShimmerSkeleton className="h-8 w-16 rounded" />
              <ShimmerSkeleton className="h-8 w-8 rounded" />
            </div>
          </div>

          {/* Preview Document */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-8">
            <div className="aspect-[8.5/11] bg-white rounded-lg shadow-xl p-8 space-y-6">
              {/* Header */}
              <div className="space-y-3">
                <Skeleton className="h-8 w-48 mx-auto bg-neutral-200" />
                <Skeleton className="h-3 w-64 mx-auto bg-neutral-200" />
                <Skeleton className="h-3 w-56 mx-auto bg-neutral-200" />
              </div>

              {/* Content Lines */}
              <div className="space-y-4 pt-6">
                <Skeleton className="h-4 w-32 bg-neutral-300" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-neutral-200" />
                  <Skeleton className="h-3 w-full bg-neutral-200" />
                  <Skeleton className="h-3 w-3/4 bg-neutral-200" />
                </div>

                <Skeleton className="h-4 w-40 bg-neutral-300 mt-6" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-neutral-200" />
                  <Skeleton className="h-3 w-full bg-neutral-200" />
                  <Skeleton className="h-3 w-2/3 bg-neutral-200" />
                </div>

                <Skeleton className="h-4 w-36 bg-neutral-300 mt-6" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-5/6 bg-neutral-200" />
                  <Skeleton className="h-3 w-full bg-neutral-200" />
                  <Skeleton className="h-3 w-4/5 bg-neutral-200" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <ShimmerSkeleton className="h-10 flex-1 rounded-lg" />
            <ShimmerSkeleton className="h-10 flex-1 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Loading Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="bg-neutral-900/95 backdrop-blur-xl border border-neutral-800 rounded-full px-6 py-3 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 bg-indigo-400 rounded-full"
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium text-white">
              Loading your resume editor...
            </span>
          </div>
        </div>
      </motion.div>

      {/* Add shimmer animation to global styles */}
      <style jsx global>{`
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </motion.div>
  );
}
