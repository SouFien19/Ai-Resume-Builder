"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const TypingAnimation: React.FC<{ texts: string[] }> = ({ texts }) => {
    const [index, setIndex] = useState(0);
    const [show, setShow] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
  
    useEffect(() => {
      let mounted = true;
      const target = texts[index % texts.length];
  
      const timer = window.setTimeout(function tick() {
        if (!mounted) return;
        setShow((s) => {
          if (!deleting) {
            const next = target.substring(0, s.length + 1);
            if (next === target) {
              
              setTimeout(() => setDeleting(true), 1800);
            }
            return next;
          } else {
            const next = target.substring(0, Math.max(0, s.length - 1));
            if (next === "") {
              setDeleting(false);
              setIndex((p) => (p + 1) % texts.length);
            }
            return next;
          }
        });
      }, deleting ? 60 : 120);
  
      return () => {
        mounted = false;
        clearTimeout(timer);
      };
    }, [index, deleting, texts]);
  
    return (
      <motion.span
        className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 font-bold relative inline-block cursor-pointer"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        animate={{
          textShadow: isHovered
            ? "0 0 20px rgba(59, 130, 246, 0.5)"
            : "0 0 0px rgba(59, 130, 246, 0)",
        }}
        transition={{ duration: 0.3 }}
      >
        {show}
        <motion.span
          animate={{
            opacity: [1, 0],
            scale: isHovered ? [1, 1.2, 1] : [1, 1, 1],
          }}
          transition={{
            duration: isHovered ? 0.8 : 0.6,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="inline-block ml-1 w-0.5 h-6 bg-gradient-to-b from-blue-600 to-purple-600"
        />
      </motion.span>
    );
  };

  export default TypingAnimation;