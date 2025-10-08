"use client";

import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function AnimatedTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
          {children}
        </motion.span>
      </TooltipTrigger>
      <TooltipContent sideOffset={6}>
        <motion.span
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {label}
        </motion.span>
      </TooltipContent>
    </Tooltip>
  );
}
