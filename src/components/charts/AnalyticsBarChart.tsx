"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface BarChartProps {
  data: ScoreDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
}

export function AnalyticsBarChart({ 
  data = [], 
  title = "ATS Score Progress", 
  subtitle = "Performance over time", 
  height = 320 
}: BarChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Filter out invalid data points
    const validData = data.filter(point => 
      point && 
      typeof point.score === 'number' && 
      !isNaN(point.score) && 
      point.date
    );
    
    if (validData.length === 0) return [];
    
    const scores = validData.map(d => d.score);
    const maxScore = Math.max(...scores, 100);
    
    return validData.map((point) => ({
      ...point,
      percentage: maxScore > 0 ? (point.score / maxScore) * 100 : 0,
      color: point.score >= 80 ? '#10b981' : point.score >= 60 ? '#f59e0b' : '#ef4444'
    }));
  }, [data]);

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">No Data Available</p>
          <p className="text-sm text-neutral-400">Submit your resume for analysis to see bar chart data</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-neutral-400 text-sm">{subtitle}</p>
      </div>

      {/* Chart Container */}
      <div className="relative" style={{ height: height - 120 }}>
        <div className="flex items-end justify-between h-full gap-3 px-4">
          {chartData.map((point, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center flex-1 group cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ scale: 1.05 }}
            >
              {/* Bar */}
              <motion.div
                className="w-full rounded-t-lg relative overflow-hidden"
                style={{ 
                  height: `${point.percentage}%`,
                  background: `linear-gradient(to top, ${point.color}, ${point.color}aa)`,
                  minHeight: '8px'
                }}
                initial={{ height: 0 }}
                animate={{ height: `${point.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                {/* Glow effect */}
                <div 
                  className="absolute inset-0 opacity-50 blur-sm"
                  style={{ backgroundColor: point.color }}
                />
                
                {/* Score label on hover */}
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.div
                      className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white text-xs px-2 py-1 rounded shadow-lg"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      {point.score}%
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Date label */}
              <motion.div 
                className="mt-2 text-xs text-neutral-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                {new Date(point.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-500">
          {[100, 75, 50, 25, 0].map(value => (
            <div key={value} className="flex items-center">
              <span className="mr-2">{value}%</span>
              <div className="w-1 h-px bg-neutral-700"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-700">
        <div className="text-sm">
          <span className="text-neutral-400">Peak: </span>
          <span className="text-green-400 font-semibold">{Math.max(...data.map(d => d.score))}%</span>
        </div>
        <div className="text-sm">
          <span className="text-neutral-400">Average: </span>
          <span className="text-cyan-400 font-semibold">{Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}%</span>
        </div>
        <div className="text-sm">
          <span className="text-neutral-400">Total: </span>
          <span className="text-purple-400 font-semibold">{data.length}</span>
        </div>
      </div>
    </motion.div>
  );
}