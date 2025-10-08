"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "framer-motion";

const AnimatedCounter: React.FC<{
  value: number;
  className?: string;
  prefix?: string;
  postfix?: string;
}> = ({ value, className, prefix = "", postfix = "" }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 60,
    stiffness: 400,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString()}${postfix}`;
      }
    });
    return unsubscribe;
  }, [springValue, prefix, postfix]);

  return <span ref={ref} className={className} />;
};

export default AnimatedCounter;
