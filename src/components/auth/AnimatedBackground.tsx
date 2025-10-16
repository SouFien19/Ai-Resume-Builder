/**
 * Animated Background - Lazy Loaded Component
 * Only loads when visible (desktop view)
 */

"use client";

import { memo } from 'react';

const AnimatedBackground = memo(() => {
  return (
    <>
      {/* Animated Orbs - Simplified for performance */}
      <div className="absolute inset-0">
        {/* Orb 1 - Reduced animation complexity */}
        <div 
          className="absolute top-20 left-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          style={{
            animation: 'float 20s ease-in-out infinite',
          }}
        />
        
        {/* Orb 2 */}
        <div 
          className="absolute bottom-20 right-20 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"
          style={{
            animation: 'float 25s ease-in-out infinite reverse',
          }}
        />
        
        {/* Orb 3 */}
        <div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"
          style={{
            animation: 'pulse 15s ease-in-out infinite',
          }}
        />
      </div>

      {/* CSS Animations - Optimized with GPU acceleration */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.5;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }

        /* Use GPU acceleration */
        @media (prefers-reduced-motion: no-preference) {
          div[style*="animation"] {
            will-change: transform;
          }
        }
      `}</style>
    </>
  );
});

AnimatedBackground.displayName = 'AnimatedBackground';

export default AnimatedBackground;
