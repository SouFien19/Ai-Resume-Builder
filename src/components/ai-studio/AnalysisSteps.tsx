"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AnalysisStepProps {
  steps: string[];
  currentStep: number;
  isComplete: boolean;
}

export const AnalysisSteps = React.memo(({ steps, currentStep, isComplete }: AnalysisStepProps) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCurrentStep = index === currentStep;
        const isCompleted = index < currentStep || isComplete;

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-3 p-3 rounded-lg border ${
              isCurrentStep 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : isCompleted 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isCompleted 
                ? 'bg-green-500 text-white'
                : isCurrentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
            }`}>
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : isCurrentStep ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Clock className="h-4 w-4" />
                </motion.div>
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
            </div>
            <span className={`text-sm font-medium ${
              isCurrentStep 
                ? 'text-blue-700 dark:text-blue-300'
                : isCompleted
                ? 'text-green-700 dark:text-green-300'
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {step}
            </span>
          </motion.div>
        );
      })}
    </div>
  );
});

AnalysisSteps.displayName = 'AnalysisSteps';