"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";

export function Marquee3D({ items, speed = 30 }: { items: React.ReactNode[]; speed?: number }) {
  const x = useMotionValue(0);
  const rotateY = useTransform(x, [-100, 100], [-6, 6]);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div className="relative overflow-hidden [perspective:800px]">
      <motion.div
        ref={ref}
        className="flex gap-8 will-change-transform"
        style={{ rotateY }}
        animate={{ x: [0, -1000] }}
        transition={{ repeat: Infinity, repeatType: "loop", ease: "linear", duration: speed }}
        onMouseMove={(e) => {
          const rect = ref.current?.getBoundingClientRect();
          if (!rect) return;
          const relX = (e.clientX - rect.left) / rect.width;
          x.set((relX - 0.5) * 200);
        }}
        onMouseLeave={() => x.set(0)}
      >
        {[...items, ...items].map((child, i) => (
          <div key={i} className="shrink-0">
            {child}
          </div>
        ))}
      </motion.div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
    </div>
  );
}
