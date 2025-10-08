"use client";

import { motion } from "framer-motion";

interface FloatingElementsProps {
  className?: string;
}

export function FloatingElements({ className = "" }: FloatingElementsProps) {
  const shapes = [
    { size: 60, delay: 0, duration: 8, x: "10%", y: "20%" },
    { size: 40, delay: 1, duration: 6, x: "80%", y: "10%" },
    { size: 80, delay: 2, duration: 10, x: "70%", y: "70%" },
    { size: 30, delay: 0.5, duration: 7, x: "20%", y: "80%" },
    { size: 50, delay: 1.5, duration: 9, x: "90%", y: "50%" },
  ];

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute rounded-full opacity-20"
          style={{
            width: shape.size,
            height: shape.size,
            left: shape.x,
            top: shape.y,
            background: `linear-gradient(135deg, 
              hsl(${200 + index * 30}, 70%, 60%), 
              hsl(${240 + index * 30}, 70%, 70%))`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 20, 0],
            scale: [1, 1.1, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: shape.duration,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Gradient Orbs */}
      <motion.div
        className="absolute w-96 h-96 rounded-full opacity-30 blur-3xl"
        style={{
          background: "radial-gradient(circle, #667eea 0%, transparent 70%)",
          left: "10%",
          top: "10%",
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute w-80 h-80 rounded-full opacity-25 blur-3xl"
        style={{
          background: "radial-gradient(circle, #f093fb 0%, transparent 70%)",
          right: "10%",
          bottom: "10%",
        }}
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}