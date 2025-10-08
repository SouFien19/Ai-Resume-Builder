import { useEffect, useCallback } from 'react';

interface UseLocalStorageBackupOptions<T> {
  key: string;
  data: T;
  enabled?: boolean;
  debounceMs?: number;
}

export function useLocalStorageBackup<T>({ 
  key, 
  data, 
  enabled = true, 
  debounceMs = 1000 
}: UseLocalStorageBackupOptions<T>) {
  // Save to localStorage with debouncing
  useEffect(() => {
    if (!enabled) return;

    const timeoutId = setTimeout(() => {
      try {
        const serialized = JSON.stringify(data);
        localStorage.setItem(key, serialized);
        localStorage.setItem(`${key}-timestamp`, Date.now().toString());
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [data, key, enabled, debounceMs]);

  // Load from localStorage
  const loadBackup = useCallback((): { data: T | null; timestamp: number | null } => {
    try {
      const serialized = localStorage.getItem(key);
      const timestamp = localStorage.getItem(`${key}-timestamp`);
      
      // Check if serialized data exists and is valid JSON (not "undefined" string)
      if (serialized && serialized !== 'undefined' && serialized !== 'null') {
        return {
          data: JSON.parse(serialized) as T,
          timestamp: timestamp ? parseInt(timestamp, 10) : null,
        };
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      // Clear corrupted data
      try {
        localStorage.removeItem(key);
        localStorage.removeItem(`${key}-timestamp`);
      } catch (clearError) {
        console.error('Failed to clear corrupted localStorage:', clearError);
      }
    }
    
    return { data: null, timestamp: null };
  }, [key]);

  // Clear backup
  const clearBackup = useCallback(() => {
    try {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}-timestamp`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  }, [key]);

  // Check if backup exists
  const hasBackup = useCallback((): boolean => {
    try {
      const serialized = localStorage.getItem(key);
      return serialized !== null && serialized !== 'undefined' && serialized !== 'null';
    } catch {
      return false;
    }
  }, [key]);

  return {
    loadBackup,
    clearBackup,
    hasBackup,
  };
}

// Format timestamp for display
export function formatBackupTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'just now';
}
