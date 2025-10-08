"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3, PieChart, Activity, Radar } from 'lucide-react';

import { AnalyticsLineChart } from './AnalyticsLineChart';
import { AnalyticsBarChart } from './AnalyticsBarChart';
import { AnalyticsDonutChart } from './AnalyticsDonutChart';
import { AnalyticsAreaChart } from './AnalyticsAreaChart';
import { AnalyticsRadialChart } from './AnalyticsRadialChart';

interface ScoreDataPoint {
  date: string;
  score: number;
}

interface DetailedScore {
  id: string;
  score: number;
  date: string;
  resumeText?: string;
  jobDescription?: string;
  analysis?: any;
  createdAt: string;
  daysAgo: number;
}

interface ChartSelectorProps {
  data?: ScoreDataPoint[];
  detailedScores?: DetailedScore[];
  height?: number;
}

// Transform detailed scores into chart-compatible format
const transformDetailedScores = (detailedScores: DetailedScore[]): ScoreDataPoint[] => {
  if (!detailedScores || detailedScores.length === 0) {
    return [];
  }

  return detailedScores
    .filter(score => score && typeof score.score === 'number' && !isNaN(score.score))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(score => ({
      date: score.date,
      score: score.score
    }));
};

type ChartType = 'line' | 'bar' | 'donut' | 'area' | 'radial';

const ChartSelector = React.memo(function ChartSelector({ data = [], detailedScores = [], height = 400 }: ChartSelectorProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('line');

  // Use detailedScores if available, otherwise fall back to data
  const chartData = detailedScores.length > 0 ? transformDetailedScores(detailedScores) : data;

  const chartTypes = [
    { 
      id: 'line' as ChartType, 
      name: 'Line Chart', 
      icon: TrendingUp, 
      description: 'Track trends over time',
      color: 'from-pink-500 to-purple-500'
    },
    { 
      id: 'bar' as ChartType, 
      name: 'Bar Chart', 
      icon: BarChart3, 
      description: 'Compare individual scores',
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      id: 'donut' as ChartType, 
      name: 'Donut Chart', 
      icon: PieChart, 
      description: 'Score distribution',
      color: 'from-green-500 to-emerald-500'
    },
    { 
      id: 'area' as ChartType, 
      name: 'Area Chart', 
      icon: Activity, 
      description: 'Cumulative progress',
      color: 'from-violet-500 to-purple-500'
    },
    { 
      id: 'radial' as ChartType, 
      name: 'Radial Chart', 
      icon: Radar, 
      description: 'Multi-dimensional analysis',
      color: 'from-yellow-500 to-orange-500'
    },
  ];

  const renderChart = () => {
    const chartProps = { data: chartData, height };
    
    switch (activeChart) {
      case 'line':
        return <AnalyticsLineChart {...chartProps} title="Individual ATS Scores" subtitle="All your resume analysis scores over time" showStats={true} />;
      case 'bar':
        return <AnalyticsBarChart {...chartProps} title="Score Comparison" subtitle="Individual performance analysis" />;
      case 'donut':
        return <AnalyticsDonutChart {...chartProps} title="Score Distribution" subtitle="Performance breakdown by ranges" />;
      case 'area':
        return <AnalyticsAreaChart {...chartProps} title="Cumulative Progress" subtitle="Your improvement journey" />;
      case 'radial':
        return <AnalyticsRadialChart {...chartProps} title="Performance Radar" subtitle="Multi-dimensional insights" />;
      default:
        return <AnalyticsLineChart {...chartProps} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-3 p-4 bg-neutral-800/50 rounded-xl border border-neutral-700/50">
        {chartTypes.map((chart) => {
          const IconComponent = chart.icon;
          const isActive = activeChart === chart.id;
          
          return (
            <motion.button
              key={chart.id}
              onClick={() => setActiveChart(chart.id)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg border transition-all duration-300
                ${isActive 
                  ? 'bg-gradient-to-r ' + chart.color + ' text-white border-transparent shadow-lg' 
                  : 'bg-neutral-700/30 text-neutral-300 border-neutral-600/50 hover:bg-neutral-700/50 hover:border-neutral-500/50'
                }
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <IconComponent className="h-4 w-4" />
              <span className="text-sm font-medium">{chart.name}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Chart Container */}
      <div className="bg-neutral-800/30 rounded-xl border border-neutral-700/50 overflow-hidden">
        {renderChart()}
      </div>

      {/* Chart Status Info */}
      <div className="flex items-center justify-between text-sm text-neutral-400 mb-4">
        <p>
          Viewing: <span className="text-white font-medium">
            {chartTypes.find(c => c.id === activeChart)?.name}
          </span>
          {' '}- {chartTypes.find(c => c.id === activeChart)?.description}
        </p>
        <p>
          <span className="text-cyan-400 font-medium">{chartData.length}</span> ATS scores
          {detailedScores.length > 0 && (
            <span className="ml-2 text-green-400">from database</span>
          )}
        </p>
      </div>
    </div>
  );
});

export { ChartSelector };