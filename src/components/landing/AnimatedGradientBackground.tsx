"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const colors = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-sky-500",
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
    setBlobs(generateBlobs(5));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <div className="relative w-full h-full">
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
                width: "30vw",
                height: "30vw",
                minWidth: "300px",
                minHeight: "300px",
              }}
            />
          ))}
      </div>
    </div>
  );
}
