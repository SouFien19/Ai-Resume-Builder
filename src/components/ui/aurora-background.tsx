"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

type AuroraBackgroundProps = {
  className?: string;
  children?: React.ReactNode;
};

export default function AuroraBackground({ className, children }: AuroraBackgroundProps) {
  return (
    <div className={cn("relative isolate min-h-screen w-full overflow-hidden bg-background", className)}>
      {/* Subtle grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      >
        <svg className="h-full w-full opacity-[0.06] dark:opacity-[0.08]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Aurora blobs */}
      <motion.div
        aria-hidden
        className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,hsl(var(--primary))_0%,transparent_60%)] opacity-30 blur-3xl"
        animate={{ x: [0, 40, -20, 0], y: [0, -20, 30, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 left-1/2 h-[44rem] w-[44rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_70%_70%,hsl(var(--secondary))_0%,transparent_60%)] opacity-25 blur-3xl"
        animate={{ x: [0, -30, 20, 0], y: [0, 20, -25, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_50%_50%,hsl(var(--accent))_0%,transparent_60%)] opacity-20 blur-3xl"
        animate={{ x: [0, -10, 30, 0], y: [0, 15, -10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Spotlight vignette */}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.2),transparent_60%)]" />

      {/* Content */}
      {children}
    </div>
  );
}
