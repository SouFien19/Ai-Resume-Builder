import React from 'react';

interface PerformanceLogEntry {
  timestamp: number;
  event: string;
  duration?: number;
  data?: Record<string, unknown>;
}

// Performance monitoring utilities for tracking app performance
export class PerformanceMonitor {
  private static measurements = new Map<string, number>();
  private static logs: PerformanceLogEntry[] = [];

  // Start timing an operation
  static startMeasurement(key: string): void {
    this.measurements.set(key, performance.now());
    this.logs.push({
      timestamp: Date.now(),
      event: `${key}_start`
    });
  }

  // End timing and log the result
  static endMeasurement(key: string, data?: Record<string, unknown>): number {
    const startTime = this.measurements.get(key);
    if (!startTime) {
      console.warn(`No start measurement found for key: ${key}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(key);
    
    this.logs.push({
      timestamp: Date.now(),
      event: `${key}_end`,
      duration,
      data
    });

    // Log slow operations (> 1 second)
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${key} took ${duration.toFixed(2)}ms`, data);
    } else if (duration > 100) {
      console.log(`${key} completed in ${duration.toFixed(2)}ms`, data);
    }

    return duration;
  }

  // Get performance summary
  static getSummary(): { 
    totalOperations: number; 
    slowOperations: Array<{ event: string; duration: number }>; 
    averageDuration: number;
    recentLogs: Array<{ timestamp: number; event: string; duration?: number }>;
  } {
    const completedOperations = this.logs.filter(log => log.event.endsWith('_end') && log.duration);
    const slowOps = completedOperations
      .filter(log => log.duration! > 1000)
      .map(log => ({ event: log.event.replace('_end', ''), duration: log.duration! }));
    
    const totalDuration = completedOperations.reduce((sum, log) => sum + (log.duration || 0), 0);
    const avgDuration = completedOperations.length > 0 ? totalDuration / completedOperations.length : 0;

    return {
      totalOperations: completedOperations.length,
      slowOperations: slowOps,
      averageDuration: avgDuration,
      recentLogs: this.logs.slice(-20) // Last 20 operations
    };
  }

  // Clear all logs (useful for testing)
  static clear(): void {
    this.measurements.clear();
    this.logs = [];
  }

  // Log a simple event
  static logEvent(event: string, data?: Record<string, unknown>): void {
    this.logs.push({
      timestamp: Date.now(),
      event,
      data
    });
  }
}

// Hook for React components to measure render performance
export function usePerformanceTracking(componentName: string) {
  const startTime = performance.now();
  
  React.useEffect(() => {
    const renderTime = performance.now() - startTime;
    if (renderTime > 16) { // More than one frame at 60fps
      PerformanceMonitor.logEvent(`${componentName}_slow_render`, { 
        renderTime: renderTime.toFixed(2) 
      });
    }
  });

  return {
    trackOperation: (operationName: string) => ({
      start: () => PerformanceMonitor.startMeasurement(`${componentName}_${operationName}`),
      end: (data?: Record<string, unknown>) => PerformanceMonitor.endMeasurement(`${componentName}_${operationName}`, data)
    })
  };
}

// Utility to monitor API call performance
export function monitorAPICall<T>(
  apiCall: () => Promise<T>, 
  operationName: string
): Promise<T> {
  PerformanceMonitor.startMeasurement(operationName);
  
  return apiCall()
    .then(result => {
      PerformanceMonitor.endMeasurement(operationName, { success: true });
      return result;
    })
    .catch(error => {
      PerformanceMonitor.endMeasurement(operationName, { success: false, error: error.message });
      throw error;
    });
}