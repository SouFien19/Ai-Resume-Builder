"use client";

import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { Button as ShadcnButton } from "@/components/ui/button";
import { useState, MouseEvent, ButtonHTMLAttributes } from "react";

interface EnhancedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  ripple?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function EnhancedButton({
  children,
  loading = false,
  ripple = true,
  disabled,
  onClick,
  className,
  ...props
}: EnhancedButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (ripple && !loading && !disabled) {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now();

      setRipples((prev) => [...prev, { x, y, id }]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 600);
    }

    if (onClick && !loading && !disabled) {
      onClick(e);
    }
  };

  return (
    <ShadcnButton
      {...props}
      disabled={disabled || loading}
      onClick={handleClick}
      className={`relative overflow-hidden ${className || ""}`}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full pointer-events-none"
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
            opacity: 1,
          }}
          animate={{
            width: 400,
            height: 400,
            x: ripple.x - 200,
            y: ripple.y - 200,
            opacity: 0,
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-inherit"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
        </motion.div>
      )}

      {/* Button content */}
      <span className={loading ? "opacity-0" : ""}>{children}</span>
    </ShadcnButton>
  );
}
