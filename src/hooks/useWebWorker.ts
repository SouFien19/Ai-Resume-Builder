/**
 * Web Worker Hook for React Components
 * Usage: const { execute, result, error, loading } = useWebWorker('/workers/resume-worker.js');
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface WorkerMessage {
  type: string;
  payload: any;
}

interface UseWebWorkerReturn {
  execute: (type: string, payload: any) => Promise<any>;
  result: any;
  error: Error | null;
  loading: boolean;
  terminate: () => void;
}

export function useWebWorker(workerPath: string): UseWebWorkerReturn {
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return;

    // Initialize worker
    try {
      workerRef.current = new Worker(workerPath);
      
      workerRef.current.onmessage = (event: MessageEvent<WorkerMessage>) => {
        const { type, payload } = event.data;
        
        if (type === 'ERROR') {
          setError(new Error(payload.message));
          setLoading(false);
        } else {
          setResult(payload);
          setLoading(false);
        }
      };

      workerRef.current.onerror = (event) => {
        setError(new Error(event.message));
        setLoading(false);
      };
    } catch (err) {
      console.error('Failed to initialize worker:', err);
      setError(err as Error);
    }

    // Cleanup
    return () => {
      workerRef.current?.terminate();
    };
  }, [workerPath]);

  const execute = useCallback((type: string, payload: any): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('Worker not initialized'));
        return;
      }

      setLoading(true);
      setError(null);

      // Set up one-time listener for this specific task
      const handleMessage = (event: MessageEvent<WorkerMessage>) => {
        const { type: responseType, payload: responsePayload } = event.data;
        
        if (responseType === 'ERROR') {
          const error = new Error(responsePayload.message);
          setError(error);
          setLoading(false);
          reject(error);
        } else {
          setResult(responsePayload);
          setLoading(false);
          resolve(responsePayload);
        }
        
        // Remove listener after handling
        workerRef.current?.removeEventListener('message', handleMessage);
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type, payload });
    });
  }, []);

  const terminate = useCallback(() => {
    workerRef.current?.terminate();
    workerRef.current = null;
  }, []);

  return { execute, result, error, loading, terminate };
}

// Example usage in a component:
/*
export function ResumeAnalyzer() {
  const { execute, result, loading, error } = useWebWorker('/workers/resume-worker.js');

  const analyzeResume = async (resumeData: any) => {
    try {
      const score = await execute('CALCULATE_ATS_SCORE', resumeData);
      console.log('ATS Score:', score);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <div>
      {loading && <p>Analyzing...</p>}
      {error && <p>Error: {error.message}</p>}
      {result && <p>Score: {result.score}/{result.maxScore}</p>}
    </div>
  );
}
*/
