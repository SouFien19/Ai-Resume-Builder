import { useState, useCallback, useRef } from 'react';

interface UseUndoRedoOptions<T> {
  initialState: T;
  maxHistory?: number;
}

export function useUndoRedo<T>({ initialState, maxHistory = 50 }: UseUndoRedoOptions<T>) {
  const [history, setHistory] = useState<T[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  const currentState = history[currentIndex];

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const setState = useCallback((newState: T | ((prev: T) => T)) => {
    // Prevent adding to history during undo/redo operations
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory((prev) => {
      const state = typeof newState === 'function' 
        ? (newState as (prev: T) => T)(prev[currentIndex]) 
        : newState;

      // Remove any "future" history when making a new change
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);

      // Limit history size
      if (newHistory.length > maxHistory) {
        newHistory.shift();
        setCurrentIndex((idx) => idx);
        return newHistory;
      }

      setCurrentIndex(newHistory.length - 1);
      return newHistory;
    });
  }, [currentIndex, maxHistory]);

  const undo = useCallback(() => {
    if (canUndo) {
      isUndoRedoAction.current = true;
      setCurrentIndex((idx) => idx - 1);
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      isUndoRedoAction.current = true;
      setCurrentIndex((idx) => idx + 1);
    }
  }, [canRedo]);

  const reset = useCallback((newState: T) => {
    setHistory([newState]);
    setCurrentIndex(0);
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([currentState]);
    setCurrentIndex(0);
  }, [currentState]);

  return {
    state: currentState,
    setState,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearHistory,
    historyLength: history.length,
    currentIndex,
  };
}
