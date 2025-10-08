import { useReducedMotion } from "framer-motion";

export const useOptimizedAnimations = () => {
  const shouldReduceMotion = useReducedMotion();

  const getStepTransition = (delay = 0) => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
      };
    }
    
    return {
      initial: { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: { opacity: 0, x: -20 },
      transition: { 
        duration: 0.3, 
        ease: [0.4, 0, 0.2, 1] as const,
        delay 
      }
    };
  };

  const getPageTransition = () => {
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }

    return {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: { 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1] as const
      }
    };
  };

  const getProgressTransition = () => {
    if (shouldReduceMotion) {
      return { duration: 0 };
    }

    return { 
      duration: 0.5, 
      ease: [0.4, 0, 0.2, 1] as const
    };
  };

  const getHoverAnimation = () => {
    if (shouldReduceMotion) {
      return {};
    }

    return {
      whileHover: { scale: 1.02, y: -1 },
      whileTap: { scale: 0.98 }
    };
  };

  return {
    getStepTransition,
    getPageTransition,
    getProgressTransition,
    getHoverAnimation,
    shouldReduceMotion
  };
};