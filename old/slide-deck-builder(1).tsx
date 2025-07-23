import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Square, Circle, Triangle, Trash2, Move, Download, Play, ChevronLeft, ChevronRight, Copy, Palette, Code, BarChart, GitBranch, Table, Image, AlignLeft, AlignCenter, AlignRight, Grid3X3, FileText, Minus } from 'lucide-react';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const TechnicalSlideDeckBuilder = () => {
  const [slides, setSlides] = useState([{ id: 1, elements: [], gridEnabled: true }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPresenting, setIsPresenting] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [connectionStart, setConnectionStart] = useState(null);
  const canvasRef = useRef(null);

  const themes = {
    tech: {
      bg: 'bg-gradient-to-br from-gray-900 to-gray-800',
      text: 'text-white',
      accent: 'from-blue-500 to-cyan-600',
      code: 'bg-gray-950 text-green-400'
    },
    blueprint: {
      bg: 'bg-gradient-to-br from-blue-950 to-blue-900',
      text: 'text-white',
      accent: 'from-cyan-400 to-blue-500',
      code: 'bg-blue-950 text-cyan-300'
    },
    paper: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      text: 'text-gray-900',
      accent: 'from-gray-600 to-gray-800',
      code: 'bg-gray-100 text-gray-800'
    },
    dark: {
      bg: 'bg-black',
      text: 'text-green-400',
      accent: 'from-green-600 to-green-800',
      code: 'bg-gray-900 text-green-300'
    }
  };

  const [currentTheme, setCurrentTheme] = useState('tech');

  const slideTemplates = {
    title: () => [
      { id: Date.now(), type: 'text', x: 100, y: 200, width: 600, height: 80, content: 'Presentation Title', fontSize: 48, fontWeight: 'bold', textAlign: 'center' },
      { id: Date.now() + 1, type: 'text', x: 100, y: 300, width: 600, height: 40, content: 'Subtitle or Author Name', fontSize: 24, textAlign: 'center', color: '#94A3B8' }
    ],
    codeSlide: () => [
      { id: Date.now(), type: 'text', x: 50, y: 50, width: 400, height: 40, content: 'Code Example', fontSize: 32, fontWeight: 'bold' },
      { id: Date.now() + 1, type: 'code', x: 50, y: 120, width: 700, height: 400, content: '// Example code\nfunction calculate(data) {\n  return data.map(item => {\n    return item.value * 2;\n  });\n}', language: 'javascript' }
    ],
    comparison: () => [
      { id: Date.now(), type: 'text', x: 50, y: 50, width: 700, height: 40, content: 'Comparison', fontSize: 32, fontWeight: 'bold' },
      { id: Date.now() + 1, type: 'rectangle', x: 50, y: 120, width: 340, height: 400, color: '#1E40AF', opacity: 0.1 },
      { id: Date.now() + 2, type: 'rectangle', x: 410, y: 120, width: 340, height: 400, color: '#059669', opacity: 0.1 },
      { id: Date.now() + 3, type: 'text', x: 70, y: 140, width: 300, height: 30, content: 'Option A', fontSize: 24, fontWeight: 'bold' },
      { id: Date.now() + 4, type: 'text', x: 430, y: 140, width: 300, height: 30, content: 'Option B', fontSize: 24, fontWeight: 'bold' }
    ]
  };

  const snapToGrid = (value) => {
    if (!showGrid) return value;
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  };

  const addSlideFromTemplate = (template) => {
    const newSlide = { 
      id: slides.length + 1, 
      elements: slideTemplates[template](),
      gridEnabled: true 
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const addSlide = () => {
    const newSlide = { id: slides.length + 1, elements: [], gridEnabled: true };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const duplicateSlide = () => {
    const slideToDuplicate = slides[currentSlide];
    const newSlide = {
      id: slides.length + 1,
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: Date.now() + Math.random()
      })),
      gridEnabled: slideToDuplicate.gridEnabled
    };
    setSlides([...slides, newSlide]);
    setCurrentSlide(slides.length);
  };

  const deleteSlide = () => {
    if (slides.length > 1) {
      const newSlides = slides.filter((_, index) => index !== currentSlide);
      setSlides(newSlides);
      setCurrentSlide(Math.max(0, currentSlide - 1));
    }
  };

  const addElement = (type) => {
    const baseElement = {
      id: Date.now(),
      type,
      x: snapToGrid(200),
      y: snapToGrid(200),
      width: 200,
      height: 100,
      color: '#3B82F6',
      fontSize: 24,
      textAlign: 'left'
    };

    let newElement = { ...baseElement };

    switch (type) {
      case 'text':
        newElement = {
          ...baseElement,
          width: 400,
          height: 50,
          content: 'Click to edit text',
          fontWeight: 'normal'
        };
        break;
      case 'code':
        newElement = {
          ...baseElement,
          width: 600,
          height: 300,
          content: '// Write your code here\nconst example = "Hello World";',
          language: 'javascript'
        };
        break;
      case 'chart':
        newElement = {
          ...baseElement,
          width: 500,
          height: 300,
          chartType: 'line',
          data: [
            { name: 'Jan', value: 400 },
            { name: 'Feb', value: 300 },
            { name: 'Mar', value: 600 },
            { name: 'Apr', value: 800 },
            { name: 'May', value: 500 }
          ]
        };
        break;
      case 'table':
        newElement = {
          ...baseElement,
          width: 500,
          height: 200,
          rows: 3,
          cols: 3,
          data: [
            ['Header 1', 'Header 2', 'Header 3'],
            ['Data 1', 'Data 2', 'Data 3'],
            ['Data 4', 'Data 5', 'Data 6']
          ]
        };
        break;
      case 'connector':
        if (connectionStart) {
          newElement = {
            ...baseElement,
            startId: connectionStart,
            endId: null,
            startX: 0,
            startY: 0,
            endX: 100,
            endY: 100
          };
          setConnectionStart(null);
        } else {
          return;
        }
        break;
    }

    const updatedSlides = [...slides];
    updatedSlides[currentSlide].elements.push(newElement);
    setSlides(updatedSlides);
    setSelectedElement(newElement.id);
  };

  const updateElement = (elementId, updates) => {
    const updatedSlides = [...slides];
    const elementIndex = updatedSlides[currentSlide].elements.findIndex(el => el.id === elementId);
    if (elementIndex !== -1) {
      updatedSlides[currentSlide].elements[elementIndex] = {
        ...updatedSlides[currentSlide].elements[elementIndex],
        ...updates
      };
      setSlides(updatedSlides);
    }
  };

  const deleteElement = (elementId) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlide].elements = updatedSlides[currentSlide].elements.filter(el => el.id !== elementId);
    setSlides(updatedSlides);
    setSelectedElement(null);
  };

  const handleMouseDown = (e, elementId) => {
    if (tool === 'select') {
      setSelectedElement(elementId);
      setIsDragging(true);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    } else if (tool === 'connector') {
      if (!connectionStart) {
        setConnectionStart(elementId);
      } else {
        addElement('connector');
      }
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = snapToGrid(e.clientX - rect.left - dragOffset.x);
      const y = snapToGrid(e.clientY - rect.top - dragOffset.y);
      updateElement(selectedElement, { x, y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, selectedElement, dragOffset]);

  const renderElement = (element) => {
    const isSelected = selectedElement === element.id;
    
    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move p-2 ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              fontSize: `${element.fontSize}px`,
              color: element.color,
              fontWeight: element.fontWeight || 'normal',
              textAlign: element.textAlign || 'left'
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
              className="outline-none"
            >
              {element.content}
            </div>
          </div>
        );
      
      case 'code':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-400' : ''} ${themes[currentTheme].code} rounded-lg p-4 font-mono text-sm overflow-auto`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <div
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => updateElement(element.id, { content: e.target.innerText })}
              className="outline-none whitespace-pre"
            >
              {element.content}
            </div>
          </div>
        );
      
      case 'chart':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move bg-white/10 rounded-lg p-4 ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <ResponsiveContainer width="100%" height="100%">
              {element.chartType === 'line' ? (
                <LineChart data={element.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              ) : element.chartType === 'bar' ? (
                <RechartsBarChart data={element.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </RechartsBarChart>
              ) : (
                <PieChart>
                  <Pie
                    data={element.data}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#3B82F6"
                    dataKey="value"
                  >
                    {element.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'][index % 5]} />
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
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          >
            <table className="w-full h-full border-collapse">
              <tbody>
                {element.data.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td
                        key={colIndex}
                        className={`border border-gray-500 p-2 text-sm ${rowIndex === 0 ? 'font-bold bg-white/10' : ''}`}
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => {
                          const newData = [...element.data];
                          newData[rowIndex][colIndex] = e.target.innerText;
                          updateElement(element.id, { data: newData });
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
      
      case 'rectangle':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: element.color,
              opacity: element.opacity || 1
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
      
      case 'circle':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move rounded-full ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.width,
              backgroundColor: element.color
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
      
      case 'triangle':
        return (
          <div
            key={element.id}
            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
            style={{
              left: element.x,
              top: element.y,
              width: 0,
              height: 0,
              borderLeft: `${element.width/2}px solid transparent`,
              borderRight: `${element.width/2}px solid transparent`,
              borderBottom: `${element.height}px solid ${element.color}`
            }}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
          />
        );
      
      default:
        return null;
    }
  };

  const PresentationView = () => (
    <div className={`fixed inset-0 ${themes[currentTheme].bg} ${themes[currentTheme].text} flex items-center justify-center`}>
      <button
        onClick={() => setIsPresenting(false)}
        className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        Exit
      </button>
      
      <button
        onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
        className="absolute left-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        disabled={currentSlide === 0}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
        className="absolute right-4 p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        disabled={currentSlide === slides.length - 1}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
      
      <div className="relative w-full max-w-6xl h-[700px]">
        {slides[currentSlide].elements.map(renderElement)}
      </div>
      
      <div className="absolute bottom-4 text-sm bg-black/50 px-4 py-2 rounded-full">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  );

  if (isPresenting) {
    return <PresentationView />;
  }

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-72 bg-gray-800 shadow-xl p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-white">Slides</h2>
        
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`mb-2 p-3 rounded-lg cursor-pointer transition-all ${
              currentSlide === index ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            <div className="text-sm font-medium text-white">Slide {index + 1}</div>
            <div className={`mt-1 h-20 rounded ${themes[currentTheme].bg} relative overflow-hidden`}>
              {slide.elements.map(el => (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x * 0.12}px`,
                    top: `${el.y * 0.12}px`,
                    transform: 'scale(0.12)',
                    transformOrigin: 'top left'
                  }}
                >
                  {el.type === 'text' && (
                    <div style={{ fontSize: el.fontSize, color: el.color }}>{el.content}</div>
                  )}
                  {(el.type === 'rectangle' || el.type === 'circle') && (
                    <div
                      style={{
                        width: el.width,
                        height: el.height,
                        backgroundColor: el.color,
                        borderRadius: el.type === 'circle' ? '50%' : 0
                      }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        
        <div className="mt-4 space-y-2">
          <button
            onClick={addSlide}
            className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Blank Slide
          </button>
          
          <div className="text-xs text-gray-400 mt-4 mb-2">Templates:</div>
          <button
            onClick={() => addSlideFromTemplate('title')}
            className="w-full p-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
          >
            Title Slide
          </button>
          <button
            onClick={() => addSlideFromTemplate('codeSlide')}
            className="w-full p-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
          >
            Code Example
          </button>
          <button
            onClick={() => addSlideFromTemplate('comparison')}
            className="w-full p-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
          >
            Comparison
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-800 shadow-sm p-4 flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 border-r border-gray-600 pr-4">
            <button
              onClick={() => setTool('select')}
              className={`p-2 rounded text-white ${tool === 'select' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              title="Select"
            >
              <Move className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('text')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Text"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('code')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Code Block"
            >
              <Code className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('chart')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Chart"
            >
              <BarChart className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('table')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Table"
            >
              <Table className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('rectangle')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Rectangle"
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('circle')}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Circle"
            >
              <Circle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 border-r border-gray-600 pr-4">
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded text-white ${showGrid ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
              title="Toggle Grid"
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={duplicateSlide}
              className="p-2 rounded text-white hover:bg-gray-700"
              title="Duplicate Slide"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={deleteSlide}
              className="p-2 rounded hover:bg-gray-700 text-red-400"
              title="Delete Slide"
              disabled={slides.length === 1}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {Object.keys(themes).map(theme => (
              <button
                key={theme}
                onClick={() => setCurrentTheme(theme)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  currentTheme === theme ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
          
          {selectedElement && (
            <div className="flex items-center gap-2 ml-auto">
              {slides[currentSlide].elements.find(el => el.id === selectedElement)?.type === 'text' && (
                <>
                  <button
                    onClick={() => updateElement(selectedElement, { textAlign: 'left' })}
                    className="p-2 rounded text-white hover:bg-gray-700"
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement, { textAlign: 'center' })}
                    className="p-2 rounded text-white hover:bg-gray-700"
                  >
                    <AlignCenter className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateElement(selectedElement, { textAlign: 'right' })}
                    className="p-2 rounded text-white hover:bg-gray-700"
                  >
                    <AlignRight className="w-4 h-4" />
                  </button>
                  <select
                    value={slides[currentSlide].elements.find(el => el.id === selectedElement)?.fontSize || 24}
                    onChange={(e) => updateElement(selectedElement, { fontSize: parseInt(e.target.value) })}
                    className="px-2 py-1 rounded bg-gray-700 text-white"
                  >
                    <option value="16">16px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                    <option value="32">32px</option>
                    <option value="48">48px</option>
                    <option value="64">64px</option>
                  </select>
                </>
              )}
              <input
                type="color"
                value={slides[currentSlide].elements.find(el => el.id === selectedElement)?.color || '#3B82F6'}
                onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <button
                onClick={() => deleteElement(selectedElement)}
                className="p-2 rounded hover:bg-gray-700 text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsPresenting(true)}
            className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Present
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto bg-gray-850">
          <div
            ref={canvasRef}
            className={`relative mx-auto w-full max-w-5xl h-[700px] ${themes[currentTheme].bg} ${themes[currentTheme].text} rounded-lg shadow-2xl overflow-hidden`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
            style={{
              backgroundImage: showGrid ? `
                repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 19px, rgba(255,255,255,0.03) 20px),
                repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, transparent 1px, transparent 19px, rgba(255,255,255,0.03) 20px)
              ` : 'none'
            }}
          >
            {slides[currentSlide].elements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalSlideDeckBuilder;