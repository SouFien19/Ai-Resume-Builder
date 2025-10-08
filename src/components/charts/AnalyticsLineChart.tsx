"use client";

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// --- TYPES ---
interface ScoreDataPoint {
  date: string;
  score: number;
}

interface EnhancedDataPoint extends ScoreDataPoint {
  trend: 'up' | 'down' | 'stable';
  change: number;
}

interface ChartProps {
  data: ScoreDataPoint[];
  title?: string;
  subtitle?: string;
  showStats?: boolean;
  height?: number;
}

interface TooltipData {
  x: number;
  y: number;
  point: EnhancedDataPoint;
}

// --- HELPER FUNCTIONS ---

/**
 * Generates a smooth SVG path through a series of points using Catmull-Rom splines.
 */
const createSplinePath = (points: {x: number, y: number}[]) => {
  if (!points || points.length < 2) return '';
  
  // Validate all points have valid coordinates
  const validPoints = points.filter(p => p && !isNaN(p.x) && !isNaN(p.y));
  if (validPoints.length < 2) return '';
  
  let path = `M ${validPoints[0].x} ${validPoints[0].y}`;
  const tension = 0.2;

  for (let i = 0; i < validPoints.length - 1; i++) {
    const p0 = validPoints[i - 1] || validPoints[i];
    const p1 = validPoints[i];
    const p2 = validPoints[i + 1];
    const p3 = validPoints[i + 2] || p2;

    const d1x = (p2.x - p0.x) * tension;
    const d1y = (p2.y - p0.y) * tension;
    const d2x = (p3.x - p1.x) * tension;
    const d2y = (p3.y - p1.y) * tension;

    const cp1x = p1.x + d1x;
    const cp1y = p1.y + d1y;
    const cp2x = p2.x - d2x;
    const cp2y = p2.y - d2y;

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return path;
};

// --- SUB-COMPONENTS ---

interface ChartHeaderProps {
  title?: string;
  subtitle?: string;
  latestPoint?: EnhancedDataPoint;
  showStats?: boolean;
}

const ChartHeader = ({ title, subtitle, latestPoint, showStats }: ChartHeaderProps) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
    <div className="mb-4 sm:mb-0">
      <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
      <p className="text-neutral-300 text-sm">{subtitle}</p>
    </div>
    {showStats && latestPoint && (
      <div className="flex items-center gap-6 bg-neutral-800/50 rounded-lg px-4 py-3">
        <div className="text-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
            {latestPoint.score}%
          </div>
          <div className="text-xs text-neutral-400">Current</div>
        </div>
        <div className="h-8 w-px bg-neutral-700"></div>
        <div className="text-center">
          <div className={`text-sm font-semibold ${latestPoint.trend === 'up' ? 'text-green-400' : latestPoint.trend === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
            {latestPoint.trend === 'up' ? '↗' : latestPoint.trend === 'down' ? '↘' : '→'} 
            {Math.abs(latestPoint.change || 0)}%
          </div>
          <div className="text-xs text-neutral-400">Change</div>
        </div>
      </div>
    )}
  </div>
);

const ChartTooltip = ({ tooltipData, containerRef }: { tooltipData: TooltipData | null, containerRef: React.RefObject<HTMLDivElement | null> }) => (
  <AnimatePresence>
    {tooltipData && (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.9 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="absolute z-30 px-3 py-2 text-sm text-white bg-neutral-800 rounded-lg shadow-xl border border-neutral-700 pointer-events-none backdrop-blur-sm"
        style={{
          left: Math.min(
            (containerRef.current?.clientWidth || 800) - 140,
            Math.max(20, tooltipData.x)
          ),
          top: tooltipData.y - 10,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-cyan-400"></div>
          <div className="font-bold text-white">{tooltipData.point.score}%</div>
        </div>
        <div className="text-neutral-300 text-xs">
          {new Date(tooltipData.point.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
        {tooltipData.point.change !== undefined && (
          <div className={`text-xs mt-1 flex items-center gap-1 ${tooltipData.point.trend === 'up' ? 'text-green-400' : tooltipData.point.trend === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
            <span>{tooltipData.point.trend === 'up' ? '↑' : tooltipData.point.trend === 'down' ? '↓' : '→'}</span>
            <span>{Math.abs(tooltipData.point.change)}% from previous</span>
          </div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

// --- MAIN CHART COMPONENT ---

export function AnalyticsLineChart({
  data = [],
  title = "ATS Score Trend",
  subtitle = "Track your resume optimization progress over time",
  showStats = true,
  height = 320
}: ChartProps) {
  const [activePointIndex, setActivePointIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced sample data with more realistic progression
  const defaultData: ScoreDataPoint[] = [
    { date: '2023-01-15', score: 65 },
    { date: '2023-02-20', score: 72 },
    { date: '2023-03-10', score: 68 },
    { date: '2023-04-05', score: 85 },
    { date: '2023-05-12', score: 78 },
    { date: '2023-06-18', score: 90 },
    { date: '2023-07-22', score: 87 },
    { date: '2023-08-30', score: 92 },
  ];

  const chartData = data && Array.isArray(data) && data.length > 0 ? data : defaultData;

  // Memoize data processing with validation
  const enhancedData = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return [];
    }
    
    return chartData
      .filter(point => point && typeof point.score === 'number' && !isNaN(point.score))
      .map((point, index) => {
        const change = index > 0 ? point.score - chartData[index - 1].score : 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        if (change > 2) trend = 'up';
        else if (change < -2) trend = 'down';
        return { ...point, change, trend };
      });
  }, [chartData]);

  // Memoize chart calculations
  const { points, pathD, areaPathD, chartWidth, chartHeight, padding } = useMemo(() => {
    const chartWidth = 800; // Increased for better detail
    const chartHeight = height;
    const padding = { top: 30, right: 30, bottom: 50, left: 60 }; // Increased padding for labels

    if (!enhancedData || enhancedData.length === 0) {
      return { points: [], pathD: '', areaPathD: '', chartWidth, chartHeight, padding };
    }

    const scores = enhancedData.map(d => d?.score || 0).filter(score => !isNaN(score));
    if (scores.length === 0) {
      return { points: [], pathD: '', areaPathD: '', chartWidth, chartHeight, padding };
    }

    const maxScore = Math.max(...scores, 100);
    const minScore = Math.min(...scores, 0);
    const scoreRange = maxScore - minScore || 1;

    const calculatedPoints = enhancedData.map((point, index) => {
      if (!point || typeof point.score !== 'number' || isNaN(point.score)) {
        return null;
      }
      
      const x = padding.left + (enhancedData.length > 1 ? (index / (enhancedData.length - 1)) : 0.5) * (chartWidth - padding.left - padding.right);
      const y = chartHeight - padding.bottom - ((point.score - minScore) / scoreRange) * (chartHeight - padding.top - padding.bottom);
      
      // Ensure coordinates are valid numbers
      if (isNaN(x) || isNaN(y)) {
        return null;
      }
      
      return { x, y, ...point };
    }).filter(point => point !== null);

    if (calculatedPoints.length === 0) {
      return { points: [], pathD: '', areaPathD: '', chartWidth, chartHeight, padding };
    }

    const pathD = createSplinePath(calculatedPoints);
    const lastPoint = calculatedPoints[calculatedPoints.length - 1];
    const firstPoint = calculatedPoints[0];
    const areaPathD = `${pathD} L ${lastPoint.x},${chartHeight - padding.bottom} L ${firstPoint.x},${chartHeight - padding.bottom} Z`;

    return { 
      points: calculatedPoints, 
      pathD, 
      areaPathD, 
      chartWidth, 
      chartHeight, 
      padding
    };
  }, [enhancedData, height]);

  // Mouse move handler for tooltip
  const handleMouseMove = useCallback((event: React.MouseEvent<SVGRectElement>) => {
    const svgRect = event.currentTarget.getBoundingClientRect();
    const svgX = event.clientX - svgRect.left;

    let closestPointIndex = -1;
    let minDistance = Infinity;

    points.forEach((point, index) => {
      const distance = Math.abs(point.x - svgX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPointIndex = index;
      }
    });

    setActivePointIndex(closestPointIndex);
  }, [points]);

  const handleMouseLeave = useCallback(() => {
    setActivePointIndex(null);
  }, []);

  // Safe active point access
  const activePoint = activePointIndex !== null && points[activePointIndex] 
    ? points[activePointIndex] 
    : null;

  const tooltipData = activePoint ? {
    x: activePoint.x,
    y: activePoint.y,
    point: activePoint
  } : null;

  if (enhancedData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-gradient-to-br from-neutral-900 to-neutral-800 rounded-2xl border border-neutral-800">
        <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Data Available</h3>
        <p className="text-neutral-400 text-sm">Add score data to see your analytics chart.</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-2xl p-6 border border-neutral-700/50 shadow-2xl backdrop-blur-sm"
      onMouseLeave={handleMouseLeave}
      role="figure"
      aria-label={title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)",
        transition: { duration: 0.3 }
      }}
      style={{
        background: "linear-gradient(135deg, #1f2937 0%, #111827 50%, #1f2937 100%)",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
    >
      <ChartHeader 
        title={title} 
        subtitle={subtitle} 
        latestPoint={enhancedData[enhancedData.length - 1]} 
        showStats={showStats} 
      />

      <div className="relative" style={{ height: `${chartHeight}px` }}>
        <ChartTooltip tooltipData={tooltipData} containerRef={containerRef} />
        
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="25%" stopColor="#06b6d4" />
              <stop offset="75%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="pointGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000000" floodOpacity="0.3"/>
            </filter>
            <pattern id="gridPattern" patternUnits="userSpaceOnUse" width="40" height="40">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>

          {/* Enhanced grid lines and labels */}
          {[0, 25, 50, 75, 100].map((value, index) => {
            const y = chartHeight - padding.bottom - ((value - 0) / 100) * (chartHeight - padding.top - padding.bottom);
            return (
              <motion.g 
                key={value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <line 
                  x1={padding.left} 
                  y1={y} 
                  x2={chartWidth - padding.right} 
                  y2={y} 
                  stroke={value === 50 ? "#4b5563" : "#374151"} 
                  strokeWidth={value === 50 ? "1.5" : "1"}
                  strokeDasharray={value === 50 ? "none" : "4, 4"}
                  opacity={value === 50 ? "0.8" : "0.4"}
                />
                <motion.text 
                  x={padding.left - 15} 
                  y={y + 4} 
                  fontSize="11" 
                  textAnchor="end" 
                  fill={value === 50 ? "#e5e7eb" : "#9CA3AF"}
                  fontFamily="system-ui"
                  fontWeight={value === 50 ? "600" : "400"}
                  whileHover={{ scale: 1.1 }}
                >
                  {value}%
                </motion.text>
              </motion.g>
            );
          })}
          
          {/* Area fill */}
          <motion.path
            d={areaPathD}
            fill="url(#areaGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          {/* Main line */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="url(#lineGradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          />

          {/* Data points with enhanced animations */}
          {points.map((point, index) => (
            <motion.g key={`point-${index}`}>
              {/* Glow effect behind point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="8"
                fill="url(#lineGradient)"
                opacity="0.4"
                filter="url(#glow)"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.4 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.4
                }}
              />
              {/* Main point */}
              <motion.circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="url(#pointGradient)"
                stroke="url(#lineGradient)"
                strokeWidth="2"
                filter="url(#shadow)"
                initial={{ scale: 0, y: point.y + 20 }}
                animate={{ scale: 1, y: point.y }}
                whileHover={{ 
                  scale: 1.4,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  bounce: 0.6
                }}
                className="cursor-pointer"
              />
              {/* Trend indicator */}
              {point.trend !== 'stable' && (
                <motion.text
                  x={point.x}
                  y={point.y - 15}
                  fontSize="12"
                  textAnchor="middle"
                  fill={point.trend === 'up' ? '#10b981' : '#ef4444'}
                  fontWeight="bold"
                  initial={{ opacity: 0, y: point.y }}
                  animate={{ opacity: 1, y: point.y - 15 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  {point.trend === 'up' ? '↗' : '↘'}
                </motion.text>
              )}
            </motion.g>
          ))}

          {/* Enhanced interactive crosshair */}
          <AnimatePresence>
            {activePointIndex !== null && activePoint && (
              <motion.g 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Vertical crosshair line */}
                <motion.line 
                  x1={activePoint.x} 
                  y1={chartHeight - padding.bottom} 
                  x2={activePoint.x} 
                  y2={padding.top} 
                  stroke="#06b6d4" 
                  strokeWidth="2" 
                  strokeDasharray="8, 4" 
                  opacity="0.7"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  style={{ transformOrigin: `${activePoint.x}px ${chartHeight - padding.bottom}px` }}
                />
                {/* Horizontal crosshair line */}
                <motion.line 
                  x1={padding.left} 
                  y1={activePoint.y} 
                  x2={chartWidth - padding.right} 
                  y2={activePoint.y} 
                  stroke="#06b6d4" 
                  strokeWidth="2" 
                  strokeDasharray="8, 4" 
                  opacity="0.7"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ transformOrigin: `${padding.left}px ${activePoint.y}px` }}
                />
                {/* Active point highlight */}
                <motion.circle 
                  cx={activePoint.x} 
                  cy={activePoint.y} 
                  r="8" 
                  fill="none"
                  stroke="#06b6d4" 
                  strokeWidth="3" 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                />
                <motion.circle 
                  cx={activePoint.x} 
                  cy={activePoint.y} 
                  r="12" 
                  fill="#06b6d4" 
                  opacity="0.2"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
                />
              </motion.g>
            )}
          </AnimatePresence>

          {/* Interactive overlay */}
          <rect
            x={padding.left}
            y={padding.top}
            width={chartWidth - padding.left - padding.right}
            height={chartHeight - padding.top - padding.bottom}
            fill="transparent"
            onMouseMove={handleMouseMove}
            className="cursor-crosshair"
          />

          {/* X-axis labels */}
          {points.map((point, index) => (
            <text
              key={index}
              x={point.x}
              y={chartHeight - padding.bottom + 20}
              fontSize="10"
              textAnchor="middle"
              fill="#9CA3AF"
              fontFamily="system-ui"
            >
              {new Date(point.date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              })}
            </text>
          ))}
        </svg>
      </div>

      {/* Enhanced summary stats */}
      <motion.div 
        className="flex justify-between items-center mt-6 pt-4 border-t border-neutral-700/50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <motion.div 
          className="text-sm text-neutral-400 hover:text-green-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-green-400 font-semibold">Peak:</span> {Math.max(...enhancedData.map(d => d.score))}%
        </motion.div>
        <motion.div 
          className="text-sm text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-cyan-400 font-semibold">Average:</span> {Math.round(enhancedData.reduce((sum, d) => sum + d.score, 0) / enhancedData.length)}%
        </motion.div>
        <motion.div 
          className="text-sm text-neutral-400 hover:text-purple-400 transition-colors cursor-pointer"
          whileHover={{ scale: 1.05 }}
        >
          <span className="text-neutral-300 font-semibold">Analyses:</span> {enhancedData.length}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}