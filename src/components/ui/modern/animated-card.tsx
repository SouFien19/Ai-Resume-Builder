"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type AnimatedCardProps = Omit<HTMLMotionProps<"div">, "children"> & {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
  variant?: "default" | "glass" | "gradient" | "floating";
};

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ children, className, hover = true, delay = 0, variant = "default", ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay, ease: "easeOut" }}
        whileHover={hover ? { y: -6, scale: 1.02 } : undefined}
        whileTap={{ scale: 0.98 }}
        className={cn("cursor-pointer", className)}
        {...props}
      >
        <Card
          className={cn(
            "relative overflow-hidden transition-all duration-300",
            variant === "default" && "bg-white dark:bg-neutral-900 border border-neutral-800",
            variant === "glass" && "bg-white/10 dark:bg-neutral-900/80 backdrop-blur-md border border-white/10",
            variant === "gradient" && "bg-gradient-to-br from-neutral-900/90 to-neutral-800/90 border border-neutral-800 shadow-xl",
            variant === "floating" && "bg-white dark:bg-neutral-900 border-0 shadow-xl"
          )}
        >
          {variant === "gradient" && (
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-orange-500/5 pointer-events-none" />
          )}
          <div className="relative z-10">{children}</div>
        </Card>
      </motion.div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

export type StatCardProps = {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
  delay?: number;
};

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ title, value, icon, className, delay = 0 }, ref) => {
    return (
      <AnimatedCard ref={ref} className={className} delay={delay} variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-neutral-400">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
            {icon && (
              <div className="p-3 bg-pink-500/20 backdrop-blur-sm rounded-2xl border border-pink-500/30 text-pink-400">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </AnimatedCard>
    );
  }
);
StatCard.displayName = "StatCard";