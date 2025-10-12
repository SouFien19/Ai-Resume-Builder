"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const colors = [
  "bg-pink-500",
  "bg-orange-500",
  "bg-purple-500",
  "bg-pink-400",
  "bg-orange-400",
];

const generateBlobs = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    initial: {
      x: `${Math.random() * 100}vw`,
      y: `${Math.random() * 100}vh`,
      scale: Math.random() * 0.5 + 0.5,
    },
    animate: {
      x: `${Math.random() * 100}vw`,
      y: `${Math.random() * 100}vh`,
      scale: Math.random() * 0.8 + 0.7,
      rotate: Math.random() * 360,
    },
    transition: {
      duration: Math.random() * 20 + 20,
      repeat: Infinity,
      repeatType: "reverse" as const,
      ease: "easeInOut" as const,
    },
  }));
};

export default function AnimatedGradientBackground() {
  const [blobs, setBlobs] = useState<ReturnType<typeof generateBlobs> | null>(
    null
  );

  useEffect(() => {
    setBlobs(generateBlobs(6));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="relative w-full h-full">
        {/* Main animated blobs */}
        {blobs &&
          blobs.map((blob) => (
            <motion.div
              key={blob.id}
              initial={blob.initial}
              animate={blob.animate}
              transition={blob.transition}
              className={cn(
                "absolute rounded-full opacity-30 blur-3xl",
                blob.color
              )}
              style={{
                width: "35vw",
                height: "35vw",
                minWidth: "350px",
                minHeight: "350px",
              }}
            />
          ))}
        
        {/* Additional fixed gradient blobs for depth */}
        <motion.div
          className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-orange-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-[500px] h-[500px] bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.2, 0.4],
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
