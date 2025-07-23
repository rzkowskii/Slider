/**
 * MARCUS-GRADE AUTO-SAVE SYSTEM
 * 
 * Never lose work again. Auto-saves every 30 seconds with visual confirmation.
 * Handles network failures, storage limits, and corruption gracefully.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { BulletproofStorage } from '@/utils/safeStorage';

export type AutoSaveStatus = 
  | 'idle'
  | 'saving'
  | 'saved'
  | 'error'
  | 'paused'
  | 'storage_full';

interface AutoSaveState {
  status: AutoSaveStatus;
  lastSaveTime?: Date;
  lastSaveError?: string;
  saveCount: number;
  bytesUsed: number;
  storageAvailable: boolean;
}

interface UseAutoSaveOptions {
  intervalMs?: number;
  maxRetries?: number;
  pauseOnError?: boolean;
  showNotifications?: boolean;
}

export const useAutoSave = <T>(
  data: T,
  options: UseAutoSaveOptions = {}
) => {
  const {
    intervalMs = 30000, // 30 seconds
    maxRetries = 3,
    pauseOnError = false,
    showNotifications = true
  } = options;

  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>({
    status: 'idle',
    saveCount: 0,
    bytesUsed: 0,
    storageAvailable: true
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastDataRef = useRef<string>('');
  const saveInProgressRef = useRef(false);
  const pausedRef = useRef(false);

  // Update storage info
  const updateStorageInfo = useCallback(() => {
    const storageInfo = BulletproofStorage.getStorageInfo();
    setAutoSaveState(prev => ({
      ...prev,
      bytesUsed: storageInfo.used,
      storageAvailable: storageInfo.available > 100000 // At least 100KB available
    }));
  }, []);

  // Perform auto-save
  const performAutoSave = useCallback(async () => {
    if (saveInProgressRef.current || pausedRef.current) {
      return;
    }

    try {
      // Check if data has actually changed
      const currentDataString = JSON.stringify(data);
      if (currentDataString === lastDataRef.current) {
        return; // No changes to save
      }

      // Check storage availability
      updateStorageInfo();
      if (!autoSaveState.storageAvailable) {
        setAutoSaveState(prev => ({
          ...prev,
          status: 'storage_full',
          lastSaveError: 'Storage full - cannot auto-save'
        }));
        return;
      }

      saveInProgressRef.current = true;
      setAutoSaveState(prev => ({ ...prev, status: 'saving' }));

      // Perform the save
      const result = await BulletproofStorage.autoSave(data);

      if (result) {
        // Success
        lastDataRef.current = currentDataString;
        retryCountRef.current = 0; // Reset retry count on success
        
        setAutoSaveState(prev => ({
          ...prev,
          status: 'saved',
          lastSaveTime: new Date(),
          lastSaveError: undefined,
          saveCount: prev.saveCount + 1
        }));

        // Show brief "saved" status, then return to idle
        setTimeout(() => {
          setAutoSaveState(prev => 
            prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
          );
        }, 2000);

        if (showNotifications) {
          console.log('📁 Auto-save successful');
        }
      } else {
        throw new Error('Auto-save failed - storage operation unsuccessful');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown auto-save error';
      console.error('Auto-save failed:', errorMessage);

      retryCountRef.current++;
      
      if (retryCountRef.current >= maxRetries) {
        // Max retries reached
        setAutoSaveState(prev => ({
          ...prev,
          status: pauseOnError ? 'paused' : 'error',
          lastSaveError: `Auto-save failed after ${maxRetries} attempts: ${errorMessage}`
        }));

        if (pauseOnError) {
          pausedRef.current = true;
        }
      } else {
        // Retry in a shorter interval
        setAutoSaveState(prev => ({
          ...prev,
          status: 'error',
          lastSaveError: `Auto-save failed (attempt ${retryCountRef.current}/${maxRetries}): ${errorMessage}`
        }));

        // Retry in 5 seconds
        setTimeout(() => {
          if (!pausedRef.current) {
            performAutoSave();
          }
        }, 5000);
      }
    } finally {
      saveInProgressRef.current = false;
    }
  }, [data, maxRetries, pauseOnError, showNotifications, autoSaveState.storageAvailable, updateStorageInfo]);

  // Start auto-save
  const startAutoSave = useCallback(() => {
    pausedRef.current = false;
    retryCountRef.current = 0;
    
    setAutoSaveState(prev => ({
      ...prev,
      status: 'idle',
      lastSaveError: undefined
    }));

    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set up new interval
    intervalRef.current = setInterval(performAutoSave, intervalMs);
    
    // Initial save check
    performAutoSave();
  }, [performAutoSave, intervalMs]);

  // Stop auto-save
  const stopAutoSave = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    setAutoSaveState(prev => ({ ...prev, status: 'idle' }));
  }, []);

  // Pause auto-save
  const pauseAutoSave = useCallback(() => {
    pausedRef.current = true;
    setAutoSaveState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  // Resume auto-save
  const resumeAutoSave = useCallback(() => {
    pausedRef.current = false;
    retryCountRef.current = 0;
    setAutoSaveState(prev => ({
      ...prev,
      status: 'idle',
      lastSaveError: undefined
    }));
    performAutoSave(); // Immediate save on resume
  }, [performAutoSave]);

  // Force save now
  const saveNow = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      if (saveInProgressRef.current) {
        return { success: false, error: 'Save already in progress' };
      }

      const result = await BulletproofStorage.autoSave(data);
      
      if (result) {
        const currentDataString = JSON.stringify(data);
        lastDataRef.current = currentDataString;
        
        setAutoSaveState(prev => ({
          ...prev,
          status: 'saved',
          lastSaveTime: new Date(),
          lastSaveError: undefined,
          saveCount: prev.saveCount + 1
        }));

        setTimeout(() => {
          setAutoSaveState(prev => 
            prev.status === 'saved' ? { ...prev, status: 'idle' } : prev
          );
        }, 2000);

        return { success: true };
      } else {
        throw new Error('Manual save failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown save error';
      setAutoSaveState(prev => ({
        ...prev,
        status: 'error',
        lastSaveError: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, [data]);

  // Check for existing auto-save on mount
  useEffect(() => {
    const checkExistingAutoSave = () => {
      const autoSaveStatus = BulletproofStorage.getAutoSaveStatus();
      if (autoSaveStatus.hasAutoSave && autoSaveStatus.age !== undefined) {
        const ageInMinutes = autoSaveStatus.age / (1000 * 60);
        if (ageInMinutes < 60) { // Less than 1 hour old
          console.log(`Found recent auto-save from ${Math.round(ageInMinutes)} minutes ago`);
        }
      }
    };

    checkExistingAutoSave();
    updateStorageInfo();
  }, [updateStorageInfo]);

  // Auto-start on mount, cleanup on unmount
  useEffect(() => {
    startAutoSave();

    return () => {
      stopAutoSave();
    };
  }, [startAutoSave, stopAutoSave]);

  // Handle visibility changes (pause when tab is hidden)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden, perform one final save
        if (!pausedRef.current && !saveInProgressRef.current) {
          performAutoSave();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performAutoSave]);

  // Handle beforeunload (save before page closes)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Perform synchronous save if possible
      try {
        const currentDataString = JSON.stringify(data);
        if (currentDataString !== lastDataRef.current) {
          // Data has changed, try to save
          BulletproofStorage.autoSave(data);
          
          // Show warning to user
          e.preventDefault();
          e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          return e.returnValue;
        }
      } catch (error) {
        console.error('Error during beforeunload save:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [data]);

  // Provide recovery function for loading auto-saved data
  const loadAutoSave = useCallback(async (): Promise<{
    success: boolean;
    data?: T;
    error?: string;
  }> => {
    try {
      const result = await BulletproofStorage.loadPresentation();
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load auto-save'
      };
    }
  }, []);

  return {
    autoSaveState,
    startAutoSave,
    stopAutoSave,
    pauseAutoSave,
    resumeAutoSave,
    saveNow,
    loadAutoSave,
    updateStorageInfo
  };
};

// Helper function to get status display info
export const getAutoSaveStatusDisplay = (
  status: AutoSaveStatus,
  lastSaveTime?: Date
) => {
  switch (status) {
    case 'saving':
      return {
        text: 'Saving...',
        className: 'text-blue-600',
        icon: '💾'
      };
    case 'saved':
      return {
        text: 'Saved',
        className: 'text-green-600',
        icon: '✅'
      };
    case 'error':
      return {
        text: 'Save Error',
        className: 'text-red-600',
        icon: '❌'
      };
    case 'paused':
      return {
        text: 'Auto-save Paused',
        className: 'text-yellow-600',
        icon: '⏸️'
      };
    case 'storage_full':
      return {
        text: 'Storage Full',
        className: 'text-red-600',
        icon: '💾'
      };
    default:
      return {
        text: lastSaveTime ? 'Auto-saved' : 'Ready',
        className: 'text-gray-600',
        icon: '💾'
      };
  }
};

// Helper function to format time ago
export const formatTimeAgo = (lastSaveTime?: Date): string | null => {
  if (!lastSaveTime) return null;
  
  const timeAgo = Math.round((Date.now() - lastSaveTime.getTime()) / 1000);
  
  if (timeAgo < 60) {
    return `${timeAgo}s ago`;
  } else if (timeAgo < 3600) {
    return `${Math.round(timeAgo / 60)}m ago`;
  } else {
    return `${Math.round(timeAgo / 3600)}h ago`;
  }
};
