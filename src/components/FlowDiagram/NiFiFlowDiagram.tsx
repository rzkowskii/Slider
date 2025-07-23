import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronRight, Square, Circle, Diamond, Hexagon, Download, MousePointer, Trash2, Copy, AlignHorizontalDistributeCenter, AlignVerticalDistributeCenter } from 'lucide-react';

// Types
interface Point {
  x: number;
  y: number;
}

interface ConnectionPoint {
  id: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  offset: number;
}

interface FlowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'data' | 'connector' | 'end';
  position: Point;
  size: { width: number; height: number };
  label: string;
  style: NodeStyle;
  connectionPoints: ConnectionPoint[];
}

interface Connection {
  id: string;
  from: { nodeId: string; pointId: string };
  to: { nodeId: string; pointId: string };
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

interface NodeStyle {
  fill: string;
  stroke: string;
  strokeWidth: number;
  shadow: string;
}

// Props interface for integration with slide system
interface NiFiFlowDiagramProps {
  width?: number;
  height?: number;
  initialNodes?: FlowNode[];
  initialConnections?: Connection[];
  onChange?: (nodes: FlowNode[], connections: Connection[]) => void;
  readonly?: boolean;
  scale?: number;
}

// Node style configurations
const nodeStyles: Record<string, NodeStyle> = {
  start: {
    fill: '#e8f5e9',
    stroke: '#4caf50',
    strokeWidth: 2,
    shadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  process: {
    fill: '#f3f4f6',
    stroke: '#6b7280',
    strokeWidth: 1.5,
    shadow: '0 2px 4px rgba(0,0,0,0.08)'
  },
  decision: {
    fill: '#fff3cd',
    stroke: '#ffc107',
    strokeWidth: 2,
    shadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  data: {
    fill: '#e3f2fd',
    stroke: '#2196f3',
    strokeWidth: 1.5,
    shadow: '0 2px 4px rgba(0,0,0,0.08)'
  },
  connector: {
    fill: '#f5f5f5',
    stroke: '#9e9e9e',
    strokeWidth: 1.5,
    shadow: '0 2px 4px rgba(0,0,0,0.08)'
  },
  end: {
    fill: '#ffebee',
    stroke: '#f44336',
    strokeWidth: 2,
    shadow: '0 2px 4px rgba(0,0,0,0.1)'
  }
};

// Node templates
const nodeTemplates = {
  start: { width: 80, height: 40, label: 'Start' },
  process: { width: 100, height: 50, label: 'Process' },
  decision: { width: 80, height: 80, label: 'Decision' },
  data: { width: 90, height: 60, label: 'Data' },
  connector: { width: 40, height: 40, label: '' },
  end: { width: 80, height: 40, label: 'End' }
};

export default function NiFiFlowDiagram({
  width = 800,
  height = 600,
  initialNodes = [],
  initialConnections = [],
  onChange,
  readonly = false,
  scale = 1
}: NiFiFlowDiagramProps) {
  const canvasRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);
  const [connections, setConnections] = useState<Connection[]>(initialConnections);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'connect'>('select');
  const [dragState, setDragState] = useState<{
    nodeId: string | null;
    offset: Point;
    isConnecting: boolean;
    fromPoint?: { nodeId: string; pointId: string };
    currentPos?: Point;
  }>({ nodeId: null, offset: { x: 0, y: 0 }, isConnecting: false });
  const [showGrid, setShowGrid] = useState(true);

  // Notify parent of changes
  useEffect(() => {
    if (onChange) {
      onChange(nodes, connections);
    }
  }, [nodes, connections, onChange]);

  // Generate connection points for a node
  const generateConnectionPoints = (type: string): ConnectionPoint[] => {
    const points: ConnectionPoint[] = [];
    if (type === 'connector') {
      // Circular connector has points all around
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        points.push({ id: `${side}-center`, side: side as any, offset: 0.5 });
      });
    } else {
      // Regular nodes have points on all sides
      ['top', 'bottom'].forEach(side => {
        points.push({ id: `${side}-center`, side: side as any, offset: 0.5 });
      });
      ['left', 'right'].forEach(side => {
        points.push({ id: `${side}-center`, side: side as any, offset: 0.5 });
      });
    }
    return points;
  };

  // Add a new node
  const addNode = (type: keyof typeof nodeTemplates, position: Point) => {
    if (readonly) return;
    
    const template = nodeTemplates[type];
    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      position,
      size: { width: template.width * scale, height: template.height * scale },
      label: template.label,
      style: nodeStyles[type],
      connectionPoints: generateConnectionPoints(type)
    };
    setNodes(prev => [...prev, newNode]);
  };

  // Get absolute position of a connection point
  const getConnectionPointPosition = (node: FlowNode, pointId: string): Point => {
    const point = node.connectionPoints.find(p => p.id === pointId);
    if (!point) return node.position;

    const { side, offset } = point;
    const { x, y } = node.position;
    const { width, height } = node.size;

    switch (side) {
      case 'top':
        return { x: x + width * offset, y };
      case 'right':
        return { x: x + width, y: y + height * offset };
      case 'bottom':
        return { x: x + width * offset, y: y + height };
      case 'left':
        return { x, y: y + height * offset };
    }
  };

  // Generate bezier curve path between two points
  const generateBezierPath = (from: Point, to: Point, fromSide: string, toSide: string): string => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    
    let cp1 = { ...from };
    let cp2 = { ...to };
    
    const offset = Math.min(50 * scale, Math.abs(dx) / 2, Math.abs(dy) / 2);
    
    // Calculate control points based on connection sides
    switch (fromSide) {
      case 'top':
        cp1.y -= offset;
        break;
      case 'right':
        cp1.x += offset;
        break;
      case 'bottom':
        cp1.y += offset;
        break;
      case 'left':
        cp1.x -= offset;
        break;
    }
    
    switch (toSide) {
      case 'top':
        cp2.y -= offset;
        break;
      case 'right':
        cp2.x += offset;
        break;
      case 'bottom':
        cp2.y += offset;
        break;
      case 'left':
        cp2.x -= offset;
        break;
    }
    
    return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
  };

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readonly) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (tool === 'select') {
      // Check if clicking on a node
      const clickedNode = nodes.find(node => 
        x >= node.position.x && 
        x <= node.position.x + node.size.width &&
        y >= node.position.y && 
        y <= node.position.y + node.size.height
      );
      
      if (clickedNode) {
        if (!e.shiftKey) {
          setSelectedNodes(new Set([clickedNode.id]));
        } else {
          setSelectedNodes(prev => {
            const newSet = new Set(prev);
            if (newSet.has(clickedNode.id)) {
              newSet.delete(clickedNode.id);
            } else {
              newSet.add(clickedNode.id);
            }
            return newSet;
          });
        }
        
        setDragState({
          nodeId: clickedNode.id,
          offset: {
            x: x - clickedNode.position.x,
            y: y - clickedNode.position.y
          },
          isConnecting: false
        });
      } else {
        setSelectedNodes(new Set());
        setSelectedConnection(null);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (readonly) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    if (dragState.nodeId && !dragState.isConnecting) {
      // Dragging node
      const gridSize = showGrid ? 10 * scale : 1;
      const snappedX = Math.round(x / gridSize) * gridSize;
      const snappedY = Math.round(y / gridSize) * gridSize;
      
      setNodes(prev => prev.map(node => {
        if (selectedNodes.has(node.id)) {
          const offsetX = snappedX - dragState.offset.x - (nodes.find(n => n.id === dragState.nodeId)?.position.x || 0);
          const offsetY = snappedY - dragState.offset.y - (nodes.find(n => n.id === dragState.nodeId)?.position.y || 0);
          return {
            ...node,
            position: {
              x: Math.max(0, Math.min(width - node.size.width, node.position.x + offsetX)),
              y: Math.max(0, Math.min(height - node.size.height, node.position.y + offsetY))
            }
          };
        }
        return node;
      }));
    } else if (dragState.isConnecting && dragState.fromPoint) {
      // Update current position for connection preview
      setDragState(prev => ({ ...prev, currentPos: { x, y } }));
    }
  };

  const handleMouseUp = () => {
    setDragState({ nodeId: null, offset: { x: 0, y: 0 }, isConnecting: false });
  };

  // Connection point handlers
  const handleConnectionPointClick = (nodeId: string, pointId: string, e: React.MouseEvent) => {
    if (readonly) return;
    
    e.stopPropagation();
    
    if (tool === 'connect') {
      if (!dragState.isConnecting) {
        // Start connection
        setDragState({
          nodeId: null,
          offset: { x: 0, y: 0 },
          isConnecting: true,
          fromPoint: { nodeId, pointId }
        });
      } else if (dragState.fromPoint && dragState.fromPoint.nodeId !== nodeId) {
        // Complete connection
        const newConnection: Connection = {
          id: `conn-${Date.now()}`,
          from: dragState.fromPoint,
          to: { nodeId, pointId },
          style: 'solid',
          color: '#6b7280'
        };
        setConnections(prev => [...prev, newConnection]);
        setDragState({ nodeId: null, offset: { x: 0, y: 0 }, isConnecting: false });
      }
    }
  };

  // Delete selected items
  const deleteSelected = () => {
    if (readonly) return;
    
    if (selectedNodes.size > 0) {
      setNodes(prev => prev.filter(node => !selectedNodes.has(node.id)));
      setConnections(prev => prev.filter(conn => 
        !selectedNodes.has(conn.from.nodeId) && !selectedNodes.has(conn.to.nodeId)
      ));
      setSelectedNodes(new Set());
    }
    if (selectedConnection) {
      setConnections(prev => prev.filter(conn => conn.id !== selectedConnection));
      setSelectedConnection(null);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (readonly) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelected();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, selectedConnection, readonly]);

  // Render node based on type
  const renderNode = (node: FlowNode) => {
    const isSelected = selectedNodes.has(node.id);
    
    switch (node.type) {
      case 'start':
      case 'end':
        return (
          <g key={node.id}>
            <rect
              x={node.position.x}
              y={node.position.y}
              width={node.size.width}
              height={node.size.height}
              rx={node.size.height / 2}
              fill={node.style.fill}
              stroke={isSelected ? '#3b82f6' : node.style.stroke}
              strokeWidth={isSelected ? 3 : node.style.strokeWidth}
              filter="url(#shadow)"
              className={readonly ? '' : 'cursor-move'}
            />
            <text
              x={node.position.x + node.size.width / 2}
              y={node.position.y + node.size.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none pointer-events-none"
              fontSize={12 * scale}
              fontWeight="500"
            >
              {node.label}
            </text>
          </g>
        );
        
      case 'process':
        return (
          <g key={node.id}>
            <rect
              x={node.position.x}
              y={node.position.y}
              width={node.size.width}
              height={node.size.height}
              rx={4}
              fill={node.style.fill}
              stroke={isSelected ? '#3b82f6' : node.style.stroke}
              strokeWidth={isSelected ? 3 : node.style.strokeWidth}
              filter="url(#shadow)"
              className={readonly ? '' : 'cursor-move'}
            />
            <text
              x={node.position.x + node.size.width / 2}
              y={node.position.y + node.size.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none pointer-events-none"
              fontSize={12 * scale}
            >
              {node.label}
            </text>
          </g>
        );
        
      case 'decision':
        return (
          <g key={node.id}>
            <path
              d={`M ${node.position.x + node.size.width / 2} ${node.position.y}
                 L ${node.position.x + node.size.width} ${node.position.y + node.size.height / 2}
                 L ${node.position.x + node.size.width / 2} ${node.position.y + node.size.height}
                 L ${node.position.x} ${node.position.y + node.size.height / 2} Z`}
              fill={node.style.fill}
              stroke={isSelected ? '#3b82f6' : node.style.stroke}
              strokeWidth={isSelected ? 3 : node.style.strokeWidth}
              filter="url(#shadow)"
              className={readonly ? '' : 'cursor-move'}
            />
            <text
              x={node.position.x + node.size.width / 2}
              y={node.position.y + node.size.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none pointer-events-none"
              fontSize={11 * scale}
            >
              {node.label}
            </text>
          </g>
        );
        
      case 'data':
        const skew = 15 * scale;
        return (
          <g key={node.id}>
            <path
              d={`M ${node.position.x + skew} ${node.position.y}
                 L ${node.position.x + node.size.width} ${node.position.y}
                 L ${node.position.x + node.size.width - skew} ${node.position.y + node.size.height}
                 L ${node.position.x} ${node.position.y + node.size.height} Z`}
              fill={node.style.fill}
              stroke={isSelected ? '#3b82f6' : node.style.stroke}
              strokeWidth={isSelected ? 3 : node.style.strokeWidth}
              filter="url(#shadow)"
              className={readonly ? '' : 'cursor-move'}
            />
            <text
              x={node.position.x + node.size.width / 2}
              y={node.position.y + node.size.height / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="select-none pointer-events-none"
              fontSize={12 * scale}
            >
              {node.label}
            </text>
          </g>
        );
        
      case 'connector':
        return (
          <g key={node.id}>
            <circle
              cx={node.position.x + node.size.width / 2}
              cy={node.position.y + node.size.height / 2}
              r={node.size.width / 2}
              fill={node.style.fill}
              stroke={isSelected ? '#3b82f6' : node.style.stroke}
              strokeWidth={isSelected ? 3 : node.style.strokeWidth}
              filter="url(#shadow)"
              className={readonly ? '' : 'cursor-move'}
            />
            {node.label && (
              <text
                x={node.position.x + node.size.width / 2}
                y={node.position.y + node.size.height / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="select-none pointer-events-none"
                fontSize={10 * scale}
              >
                {node.label}
              </text>
            )}
          </g>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Toolbar - only show if not readonly */}
      {!readonly && (
        <div className="bg-gray-50 border-b border-gray-200 p-2">
          <div className="flex items-center gap-2">
            {/* Tools */}
            <div className="flex items-center gap-1 border-r pr-2">
              <button
                onClick={() => setTool('select')}
                className={`p-1 rounded text-xs ${tool === 'select' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                title="Select"
              >
                <MousePointer size={14} />
              </button>
              <button
                onClick={() => setTool('connect')}
                className={`p-1 rounded text-xs ${tool === 'connect' ? 'bg-blue-500 text-white' : 'bg-white hover:bg-gray-100'}`}
                title="Connect"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            
            {/* Node Types */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => addNode('start', { x: 50, y: 50 })}
                className="px-2 py-1 bg-green-100 hover:bg-green-200 rounded text-xs"
              >
                Start
              </button>
              <button
                onClick={() => addNode('process', { x: 50, y: 50 })}
                className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
              >
                Process
              </button>
              <button
                onClick={() => addNode('decision', { x: 50, y: 50 })}
                className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-xs"
              >
                Decision
              </button>
              <button
                onClick={() => addNode('data', { x: 50, y: 50 })}
                className="px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded text-xs"
              >
                Data
              </button>
              <button
                onClick={() => addNode('end', { x: 50, y: 50 })}
                className="px-2 py-1 bg-red-100 hover:bg-red-200 rounded text-xs"
              >
                End
              </button>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-1 border-l pl-2">
              <button
                onClick={deleteSelected}
                disabled={selectedNodes.size === 0 && !selectedConnection}
                className="p-1 rounded bg-white hover:bg-gray-100 disabled:opacity-50 text-xs"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <svg
          ref={canvasRef}
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="bg-white"
          style={{ cursor: tool === 'connect' ? 'crosshair' : 'default' }}
        >
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.1" />
            </filter>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon
                points="0 0, 8 3, 0 6"
                fill="#6b7280"
              />
            </marker>
          </defs>
          
          {/* Grid */}
          {showGrid && (
            <pattern id="grid" width={10 * scale} height={10 * scale} patternUnits="userSpaceOnUse">
              <circle cx={1 * scale} cy={1 * scale} r={0.5 * scale} fill="#e5e7eb" />
            </pattern>
          )}
          {showGrid && (
            <rect width="100%" height="100%" fill="url(#grid)" />
          )}
          
          {/* Connections */}
          {connections.map(conn => {
            const fromNode = nodes.find(n => n.id === conn.from.nodeId);
            const toNode = nodes.find(n => n.id === conn.to.nodeId);
            if (!fromNode || !toNode) return null;
            
            const fromPoint = getConnectionPointPosition(fromNode, conn.from.pointId);
            const toPoint = getConnectionPointPosition(toNode, conn.to.pointId);
            const fromSide = fromNode.connectionPoints.find(p => p.id === conn.from.pointId)?.side || 'right';
            const toSide = toNode.connectionPoints.find(p => p.id === conn.to.pointId)?.side || 'left';
            
            return (
              <g key={conn.id}>
                <path
                  d={generateBezierPath(fromPoint, toPoint, fromSide, toSide)}
                  fill="none"
                  stroke={selectedConnection === conn.id ? '#3b82f6' : conn.color}
                  strokeWidth={selectedConnection === conn.id ? 3 : 2}
                  strokeDasharray={conn.style === 'dashed' ? '5,5' : conn.style === 'dotted' ? '2,2' : ''}
                  markerEnd="url(#arrowhead)"
                  className={readonly ? '' : 'cursor-pointer'}
                  onClick={() => {
                    if (!readonly) {
                      setSelectedConnection(conn.id);
                      setSelectedNodes(new Set());
                    }
                  }}
                />
              </g>
            );
          })}
          
          {/* Connection preview */}
          {dragState.isConnecting && dragState.fromPoint && dragState.currentPos && (
            <path
              d={(() => {
                const fromNode = nodes.find(n => n.id === dragState.fromPoint!.nodeId);
                if (!fromNode) return '';
                const fromPoint = getConnectionPointPosition(fromNode, dragState.fromPoint.pointId);
                const fromSide = fromNode.connectionPoints.find(p => p.id === dragState.fromPoint!.pointId)?.side || 'right';
                return generateBezierPath(fromPoint, dragState.currentPos, fromSide, 'left');
              })()}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2"
              strokeDasharray="5,5"
              opacity="0.5"
            />
          )}
          
          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              {renderNode(node)}
              
              {/* Connection points */}
              {!readonly && (tool === 'connect' || dragState.isConnecting) && node.connectionPoints.map(point => {
                const pos = getConnectionPointPosition(node, point.id);
                return (
                  <circle
                    key={point.id}
                    cx={pos.x}
                    cy={pos.y}
                    r={4 * scale}
                    fill="white"
                    stroke="#6b7280"
                    strokeWidth="2"
                    className="cursor-crosshair hover:stroke-blue-500"
                    onClick={e => handleConnectionPointClick(node.id, point.id, e)}
                  />
                );
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// Export types for use in the slide system
export type { FlowNode, Connection, Point };
