import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Plus, Type, Square, Circle, Triangle, Code, BarChart, Table, 
  Move, Play, Copy, Trash2, Save, Upload, Undo, Redo, 
  ZoomIn, ZoomOut, Grid3X3, ArrowRight, Image,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { useUndoRedo } from '@/hooks/useUndoRedo';
import { useAutoSave, getAutoSaveStatusDisplay, formatTimeAgo } from '@/hooks/useAutoSave';
import { BulletproofStorage } from '@/utils/safeStorage';
import { 
  AppErrorBoundary, 
  SlideErrorBoundary, 
  ElementErrorBoundary 
} from '@/components/ErrorBoundary/PresentationErrorBoundary';
import StressTestSuite from '@/testing/StressTestSuite';
import NiFiFlowDiagram from '@/components/FlowDiagram/NiFiFlowDiagram';
import type { FlowNode, Connection } from '@/components/FlowDiagram/NiFiFlowDiagram';

// Plugin System
interface Plugin {
  id: string;
  name: string;
  version: string;
  tools?: PluginTool[];
  elementTypes?: PluginElementType[];
}

interface PluginTool {
  id: string;
  name: string;
  icon: React.ComponentType;
  action: (context: PluginContext) => void;
}

interface PluginElementType {
  type: string;
  create: () => SlideElement;
  render: (element: SlideElement, props: ElementRenderProps) => React.ReactNode;
}

interface PluginContext {
  addElement: (element: SlideElement) => void;
  selectedElements: Set<string>;
  updateElement: (id: string, updates: Partial<SlideElement>) => void;
  deleteElement: (id: string) => void;
}

interface ElementRenderProps {
  element: SlideElement;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

// Core Types
interface SlideElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  style?: Record<string, any>;
  
  // Text specific
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  textAlign?: 'left' | 'center' | 'right';
  fontWeight?: string;
  
  // Shape specific
  shapeType?: 'rectangle' | 'circle' | 'triangle';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  
  // Code specific
  language?: string;
  
  // Chart specific
  chartType?: 'bar' | 'line' | 'pie';
  data?: any[];
  
  // Table specific
  rows?: number;
  cols?: number;
  tableData?: string[][];
  
  // Connector specific
  points?: { x: number; y: number }[];
  arrowEnd?: boolean;
  
  // Flow diagram specific
  nodes?: FlowNode[];
  connections?: Connection[];
}

interface Slide {
  id: string;
  elements: SlideElement[];
  gridEnabled?: boolean;
  background?: string;
  notes?: string;
}

interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: string;
  settings: {
    gridEnabled: boolean;
    snapToGrid: boolean;
    gridSize: number;
    showGuides: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Themes
const themes = {
  minimal: {
    name: 'Minimal',
    bg: 'bg-white',
    text: 'text-gray-900',
    slideClass: 'shadow-lg border border-gray-200',
    grid: 'rgba(0,0,0,0.05)',
    toolbar: 'bg-white border-gray-200'
  },
  dark: {
    name: 'Dark',
    bg: 'bg-gray-900',
    text: 'text-white',
    slideClass: 'shadow-2xl border border-gray-700',
    grid: 'rgba(255,255,255,0.05)',
    toolbar: 'bg-gray-800 border-gray-700'
  },
  tech: {
    name: 'Tech',
    bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
    text: 'text-white',
    slideClass: 'shadow-2xl',
    grid: 'rgba(255,255,255,0.1)',
    toolbar: 'bg-gray-800 border-gray-700'
  },
  blueprint: {
    name: 'Blueprint',
    bg: 'bg-gradient-to-br from-blue-950 to-blue-900',
    text: 'text-white',
    slideClass: 'shadow-2xl',
    grid: 'rgba(255,255,255,0.1)',
    toolbar: 'bg-blue-900 border-blue-800'
  }
};

// Slide Templates
const slideTemplates = {
  title: (): SlideElement[] => [
    {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100, y: 200, width: 600, height: 80,
      content: 'Presentation Title',
      fontSize: 48, fontWeight: 'bold', textAlign: 'center',
      color: '#1F2937'
    },
    {
      id: `text-${Date.now() + 1}`,
      type: 'text',
      x: 100, y: 300, width: 600, height: 40,
      content: 'Subtitle or Author Name',
      fontSize: 24, textAlign: 'center',
      color: '#6B7280'
    },
    {
      id: `text-${Date.now() + 2}`,
      type: 'text',
      x: 100, y: 450, width: 600, height: 30,
      content: new Date().toLocaleDateString(),
      fontSize: 18, textAlign: 'center',
      color: '#9CA3AF'
    }
  ],
  
  codeSlide: (): SlideElement[] => [
    {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50, y: 50, width: 400, height: 40,
      content: 'Code Example',
      fontSize: 32, fontWeight: 'bold',
      color: '#1F2937'
    },
    {
      id: `code-${Date.now() + 1}`,
      type: 'code',
      x: 50, y: 120, width: 700, height: 400,
      content: '// Example code\nfunction calculate(data) {\n  return data.map(item => {\n    return item.value * 2;\n  });\n}\n\n// Usage\nconst result = calculate(myData);',
      language: 'javascript'
    }
  ],
  
  comparison: (): SlideElement[] => [
    {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 50, y: 50, width: 700, height: 40,
      content: 'Comparison',
      fontSize: 32, fontWeight: 'bold',
      color: '#1F2937'
    },
    {
      id: `shape-${Date.now() + 1}`,
      type: 'shape',
      shapeType: 'rectangle',
      x: 50, y: 120, width: 340, height: 400,
      fill: '#DBEAFE', opacity: 0.8
    },
    {
      id: `shape-${Date.now() + 2}`,
      type: 'shape',
      shapeType: 'rectangle',
      x: 410, y: 120, width: 340, height: 400,
      fill: '#D1FAE5', opacity: 0.8
    },
    {
      id: `text-${Date.now() + 3}`,
      type: 'text',
      x: 70, y: 140, width: 300, height: 30,
      content: 'Option A',
      fontSize: 24, fontWeight: 'bold',
      color: '#1E40AF'
    },
    {
      id: `text-${Date.now() + 4}`,
      type: 'text',
      x: 430, y: 140, width: 300, height: 30,
      content: 'Option B',
      fontSize: 24, fontWeight: 'bold',
      color: '#059669'
    }
  ]
};

const ProfessionalSlideDeck: React.FC = () => {
  // Core State
  const [presentation, setPresentation] = useState<Presentation>({
    id: 'main-presentation',
    title: 'Professional Presentation',
    slides: [{ id: 'slide-1', elements: [], gridEnabled: true }],
    theme: 'minimal',
    settings: {
      gridEnabled: true,
      snapToGrid: true,
      gridSize: 20,
      showGuides: true
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElements, setSelectedElements] = useState<Set<string>>(new Set());
  const [tool, setTool] = useState('select');
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [clipboard, setClipboard] = useState<SlideElement[]>([]);
  const [isPresenting, setIsPresenting] = useState(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Undo/Redo
  const { pushState, undo, redo, canUndo, canRedo } = useUndoRedo(presentation, 50);
  
  // Auto-save system - MARCUS PROTECTION
  const { autoSaveState, saveNow } = useAutoSave(presentation, {
    intervalMs: 30000, // 30 seconds
    maxRetries: 3,
    pauseOnError: false,
    showNotifications: true
  });
  
  // Plugin System
  const [plugins] = useState<Map<string, Plugin>>(new Map());
  
  // Current helpers
  const currentSlide = presentation.slides[currentSlideIndex];
  const currentTheme = themes[presentation.theme as keyof typeof themes];
  
  // Grid snapping
  const snapToGrid = useCallback((value: number) => {
    if (!presentation.settings.snapToGrid) return value;
    return Math.round(value / presentation.settings.gridSize) * presentation.settings.gridSize;
  }, [presentation.settings.snapToGrid, presentation.settings.gridSize]);
  
  // Element creation
  const createElement = useCallback((type: string): SlideElement => {
    const baseElement = {
      id: `${type}-${Date.now()}-${Math.random()}`,
      type,
      x: snapToGrid(200),
      y: snapToGrid(200),
      width: 200,
      height: 100,
      rotation: 0
    };
    
    switch (type) {
      case 'text':
        return {
          ...baseElement,
          content: 'Click to edit',
          fontSize: 24,
          fontFamily: 'Inter, sans-serif',
          color: currentTheme.text === 'text-white' ? '#ffffff' : '#000000',
          textAlign: 'left',
          width: 300,
          height: 50
        };
      
      case 'code':
        return {
          ...baseElement,
          content: '// Your code here\nconst hello = "world";\nconsole.log(hello);',
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
      
      case 'chart':
        return {
          ...baseElement,
          chartType: 'bar',
          width: 400,
          height: 300,
          data: [
            { label: 'Q1', value: 30 },
            { label: 'Q2', value: 50 },
            { label: 'Q3', value: 20 },
            { label: 'Q4', value: 40 }
          ]
        };
      
      case 'table':
        return {
          ...baseElement,
          rows: 3,
          cols: 3,
          width: 400,
          height: 200,
          tableData: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Data 1', 'Data 2', 'Data 3'],
            ['Data 4', 'Data 5', 'Data 6']
          ]
        };
      
      case 'flowDiagram':
        return {
          ...baseElement,
          width: 600,
          height: 400,
          nodes: [],
          connections: []
        };
      
      default:
        return baseElement;
    }
  }, [snapToGrid, currentTheme]);
  
  // State management
  const updatePresentation = useCallback((updates: Partial<Presentation>) => {
    const newPresentation = { ...presentation, ...updates, updatedAt: new Date() };
    setPresentation(newPresentation);
    pushState(newPresentation, 'Update presentation');
  }, [presentation, pushState]);
  
  const updateSlide = useCallback((slideIndex: number, updates: Partial<Slide>) => {
    const newSlides = [...presentation.slides];
    newSlides[slideIndex] = { ...newSlides[slideIndex], ...updates };
    updatePresentation({ slides: newSlides });
  }, [presentation.slides, updatePresentation]);
  
  const updateElement = useCallback((elementId: string, updates: Partial<SlideElement>) => {
    const newElements = currentSlide.elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    updateSlide(currentSlideIndex, { elements: newElements });
  }, [currentSlide.elements, updateSlide, currentSlideIndex]);
  
  // Element operations
  const addElement = useCallback((type: string) => {
    const newElement = createElement(type);
    const newElements = [...currentSlide.elements, newElement];
    updateSlide(currentSlideIndex, { elements: newElements });
    setSelectedElements(new Set([newElement.id]));
  }, [createElement, currentSlide.elements, updateSlide, currentSlideIndex]);
  
  const deleteSelectedElements = useCallback(() => {
    const newElements = currentSlide.elements.filter(el => !selectedElements.has(el.id));
    updateSlide(currentSlideIndex, { elements: newElements });
    setSelectedElements(new Set());
  }, [currentSlide.elements, selectedElements, updateSlide, currentSlideIndex]);
  
  // Copy/Paste operations
  const copySelectedElements = useCallback(() => {
    const elementsToCopy = currentSlide.elements.filter(el => selectedElements.has(el.id));
    setClipboard(elementsToCopy);
  }, [currentSlide.elements, selectedElements]);
  
  const pasteElements = useCallback(() => {
    if (clipboard.length === 0) return;
    
    const pastedElements = clipboard.map(el => ({
      ...el,
      id: `${el.type}-${Date.now()}-${Math.random()}`,
      x: snapToGrid(el.x + 20),
      y: snapToGrid(el.y + 20)
    }));
    
    const newElements = [...currentSlide.elements, ...pastedElements];
    updateSlide(currentSlideIndex, { elements: newElements });
    setSelectedElements(new Set(pastedElements.map(el => el.id)));
  }, [clipboard, currentSlide.elements, updateSlide, currentSlideIndex, snapToGrid]);
  
  // Slide operations
  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      gridEnabled: true
    };
    const newSlides = [...presentation.slides, newSlide];
    updatePresentation({ slides: newSlides });
    setCurrentSlideIndex(presentation.slides.length);
  }, [presentation.slides, updatePresentation]);
  
  const addSlideFromTemplate = useCallback((templateName: keyof typeof slideTemplates) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: slideTemplates[templateName](),
      gridEnabled: true
    };
    const newSlides = [...presentation.slides, newSlide];
    updatePresentation({ slides: newSlides });
    setCurrentSlideIndex(presentation.slides.length);
  }, [presentation.slides, updatePresentation]);
  
  const duplicateSlide = useCallback(() => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: currentSlide.elements.map(el => ({
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`
      })),
      gridEnabled: currentSlide.gridEnabled
    };
    const newSlides = [...presentation.slides];
    newSlides.splice(currentSlideIndex + 1, 0, newSlide);
    updatePresentation({ slides: newSlides });
    setCurrentSlideIndex(currentSlideIndex + 1);
  }, [currentSlide, currentSlideIndex, presentation.slides, updatePresentation]);
  
  const deleteSlide = useCallback(() => {
    if (presentation.slides.length > 1) {
      const newSlides = presentation.slides.filter((_, index) => index !== currentSlideIndex);
      updatePresentation({ slides: newSlides });
      setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
    }
  }, [presentation.slides, currentSlideIndex, updatePresentation]);
  
  // Save/Load operations - MARCUS GRADE PROTECTION
  const savePresentation = useCallback(async () => {
    try {
      const result = await BulletproofStorage.savePresentation(presentation);
      if (result.success) {
        console.log('✅ Presentation saved successfully', result.backupCreated ? '(backup created)' : '');
        // Also export for external storage
        BulletproofStorage.exportPresentation(presentation);
      } else {
        console.error('❌ Save failed:', result.error);
        alert(`Save failed: ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Critical save error:', error);
      alert('Critical save error. Please try again or export manually.');
    }
  }, [presentation]);
  
  const loadPresentation = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        // Validate the loaded data before setting it
        if (!data.id || !data.title || !Array.isArray(data.slides)) {
          throw new Error('Invalid presentation format');
        }
        
        const loadedPresentation = {
          ...data,
          updatedAt: new Date()
        };
        
        setPresentation(loadedPresentation);
        setCurrentSlideIndex(0);
        setSelectedElements(new Set());
        pushState(loadedPresentation, 'Load presentation');
        
        console.log('✅ Presentation loaded successfully');
      } catch (err) {
        console.error('❌ Load failed:', err);
        alert('Invalid presentation file. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, [pushState]);

  // Manual save now function
  const handleManualSave = useCallback(async () => {
    const result = await saveNow();
    if (result.success) {
      console.log('✅ Manual save successful');
    } else {
      console.error('❌ Manual save failed:', result.error);
      alert(`Manual save failed: ${result.error}`);
    }
  }, [saveNow]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey && canRedo) {
              const state = redo();
              if (state) setPresentation(state.state);
            } else if (canUndo) {
              const state = undo();
              if (state) setPresentation(state.state);
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
          case 'a':
            e.preventDefault();
            setSelectedElements(new Set(currentSlide.elements.map(el => el.id)));
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
  }, [
    selectedElements, clipboard, canUndo, canRedo, currentSlide.elements,
    copySelectedElements, pasteElements, deleteSelectedElements,
    savePresentation, undo, redo
  ]);
  
  // Mouse handling
  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedElements(new Set());
    }
  }, []);
  
  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (e.ctrlKey || e.metaKey) {
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
  }, [selectedElements]);
  
  // Element rendering
  const renderElement = useCallback((element: SlideElement) => {
    const isSelected = selectedElements.has(element.id);
    
    const baseStyle: React.CSSProperties = {
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
    
    const handleClick = (e: React.MouseEvent) => handleElementClick(element.id, e);
    
    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (element.type === 'text') {
        const newContent = prompt('Edit text:', element.content);
        if (newContent !== null) {
          updateElement(element.id, { content: newContent });
        }
      }
    };
    
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
              fontWeight: element.fontWeight,
              textAlign: element.textAlign,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : 
                             element.textAlign === 'right' ? 'flex-end' : 'flex-start',
              padding: '8px'
            }}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
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
              backgroundColor: 'rgba(0,0,0,0.9)',
              color: '#00ff41',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, monospace',
              fontSize: '14px',
              padding: '16px',
              overflow: 'auto',
              borderRadius: '8px'
            }}
            onClick={handleClick}
            onDoubleClick={() => {
              const newContent = prompt('Edit code:', element.content);
              if (newContent !== null) {
                updateElement(element.id, { content: newContent });
              }
            }}
          >
            <pre style={{ margin: 0 }}>{element.content}</pre>
          </div>
        );
      
      case 'shape':
        const ShapeComponent = () => {
          const shapeStyle: React.CSSProperties = {
            width: '100%',
            height: '100%',
            backgroundColor: element.fill,
            border: element.stroke !== 'none' ? `${element.strokeWidth}px solid ${element.stroke}` : 'none',
            opacity: element.opacity || 1
          };
          
          switch (element.shapeType) {
            case 'circle':
              return <div style={{ ...shapeStyle, borderRadius: '50%' }} />;
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
              return <div style={shapeStyle} />;
          }
        };
        
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onClick={handleClick}
          >
            <ShapeComponent />
          </div>
        );
      
      case 'chart':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              ...selectionStyle,
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: '8px',
              padding: '16px'
            }}
            onClick={handleClick}
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
                    {element.data?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        );
      
      case 'table':
        return (
          <div
            key={element.id}
            style={{ ...baseStyle, ...selectionStyle }}
            onClick={handleClick}
          >
            <table style={{ width: '100%', height: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {element.tableData?.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        style={{
                          border: '1px solid #d1d5db',
                          padding: '8px',
                          fontSize: '14px',
                          backgroundColor: rowIndex === 0 ? 'rgba(0,0,0,0.05)' : 'transparent',
                          fontWeight: rowIndex === 0 ? 'bold' : 'normal'
                        }}
                        onDoubleClick={() => {
                          const newValue = prompt('Edit cell:', cell);
                          if (newValue !== null && element.tableData) {
                            const newData = [...element.tableData];
                            newData[rowIndex][colIndex] = newValue;
                            updateElement(element.id, { tableData: newData });
                          }
                        }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      
      case 'flowDiagram':
        return (
          <ElementErrorBoundary
            key={element.id}
            elementType="flowDiagram"
            elementId={element.id}
          >
            <div
              style={{ ...baseStyle, ...selectionStyle }}
              onClick={handleClick}
            >
              <NiFiFlowDiagram
                width={element.width}
                height={element.height}
                initialNodes={element.nodes || []}
                initialConnections={element.connections || []}
                onChange={(nodes: FlowNode[], connections: Connection[]) => {
                  updateElement(element.id, { nodes, connections });
                }}
                readonly={false}
                scale={0.8} // Scale down slightly to fit better in slides
              />
            </div>
          </ElementErrorBoundary>
        );
      
      default:
        return null;
    }
  }, [selectedElements, tool, handleElementClick, updateElement]);
  
  // Presentation Mode
  if (isPresenting) {
    return (
      <div className={`fixed inset-0 ${currentTheme.bg} ${currentTheme.text} flex items-center justify-center`}>
        <button
          onClick={() => setIsPresenting(false)}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors z-10"
        >
          Exit
        </button>
        
        <button
          onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
          className="absolute left-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors z-10"
          disabled={currentSlideIndex === 0}
        >
          ←
        </button>
        
        <button
          onClick={() => setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))}
          className="absolute right-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors z-10"
          disabled={currentSlideIndex === presentation.slides.length - 1}
        >
          →
        </button>
        
        <div className="relative w-full max-w-6xl h-[700px]">
          {currentSlide.elements.map(renderElement)}
        </div>
        
        <div className="absolute bottom-4 text-sm bg-black/50 px-4 py-2 rounded-full">
          {currentSlideIndex + 1} / {presentation.slides.length}
        </div>
      </div>
    );
  }
  
  // Main Interface
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Sidebar - Slides */}
      <div className="w-64 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">{presentation.title}</h2>
          <p className="text-sm text-gray-600">{presentation.slides.length} slides</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {presentation.slides.map((slide, index) => (
            <div
              key={slide.id}
              onClick={() => setCurrentSlideIndex(index)}
              className={`
                relative cursor-pointer rounded-lg p-2 transition-all border
                ${index === currentSlideIndex 
                  ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50 border-gray-200'
                }
              `}
            >
              <div className="text-sm font-medium mb-1">Slide {index + 1}</div>
              <div 
                className={`aspect-video rounded border overflow-hidden ${currentTheme.bg} ${currentTheme.slideClass}`}
                style={{ transform: 'scale(0.8)', transformOrigin: 'top left' }}
              >
                <div className="relative w-full h-full scale-[0.15] origin-top-left">
                  {slide.elements.map(el => (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: el.x,
                        top: el.y,
                        width: el.width,
                        height: el.height
                      }}
                    >
                      {el.type === 'text' && (
                        <div style={{ 
                          fontSize: el.fontSize, 
                          color: el.color,
                          fontWeight: el.fontWeight 
                        }}>
                          {el.content}
                        </div>
                      )}
                      {el.type === 'shape' && (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: el.fill,
                            borderRadius: el.shapeType === 'circle' ? '50%' : 0
                          }}
                        />
                      )}
                    </div>
                  ))}
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
          
          <div className="text-xs text-gray-500 mb-2">Templates:</div>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => addSlideFromTemplate('title')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            >
              Title
            </button>
            <button
              onClick={() => addSlideFromTemplate('codeSlide')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            >
              Code
            </button>
            <button
              onClick={() => addSlideFromTemplate('comparison')}
              className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
            >
              Compare
            </button>
          </div>
          
          <div className="flex gap-2 pt-2">
            <button
              onClick={duplicateSlide}
              className="flex-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
              title="Duplicate Slide"
            >
              <Copy className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={deleteSlide}
              disabled={presentation.slides.length === 1}
              className="flex-1 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm disabled:opacity-50"
              title="Delete Slide"
            >
              <Trash2 className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className={`${currentTheme.toolbar} shadow-sm border-b px-4 py-2`}>
          <div className="flex items-center gap-4 flex-wrap">
            {/* File operations */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              <button
                onClick={savePresentation}
                className="p-2 hover:bg-gray-100 rounded"
                title="Save Presentation (Ctrl+S)"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleManualSave}
                className="p-2 hover:bg-gray-100 rounded"
                title="Force Save Now"
              >
                <Save className="w-4 h-4 text-blue-600" />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 hover:bg-gray-100 rounded"
                title="Load Presentation"
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
              
              {/* Auto-save status - MARCUS PROTECTION */}
              <div className="flex items-center gap-2 ml-2">
                {(() => {
                  const statusDisplay = getAutoSaveStatusDisplay(autoSaveState.status, autoSaveState.lastSaveTime);
                  const timeAgo = formatTimeAgo(autoSaveState.lastSaveTime);
                  
                  return (
                    <div 
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusDisplay.className}`}
                      title={autoSaveState.lastSaveError || `Auto-save: ${statusDisplay.text}${timeAgo ? ` (${timeAgo})` : ''}`}
                    >
                      <span>{statusDisplay.icon}</span>
                      <span>{statusDisplay.text}</span>
                      {timeAgo && autoSaveState.status !== 'saving' && (
                        <span className="text-gray-500 ml-1">
                          {timeAgo}
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Edit operations */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              <button
                onClick={() => {
                  const state = undo();
                  if (state) setPresentation(state.state);
                }}
                disabled={!canUndo}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  const state = redo();
                  if (state) setPresentation(state.state);
                }}
                disabled={!canRedo}
                className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
            
            {/* Tools */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              <button
                onClick={() => setTool('select')}
                className={`p-2 rounded ${tool === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                title="Select Tool"
              >
                <Move className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('text')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Text"
              >
                <Type className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('shape')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Shape"
              >
                <Square className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('code')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('chart')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Chart"
              >
                <BarChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('table')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Table"
              >
                <Table className="w-4 h-4" />
              </button>
              <button
                onClick={() => addElement('flowDiagram')}
                className="p-2 hover:bg-gray-100 rounded"
                title="Add Flow Diagram"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* View controls */}
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-2 rounded ${showGrid ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                title="Toggle Grid"
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
            <div className="flex items-center gap-2 border-r border-gray-300 pr-4">
              {Object.entries(themes).map(([key, theme]) => (
                <button
                  key={key}
                  onClick={() => updatePresentation({ theme: key })}
                  className={`px-3 py-1 rounded text-sm ${
                    presentation.theme === key ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
            
            {/* Present button */}
            <button
              onClick={() => setIsPresenting(true)}
              className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Present
            </button>
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
                ${currentTheme.bg} ${currentTheme.text} ${currentTheme.slideClass}
                transition-all duration-300
              `}
              style={{
                width: 1024,
                height: 576,
                backgroundImage: showGrid ? `
                  repeating-linear-gradient(0deg, ${currentTheme.grid} 0px, transparent 1px, transparent 19px, ${currentTheme.grid} 20px),
                  repeating-linear-gradient(90deg, ${currentTheme.grid} 0px, transparent 1px, transparent 19px, ${currentTheme.grid} 20px)
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
          <div>
            Slide {currentSlideIndex + 1} of {presentation.slides.length}
            {selectedElements.size > 0 && (
              <span className="ml-4">
                {selectedElements.size} element{selectedElements.size !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span>Shortcuts: Ctrl+C/V (copy/paste), Ctrl+D (duplicate), Del (delete)</span>
            <div className="flex items-center gap-2">
              <span>Actions:</span>
              {selectedElements.size > 0 && (
                <>
                  <button
                    onClick={copySelectedElements}
                    className="px-2 py-1 bg-gray-100 rounded text-xs hover:bg-gray-200"
                  >
                    Copy
                  </button>
                  <button
                    onClick={deleteSelectedElements}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                  >
                    Delete
                  </button>
                </>
              )}
              {clipboard.length > 0 && (
                <button
                  onClick={pasteElements}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                >
                  Paste
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalSlideDeck;
