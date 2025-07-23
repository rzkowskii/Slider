import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, Type, Square, Circle, Triangle, Trash2, Move, Play, ChevronLeft, ChevronRight, Copy, Code, BarChart, Table, Image, Download, Upload, Undo, Redo, ZoomIn, ZoomOut, Layers, Link2, ArrowRight, Save, Grid3X3 } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Simple plugin system
const usePlugins = () => {
  const [plugins, setPlugins] = useState(new Map());
  
  const registerPlugin = (id, plugin) => {
    setPlugins(prev => new Map(prev).set(id, plugin));
  };
  
  return { plugins, registerPlugin };
};

// Undo/Redo functionality
const useHistory = () => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  
  const pushState = useCallback((state) => {
    setHistory(prev => [...prev.slice(0, currentIndex + 1), state]);
    setCurrentIndex(prev => prev + 1);
  }, [currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      return history[currentIndex - 1];
    }
  }, [currentIndex, history]);
  
  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(prev => prev + 1);
      return history[currentIndex + 1];
    }
  }, [currentIndex, history]);
  
  return { pushState, undo, redo, canUndo: currentIndex > 0, canRedo: currentIndex < history.length - 1 };
};

const BeautifulSlideDeck = () => {
  // Core state
  const [slides, setSlides] = useState([{ id: '1', elements: [] }]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElements, setSelectedElements] = useState(new Set());
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [clipboard, setClipboard] = useState(null);
  
  // Refs
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Plugins
  const { plugins, registerPlugin } = usePlugins();
  
  // History
  const { pushState, undo, redo, canUndo, canRedo } = useHistory();
  
  // Current slide helper
  const currentSlide = slides[currentSlideIndex];
  
  // Beautiful themes
  const themes = {
    minimal: {
      name: 'Minimal',
      bg: 'bg-white',
      text: 'text-gray-900',
      slideClass: 'shadow-lg border border-gray-200',
      grid: 'rgba(0,0,0,0.05)'
    },
    dark: {
      name: 'Dark',
      bg: 'bg-gray-900',
      text: 'text-white',
      slideClass: 'shadow-2xl border border-gray-700',
      grid: 'rgba(255,255,255,0.05)'
    },
    gradient: {
      name: 'Gradient',
      bg: 'bg-gradient-to-br from-purple-600 via-pink-600 to-red-600',
      text: 'text-white',
      slideClass: 'shadow-2xl',
      grid: 'rgba(255,255,255,0.1)'
    }
  };
  
  const [currentTheme, setCurrentTheme] = useState('minimal');
  const theme = themes[currentTheme];
  
  // Grid snap helper
  const snapToGrid = (value) => {
    if (!showGrid) return value;
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  };
  
  // Save/Load functionality
  const savePresentation = () => {
    const data = {
      slides,
      theme: currentTheme,
      version: '1.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.json';
    a.click();
  };
  
  const loadPresentation = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          setSlides(data.slides);
          setCurrentTheme(data.theme || 'minimal');
          setCurrentSlideIndex(0);
        } catch (err) {
          alert('Invalid presentation file');
        }
      };
      reader.readAsText(file);
    }
  };
  
  // Element creation
  const createElement = (type) => {
    const baseElement = {
      id: Date.now().toString(),
      type,
      x: snapToGrid(200),
      y: snapToGrid(200),
      width: 200,
      height: 100,
      rotation: 0,
      style: {}
    };
    
    switch (type) {
      case 'text':
        return {
          ...baseElement,
          content: 'Click to edit',
          fontSize: 24,
          fontFamily: 'Inter, sans-serif',
          color: theme.text === 'text-white' ? '#ffffff' : '#000000',
          width: 300,
          height: 50
        };
      
      case 'code':
        return {
          ...baseElement,
          content: '// Your code here\nconst hello = "world";',
          language: 'javascript',
          width: 400,
          height: 200
        };
      
      case 'shape':
        return {
          ...baseElement,
          shapeType: 'rectangle',
          fill: '#3B82F6',
          stroke: 'none',
          strokeWidth: 2
        };
      
      case 'connector':
        return {
          ...baseElement,
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 100 }
          ],
          stroke: '#3B82F6',
          strokeWidth: 2,
          arrowEnd: true
        };
      
      case 'chart':
        return {
          ...baseElement,
          chartType: 'bar',
          width: 400,
          height: 300,
          data: [
            { label: 'A', value: 30 },
            { label: 'B', value: 50 },
            { label: 'C', value: 20 },
            { label: 'D', value: 40 }
          ]
        };
      
      case 'image':
        return {
          ...baseElement,
          src: '',
          width: 300,
          height: 200
        };
      
      default:
        return baseElement;
    }
  };
  
  const addElement = (type) => {
    const newElement = createElement(type);
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements.push(newElement);
    setSlides(newSlides);
    pushState(newSlides);
    setSelectedElements(new Set([newElement.id]));
  };
  
  // Element manipulation
  const updateElement = (elementId, updates) => {
    const newSlides = [...slides];
    const element = newSlides[currentSlideIndex].elements.find(el => el.id === elementId);
    if (element) {
      Object.assign(element, updates);
      setSlides(newSlides);
    }
  };
  
  const deleteSelectedElements = () => {
    const newSlides = [...slides];
    newSlides[currentSlideIndex].elements = newSlides[currentSlideIndex].elements.filter(
      el => !selectedElements.has(el.id)
    );
    setSlides(newSlides);
    pushState(newSlides);
    setSelectedElements(new Set());
  };
  
  // Copy/Paste
  const copySelectedElements = () => {
    const elementsToCopy = currentSlide.elements.filter(el => selectedElements.has(el.id));
    setClipboard(elementsToCopy);
  };
  
  const pasteElements = () => {
    if (!clipboard) return;
    
    const newSlides = [...slides];
    const pastedElements = clipboard.map(el => ({
      ...el,
      id: Date.now() + Math.random(),
      x: el.x + 20,
      y: el.y + 20
    }));
    
    newSlides[currentSlideIndex].elements.push(...pastedElements);
    setSlides(newSlides);
    pushState(newSlides);
    setSelectedElements(new Set(pastedElements.map(el => el.id)));
  };
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Ctrl/Cmd shortcuts
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey && canRedo) {
              const state = redo();
              if (state) setSlides(state);
            } else if (canUndo) {
              const state = undo();
              if (state) setSlides(state);
            }
            break;
          case 'c':
            e.preventDefault();
            copySelectedElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 's':
            e.preventDefault();
            savePresentation();
            break;
          case 'd':
            e.preventDefault();
            if (selectedElements.size > 0) {
              copySelectedElements();
              pasteElements();
            }
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
          case 'Backspace':
            if (selectedElements.size > 0) {
              deleteSelectedElements();
            }
            break;
          case 'Escape':
            setSelectedElements(new Set());
            setTool('select');
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElements, clipboard, canUndo, canRedo]);
  
  // Mouse handling for selection and dragging
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElements(new Set());
    }
  };
  
  const handleElementClick = (elementId, e) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
      // Multi-select
      const newSelection = new Set(selectedElements);
      if (newSelection.has(elementId)) {
        newSelection.delete(elementId);
      } else {
        newSelection.add(elementId);
      }
      setSelectedElements(newSelection);
    } else {
      setSelectedElements(new Set([elementId]));
    }
  };
  
  // Render element
  const renderElement = (element) => {
    const isSelected = selectedElements.has(element.id);
    
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      cursor: tool === 'select' ? 'move' : 'crosshair',
      userSelect: 'none'
    };
    
    const selectionStyle = isSelected ? {
      outline: '2px solid #3B82F6',
      outlineOffset: '2px'
    } : {};
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              color: element.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onDoubleClick={() => {
              const newContent = prompt('Edit text:', element.content);
              if (newContent !== null) {
                updateElement(element.id, { content: newContent });
              }
            }}
          >
            {element.content}
          </div>
        );
      
      case 'code':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '16px',
              overflow: 'auto',
              borderRadius: '8px'
            }}
            onClick={(e) => handleElementClick(element.id, e)}
          >
            <pre>{element.content}</pre>
          </div>
        );
      
      case 'shape':
        const ShapeComponent = () => {
          switch (element.shapeType) {
            case 'circle':
              return (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: element.fill,
                    border: element.stroke !== 'none' ? `${element.strokeWidth}px solid ${element.stroke}` : 'none'
                  }}
                />
              );
            case 'triangle':
              return (
                <div
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: `${element.width/2}px solid transparent`,
                    borderRight: `${element.width/2}px solid transparent`,
                    borderBottom: `${element.height}px solid ${element.fill}`
                  }}
                />
              );
            default:
              return (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: element.fill,
                    border: element.stroke !== 'none' ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
                    borderRadius: element.rounded ? '8px' : '0'
                  }}
                />
              );
          }
        };
        
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onClick={(e) => handleElementClick(element.id, e)}
          >
            <ShapeComponent />
          </div>
        );
      
      case 'chart':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: '8px', padding: '16px' }}
            onClick={(e) => handleElementClick(element.id, e)}
          >
            <ResponsiveContainer width="100%" height="100%">
              {element.chartType === 'bar' ? (
                <RechartsBarChart data={element.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </RechartsBarChart>
              ) : element.chartType === 'line' ? (
                <LineChart data={element.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie
                    data={element.data}
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    dataKey="value"
                  >
                    {element.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Slide operations
  const addSlide = () => {
    const newSlide = { id: Date.now().toString(), elements: [] };
    const newSlides = [...slides, newSlide];
    setSlides(newSlides);
    setCurrentSlideIndex(slides.length);
    pushState(newSlides);
  };
  
  const duplicateSlide = () => {
    const newSlide = {
      id: Date.now().toString(),
      elements: currentSlide.elements.map(el => ({
        ...el,
        id: Date.now() + Math.random()
      }))
    };
    const newSlides = [...slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(currentSlideIndex + 1);
    pushState(newSlides);
  };
  
  const deleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, index) => index !== currentSlideIndex);
      setSlides(newSlides);
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
      pushState(newSlides);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Slides */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Slides</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlideIndex(index)}
              className={`
                relative cursor-pointer rounded-lg p-2 transition-all
                ${index === currentSlideIndex ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}
              `}
            >
              <div className="text-sm font-medium mb-1">Slide {index + 1}</div>
              <div className={`
                aspect-video rounded border ${theme.bg} ${theme.slideClass}
                transform scale-90
              `}>
                {/* Mini preview */}
                <div className="relative w-full h-full overflow-hidden scale-[0.2] origin-top-left">
                  {slide.elements.map(el => renderElement(el))}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t space-y-2">
          <button
            onClick={addSlide}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Slide
          </button>
          <div className="flex gap-2">
            <button
              onClick={duplicateSlide}
              className="flex-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
            >
              Duplicate
            </button>
            <button
              onClick={deleteSlide}
              disabled={slides.length === 1}
              className="flex-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-white shadow-sm border-b px-4 py-2">
          <div className="flex items-center gap-4">
            {/* File operations */}
            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={savePresentation}
                className="p-2 hover:bg-gray-100 rounded"
                title="Save"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded"
                title="Open"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={loadPresentation}
                style={{ display: 'none' }}
              />
            </div>
            
            {/* Edit operations */}
            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={() => canUndo && setSlides(undo())}
                disabled={!canUndo}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Undo"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => canRedo && setSlides(redo())}
                disabled={!canRedo}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Redo"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tools */}
            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={() => setTool('select')}
                className={`p-2 rounded ${tool === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                title="Select"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('text')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Text"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = createElement('shape');
                  el.shapeType = 'rectangle';
                  const newSlides = [...slides];
                  newSlides[currentSlideIndex].elements.push(el);
                  setSlides(newSlides);
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Rectangle"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const el = createElement('shape');
                  el.shapeType = 'circle';
                  const newSlides = [...slides];
                  newSlides[currentSlideIndex].elements.push(el);
                  setSlides(newSlides);
                }}
                className="p-2 hover:bg-gray-100 rounded"
                title="Circle"
              >
                <Circle className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('connector')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Arrow"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('code')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Code"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('chart')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Chart"
              >
                <BarChart className="w-4 h-4" />
              </button>
            </div>
            
            {/* View controls */}
            <div className="flex items-center gap-2 border-r pr-4">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded ${showGrid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                title="Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(Math.max(0.25, zoom - 0.25))}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                className="p-2 hover:bg-gray-100 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            {/* Themes */}
            <div className="flex items-center gap-2">
              {Object.entries(themes).map(([key, t]) => (
                <button
                  key={key}
                  onClick={() => setCurrentTheme(key)}
                  className={`px-3 py-1 rounded text-sm ${
                    currentTheme === key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Canvas */}
        <div className="flex-1 overflow-auto bg-gray-200 p-8">
          <div
            className="mx-auto transition-transform"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center'
            }}
          >
            <div
              ref={canvasRef}
              className={`
                relative mx-auto
                ${theme.bg} ${theme.text} ${theme.slideClass}
                transition-all duration-300
              `}
              style={{
                width: 1024,
                height: 576,
                backgroundImage: showGrid ? `
                  repeating-linear-gradient(0deg, ${theme.grid} 0px, transparent 1px, transparent 19px, ${theme.grid} 20px),
                  repeating-linear-gradient(90deg, ${theme.grid} 0px, transparent 1px, transparent 19px, ${theme.grid} 20px)
                ` : 'none'
              }}
              onMouseDown={handleCanvasMouseDown}
            >
              {currentSlide.elements.map(element => renderElement(element))}
            </div>
          </div>
        </div>
        
        {/* Bottom status bar */}
        <div className="bg-white border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
          <div>Slide {currentSlideIndex + 1} of {slides.length}</div>
          <div>{selectedElements.size} element{selectedElements.size !== 1 ? 's' : ''} selected</div>
        </div>
      </div>
      
      {/* Right Sidebar - Properties (when element selected) */}
      {selectedElements.size > 0 && (
        <div className="w-64 bg-white shadow-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
          {/* Add property controls here based on selected element type */}
          <button
            onClick={deleteSelectedElements}
            className="w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Selected
          </button>
        </div>
      )}
    </div>
  );
};

export default BeautifulSlideDeck;