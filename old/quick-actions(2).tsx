import React, { useState, useRef, useEffect } from 'react';
import { Type, Square, Circle, Camera, Code, BarChart, Zap, Plus, X, Link, MessageSquare, Calendar, MapPin } from 'lucide-react';

// Quick Actions Component
const QuickActionsMenu = () => {
  const [elements, setElements] = useState([]);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickActionPosition, setQuickActionPosition] = useState({ x: 0, y: 0 });
  const [selectedElement, setSelectedElement] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const canvasRef = useRef(null);

  // Quick action items
  const quickActions = [
    { id: 'text', icon: Type, label: 'Text', color: '#3B82F6' },
    { id: 'rectangle', icon: Square, label: 'Rectangle', color: '#10B981' },
    { id: 'circle', icon: Circle, label: 'Circle', color: '#F59E0B' },
    { id: 'image', icon: Camera, label: 'Image', color: '#8B5CF6' },
    { id: 'code', icon: Code, label: 'Code', color: '#EF4444' },
    { id: 'chart', icon: BarChart, label: 'Chart', color: '#06B6D4' },
    { id: 'link', icon: Link, label: 'Link', color: '#EC4899' },
    { id: 'comment', icon: MessageSquare, label: 'Comment', color: '#84CC16' }
  ];

  // Handle canvas click
  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setQuickActionPosition({ x, y });
      setShowQuickActions(true);
      setSelectedElement(null);
      setContextMenuPosition(null);
    }
  };

  // Handle right click on canvas
  const handleCanvasRightClick = (e) => {
    e.preventDefault();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setContextMenuPosition({ x, y });
    setShowQuickActions(false);
  };

  // Add element from quick action
  const addElement = (type, position) => {
    const newElement = {
      id: Date.now(),
      type,
      x: position.x - 50,
      y: position.y - 50,
      width: 100,
      height: 100,
      content: type === 'text' ? 'New Text' : '',
      color: quickActions.find(a => a.id === type)?.color || '#3B82F6'
    };
    
    setElements([...elements, newElement]);
    setShowQuickActions(false);
    setContextMenuPosition(null);
  };

  // Delete element
  const deleteElement = (id) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
  };

  // Duplicate element
  const duplicateElement = (element) => {
    const newElement = {
      ...element,
      id: Date.now(),
      x: element.x + 20,
      y: element.y + 20
    };
    setElements([...elements, newElement]);
  };

  // Close menus on escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowQuickActions(false);
        setContextMenuPosition(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Render element
  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    const Icon = quickActions.find(a => a.id === element.type)?.icon || Square;
    
    return (
      <div
        key={element.id}
        className={`absolute cursor-move transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-102'
        }`}
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height
        }}
        onClick={() => setSelectedElement(element.id)}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSelectedElement(element.id);
          const rect = canvasRef.current.getBoundingClientRect();
          setContextMenuPosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
          });
        }}
      >
        <div
          className="w-full h-full rounded-lg flex items-center justify-center"
          style={{ backgroundColor: element.color + '20', border: `2px solid ${element.color}` }}
        >
          <Icon className="w-8 h-8" style={{ color: element.color }} />
          {element.type === 'text' && (
            <span className="ml-2 font-medium" style={{ color: element.color }}>
              {element.content}
            </span>
          )}
        </div>
      </div>
    );
  };

  // Quick Actions Menu Component
  const QuickActionsWheel = ({ position }) => {
    const menuRef = useRef(null);
    const [isExpanded, setIsExpanded] = useState(false);
    
    useEffect(() => {
      // Animate expansion
      setTimeout(() => setIsExpanded(true), 10);
    }, []);
    
    return (
      <div
        ref={menuRef}
        className="absolute z-50"
        style={{ left: position.x, top: position.y }}
      >
        {/* Center button */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2">
          <button
            onClick={() => setShowQuickActions(false)}
            className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        
        {/* Action buttons in a circle */}
        {quickActions.map((action, index) => {
          const angle = (index * 45) * Math.PI / 180;
          const radius = isExpanded ? 80 : 0;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          return (
            <div
              key={action.id}
              className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isExpanded ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
              }`}
              style={{
                left: x,
                top: y,
                transitionDelay: `${index * 30}ms`
              }}
            >
              <button
                onClick={() => addElement(action.id, position)}
                className="group relative w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                style={{ borderColor: action.color, borderWidth: '2px' }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
                
                {/* Tooltip */}
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {action.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  // Context Menu Component
  const ContextMenu = ({ position, element }) => {
    const menuItems = [
      { id: 'duplicate', icon: Copy, label: 'Duplicate', action: () => duplicateElement(element) },
      { id: 'delete', icon: X, label: 'Delete', action: () => deleteElement(element.id) },
      { id: 'bring-front', icon: Square, label: 'Bring to Front', action: () => {} },
      { id: 'send-back', icon: Square, label: 'Send to Back', action: () => {} }
    ];
    
    return (
      <div
        className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[160px]"
        style={{ left: position.x, top: position.y }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              item.action();
              setContextMenuPosition(null);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-3 text-sm"
          >
            <item.icon className="w-4 h-4 text-gray-600" />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    );
  };

  // Floating Action Button
  const FloatingActionButton = () => {
    const [showMiniActions, setShowMiniActions] = useState(false);
    
    return (
      <div className="fixed bottom-8 right-8 z-50">
        {/* Mini actions */}
        <div className={`absolute bottom-16 right-0 transition-all duration-300 ${
          showMiniActions ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <div className="space-y-3">
            {quickActions.slice(0, 4).map((action, index) => (
              <button
                key={action.id}
                onClick={() => {
                  addElement(action.id, { x: 400, y: 300 });
                  setShowMiniActions(false);
                }}
                className="block ml-auto w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                style={{ 
                  borderColor: action.color, 
                  borderWidth: '2px',
                  transitionDelay: showMiniActions ? `${index * 50}ms` : '0ms'
                }}
              >
                <action.icon className="w-5 h-5" style={{ color: action.color }} />
              </button>
            ))}
          </div>
        </div>
        
        {/* Main FAB */}
        <button
          onClick={() => setShowMiniActions(!showMiniActions)}
          className={`w-14 h-14 bg-blue-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-600 transition-all duration-300 ${
            showMiniActions ? 'rotate-45' : ''
          }`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 border-b">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Quick Actions Demo
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Click anywhere on canvas for quick actions • Right-click elements for context menu • Use FAB for quick add
        </p>
      </div>
      
      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="flex-1 relative bg-white m-4 rounded-lg shadow-lg overflow-hidden cursor-crosshair"
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasRightClick}
      >
        {/* Grid background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, #000 0px, transparent 1px, transparent 39px, #000 40px),
              repeating-linear-gradient(90deg, #000 0px, transparent 1px, transparent 39px, #000 40px)
            `
          }}
        />
        
        {/* Elements */}
        {elements.map(renderElement)}
        
        {/* Empty state */}
        {elements.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Plus className="w-16 h-16 mx-auto mb-4" />
              <p className="text-lg">Click anywhere to add elements</p>
              <p className="text-sm mt-2">Or use the floating action button</p>
            </div>
          </div>
        )}
        
        {/* Quick Actions Wheel */}
        {showQuickActions && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black bg-opacity-10"
              onClick={() => setShowQuickActions(false)}
            />
            <QuickActionsWheel position={quickActionPosition} />
          </>
        )}
        
        {/* Context Menu */}
        {contextMenuPosition && selectedElement && (
          <>
            {/* Backdrop */}
            <div 
              className="absolute inset-0"
              onClick={() => setContextMenuPosition(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenuPosition(null);
              }}
            />
            <ContextMenu 
              position={contextMenuPosition} 
              element={elements.find(el => el.id === selectedElement)}
            />
          </>
        )}
      </div>
      
      {/* Floating Action Button */}
      <FloatingActionButton />
      
      {/* Status Bar */}
      <div className="bg-white border-t px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <span>{elements.length} elements on canvas</span>
          <span>Selected: {selectedElement ? `Element ${selectedElement}` : 'None'}</span>
        </div>
      </div>
    </div>
  );
};

// Copy icon component (since it might not be available in lucide-react)
const Copy = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

export default QuickActionsMenu;