"use client";

import { motion, useInView } from "framer-motion";
import React, { useRef } from "react";

const StaggeredFadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDuration?: number;
  childDuration?: number;
  delay?: number;
}> = ({
  children,
  className,
  staggerDuration = 0.05,
  childDuration = 0.4,
  delay = 0,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: childDuration,
        ease: "easeOut" as const,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{
        staggerChildren: staggerDuration,
        delayChildren: delay,
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={variants}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export default StaggeredFadeIn;
