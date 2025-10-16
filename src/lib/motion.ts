/**
 * Optimized Framer Motion Setup
 * Uses LazyMotion for ~120 KB bundle reduction
 * 
 * Usage:
 * import { LazyMotion, domAnimation, m } from '@/lib/motion';
 * 
 * <LazyMotion features={domAnimation}>
 *   <m.div animate={{ opacity: 1 }} />
 * </LazyMotion>
 */

export { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';

// Re-export commonly used types
export type { HTMLMotionProps, Variants, Transition, TargetAndTransition } from 'framer-motion';
