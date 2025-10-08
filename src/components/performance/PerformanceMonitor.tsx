'use client';

import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentCount: number;
  memoryUsage?: number;
}

export const PerformanceMonitor = ({ componentName }: { componentName: string }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);

  useEffect(() => {
    const startTime = performance.now();
    let componentCount = 0;

    // Count DOM elements as a rough proxy for component complexity
    const observer = new MutationObserver(() => {
      componentCount = document.querySelectorAll('*').length;
    });

    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });

    // Measure render time
    const measurePerformance = () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize;
      
      setMetrics({
        renderTime: Math.round(renderTime * 100) / 100,
        componentCount: document.querySelectorAll('*').length,
        memoryUsage: memoryUsage ? Math.round(memoryUsage / 1024 / 1024 * 100) / 100 : undefined
      });
    };

    // Measure after a short delay to catch async renders
    const timeoutId = setTimeout(measurePerformance, 100);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  if (!metrics || process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 backdrop-blur-sm">
      <div className="text-cyan-400 font-bold mb-1">{componentName}</div>
      <div>Render: {metrics.renderTime}ms</div>
      <div>DOM: {metrics.componentCount} elements</div>
      {metrics.memoryUsage && (
        <div>Memory: {metrics.memoryUsage}MB</div>
      )}
    </div>
  );
};

export default PerformanceMonitor;