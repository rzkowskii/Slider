import { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// Performance Monitoring Hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    fps: 0,
    renderTime: 0,
    visibleElements: 0,
    totalElements: 0,
    cacheHits: 0,
    cacheMisses: 0
  });
  
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  
  useEffect(() => {
    let animationId: number;
    
    const measureFPS = () => {
      frameCountRef.current++;
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTimeRef.current;
      
      if (deltaTime >= 1000) {
        const fps = Math.round((frameCountRef.current * 1000) / deltaTime);
        setMetrics(prev => ({ ...prev, fps }));
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };
    
    measureFPS();
    
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return { metrics, setMetrics };
};

// Debounced Update Hook
export const useDebouncedUpdate = (
  callback: (...args: any[]) => any, 
  delay = 16
) => {
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: any[]) => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Throttled Update Hook
export const useThrottledUpdate = (
  callback: (...args: any[]) => any, 
  delay = 16
) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef<number | undefined>(undefined);
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args: any[]) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;
    
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
    }
    
    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now;
      callbackRef.current(...args);
    } else {
      timeoutRef.current = window.setTimeout(() => {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - timeSinceLastRun);
    }
  }, [delay]);
};

// Viewport Hook for Virtualization
export const useViewport = (containerRef: React.RefObject<HTMLElement>) => {
  const [viewport, setViewport] = useState({ 
    x: 0, 
    y: 0, 
    width: 800, 
    height: 600 
  });
  
  useEffect(() => {
    const updateViewport = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewport({
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop,
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateViewport();
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateViewport);
      window.addEventListener('resize', updateViewport);
      
      return () => {
        container.removeEventListener('scroll', updateViewport);
        window.removeEventListener('resize', updateViewport);
      };
    }
  }, [containerRef]);
  
  return viewport;
};

// Virtualization Hook
export const useVirtualization = <T extends { x: number; y: number; width: number; height: number }>(
  items: T[],
  viewport: { x: number; y: number; width: number; height: number },
  buffer = 50
) => {
  return useMemo(() => {
    return items.filter(item => {
      const itemRight = item.x + item.width;
      const itemBottom = item.y + item.height;
      
      return (
        itemRight >= viewport.x - buffer &&
        item.x <= viewport.x + viewport.width + buffer &&
        itemBottom >= viewport.y - buffer &&
        item.y <= viewport.y + viewport.height + buffer
      );
    });
  }, [items, viewport, buffer]);
};

// Memory optimization hook
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);
  
  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);
  
  const clearAll = useCallback(() => {
    cleanupFunctions.current.forEach(cleanup => cleanup());
    cleanupFunctions.current = [];
  }, []);
  
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);
  
  return { addCleanup, clearAll };
};
