"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequiredField {
  id: string;
  label: string;
  isFilled: boolean;
  section: string;
}

interface RequiredFieldsCounterProps {
  requiredFields: RequiredField[];
  className?: string;
  showDetails?: boolean;
}

export function RequiredFieldsCounter({
  requiredFields,
  className,
  showDetails = false
}: RequiredFieldsCounterProps) {
  const totalRequired = requiredFields.length;
  const filledRequired = requiredFields.filter(f => f.isFilled).length;
  const missingRequired = totalRequired - filledRequired;
  const isComplete = missingRequired === 0;

  if (isComplete && !showDetails) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className={cn(
          "px-4 py-3 rounded-lg border",
          "bg-green-50 border-green-200",
          "flex items-center gap-3",
          className
        )}
      >
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            All required fields completed!
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            Your resume meets the minimum requirements
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("space-y-3", className)}
    >
      {/* Counter Badge */}
      <div
        className={cn(
          "px-4 py-3 rounded-lg border flex items-center gap-3",
          isComplete
            ? "bg-green-50 border-green-200"
            : "bg-orange-50 border-orange-200"
        )}
      >
        <div className="flex-shrink-0">
          {isComplete ? (
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-orange-600" />
          )}
        </div>
        
        <div className="flex-1">
          <p className={cn(
            "text-sm font-medium",
            isComplete ? "text-green-800" : "text-orange-800"
          )}>
            {isComplete ? (
              "All required fields completed!"
            ) : (
              <>
                {missingRequired} required field{missingRequired !== 1 ? 's' : ''} remaining
              </>
            )}
          </p>
          <p className={cn(
            "text-xs mt-0.5",
            isComplete ? "text-green-600" : "text-orange-600"
          )}>
            {filledRequired} of {totalRequired} completed
          </p>
        </div>

        {/* Progress Ring */}
        <div className="relative w-12 h-12 flex-shrink-0">
          <svg className="w-12 h-12 transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              className={isComplete ? "text-green-200" : "text-orange-200"}
            />
            {/* Progress circle */}
            <motion.circle
              cx="24"
              cy="24"
              r="20"
              stroke="currentColor"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              className={isComplete ? "text-green-600" : "text-orange-600"}
              initial={{ strokeDasharray: "0, 126" }}
              animate={{
                strokeDasharray: `${(filledRequired / totalRequired) * 126}, 126`
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-xs font-bold",
              isComplete ? "text-green-700" : "text-orange-700"
            )}>
              {Math.round((filledRequired / totalRequired) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Missing Fields Details */}
      <AnimatePresence>
        {!isComplete && showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-neutral-600" />
                <h4 className="text-sm font-semibold text-neutral-700">
                  Missing Required Fields
                </h4>
              </div>
              
              <ul className="space-y-2">
                {requiredFields
                  .filter(f => !f.isFilled)
                  .map((field) => (
                    <motion.li
                      key={field.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 text-sm text-neutral-600"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      <span className="flex-1">
                        <span className="font-medium">{field.label}</span>
                        <span className="text-neutral-500 ml-1">
                          in {field.section}
                        </span>
                      </span>
                    </motion.li>
                  ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
