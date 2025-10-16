/**
 * Stats Section - Lazy Loaded Component
 * Only loads when visible (desktop view)
 */

"use client";

import { memo } from 'react';
import { Users, FileText, Award } from 'lucide-react';

const StatsSection = memo(() => {
  const stats = [
    { icon: Users, label: 'Active Users', value: '50K+' },
    { icon: FileText, label: 'Resumes Created', value: '100K+' },
    { icon: Award, label: 'Success Rate', value: '95%' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mt-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div 
            key={index} 
            className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <Icon className="w-8 h-8 text-white mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-white/80">{stat.label}</div>
          </div>
        );
      })}
    </div>
  );
});

StatsSection.displayName = 'StatsSection';

export default StatsSection;
