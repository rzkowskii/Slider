import React, { useState, useEffect } from 'react';
import { Monitor, Tablet, Smartphone, Menu, X, Maximize2, Grid, Layers, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

// Custom hook for responsive design
const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  const [device, setDevice] = useState('desktop');
  const [orientation, setOrientation] = useState('landscape');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({ width, height });
      setOrientation(width > height ? 'landscape' : 'portrait');
      
      // Determine device type
      if (width < 640) {
        setDevice('mobile');
      } else if (width < 1024) {
        setDevice('tablet');
      } else {
        setDevice('desktop');
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);
  
  return { screenSize, device, orientation };
};

// Touch-friendly toolbar
const TouchToolbar = ({ tools, selectedTool, onSelectTool }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Collapsed view for mobile */}
      <div className="md:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 flex items-center justify-between"
        >
          <span className="font-medium">Tools</span>
          <Menu className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </button>
        
        {isExpanded && (
          <div className="grid grid-cols-4 gap-2 p-4 border-t">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  onSelectTool(tool.id);
                  setIsExpanded(false);
                }}
                className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                  selectedTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <tool.icon className="w-6 h-6" />
                <span className="text-xs">{tool.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Expanded view for tablet/desktop */}
      <div className="hidden md:flex items-center gap-2 p-3">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className={`p-3 rounded-lg flex items-center gap-2 ${
              selectedTool === tool.id ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
          >
            <tool.icon className="w-5 h-5" />
            <span className="hidden lg:inline text-sm">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Swipeable slide navigator
const SwipeableSlides = ({ slides, currentSlide, onSelectSlide }) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe && currentSlide < slides.length - 1) {
      onSelectSlide(currentSlide + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      onSelectSlide(currentSlide - 1);
    }
  };
  
  return (
    <div
      className="relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div 
        className="flex transition-transform duration-300"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={slide.id} className="w-full flex-shrink-0 p-4">
            <div
              onClick={() => onSelectSlide(index)}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer ${
                index === currentSlide ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="text-sm font-medium mb-2">Slide {index + 1}</div>
              <div className="aspect-video bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-400">{slide.title}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Slide indicators */}
      <div className="flex justify-center gap-1 mt-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => onSelectSlide(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentSlide ? 'bg-blue-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Responsive canvas
const ResponsiveCanvas = ({ device, elements }) => {
  const [zoom, setZoom] = useState(1);
  const [isPinching, setIsPinching] = useState(false);
  const [initialPinchDistance, setInitialPinchDistance] = useState(0);
  
  // Handle pinch zoom
  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      setIsPinching(true);
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setInitialPinchDistance(distance);
    }
  };
  
  const handleTouchMove = (e) => {
    if (isPinching && e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const scale = distance / initialPinchDistance;
      setZoom(Math.min(Math.max(0.5, scale), 3));
    }
  };
  
  const handleTouchEnd = () => {
    setIsPinching(false);
  };
  
  const canvasSize = {
    desktop: { width: 800, height: 600 },
    tablet: { width: 600, height: 450 },
    mobile: { width: 320, height: 240 }
  };
  
  const size = canvasSize[device];
  
  return (
    <div className="relative overflow-auto bg-gray-100 rounded-lg">
      <div className="p-4">
        {/* Zoom controls */}
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(3, zoom + 0.25))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div
          className="relative bg-white shadow-lg mx-auto transition-transform"
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'center'
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Grid background */}
          <div className="absolute inset-0 opacity-5">
            <Grid className="w-full h-full" />
          </div>
          
          {/* Canvas elements */}
          {elements.map(element => (
            <div
              key={element.id}
              className="absolute p-2 bg-blue-100 border-2 border-blue-300 rounded"
              style={{
                left: element.x * (size.width / 800),
                top: element.y * (size.height / 600),
                width: element.width * (size.width / 800),
                height: element.height * (size.height / 600)
              }}
            >
              <span className="text-xs">{element.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main responsive app
const ResponsiveApp = () => {
  const { screenSize, device, orientation } = useResponsive();
  const [selectedTool, setSelectedTool] = useState('select');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(device === 'desktop');
  const [previewDevice, setPreviewDevice] = useState('auto');
  
  const tools = [
    { id: 'select', icon: Maximize2, label: 'Select' },
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'grid', icon: Grid, label: 'Grid' }
  ];
  
  const slides = [
    { id: 1, title: 'Welcome Slide' },
    { id: 2, title: 'Content Slide' },
    { id: 3, title: 'Thank You' }
  ];
  
  const elements = [
    { id: 1, type: 'text', x: 100, y: 100, width: 200, height: 50 },
    { id: 2, type: 'shape', x: 350, y: 200, width: 150, height: 150 }
  ];
  
  const deviceForPreview = previewDevice === 'auto' ? device : previewDevice;
  
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            {/* Menu toggle for mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <h1 className="text-lg font-semibold">Responsive Slide Builder</h1>
          </div>
          
          {/* Device info */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
              <span>{device === 'mobile' ? <Smartphone className="w-4 h-4" /> : device === 'tablet' ? <Tablet className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}</span>
              <span className="capitalize">{device}</span>
              <span>•</span>
              <span>{screenSize.width} × {screenSize.height}</span>
              <span>•</span>
              <span className="capitalize">{orientation}</span>
            </div>
            
            {/* Device preview selector */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-white shadow-sm' : ''}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-white shadow-sm' : ''}`}
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-white shadow-sm' : ''}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 fixed lg:relative z-20 lg:z-0
          w-64 h-full bg-white shadow-lg
          transition-transform duration-300
        `}>
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Slides</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          {/* Slides list - different view for mobile */}
          <div className="p-4">
            {device === 'mobile' ? (
              <SwipeableSlides
                slides={slides}
                currentSlide={currentSlide}
                onSelectSlide={setCurrentSlide}
              />
            ) : (
              <div className="space-y-2">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    onClick={() => setCurrentSlide(index)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      index === currentSlide ? 'bg-blue-100' : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-sm font-medium">Slide {index + 1}</div>
                    <div className="text-xs text-gray-600">{slide.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
        
        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && device !== 'desktop' && (
          <div
            className="fixed inset-0 bg-black/50 z-10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="p-4">
            <TouchToolbar
              tools={tools}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </div>
          
          {/* Canvas */}
          <div className="flex-1 p-4 overflow-auto">
            <ResponsiveCanvas
              device={deviceForPreview}
              elements={elements}
            />
          </div>
          
          {/* Mobile bottom navigation */}
          {device === 'mobile' && (
            <div className="bg-white border-t p-4">
              <div className="flex justify-around">
                <button className="p-2">
                  <Layers className="w-5 h-5" />
                </button>
                <button className="p-2">
                  <Grid className="w-5 h-5" />
                </button>
                <button className="p-2">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Minus icon component
const Minus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

// Plus icon component
const Plus = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

// Type icon component
const Type = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default ResponsiveApp;