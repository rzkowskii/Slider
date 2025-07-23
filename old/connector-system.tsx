import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Circle, Square } from 'lucide-react';

// Connector system with anchor points and auto-routing
const ConnectorSystem = () => {
  const [elements, setElements] = useState([
    { id: '1', type: 'rectangle', x: 100, y: 100, width: 120, height: 80, label: 'Start' },
    { id: '2', type: 'circle', x: 300, y: 100, width: 100, height: 100, label: 'Process' },
    { id: '3', type: 'rectangle', x: 500, y: 100, width: 120, height: 80, label: 'End' }
  ]);
  
  const [connectors, setConnectors] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [tempConnector, setTempConnector] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredAnchor, setHoveredAnchor] = useState(null);
  
  const canvasRef = useRef(null);

  // Anchor point positions
  const getAnchorPoints = (element) => {
    const cx = element.x + element.width / 2;
    const cy = element.y + element.height / 2;
    
    return {
      top: { x: cx, y: element.y, id: 'top' },
      right: { x: element.x + element.width, y: cy, id: 'right' },
      bottom: { x: cx, y: element.y + element.height, id: 'bottom' },
      left: { x: element.x, y: cy, id: 'left' }
    };
  };

  // Get closest anchor point to a position
  const getClosestAnchor = (element, x, y) => {
    const anchors = getAnchorPoints(element);
    let closest = null;
    let minDistance = Infinity;
    
    Object.values(anchors).forEach(anchor => {
      const distance = Math.sqrt((anchor.x - x) ** 2 + (anchor.y - y) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closest = anchor;
      }
    });
    
    return closest;
  };

  // Auto-route connector around obstacles
  const autoRouteConnector = (start, end) => {
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const points = [start];
    
    // Simple L-shaped routing
    if (Math.abs(dx) > Math.abs(dy)) {
      // Horizontal first
      points.push({ x: start.x + dx / 2, y: start.y });
      points.push({ x: start.x + dx / 2, y: end.y });
    } else {
      // Vertical first
      points.push({ x: start.x, y: start.y + dy / 2 });
      points.push({ x: end.x, y: start.y + dy / 2 });
    }
    
    points.push(end);
    return points;
  };

  // Create SVG path from points
  const createPath = (points) => {
    if (points.length < 2) return '';
    
    let path = `M ${points[0].x} ${points[0].y}`;
    
    // Create smooth curves through points
    for (let i = 1; i < points.length; i++) {
      if (i === 1 && points.length === 2) {
        // Direct line for 2 points
        path += ` L ${points[i].x} ${points[i].y}`;
      } else if (i === 1) {
        // First curve
        path += ` Q ${points[i].x} ${points[i].y}`;
      } else if (i === points.length - 1) {
        // Last point
        path += ` ${points[i].x} ${points[i].y}`;
      } else {
        // Middle points
        path += ` T ${points[i].x} ${points[i].y}`;
      }
    }
    
    return path;
  };

  // Handle mouse move for dragging and connecting
  const handleMouseMove = useCallback((e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging && selectedElement) {
      const newX = x - dragOffset.x;
      const newY = y - dragOffset.y;
      
      setElements(prev => prev.map(el => 
        el.id === selectedElement ? { ...el, x: newX, y: newY } : el
      ));
      
      // Update connectors
      setConnectors(prev => prev.map(conn => {
        const newConn = { ...conn };
        if (conn.from.elementId === selectedElement) {
          const element = elements.find(el => el.id === selectedElement);
          if (element) {
            const updatedElement = { ...element, x: newX, y: newY };
            const anchor = getAnchorPoints(updatedElement)[conn.from.anchorId];
            newConn.from = { ...conn.from, ...anchor };
          }
        }
        if (conn.to.elementId === selectedElement) {
          const element = elements.find(el => el.id === selectedElement);
          if (element) {
            const updatedElement = { ...element, x: newX, y: newY };
            const anchor = getAnchorPoints(updatedElement)[conn.to.anchorId];
            newConn.to = { ...conn.to, ...anchor };
          }
        }
        newConn.points = autoRouteConnector(newConn.from, newConn.to);
        return newConn;
      }));
    }
    
    if (isConnecting && connectingFrom) {
      setTempConnector({
        from: connectingFrom,
        to: { x, y },
        points: [connectingFrom, { x, y }]
      });
    }
  }, [isDragging, selectedElement, dragOffset, isConnecting, connectingFrom, elements]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
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

  // Start connecting from an anchor
  const startConnection = (element, anchorId, e) => {
    e.stopPropagation();
    const anchor = getAnchorPoints(element)[anchorId];
    setIsConnecting(true);
    setConnectingFrom({ ...anchor, elementId: element.id, anchorId });
  };

  // Complete connection to an anchor
  const completeConnection = (element, anchorId, e) => {
    e.stopPropagation();
    if (isConnecting && connectingFrom && connectingFrom.elementId !== element.id) {
      const anchor = getAnchorPoints(element)[anchorId];
      const to = { ...anchor, elementId: element.id, anchorId };
      const points = autoRouteConnector(connectingFrom, to);
      
      setConnectors(prev => [...prev, {
        id: `conn-${Date.now()}`,
        from: connectingFrom,
        to,
        points,
        style: 'solid',
        arrow: 'arrow'
      }]);
      
      setIsConnecting(false);
      setConnectingFrom(null);
      setTempConnector(null);
    }
  };

  // Handle element selection and dragging
  const handleElementMouseDown = (element, e) => {
    if (!isConnecting) {
      setSelectedElement(element.id);
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  // Cancel connection on canvas click
  const handleCanvasClick = () => {
    if (isConnecting) {
      setIsConnecting(false);
      setConnectingFrom(null);
      setTempConnector(null);
    }
    setSelectedElement(null);
  };

  // Render arrow marker
  const renderArrowMarker = (id) => (
    <defs>
      <marker
        id={id}
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth="8"
        markerHeight="8"
        orient="auto"
        fill="#3B82F6"
      >
        <path d="M 0 0 L 10 5 L 0 10 z" />
      </marker>
    </defs>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4">
          <h2 className="text-xl font-bold">Connector System Demo</h2>
          <p className="text-sm text-gray-600 mt-1">
            Hover over shapes to see anchor points. Click and drag from an anchor to connect shapes.
          </p>
        </div>
        
        <div 
          ref={canvasRef}
          className="flex-1 relative overflow-hidden bg-gray-50"
          onClick={handleCanvasClick}
        >
          {/* SVG layer for connectors */}
          <svg className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
            {renderArrowMarker('arrow')}
            
            {/* Render connectors */}
            {connectors.map(conn => (
              <g key={conn.id}>
                <path
                  d={createPath(conn.points)}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2"
                  markerEnd={conn.arrow === 'arrow' ? 'url(#arrow)' : ''}
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : ''}
                />
              </g>
            ))}
            
            {/* Temp connector while connecting */}
            {tempConnector && (
              <path
                d={createPath(tempConnector.points)}
                fill="none"
                stroke="#94A3B8"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>
          
          {/* Elements layer */}
          {elements.map(element => {
            const isSelected = selectedElement === element.id;
            const anchors = getAnchorPoints(element);
            
            return (
              <div
                key={element.id}
                className={`absolute ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                style={{
                  left: element.x,
                  top: element.y,
                  width: element.width,
                  height: element.height,
                  zIndex: 2
                }}
              >
                {/* Element shape */}
                <div
                  className={`
                    w-full h-full bg-white border-2 border-gray-300 
                    flex items-center justify-center cursor-move
                    hover:border-gray-400 transition-colors
                    ${element.type === 'circle' ? 'rounded-full' : 'rounded'}
                  `}
                  onMouseDown={(e) => handleElementMouseDown(element, e)}
                >
                  <span className="text-sm font-medium select-none">{element.label}</span>
                </div>
                
                {/* Anchor points */}
                {Object.entries(anchors).map(([key, anchor]) => (
                  <div
                    key={key}
                    className={`
                      absolute w-3 h-3 bg-blue-500 rounded-full cursor-crosshair
                      transform -translate-x-1/2 -translate-y-1/2
                      opacity-0 hover:opacity-100 transition-opacity
                      ${hoveredAnchor === `${element.id}-${key}` ? 'opacity-100' : ''}
                    `}
                    style={{
                      left: anchor.x - element.x,
                      top: anchor.y - element.y,
                      zIndex: 3
                    }}
                    onMouseEnter={() => setHoveredAnchor(`${element.id}-${key}`)}
                    onMouseLeave={() => setHoveredAnchor(null)}
                    onMouseDown={(e) => startConnection(element, key, e)}
                    onMouseUp={(e) => completeConnection(element, key, e)}
                  />
                ))}
                
                {/* Show all anchors on hover */}
                <style jsx>{`
                  div:hover > div[class*="opacity-0"] {
                    opacity: 1;
                  }
                `}</style>
              </div>
            );
          })}
        </div>
        
        <div className="bg-white border-t p-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Anchor Points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 border-t-2 border-blue-500"></div>
              <span>Connectors</span>
            </div>
            <div className="ml-auto text-gray-600">
              {isConnecting ? 'Click another shape to connect' : 'Drag shapes or click anchors to connect'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectorSystem;