"use client";

import React from 'react';
import { motion } from 'framer-motion';

// Optimized particle background with reduced particles for better performance
export const ParticleBackground = React.memo(() => {
  // Reduced from original implementation for performance
  const particles = Array.from({ length: 8 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute w-1 h-1 bg-blue-500/30 rounded-full"
      animate={{
        y: [-20, -100],
        opacity: [0, 1, 0],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        delay: i * 0.5,
        ease: "easeInOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles}
    </div>
  );
});

ParticleBackground.displayName = 'ParticleBackground';

// Optimized floating orbs with reduced complexity
export const FloatingOrbs = React.memo(() => {
  const orbs = Array.from({ length: 3 }, (_, i) => (
    <motion.div
      key={i}
      className="absolute rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"
      animate={{
        x: [0, 30, 0],
        y: [0, -20, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{
        duration: 6 + i,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        width: `${60 + i * 20}px`,
        height: `${60 + i * 20}px`,
        left: `${30 + i * 25}%`,
        top: `${40 + i * 10}%`,
      }}
    />
  ));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs}
    </div>
  );
});

FloatingOrbs.displayName = 'FloatingOrbs';