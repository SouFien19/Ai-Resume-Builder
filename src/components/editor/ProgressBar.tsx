"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  percentage,
  label,
  showPercentage = true,
  className,
  size = 'md'
}: ProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));
  const isComplete = clampedPercentage === 100;

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3'
  };

  const getColorClass = () => {
    if (clampedPercentage >= 80) return 'from-green-500 to-emerald-500';
    if (clampedPercentage >= 50) return 'from-blue-500 to-cyan-500';
    if (clampedPercentage >= 25) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Label and Percentage */}
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && (
            <span className="font-medium text-neutral-700">{label}</span>
          )}
          {showPercentage && (
            <motion.span
              key={clampedPercentage}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                "font-semibold flex items-center gap-1",
                isComplete ? "text-green-600" : "text-neutral-600"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
              {Math.round(clampedPercentage)}%
            </motion.span>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className={cn(
        "relative w-full bg-neutral-200 rounded-full overflow-hidden",
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${clampedPercentage}%` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.1, 0.25, 1],
            delay: 0.1
          }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r",
            getColorClass(),
            "relative overflow-hidden"
          )}
        >
          {/* Shimmer effect */}
          <motion.div
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}

interface SectionProgressProps {
  sections: {
    id: string;
    name: string;
    completion: number;
    required?: boolean;
  }[];
  className?: string;
}

export function SectionProgress({ sections, className }: SectionProgressProps) {
  const totalSections = sections.length;
  const completedSections = sections.filter(s => s.completion === 100).length;
  const overallPercentage = (completedSections / totalSections) * 100;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Overall Progress */}
      <ProgressBar
        percentage={overallPercentage}
        label="Overall Completion"
        showPercentage
        size="lg"
      />

      {/* Individual Sections */}
      <div className="space-y-2">
        {sections.map((section) => (
          <div key={section.id} className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-neutral-600">
                  {section.name}
                  {section.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </span>
                <span className="text-xs text-neutral-500">
                  {Math.round(section.completion)}%
                </span>
              </div>
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${section.completion}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full",
                    section.completion === 100
                      ? "bg-green-500"
                      : section.completion >= 50
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  )}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
