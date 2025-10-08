"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface DonutChartProps {
  data: ScoreDataPoint[];
  title?: string;
  subtitle?: string;
}

export function AnalyticsDonutChart({ 
  data = [], 
  title = "Score Distribution", 
  subtitle = "Performance breakdown" 
}: DonutChartProps) {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);

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
    
    // Group scores into ranges
    const ranges = [
      { label: 'Excellent', min: 90, max: 100, color: '#10b981', count: 0 },
      { label: 'Good', min: 75, max: 89, color: '#06b6d4', count: 0 },
      { label: 'Average', min: 60, max: 74, color: '#f59e0b', count: 0 },
      { label: 'Below Average', min: 0, max: 59, color: '#ef4444', count: 0 }
    ];

    validData.forEach(point => {
      ranges.forEach(range => {
        if (point.score >= range.min && point.score <= range.max) {
          range.count++;
        }
      });
    });

    const total = validData.length;
    let currentAngle = 0;

    return ranges
      .filter(range => range.count > 0)
      .map(range => {
        const percentage = total > 0 ? (range.count / total) * 100 : 0;
        const angle = total > 0 ? (range.count / total) * 360 : 0;
        const startAngle = currentAngle;
        currentAngle += angle;
        
        return {
          ...range,
          percentage,
          angle,
          startAngle,
          endAngle: currentAngle
        };
      });
  }, [data]);

  const radius = 80;
  const innerRadius = 50;
  const center = 100;

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", innerEnd.x, innerEnd.y,
      "A", innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      "Z"
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  if (!data || data.length === 0 || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400 bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-700/50 p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <p className="text-lg font-medium text-white mb-2">No Data Available</p>
          <p className="text-sm text-neutral-400">Submit your resume for analysis to see score distribution</p>
        </div>
      </div>
    );
  }

  const latestScore = data[data.length - 1]?.score || 0;

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
        {/* Donut Chart */}
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {chartData.map((segment, index) => (
              <motion.path
                key={segment.label}
                d={createArcPath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="#1f2937"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-300"
                style={{
                  filter: hoveredSegment === index ? 'brightness(1.2) drop-shadow(0 0 10px currentColor)' : 'none'
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            ))}
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div 
              className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
            >
              {latestScore}%
            </motion.div>
            <div className="text-xs text-neutral-400">Latest Score</div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {chartData.map((segment, index) => (
            <motion.div
              key={segment.label}
              className="flex items-center gap-3 cursor-pointer group"
              onMouseEnter={() => setHoveredSegment(index)}
              onMouseLeave={() => setHoveredSegment(null)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              whileHover={{ scale: 1.05 }}
            >
              <div 
                className="w-4 h-4 rounded-full border-2 border-neutral-700"
                style={{ backgroundColor: segment.color }}
              />
              <div className="text-sm">
                <div className="text-white font-medium group-hover:text-cyan-300 transition-colors">
                  {segment.label}
                </div>
                <div className="text-neutral-400 text-xs">
                  {segment.count} ({Math.round(segment.percentage)}%)
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-700">
        <div className="text-sm">
          <span className="text-neutral-400">Total Analyses: </span>
          <span className="text-white font-semibold">{data.length}</span>
        </div>
        <div className="text-sm">
          <span className="text-neutral-400">Average: </span>
          <span className="text-cyan-400 font-semibold">
            {Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length)}%
          </span>
        </div>
      </div>
    </motion.div>
  );
}