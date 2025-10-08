"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface RadialChartProps {
  data: ScoreDataPoint[];
  title?: string;
  subtitle?: string;
}

export function AnalyticsRadialChart({ 
  data = [], 
  title = "Performance Radar", 
  subtitle = "Multi-dimensional view" 
}: RadialChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const chartData = useMemo(() => {
    if (!data || !Array.isArray(data) || data.length === 0) return [];
    
    // Filter out invalid data points
    const validData = data.filter(point => 
      point && 
      typeof point.score === 'number' && 
      !isNaN(point.score) && 
      point.score >= 0 && 
      point.score <= 100
    );
    
    if (validData.length === 0) return [];
    
    // Take latest scores and create categories with safe calculations
    const scores = validData.map(d => d.score);
    const latestScore = validData[validData.length - 1]?.score || 0;
    const averageScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0;
    const peakScore = scores.length > 0 ? Math.max(...scores) : 0;
    const minScore = scores.length > 0 ? Math.min(...scores) : 0;
    const consistencyScore = Math.round(100 - (peakScore - minScore));
    const improvementScore = validData.length > 1 ? 
      Math.max(0, Math.round(((latestScore - (validData[0]?.score || 0)) * 2 + 50))) : 50;
    
    const categories = [
      { label: 'Latest Score', value: latestScore, color: '#10b981' },
      { label: 'Average', value: averageScore, color: '#06b6d4' },
      { label: 'Peak Performance', value: peakScore, color: '#8b5cf6' },
      { label: 'Consistency', value: Math.max(0, Math.min(100, consistencyScore)), color: '#f59e0b' },
      { label: 'Improvement', value: Math.max(0, Math.min(100, improvementScore)), color: '#ef4444' }
    ];

    const angleStep = (2 * Math.PI) / categories.length;
    
    return categories.map((category, index) => ({
      ...category,
      angle: index * angleStep,
      radius: (category.value / 100) * 80 // Scale to chart size
    }));
  }, [data]);

  const center = 120;
  const maxRadius = 80;

  // Create polygon path with validation
  const createPolygonPath = () => {
    if (!chartData || chartData.length === 0) return '';
    
    return chartData.map(point => {
      const x = center + point.radius * Math.cos(point.angle - Math.PI / 2);
      const y = center + point.radius * Math.sin(point.angle - Math.PI / 2);
      
      // Validate coordinates
      if (isNaN(x) || isNaN(y)) return '0,0';
      
      return `${x},${y}`;
    }).join(' ');
  };

  // Create grid circles
  const gridCircles = [20, 40, 60, 80].map(radius => (
    <circle
      key={radius}
      cx={center}
      cy={center}
      r={radius}
      fill="none"
      stroke="#374151"
      strokeWidth="1"
      opacity="0.3"
    />
  ));

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">No Data Available</p>
          <p className="text-sm text-neutral-400">Submit your resume for analysis to see radar chart data</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full p-6 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-1">{title}</h3>
        <p className="text-neutral-400 text-sm">{subtitle}</p>
      </div>

      <div className="flex items-center justify-center gap-8">
        {/* Radial Chart */}
        <div className="relative">
          <svg width="240" height="240" className="overflow-visible">
            {/* Background grid */}
            {gridCircles}
            
            {/* Grid lines */}
            {chartData.map((_, index) => {
              const angle = index * (2 * Math.PI) / chartData.length;
              const x2 = center + maxRadius * Math.cos(angle - Math.PI / 2);
              const y2 = center + maxRadius * Math.sin(angle - Math.PI / 2);
              return (
                <line
                  key={index}
                  x1={center}
                  y1={center}
                  x2={x2}
                  y2={y2}
                  stroke="#374151"
                  strokeWidth="1"
                  opacity="0.3"
                />
              );
            })}

            {/* Data polygon */}
            <motion.polygon
              points={createPolygonPath()}
              fill="url(#radialGradient)"
              stroke="#06b6d4"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
            />

            {/* Data points */}
            {chartData.map((point, index) => {
              const x = center + point.radius * Math.cos(point.angle - Math.PI / 2);
              const y = center + point.radius * Math.sin(point.angle - Math.PI / 2);
              
              return (
                <motion.g key={index}>
                  <motion.circle
                    cx={x}
                    cy={y}
                    r={hoveredIndex === index ? "8" : "5"}
                    fill={point.color}
                    stroke="#1f2937"
                    strokeWidth="2"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5, type: "spring", bounce: 0.5 }}
                    whileHover={{ scale: 1.3 }}
                  />
                  
                  {/* Value labels */}
                  <motion.text
                    x={x + (x > center ? 15 : -15)}
                    y={y}
                    fontSize="12"
                    fill={point.color}
                    textAnchor={x > center ? "start" : "end"}
                    fontWeight="bold"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0.7 }}
                    transition={{ delay: index * 0.1 + 0.8 }}
                  >
                    {point.value}%
                  </motion.text>
                </motion.g>
              );
            })}

            {/* Gradient definition */}
            <defs>
              <radialGradient id="radialGradient" cx="50%" cy="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Legend */}
        <div className="space-y-4">
          {chartData.map((item, index) => (
            <motion.div
              key={item.label}
              className="flex items-center gap-3 cursor-pointer group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-neutral-700"
                style={{ backgroundColor: item.color }}
              />
              <div className="text-sm">
                <div className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                  {item.label}
                </div>
                <div className="text-neutral-400 text-xs">
                  {item.value}%
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Overall Score */}
      <div className="text-center mt-6 pt-4 border-t border-neutral-700">
        <div className="text-sm text-neutral-400 mb-1">Overall Performance Score</div>
        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
          {Math.round(chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length)}%
        </div>
      </div>
    </motion.div>
  );
}