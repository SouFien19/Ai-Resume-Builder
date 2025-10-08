"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const MagneticButton: React.FC<{
    children: React.ReactNode;
    href?: string;
    variant?: "default" | "outline";
    size?: "default" | "lg";
    className?: string;
    onClick?: () => void;
    asChild?: boolean;
  }> = ({ children, href, variant = "default", size = "default", className = "", onClick, asChild = false }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
  
    const handleMouseMove = (e: React.MouseEvent) => {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const x = (e.clientX - centerX) / 5;
      const y = (e.clientY - centerY) / 5;
      setMousePosition({ x, y });
    };
  
    const buttonVariants = {
      idle: { scale: 1, x: 0, y: 0 },
      hover: {
        scale: 1.05,
        x: mousePosition.x,
        y: mousePosition.y,
        transition: { type: "spring" as const, stiffness: 400, damping: 25 }
      },
      tap: { scale: 0.95 }
    };
  
    const rippleVariants = {
      idle: { scale: 0, opacity: 0 },
      hover: { scale: 1, opacity: 0.2 }
    };
  
    
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, {
        className: `
          relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
          transition-all duration-300 border-2
          ${variant === "outline"
            ? "border-white/30 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm"
            : "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          }
          ${size === "lg" ? "text-lg px-8 py-4" : "text-base"}
          ${className}
        `,
        onMouseMove: handleMouseMove,
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        style: {
          transform: isHovered
            ? `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(1.05)`
            : 'translate(0px, 0px) scale(1)',
          transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }
      } as React.HTMLAttributes<HTMLElement>);
    }
  
    const Component = href ? motion.a : motion.button;
  
    return (
      <Component
        href={href}
        onClick={onClick}
        className={`
          relative overflow-hidden inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
          transition-all duration-300 border-2
          ${variant === "outline"
            ? "border-white/30 text-white bg-transparent hover:bg-white/10 backdrop-blur-sm"
            : "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
          }
          ${size === "lg" ? "text-lg px-8 py-4" : "text-base"}
          ${className}
        `}
        variants={buttonVariants}
        initial="idle"
        animate={isHovered ? "hover" : "idle"}
        whileTap="tap"
        onMouseMove={handleMouseMove}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        
        <motion.div
          className="absolute inset-0 bg-white rounded-xl"
          variants={rippleVariants}
          initial="idle"
          animate={isHovered ? "hover" : "idle"}
          transition={{ duration: 0.3 }}
        />
  
        
        <motion.div
          className="relative z-10 flex items-center gap-2"
          animate={{ x: isHovered ? 2 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      </Component>
    );
  };

  export default MagneticButton;