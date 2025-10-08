"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface SaveSuccessIndicatorProps {
  show: boolean;
  isFirstSave?: boolean;
  onComplete?: () => void;
}

export function SaveSuccessIndicator({ show, isFirstSave = false, onComplete }: SaveSuccessIndicatorProps) {
  const [localShow, setLocalShow] = useState(false);

  const fireConfetti = useCallback(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 60, 
      zIndex: 9999,
      colors: ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B']
    };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Launch from top-right
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.8, 1), y: Math.random() * 0.3 }
      });
      
      // Launch from top-left
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0, 0.2), y: Math.random() * 0.3 }
      });
    }, 250);
  }, []);

  useEffect(() => {
    if (show && !localShow) {
      setLocalShow(true);

      // Trigger confetti for first save or major milestone
      if (isFirstSave) {
        fireConfetti();
      }

      // Auto-hide after 2 seconds
      const timer = setTimeout(() => {
        setLocalShow(false);
        if (onComplete) onComplete();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, isFirstSave, localShow, onComplete, fireConfetti]);

  return (
    <AnimatePresence>
      {localShow && (
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={{ 
            scale: 1, 
            rotate: 0, 
            opacity: 1,
            transition: {
              type: "spring",
              stiffness: 260,
              damping: 20
            }
          }}
          exit={{ 
            scale: 0, 
            rotate: 180, 
            opacity: 0,
            transition: {
              duration: 0.3
            }
          }}
          className="fixed top-4 right-4 z-[100]"
        >
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full shadow-2xl ring-4 ring-green-500/20">
            <div className="p-4 flex items-center gap-3">
              {/* Animated Checkmark */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: 0.1
                  }
                }}
                className="relative"
              >
                <Check className="w-6 h-6 stroke-[3]" />
                
                {/* Pulse Ring */}
                <motion.div
                  initial={{ scale: 1, opacity: 0.5 }}
                  animate={{ 
                    scale: 2, 
                    opacity: 0,
                    transition: {
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeOut"
                    }
                  }}
                  className="absolute inset-0 rounded-full bg-white"
                />
              </motion.div>

              {/* Text */}
              <div>
                <motion.p
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ 
                    opacity: 1, 
                    x: 0,
                    transition: { delay: 0.2 }
                  }}
                  className="font-semibold text-sm"
                >
                  {isFirstSave ? '🎉 First save!' : 'Saved successfully'}
                </motion.p>
                {isFirstSave && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ 
                      opacity: 1, 
                      x: 0,
                      transition: { delay: 0.3 }
                    }}
                    className="text-xs text-green-100"
                  >
                    Great start! Keep going!
                  </motion.p>
                )}
              </div>

              {/* Sparkles for first save */}
              {isFirstSave && (
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Compact version for toolbar/inline use
export function CompactSaveIndicator({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className="inline-flex items-center gap-2"
        >
          <motion.div
            animate={{ 
              rotate: 360,
              transition: {
                duration: 0.6,
                ease: "easeInOut"
              }
            }}
            className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center"
          >
            <Check className="w-3 h-3 text-white stroke-[3]" />
          </motion.div>
          <span className="text-xs font-medium text-green-600 dark:text-green-400">
            Saved
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
