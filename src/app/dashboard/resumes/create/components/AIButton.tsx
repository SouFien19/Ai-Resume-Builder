"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";

interface AIButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isStreaming?: boolean;
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "sm" | "default";
  className?: string;
}

const AIButton = memo(function AIButton({
  onClick,
  isLoading,
  isStreaming = false,
  children,
  variant = "outline",
  size = "sm",
  className = ""
}: AIButtonProps) {
  const disabled = isLoading || isStreaming;
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={`transition-all duration-300 ${
        isStreaming 
          ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white border-transparent animate-pulse" 
          : disabled 
          ? "opacity-60 cursor-not-allowed"
          : "hover:scale-105"
      } ${className}`}
    >
      {disabled ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          {isStreaming ? "Streaming..." : "Working..."}
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4 mr-2" />
          {children}
        </>
      )}
    </Button>
  );
});

export default AIButton;