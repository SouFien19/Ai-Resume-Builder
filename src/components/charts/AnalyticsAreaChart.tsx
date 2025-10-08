"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface AreaChartProps {
  data: ScoreDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
}

export function AnalyticsAreaChart({ 
  data = [], 
  title = "Score Progression", 
  subtitle = "Cumulative performance view", 
  height = 320 
}: AreaChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const chartData = useMemo(() => {
    // Enhanced data validation
    if (!data || !Array.isArray(data) || data.length === 0) {
      return { points: [], path: '', areaPath: '', chartWidth: 800, chartHeight: height, padding: { top: 40, right: 40, bottom: 60, left: 60 }, maxScore: 100, minScore: 0 };
    }
    
    // Filter out invalid data points
    const validData = data.filter(point => 
      point && 
      typeof point.score === 'number' && 
      !isNaN(point.score) && 
      point.date
    );
    
    if (validData.length === 0) {
      return { points: [], path: '', areaPath: '', chartWidth: 800, chartHeight: height, padding: { top: 40, right: 40, bottom: 60, left: 60 }, maxScore: 100, minScore: 0 };
    }
    
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };
    const chartWidth = 800;
    const chartHeight = height;
    
    const scores = validData.map(d => d.score);
    const maxScore = Math.max(...scores, 100);
    const minScore = Math.min(...scores, 0);
    const scoreRange = maxScore - minScore || 1;

    const points = validData.map((point, index) => {
      const x = padding.left + (validData.length > 1 ? (index / (validData.length - 1)) : 0.5) * (chartWidth - padding.left - padding.right);
      const y = chartHeight - padding.bottom - ((point.score - minScore) / scoreRange) * (chartHeight - padding.top - padding.bottom);
      
      // Validate coordinates
      if (isNaN(x) || isNaN(y)) {
        return null;
      }
      
      return { x, y, ...point };
    }).filter(point => point !== null);

    if (points.length === 0) {
      return { points: [], path: '', areaPath: '', chartWidth, chartHeight, padding, maxScore, minScore };
    }

    // Create smooth curve with validation
    const createSmoothPath = (points: Array<{x: number; y: number}>) => {
      if (!points || points.length < 2) return '';
      
      // Validate all points have valid coordinates
      const validPoints = points.filter(p => p && !isNaN(p.x) && !isNaN(p.y));
      if (validPoints.length < 2) return '';
      
      let path = `M ${validPoints[0].x} ${validPoints[0].y}`;
      
      for (let i = 1; i < validPoints.length; i++) {
        const prev = validPoints[i - 1];
        const curr = validPoints[i];
        
        if (i === 1) {
          const controlX = prev.x + (curr.x - prev.x) / 3;
          const controlY = prev.y;
          path += ` Q ${controlX} ${controlY} ${curr.x} ${curr.y}`;
        } else {
          const cpx1 = prev.x + (curr.x - prev.x) / 3;
          const cpy1 = prev.y;
          const cpx2 = curr.x - (curr.x - prev.x) / 3;
          const cpy2 = curr.y;
          path += ` C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${curr.x} ${curr.y}`;
        }
      }
      
      return path;
    };

    const linePath = createSmoothPath(points);
    const areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

    return { points, path: linePath, areaPath, chartWidth, chartHeight, padding, maxScore, minScore };
  }, [data, height]);

  if (!data || data.length === 0 || chartData.points.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">No Data Available</p>
          <p className="text-sm text-neutral-400">Submit your resume for analysis to see area chart data</p>
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

      {/* Chart */}
      <div className="relative" style={{ height: height - 120 }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartData.chartWidth} ${chartData.chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {chartData.points.length > 0 && [0, 25, 50, 75, 100].map((value) => {
            const y = chartData.chartHeight! - chartData.padding!.bottom - ((value - chartData.minScore!) / (chartData.maxScore! - chartData.minScore!)) * (chartData.chartHeight! - chartData.padding!.top - chartData.padding!.bottom);
            return (
              <g key={value}>
                <line
                  x1={chartData.padding!.left}
                  y1={y}
                  x2={chartData.chartWidth! - chartData.padding!.right}
                  y2={y}
                  stroke="#374151"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                <text
                  x={chartData.padding!.left - 10}
                  y={y + 4}
                  fontSize="12"
                  fill="#9CA3AF"
                  textAnchor="end"
                >
                  {value}%
                </text>
              </g>
            );
          })}

          {/* Area */}
          <motion.path
            d={chartData.areaPath}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Line */}
          <motion.path
            d={chartData.path}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {/* Data points */}
          {chartData.points.map((point, index) => (
            <motion.g key={index}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={hoveredPoint === index ? "8" : "5"}
                fill="#ffffff"
                stroke="url(#lineGradient)"
                strokeWidth="3"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.5, type: "spring", bounce: 0.5 }}
                whileHover={{ scale: 1.2 }}
              />
              
              {/* Tooltip */}
              {hoveredPoint === index && (
                <motion.g
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  <rect
                    x={point.x - 30}
                    y={point.y - 35}
                    width="60"
                    height="25"
                    rx="4"
                    fill="#1f2937"
                    stroke="#374151"
                  />
                  <text
                    x={point.x}
                    y={point.y - 18}
                    fontSize="12"
                    fill="#ffffff"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {point.score}%
                  </text>
                </motion.g>
              )}
            </motion.g>
          ))}

          {/* X-axis labels */}
          {chartData.points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartData.chartHeight! - chartData.padding!.bottom + 20}
              fontSize="10"
              textAnchor="middle"
              fill="#9CA3AF"
            >
              {new Date(point.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </text>
          ))}
        </svg>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-700">
        <div className="text-sm">
          <span className="text-neutral-400">Trend: </span>
          <span className={`font-semibold ${
            data[data.length - 1].score > data[0].score ? 'text-green-400' : 'text-red-400'
          }`}>
            {data[data.length - 1].score > data[0].score ? '↗ Improving' : '↘ Declining'}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-neutral-400">Range: </span>
          <span className="text-cyan-400 font-semibold">
            {Math.min(...data.map(d => d.score))}% - {Math.max(...data.map(d => d.score))}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}