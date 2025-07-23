import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Square, Circle, Triangle, AlignLeft, AlignCenter, AlignRight, AlignVerticalCenter, Minimize2, ArrowUp, ArrowDown } from 'lucide-react';

const SmartAlignment = () => {
  const [elements, setElements] = useState([
    { id: '1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, color: '#3B82F6' },
    { id: '2', type: 'circle', x: 300, y: 200, width: 100, height: 100, color: '#10B981' },
    { id: '3', type: 'rectangle', x: 250, y: 350, width: 120, height: 80, color: '#F59E0B' },
    { id: '4', type: 'triangle', x: 450, y: 150, width: 100, height: 100, color: '#EF4444' }
  ]);
  
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [alignmentGuides, setAlignmentGuides] = useState({ vertical: [], horizontal: [] });
  const [showGuides, setShowGuides] = useState(true);
  const [snapDistance] = useState(10);
  
  const canvasRef = useRef(null);

  // Calculate alignment guides for an element
  const calculateAlignmentPoints = (element) => {
    return {
      left: element.x,
      centerX: element.x + element.width / 2,
      right: element.x + element.width,
      top: element.y,
      centerY: element.y + element.height / 2,
      bottom: element.y + element.height
    };
  };

  // Find snap points from other elements
  const findSnapPoints = useCallback((movingElement, otherElements) => {
    const guides = { vertical: [], horizontal: [] };
    const movingPoints = calculateAlignmentPoints(movingElement);
    
    otherElements.forEach(element => {
      if (element.id === movingElement.id) return;
      
      const points = calculateAlignmentPoints(element);
      
      // Check vertical alignments
      Object.entries({ left: points.left, centerX: points.centerX, right: points.right }).forEach(([key, value]) => {
        Object.entries({ left: movingPoints.left, centerX: movingPoints.centerX, right: movingPoints.right }).forEach(([movingKey, movingValue]) => {
          if (Math.abs(value - movingValue) < snapDistance) {
            guides.vertical.push({
              position: value,
              from: Math.min(element.y, movingElement.y) - 20,
              to: Math.max(element.y + element.height, movingElement.y + movingElement.height) + 20,
              snap: value - movingValue,
              type: `${key}-${movingKey}`
            });
          }
        });
      });
      
      // Check horizontal alignments
      Object.entries({ top: points.top, centerY: points.centerY, bottom: points.bottom }).forEach(([key, value]) => {
        Object.entries({ top: movingPoints.top, centerY: movingPoints.centerY, bottom: movingPoints.bottom }).forEach(([movingKey, movingValue]) => {
          if (Math.abs(value - movingValue) < snapDistance) {
            guides.horizontal.push({
              position: value,
              from: Math.min(element.x, movingElement.x) - 20,
              to: Math.max(element.x + element.width, movingElement.x + movingElement.width) + 20,
              snap: value - movingValue,
              type: `${key}-${movingKey}`
            });
          }
        });
      });
    });
    
    return guides;
  }, [snapDistance]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggedElement) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - dragOffset.x;
    let newY = e.clientY - rect.top - dragOffset.y;
    
    // Create temporary element position
    const tempElement = {
      ...draggedElement,
      x: newX,
      y: newY
    };
    
    // Find snap guides
    if (showGuides) {
      const guides = findSnapPoints(tempElement, elements);
      setAlignmentGuides(guides);
      
      // Apply snapping
      if (guides.vertical.length > 0) {
        const snapX = guides.vertical[0].snap;
        newX += snapX;
      }
      if (guides.horizontal.length > 0) {
        const snapY = guides.horizontal[0].snap;
        newY += snapY;
      }
    }
    
    // Update element position
    setElements(prev => prev.map(el => 
      el.id === draggedElement.id ? { ...el, x: newX, y: newY } : el
    ));
  }, [isDragging, draggedElement, dragOffset, showGuides, findSnapPoints, elements]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDraggedElement(null);
    setAlignmentGuides({ vertical: [], horizontal: [] });
  }, []);

  // Add event listeners
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // Start dragging
  const handleElementMouseDown = (element, e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedElement(element);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    // Handle selection
    if (!e.ctrlKey && !e.metaKey && !selectedElements.has(element.id)) {
      setSelectedElements(new Set([element.id]));
    }
  };

  // Handle element selection
  const handleElementClick = (element, e) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      const newSelection = new Set(selectedElements);
      if (newSelection.has(element.id)) {
        newSelection.delete(element.id);
      } else {
        newSelection.add(element.id);
      }
      setSelectedElements(newSelection);
    } else if (!isDragging) {
      setSelectedElements(new Set([element.id]));
    }
  };

  // Canvas click to deselect
  const handleCanvasClick = () => {
    setSelectedElements(new Set());
  };

  // Alignment actions
  const alignElements = (alignment) => {
    if (selectedElements.size < 2) return;
    
    const selected = elements.filter(el => selectedElements.has(el.id));
    let updates = [];
    
    switch (alignment) {
      case 'left':
        const minX = Math.min(...selected.map(el => el.x));
        updates = selected.map(el => ({ ...el, x: minX }));
        break;
      case 'center-h':
        const avgX = selected.reduce((sum, el) => sum + el.x + el.width / 2, 0) / selected.length;
        updates = selected.map(el => ({ ...el, x: avgX - el.width / 2 }));
        break;
      case 'right':
        const maxRight = Math.max(...selected.map(el => el.x + el.width));
        updates = selected.map(el => ({ ...el, x: maxRight - el.width }));
        break;
      case 'top':
        const minY = Math.min(...selected.map(el => el.y));
        updates = selected.map(el => ({ ...el, y: minY }));
        break;
      case 'center-v':
        const avgY = selected.reduce((sum, el) => sum + el.y + el.height / 2, 0) / selected.length;
        updates = selected.map(el => ({ ...el, y: avgY - el.height / 2 }));
        break;
      case 'bottom':
        const maxBottom = Math.max(...selected.map(el => el.y + el.height));
        updates = selected.map(el => ({ ...el, y: maxBottom - el.height }));
        break;
    }
    
    setElements(prev => prev.map(el => {
      const update = updates.find(u => u.id === el.id);
      return update || el;
    }));
  };

  // Distribute elements
  const distributeElements = (direction) => {
    if (selectedElements.size < 3) return;
    
    const selected = elements
      .filter(el => selectedElements.has(el.id))
      .sort((a, b) => direction === 'horizontal' ? a.x - b.x : a.y - b.y);
    
    if (direction === 'horizontal') {
      const startX = selected[0].x;
      const endX = selected[selected.length - 1].x;
      const totalWidth = selected.reduce((sum, el) => sum + el.width, 0);
      const spacing = (endX - startX - totalWidth + selected[selected.length - 1].width) / (selected.length - 1);
      
      let currentX = startX;
      const updates = selected.map(el => {
        const update = { ...el, x: currentX };
        currentX += el.width + spacing;
        return update;
      });
      
      setElements(prev => prev.map(el => {
        const update = updates.find(u => u.id === el.id);
        return update || el;
      }));
    } else {
      const startY = selected[0].y;
      const endY = selected[selected.length - 1].y;
      const totalHeight = selected.reduce((sum, el) => sum + el.height, 0);
      const spacing = (endY - startY - totalHeight + selected[selected.length - 1].height) / (selected.length - 1);
      
      let currentY = startY;
      const updates = selected.map(el => {
        const update = { ...el, y: currentY };
        currentY += el.height + spacing;
        return update;
      });
      
      setElements(prev => prev.map(el => {
        const update = updates.find(u => u.id === el.id);
        return update || el;
      }));
    }
  };

  // Render element
  const renderElement = (element) => {
    const isSelected = selectedElements.has(element.id);
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height
        }}
        onMouseDown={(e) => handleElementMouseDown(element, e)}
        onClick={(e) => handleElementClick(element, e)}
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
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center gap-6">
            <div>
              <h2 className="text-xl font-bold">Smart Alignment Demo</h2>
              <p className="text-sm text-gray-600">Select multiple elements to use alignment tools</p>
            </div>
            
            {/* Alignment Tools */}
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-1 border-r pr-4">
                <span className="text-sm font-medium mr-2">Align:</span>
                <button
                  onClick={() => alignElements('left')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Left"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alignElements('center-h')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Center Horizontal"
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alignElements('right')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Right"
                >
                  <AlignRight className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-gray-300 mx-1" />
                <button
                  onClick={() => alignElements('top')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Top"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alignElements('center-v')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Center Vertical"
                >
                  <AlignVerticalCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => alignElements('bottom')}
                  disabled={selectedElements.size < 2}
                  className="p-2 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Align Bottom"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
              
              {/* Distribute Tools */}
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium mr-2">Distribute:</span>
                <button
                  onClick={() => distributeElements('horizontal')}
                  disabled={selectedElements.size < 3}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Distribute Horizontally"
                >
                  H
                </button>
                <button
                  onClick={() => distributeElements('vertical')}
                  disabled={selectedElements.size < 3}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Distribute Vertically"
                >
                  V
                </button>
              </div>
              
              {/* Toggle Guides */}
              <div className="flex items-center gap-2 border-l pl-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGuides}
                    onChange={(e) => setShowGuides(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Show Guides</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          onClick={handleCanvasClick}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 19px, rgba(0,0,0,0.03) 20px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 19px, rgba(0,0,0,0.03) 20px)
              `
            }}
          />
          
          {/* Alignment Guides */}
          {showGuides && (
            <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
              {/* Vertical guides */}
              {alignmentGuides.vertical.map((guide, index) => (
                <line
                  key={`v-${index}`}
                  x1={guide.position}
                  y1={guide.from}
                  x2={guide.position}
                  y2={guide.to}
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}
              
              {/* Horizontal guides */}
              {alignmentGuides.horizontal.map((guide, index) => (
                <line
                  key={`h-${index}`}
                  x1={guide.from}
                  y1={guide.position}
                  x2={guide.to}
                  y2={guide.position}
                  stroke="#3B82F6"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              ))}
            </svg>
          )}
          
          {/* Elements */}
          {elements.map(renderElement)}
        </div>
        
        {/* Status Bar */}
        <div className="bg-white border-t px-4 py-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>{selectedElements.size} element{selectedElements.size !== 1 ? 's' : ''} selected</span>
            <span>Tip: Hold Ctrl/Cmd to select multiple elements</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartAlignment;