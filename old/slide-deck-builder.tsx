import React, { useState, useRef, useEffect } from 'react';
import { Plus, Type, Square, Circle, Triangle, Trash2, Move, Download, Play, ChevronLeft, ChevronRight, Copy, Palette } from 'lucide-react';

const SlideDeckBuilder = () => {
  const [slides, setSlides] = useState([{ id: 1, elements: [] }]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedElement, setSelectedElement] = useState(null);
  const [tool, setTool] = useState('select');
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPresenting, setIsPresenting] = useState(false);
  const canvasRef = useRef(null);

  const themes = {
    modern: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-800',
      text: 'text-white',
      accent: 'from-blue-500 to-purple-600'
    },
    vibrant: {
      bg: 'bg-gradient-to-br from-purple-600 to-pink-600',
      text: 'text-white',
      accent: 'from-yellow-400 to-orange-500'
    },
    minimal: {
      bg: 'bg-white',
      text: 'text-gray-900',
      accent: 'from-gray-400 to-gray-600'
    }
  };

  const [currentTheme, setCurrentTheme] = useState('modern');

  const addSlide = () => {
    const newSlide = { id: slides.length + 1, elements: [] };
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
      }))
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
    const newElement = {
      id: Date.now(),
      type,
      x: 100,
      y: 100,
      width: type === 'text' ? 300 : 100,
      height: type === 'text' ? 50 : 100,
      content: type === 'text' ? 'Click to edit text' : '',
      color: '#3B82F6',
      fontSize: 24
    };

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
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && selectedElement && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - dragOffset.x;
      const y = e.clientY - rect.top - dragOffset.y;
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
              color: element.color
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
              backgroundColor: element.color
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

  if (isPresenting) {
    return (
      <div className={`fixed inset-0 ${themes[currentTheme].bg} ${themes[currentTheme].text} flex items-center justify-center`}>
        <button
          onClick={() => setIsPresenting(false)}
          className="absolute top-4 right-4 p-2 bg-white/10 rounded-lg hover:bg-white/20"
        >
          Exit
        </button>
        
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          className="absolute left-4 p-3 bg-white/10 rounded-lg hover:bg-white/20"
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          className="absolute right-4 p-3 bg-white/10 rounded-lg hover:bg-white/20"
          disabled={currentSlide === slides.length - 1}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
        
        <div className="relative w-full max-w-5xl h-[600px]">
          {slides[currentSlide].elements.map(renderElement)}
        </div>
        
        <div className="absolute bottom-4 text-sm">
          {currentSlide + 1} / {slides.length}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Slides</h2>
        
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => setCurrentSlide(index)}
            className={`mb-2 p-3 rounded-lg cursor-pointer transition-all ${
              currentSlide === index ? 'bg-blue-100 ring-2 ring-blue-400' : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="text-sm font-medium">Slide {index + 1}</div>
            <div className={`mt-1 h-16 rounded ${themes[currentTheme].bg} relative overflow-hidden`}>
              {slide.elements.map(el => (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: `${el.x * 0.15}px`,
                    top: `${el.y * 0.15}px`,
                    transform: 'scale(0.15)',
                    transformOrigin: 'top left'
                  }}
                >
                  {el.type === 'text' ? (
                    <div style={{ fontSize: el.fontSize, color: el.color }}>{el.content}</div>
                  ) : (
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
        
        <button
          onClick={addSlide}
          className="w-full mt-4 p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Slide
        </button>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white shadow-sm p-4 flex items-center gap-4">
          <div className="flex items-center gap-2 border-r pr-4">
            <button
              onClick={() => setTool('select')}
              className={`p-2 rounded ${tool === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              <Move className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('text')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Type className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('rectangle')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Square className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('circle')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Circle className="w-5 h-5" />
            </button>
            <button
              onClick={() => addElement('triangle')}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Triangle className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 border-r pr-4">
            <button
              onClick={duplicateSlide}
              className="p-2 rounded hover:bg-gray-100"
              title="Duplicate Slide"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={deleteSlide}
              className="p-2 rounded hover:bg-gray-100 text-red-500"
              title="Delete Slide"
              disabled={slides.length === 1}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentTheme('modern')}
              className={`px-3 py-1 rounded text-sm ${currentTheme === 'modern' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              Modern
            </button>
            <button
              onClick={() => setCurrentTheme('vibrant')}
              className={`px-3 py-1 rounded text-sm ${currentTheme === 'vibrant' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              Vibrant
            </button>
            <button
              onClick={() => setCurrentTheme('minimal')}
              className={`px-3 py-1 rounded text-sm ${currentTheme === 'minimal' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            >
              Minimal
            </button>
          </div>
          
          {selectedElement && (
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="color"
                value={slides[currentSlide].elements.find(el => el.id === selectedElement)?.color || '#3B82F6'}
                onChange={(e) => updateElement(selectedElement, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer"
              />
              <button
                onClick={() => deleteElement(selectedElement)}
                className="p-2 rounded hover:bg-gray-100 text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
          
          <button
            onClick={() => setIsPresenting(true)}
            className="ml-auto px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Present
          </button>
        </div>

        {/* Canvas */}
        <div className="flex-1 p-8 overflow-auto">
          <div
            ref={canvasRef}
            className={`relative mx-auto w-full max-w-4xl h-[600px] ${themes[currentTheme].bg} ${themes[currentTheme].text} rounded-lg shadow-2xl overflow-hidden`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedElement(null);
              }
            }}
          >
            {slides[currentSlide].elements.map(renderElement)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlideDeckBuilder;