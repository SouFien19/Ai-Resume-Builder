"use client";

import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface HoverCardProps extends CardProps {
  onMouseMove?: (e: React.MouseEvent) => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export interface TextareaProps {
  className?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
}

// Optimized hover card with better performance
export const HoverCard = React.memo(({ children, className = "", onMouseMove }: HoverCardProps) => {
  return (
    <motion.div
      className={`relative group ${className}`}
      onMouseMove={onMouseMove}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
});

HoverCard.displayName = 'HoverCard';

export const Card = React.memo(({ children, className = "" }: CardProps) => (
  <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
    {children}
  </div>
));

Card.displayName = 'Card';

export const CardContent = React.memo(({ children, className = "" }: CardProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
));

CardContent.displayName = 'CardContent';

export const CardHeader = React.memo(({ children, className = "" }: CardProps) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
));

CardHeader.displayName = 'CardHeader';

export const CardTitle = React.memo(({ children, className = "" }: CardProps) => (
  <h3 className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}>
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

export const Button = React.memo(({ children, className = "", variant = 'primary', size = 'md', onClick, disabled, type = 'button' }: ButtonProps) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl",
    secondary: "bg-gray-600 hover:bg-gray-700 text-white",
    outline: "border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base", 
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = 'Button';

export const Textarea = React.memo(({ className = "", placeholder, value, onChange, rows = 6 }: TextareaProps) => (
  <textarea
    className={`w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${className}`}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
  />
));

Textarea.displayName = 'Textarea';