import { useState, useCallback, useRef } from 'react';

export interface HistoryState<T> {
  state: T;
  timestamp: number;
  action: string;
}

export const useUndoRedo = <T>(initialState: T, maxHistorySize = 50) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const history = useRef<HistoryState<T>[]>([
    { state: initialState, timestamp: Date.now(), action: 'Initial state' }
  ]);

  const pushState = useCallback((newState: T, action: string) => {
    // Remove any history after current index (when undoing then making new changes)
    history.current = history.current.slice(0, currentIndex + 1);
    
    // Add new state
    history.current.push({
      state: JSON.parse(JSON.stringify(newState)), // Deep clone
      timestamp: Date.now(),
      action
    });
    
    // Limit history size
    if (history.current.length > maxHistorySize) {
      history.current = history.current.slice(-maxHistorySize);
      setCurrentIndex(maxHistorySize - 1);
    } else {
      setCurrentIndex(history.current.length - 1);
    }
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      return history.current[currentIndex - 1];
    }
    return null;
  }, [currentIndex]);

  const redo = useCallback(() => {
    if (currentIndex < history.current.length - 1) {
      setCurrentIndex(currentIndex + 1);
      return history.current[currentIndex + 1];
    }
    return null;
  }, [currentIndex]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.current.length - 1;

  const getCurrentState = useCallback(() => {
    return history.current[currentIndex];
  }, [currentIndex]);

  const getHistoryInfo = useCallback(() => {
    return {
      currentIndex,
      totalStates: history.current.length,
      canUndo,
      canRedo,
      currentAction: history.current[currentIndex]?.action,
      previousAction: currentIndex > 0 ? history.current[currentIndex - 1]?.action : null,
      nextAction: currentIndex < history.current.length - 1 ? history.current[currentIndex + 1]?.action : null
    };
  }, [currentIndex, canUndo, canRedo]);

  return {
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
    getCurrentState,
    getHistoryInfo
  };
};
