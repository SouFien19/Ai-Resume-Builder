"use client";

import React, { useState, useEffect } from 'react';
import { PerformanceMonitor } from '@/lib/performance-monitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, TrendingUp, Zap, AlertTriangle, BarChart3 } from 'lucide-react';

interface PerformanceSummary {
  totalOperations: number;
  slowOperations: Array<{ event: string; duration: number }>;
  averageDuration: number;
  recentLogs: Array<{ timestamp: number; event: string; duration?: number }>;
}

export default function PerformanceDashboard() {
  const [summary, setSummary] = useState<PerformanceSummary | null>(null);
  const refreshData = () => {
    setSummary(PerformanceMonitor.getSummary());
  };

  useEffect(() => {
    refreshData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(refreshData, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const clearData = () => {
    PerformanceMonitor.clear();
    refreshData();
  };

  if (!summary) {
    return (
      <div className="p-6">
        <div className="animate-pulse">Loading performance data...</div>
      </div>
    );
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getOperationStatus = (duration?: number) => {
    if (!duration) return 'info';
    if (duration > 1000) return 'error';
    if (duration > 500) return 'warning';
    return 'success';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'success': return <Zap className="h-4 w-4" />;
      default: return <BarChart3 className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Performance Dashboard
          </h2>
          <p className="text-gray-600">Monitor app performance in real-time</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshData} variant="outline" size="sm">
            Refresh
          </Button>
          <Button onClick={clearData} variant="outline" size="sm">
            Clear Data
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOperations}</div>
            <p className="text-xs text-gray-500 mt-1">API calls tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(summary.averageDuration)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {summary.averageDuration < 500 ? 'Excellent' : 
               summary.averageDuration < 1000 ? 'Good' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Slow Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{summary.slowOperations.length}</div>
            <p className="text-xs text-gray-500 mt-1">Operations &gt; 1s</p>
          </CardContent>
        </Card>
      </div>

      {/* Slow Operations Alert */}
      {summary.slowOperations.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Slow Operations Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.slowOperations.map((op, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="font-medium">{op.event.replace(/_/g, ' ')}</span>
                  <Badge variant="destructive">{formatDuration(op.duration)}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {summary.recentLogs.slice(-20).reverse().map((log, index) => {
              const status = getOperationStatus(log.duration);
              return (
                <div key={index} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(status)}
                    <span className="font-medium">{log.event.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatTimestamp(log.timestamp)}</span>
                    {log.duration && (
                      <Badge 
                        variant={status === 'error' ? 'destructive' : 
                                status === 'warning' ? 'secondary' : 'default'}
                      >
                        {formatDuration(log.duration)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Performance Optimizations Active
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">✅ Implemented</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• API Response Caching (5min TTL)</li>
                <li>• Component Debouncing (300ms)</li>
                <li>• React.memo Optimizations</li>
                <li>• AI Streaming Responses</li>
                <li>• Code Splitting & Lazy Loading</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-800">🎯 Benefits</h4>
              <ul className="space-y-1 text-blue-700">
                <li>• Reduced API redundancy</li>
                <li>• Smoother UI interactions</li>
                <li>• Faster page load times</li>
                <li>• Better perceived performance</li>
                <li>• Optimized bundle sizes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}