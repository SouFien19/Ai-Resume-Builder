"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PageHeaderProps = {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
  gradient?: boolean;
  badge?: string;
  showBack?: boolean;
  onBack?: () => void;
};

export function PageHeader({
  title,
  description,
  children,
  className,
  gradient = true,
  badge,
  showBack = false,
  onBack,
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn("space-y-4", className)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-white/5 to-white/[0.03] p-6 md:p-8">
        {/* Accent background */}
        {gradient && (
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-orange-500/5" />
        )}

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            {showBack && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 }}
                className="mb-3"
              >
                <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              </motion.div>
            )}

            {badge && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-2"
              >
                <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/60 px-3 py-1 text-xs font-medium text-neutral-300">
                  {badge}
                </span>
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className={cn(
                "text-3xl font-bold md:text-4xl",
                gradient
                  ? "bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
                  : "text-white"
              )}
            >
              {title}
            </motion.h1>

            {description && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-2 max-w-2xl text-base text-neutral-400"
              >
                {description}
              </motion.p>
            )}
          </div>

          {children && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="ml-6 flex-shrink-0"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}