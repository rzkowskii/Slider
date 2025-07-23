import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Square, Circle, Triangle, Zap, Activity, Eye, EyeOff } from 'lucide-react';

// Performance Monitoring Hook
const usePerformanceMonitor = () => {
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
    let animationId;
    
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
const useDebouncedUpdate = (callback, delay = 16) => {
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);
  
  // Update callback ref on each render
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};

// Throttled Update Hook
const useThrottledUpdate = (callback, delay = 16) => {
  const lastRunRef = useRef(0);
  const timeoutRef = useRef();
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  return useCallback((...args) => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRunRef.current;
    
    clearTimeout(timeoutRef.current);
    
    if (timeSinceLastRun >= delay) {
      lastRunRef.current = now;
      callbackRef.current(...args);
    } else {
      timeoutRef.current = setTimeout(() => {
        lastRunRef.current = Date.now();
        callbackRef.current(...args);
      }, delay - timeSinceLastRun);
    }
  }, [delay]);
};

// Canvas Cache System
class CanvasCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.hits = 0;
    this.misses = 0;
  }
  
  generateKey(element) {
    return `${element.type}-${element.id}-${element.x}-${element.y}-${element.width}-${element.height}-${element.color}`;
  }
  
  get(element) {
    const key = this.generateKey(element);
    const cached = this.cache.get(key);
    
    if (cached) {
      this.hits++;
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, cached);
      return cached;
    }
    
    this.misses++;
    return null;
  }
  
  set(element, canvas) {
    const key = this.generateKey(element);
    
    // Remove oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, canvas);
  }
  
  clear() {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }
  
  getStats() {
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses) * 100).toFixed(1) : 0
    };
  }
}

// Virtualized Canvas Component
const VirtualizedCanvas = ({ elements, viewport, renderElement, cache }) => {
  // Calculate visible elements based on viewport
  const visibleElements = useMemo(() => {
    const buffer = 50; // Render elements slightly outside viewport
    
    return elements.filter(element => {
      const elementRight = element.x + element.width;
      const elementBottom = element.y + element.height;
      
      return (
        elementRight >= viewport.x - buffer &&
        element.x <= viewport.x + viewport.width + buffer &&
        elementBottom >= viewport.y - buffer &&
        element.y <= viewport.y + viewport.height + buffer
      );
    });
  }, [elements, viewport]);
  
  return (
    <>
      {visibleElements.map(element => renderElement(element))}
    </>
  );
};

// Performance Optimized App
const PerformanceOptimizedApp = () => {
  // State
  const [elements, setElements] = useState(() => {
    // Generate many elements for testing
    const items = [];
    for (let i = 0; i < 200; i++) {
      items.push({
        id: `el-${i}`,
        type: ['rectangle', 'circle', 'triangle'][i % 3],
        x: (i % 10) * 150 + 50,
        y: Math.floor(i / 10) * 150 + 50,
        width: 100,
        height: 100,
        color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5]
      });
    }
    return items;
  });
  
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 800, height: 600 });
  const [enableVirtualization, setEnableVirtualization] = useState(true);
  const [enableCaching, setEnableCaching] = useState(true);
  const [enableDebouncing, setEnableDebouncing] = useState(true);
  
  // Refs
  const canvasRef = useRef(null);
  const [cache] = useState(() => new CanvasCache());
  
  // Performance monitoring
  const { metrics, setMetrics } = usePerformanceMonitor();
  
  // Update viewport on scroll/resize
  useEffect(() => {
    const updateViewport = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setViewport({
          x: canvasRef.current.scrollLeft,
          y: canvasRef.current.scrollTop,
          width: rect.width,
          height: rect.height
        });
      }
    };
    
    updateViewport();
    
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('scroll', updateViewport);
      window.addEventListener('resize', updateViewport);
      
      return () => {
        canvas.removeEventListener('scroll', updateViewport);
        window.removeEventListener('resize', updateViewport);
      };
    }
  }, []);
  
  // Update element position (with optional debouncing)
  const updateElementPosition = useCallback((id, x, y) => {
    const startTime = performance.now();
    
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, x, y } : el
    ));
    
    const renderTime = performance.now() - startTime;
    setMetrics(prev => ({ ...prev, renderTime }));
  }, [setMetrics]);
  
  const debouncedUpdate = useDebouncedUpdate(updateElementPosition, 16);
  const throttledUpdate = useThrottledUpdate(updateElementPosition, 16);
  
  const handleUpdatePosition = useCallback((id, x, y) => {
    if (enableDebouncing) {
      throttledUpdate(id, x, y);
    } else {
      updateElementPosition(id, x, y);
    }
  }, [enableDebouncing, throttledUpdate, updateElementPosition]);
  
  // Mouse handlers
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !selectedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + viewport.x - dragOffset.x;
    const y = e.clientY - rect.top + viewport.y - dragOffset.y;
    
    handleUpdatePosition(selectedElement, x, y);
  }, [isDragging, selectedElement, viewport, dragOffset, handleUpdatePosition]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  
  // Render element with caching
  const renderElement = useCallback((element) => {
    const isSelected = selectedElement === element.id;
    
    // Try to get from cache
    if (enableCaching && !isSelected && !isDragging) {
      const cached = cache.get(element);
      if (cached) {
        return (
          <div
            key={element.id}
            dangerouslySetInnerHTML={{ __html: cached }}
            className="absolute"
            style={{ left: element.x, top: element.y }}
            onClick={() => setSelectedElement(element.id)}
            onMouseDown={(e) => {
              setSelectedElement(element.id);
              setIsDragging(true);
              const rect = e.currentTarget.getBoundingClientRect();
              setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
              });
            }}
          />
        );
      }
    }
    
    // Render element
    const elementHtml = (
      <div
        key={element.id}
        className={`absolute cursor-move transition-shadow ${isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height
        }}
        onClick={() => setSelectedElement(element.id)}
        onMouseDown={(e) => {
          setSelectedElement(element.id);
          setIsDragging(true);
          const rect = e.currentTarget.getBoundingClientRect();
          setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }}
      >
        {element.type === 'rectangle' && (
          <div className="w-full h-full rounded" style={{ backgroundColor: element.color }} />
        )}
        {element.type === 'circle' && (
          <div className="w-full h-full rounded-full" style={{ backgroundColor: element.color }} />
        )}
        {element.type === 'triangle' && (
          <div
            className="w-0 h-0"
            style={{
              borderLeft: `${element.width/2}px solid transparent`,
              borderRight: `${element.width/2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.color}`
            }}
          />
        )}
        <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
          {element.id}
        </div>
      </div>
    );
    
    // Cache the rendered element (simplified - in real app would serialize properly)
    if (enableCaching && !isSelected) {
      // Note: This is simplified. In production, you'd properly serialize the element
      cache.set(element, '<div>cached</div>');
    }
    
    return elementHtml;
  }, [selectedElement, isDragging, enableCaching, cache]);
  
  // Update metrics
  useEffect(() => {
    const visibleCount = enableVirtualization ? 
      elements.filter(el => {
        const elementRight = el.x + el.width;
        const elementBottom = el.y + el.height;
        return (
          elementRight >= viewport.x &&
          el.x <= viewport.x + viewport.width &&
          elementBottom >= viewport.y &&
          el.y <= viewport.y + viewport.height
        );
      }).length : elements.length;
    
    const cacheStats = cache.getStats();
    
    setMetrics(prev => ({
      ...prev,
      visibleElements: visibleCount,
      totalElements: elements.length,
      cacheHits: cacheStats.hits,
      cacheMisses: cacheStats.misses
    }));
  }, [elements, viewport, enableVirtualization, cache, setMetrics]);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Control Panel */}
      <div className="w-80 bg-white shadow-lg p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Performance Optimizations
        </h2>
        
        {/* Performance Metrics */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Performance Metrics
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">FPS:</span>
              <span className={`font-mono ${metrics.fps >= 50 ? 'text-green-600' : metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                {metrics.fps}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Render Time:</span>
              <span className="font-mono">{metrics.renderTime.toFixed(2)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Visible Elements:</span>
              <span className="font-mono">{metrics.visibleElements} / {metrics.totalElements}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cache Hit Rate:</span>
              <span className="font-mono">{cache.getStats().hitRate}%</span>
            </div>
          </div>
        </div>
        
        {/* Optimization Controls */}
        <div className="space-y-4">
          <h3 className="font-semibold">Optimization Settings</h3>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              {enableVirtualization ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              Virtualized Rendering
            </span>
            <input
              type="checkbox"
              checked={enableVirtualization}
              onChange={(e) => setEnableVirtualization(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              Element Caching
            </span>
            <input
              type="checkbox"
              checked={enableCaching}
              onChange={(e) => {
                setEnableCaching(e.target.checked);
                if (!e.target.checked) cache.clear();
              }}
              className="w-4 h-4"
            />
          </label>
          
          <label className="flex items-center justify-between cursor-pointer">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Debounced Updates
            </span>
            <input
              type="checkbox"
              checked={enableDebouncing}
              onChange={(e) => setEnableDebouncing(e.target.checked)}
              className="w-4 h-4"
            />
          </label>
        </div>
        
        {/* Info */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm">
          <p className="text-blue-800 mb-2">
            <strong>Performance Tips:</strong>
          </p>
          <ul className="text-blue-700 space-y-1 text-xs">
            <li>• Virtualization only renders visible elements</li>
            <li>• Caching reuses rendered elements</li>
            <li>• Debouncing reduces update frequency</li>
            <li>• Try dragging elements with different settings</li>
          </ul>
        </div>
        
        {/* Actions */}
        <div className="mt-6 space-y-2">
          <button
            onClick={() => {
              // Add more elements
              const newElements = [];
              const startId = elements.length;
              for (let i = 0; i < 100; i++) {
                newElements.push({
                  id: `el-${startId + i}`,
                  type: ['rectangle', 'circle', 'triangle'][i % 3],
                  x: Math.random() * 1500,
                  y: Math.random() * 1500,
                  width: 100,
                  height: 100,
                  color: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][i % 5]
                });
              }
              setElements(prev => [...prev, ...newElements]);
            }}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add 100 More Elements
          </button>
          
          <button
            onClick={() => cache.clear()}
            className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Clear Cache
          </button>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 border-b">
          <h3 className="text-lg font-semibold">Canvas ({elements.length} elements)</h3>
          <p className="text-sm text-gray-600">Scroll to see virtualization in action</p>
        </div>
        
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-auto bg-gray-50"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          {/* Canvas content with fixed size for scrolling */}
          <div className="relative" style={{ width: 2000, height: 2000 }}>
            {enableVirtualization ? (
              <VirtualizedCanvas
                elements={elements}
                viewport={viewport}
                renderElement={renderElement}
                cache={cache}
              />
            ) : (
              elements.map(renderElement)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceOptimizedApp;