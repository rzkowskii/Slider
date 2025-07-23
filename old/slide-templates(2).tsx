import React, { useState } from 'react';
import { Layout, FileText, List, Grid, BarChart2, Users, Calendar, Quote, Camera, Play, Monitor, Code } from 'lucide-react';

// Template definitions
const templateCategories = {
  basic: {
    name: 'Basic Layouts',
    icon: Layout,
    templates: [
      {
        id: 'title-slide',
        name: 'Title Slide',
        preview: '🎯',
        elements: [
          { type: 'text', content: 'Your Title Here', x: 100, y: 200, width: 600, height: 80, fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'text', content: 'Subtitle or Author Name', x: 100, y: 300, width: 600, height: 40, fontSize: 24, textAlign: 'center', color: '#6B7280' },
          { type: 'text', content: new Date().toLocaleDateString(), x: 100, y: 450, width: 600, height: 30, fontSize: 18, textAlign: 'center', color: '#9CA3AF' }
        ]
      },
      {
        id: 'section-header',
        name: 'Section Header',
        preview: '📑',
        elements: [
          { type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 800, height: 200, color: '#3B82F6' },
          { type: 'text', content: 'Section Title', x: 50, y: 80, width: 700, height: 60, fontSize: 42, fontWeight: 'bold', textAlign: 'center', color: '#FFFFFF' },
          { type: 'text', content: 'Brief description of this section', x: 100, y: 300, width: 600, height: 40, fontSize: 20, textAlign: 'center', color: '#6B7280' }
        ]
      },
      {
        id: 'content-slide',
        name: 'Content Slide',
        preview: '📝',
        elements: [
          { type: 'text', content: 'Slide Title', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 110, width: 200, height: 3, color: '#3B82F6' },
          { type: 'text', content: '• First point goes here\n• Second point goes here\n• Third point goes here\n• Fourth point goes here', x: 50, y: 150, width: 700, height: 300, fontSize: 20, color: '#374151' }
        ]
      }
    ]
  },
  presentation: {
    name: 'Presentation',
    icon: Monitor,
    templates: [
      {
        id: 'two-column',
        name: 'Two Column',
        preview: '⬜⬜',
        elements: [
          { type: 'text', content: 'Two Column Layout', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 120, width: 350, height: 380, color: '#F3F4F6' },
          { type: 'shape', shapeType: 'rectangle', x: 420, y: 120, width: 350, height: 380, color: '#F3F4F6' },
          { type: 'text', content: 'Left Column', x: 70, y: 140, width: 310, height: 40, fontSize: 24, fontWeight: 'bold', color: '#374151' },
          { type: 'text', content: 'Right Column', x: 440, y: 140, width: 310, height: 40, fontSize: 24, fontWeight: 'bold', color: '#374151' }
        ]
      },
      {
        id: 'comparison',
        name: 'Comparison',
        preview: '⚖️',
        elements: [
          { type: 'text', content: 'Comparison', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 150, width: 350, height: 350, color: '#DBEAFE' },
          { type: 'shape', shapeType: 'rectangle', x: 420, y: 150, width: 350, height: 350, color: '#D1FAE5' },
          { type: 'text', content: 'Option A', x: 70, y: 170, width: 310, height: 40, fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#1E40AF' },
          { type: 'text', content: 'Option B', x: 440, y: 170, width: 310, height: 40, fontSize: 28, fontWeight: 'bold', textAlign: 'center', color: '#059669' },
          { type: 'shape', shapeType: 'circle', x: 200, y: 300, width: 50, height: 50, color: '#3B82F6' },
          { type: 'shape', shapeType: 'circle', x: 570, y: 300, width: 50, height: 50, color: '#10B981' }
        ]
      },
      {
        id: 'timeline',
        name: 'Timeline',
        preview: '📅',
        elements: [
          { type: 'text', content: 'Project Timeline', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 100, y: 300, width: 600, height: 4, color: '#6B7280' },
          { type: 'shape', shapeType: 'circle', x: 100, y: 285, width: 30, height: 30, color: '#3B82F6' },
          { type: 'shape', shapeType: 'circle', x: 300, y: 285, width: 30, height: 30, color: '#8B5CF6' },
          { type: 'shape', shapeType: 'circle', x: 500, y: 285, width: 30, height: 30, color: '#10B981' },
          { type: 'shape', shapeType: 'circle', x: 700, y: 285, width: 30, height: 30, color: '#F59E0B' },
          { type: 'text', content: 'Phase 1', x: 75, y: 250, width: 80, height: 30, fontSize: 16, textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'Phase 2', x: 275, y: 250, width: 80, height: 30, fontSize: 16, textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'Phase 3', x: 475, y: 250, width: 80, height: 30, fontSize: 16, textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'Complete', x: 675, y: 250, width: 80, height: 30, fontSize: 16, textAlign: 'center', color: '#374151' }
        ]
      }
    ]
  },
  business: {
    name: 'Business',
    icon: BarChart2,
    templates: [
      {
        id: 'swot',
        name: 'SWOT Analysis',
        preview: '🎯',
        elements: [
          { type: 'text', content: 'SWOT Analysis', x: 50, y: 30, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 100, width: 350, height: 200, color: '#DBEAFE' },
          { type: 'shape', shapeType: 'rectangle', x: 420, y: 100, width: 350, height: 200, color: '#D1FAE5' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 320, width: 350, height: 200, color: '#FEF3C7' },
          { type: 'shape', shapeType: 'rectangle', x: 420, y: 320, width: 350, height: 200, color: '#FEE2E2' },
          { type: 'text', content: 'Strengths', x: 70, y: 120, width: 310, height: 30, fontSize: 24, fontWeight: 'bold', color: '#1E40AF' },
          { type: 'text', content: 'Weaknesses', x: 440, y: 120, width: 310, height: 30, fontSize: 24, fontWeight: 'bold', color: '#059669' },
          { type: 'text', content: 'Opportunities', x: 70, y: 340, width: 310, height: 30, fontSize: 24, fontWeight: 'bold', color: '#D97706' },
          { type: 'text', content: 'Threats', x: 440, y: 340, width: 310, height: 30, fontSize: 24, fontWeight: 'bold', color: '#DC2626' }
        ]
      },
      {
        id: 'metrics',
        name: 'Key Metrics',
        preview: '📊',
        elements: [
          { type: 'text', content: 'Key Performance Metrics', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 150, width: 220, height: 150, color: '#EDE9FE' },
          { type: 'shape', shapeType: 'rectangle', x: 290, y: 150, width: 220, height: 150, color: '#DBEAFE' },
          { type: 'shape', shapeType: 'rectangle', x: 530, y: 150, width: 220, height: 150, color: '#D1FAE5' },
          { type: 'text', content: '87%', x: 50, y: 180, width: 220, height: 60, fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#7C3AED' },
          { type: 'text', content: '$1.2M', x: 290, y: 180, width: 220, height: 60, fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#3B82F6' },
          { type: 'text', content: '+45%', x: 530, y: 180, width: 220, height: 60, fontSize: 48, fontWeight: 'bold', textAlign: 'center', color: '#10B981' },
          { type: 'text', content: 'Customer Satisfaction', x: 50, y: 260, width: 220, height: 30, fontSize: 16, textAlign: 'center', color: '#6B7280' },
          { type: 'text', content: 'Revenue', x: 290, y: 260, width: 220, height: 30, fontSize: 16, textAlign: 'center', color: '#6B7280' },
          { type: 'text', content: 'Growth Rate', x: 530, y: 260, width: 220, height: 30, fontSize: 16, textAlign: 'center', color: '#6B7280' }
        ]
      },
      {
        id: 'team',
        name: 'Team Introduction',
        preview: '👥',
        elements: [
          { type: 'text', content: 'Meet Our Team', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'shape', shapeType: 'circle', x: 125, y: 150, width: 100, height: 100, color: '#E5E7EB' },
          { type: 'shape', shapeType: 'circle', x: 350, y: 150, width: 100, height: 100, color: '#E5E7EB' },
          { type: 'shape', shapeType: 'circle', x: 575, y: 150, width: 100, height: 100, color: '#E5E7EB' },
          { type: 'text', content: 'Alice Johnson', x: 75, y: 270, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'Bob Smith', x: 300, y: 270, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'Carol Davis', x: 525, y: 270, width: 200, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#374151' },
          { type: 'text', content: 'CEO', x: 75, y: 300, width: 200, height: 25, fontSize: 16, textAlign: 'center', color: '#6B7280' },
          { type: 'text', content: 'CTO', x: 300, y: 300, width: 200, height: 25, fontSize: 16, textAlign: 'center', color: '#6B7280' },
          { type: 'text', content: 'CFO', x: 525, y: 300, width: 200, height: 25, fontSize: 16, textAlign: 'center', color: '#6B7280' }
        ]
      }
    ]
  },
  technical: {
    name: 'Technical',
    icon: Code,
    templates: [
      {
        id: 'code-explanation',
        name: 'Code + Explanation',
        preview: '💻',
        elements: [
          { type: 'text', content: 'Code Example', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 120, width: 400, height: 380, color: '#1F2937' },
          { type: 'code', content: 'function fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n - 1) + fibonacci(n - 2);\n}\n\n// Example usage\nconsole.log(fibonacci(10)); // 55', x: 60, y: 130, width: 380, height: 360, language: 'javascript' },
          { type: 'shape', shapeType: 'rectangle', x: 470, y: 120, width: 300, height: 380, color: '#F3F4F6' },
          { type: 'text', content: 'Key Points:', x: 490, y: 140, width: 260, height: 30, fontSize: 20, fontWeight: 'bold', color: '#374151' },
          { type: 'text', content: '• Recursive solution\n• Base case: n ≤ 1\n• Time: O(2^n)\n• Space: O(n)', x: 490, y: 180, width: 260, height: 200, fontSize: 18, color: '#6B7280' }
        ]
      },
      {
        id: 'architecture',
        name: 'System Architecture',
        preview: '🏗️',
        elements: [
          { type: 'text', content: 'System Architecture', x: 50, y: 30, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', textAlign: 'center', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 100, y: 120, width: 150, height: 80, color: '#DBEAFE' },
          { type: 'shape', shapeType: 'rectangle', x: 325, y: 120, width: 150, height: 80, color: '#D1FAE5' },
          { type: 'shape', shapeType: 'rectangle', x: 550, y: 120, width: 150, height: 80, color: '#FEF3C7' },
          { type: 'text', content: 'Frontend', x: 100, y: 150, width: 150, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#1E40AF' },
          { type: 'text', content: 'API', x: 325, y: 150, width: 150, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#059669' },
          { type: 'text', content: 'Database', x: 550, y: 150, width: 150, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#D97706' },
          { type: 'shape', shapeType: 'rectangle', x: 250, y: 158, width: 75, height: 4, color: '#6B7280' },
          { type: 'shape', shapeType: 'rectangle', x: 475, y: 158, width: 75, height: 4, color: '#6B7280' }
        ]
      },
      {
        id: 'api-docs',
        name: 'API Documentation',
        preview: '📡',
        elements: [
          { type: 'text', content: 'API Endpoint', x: 50, y: 50, width: 700, height: 50, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 120, width: 100, height: 40, color: '#10B981' },
          { type: 'text', content: 'GET', x: 50, y: 128, width: 100, height: 30, fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: '#FFFFFF' },
          { type: 'text', content: '/api/users/:id', x: 170, y: 128, width: 300, height: 30, fontSize: 20, fontFamily: 'monospace', color: '#374151' },
          { type: 'text', content: 'Response:', x: 50, y: 200, width: 150, height: 30, fontSize: 20, fontWeight: 'bold', color: '#374151' },
          { type: 'shape', shapeType: 'rectangle', x: 50, y: 240, width: 700, height: 200, color: '#F3F4F6' },
          { type: 'code', content: '{\n  "id": "123",\n  "name": "John Doe",\n  "email": "john@example.com",\n  "created_at": "2024-01-15"\n}', x: 60, y: 250, width: 680, height: 180, language: 'json' }
        ]
      }
    ]
  },
  creative: {
    name: 'Creative',
    icon: Camera,
    templates: [
      {
        id: 'quote',
        name: 'Quote Slide',
        preview: '💬',
        elements: [
          { type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 800, height: 600, color: '#1F2937' },
          { type: 'text', content: '"', x: 100, y: 150, width: 100, height: 100, fontSize: 120, color: '#3B82F6' },
          { type: 'text', content: 'The only way to do great work is to love what you do.', x: 100, y: 250, width: 600, height: 80, fontSize: 32, fontStyle: 'italic', textAlign: 'center', color: '#FFFFFF' },
          { type: 'text', content: '— Steve Jobs', x: 100, y: 380, width: 600, height: 40, fontSize: 24, textAlign: 'center', color: '#9CA3AF' }
        ]
      },
      {
        id: 'image-text',
        name: 'Image + Text',
        preview: '🖼️',
        elements: [
          { type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 400, height: 600, color: '#E5E7EB' },
          { type: 'text', content: 'Bold Statement', x: 450, y: 200, width: 300, height: 60, fontSize: 36, fontWeight: 'bold', color: '#1F2937' },
          { type: 'text', content: 'Supporting text that provides context and additional information about the main topic.', x: 450, y: 280, width: 300, height: 100, fontSize: 18, color: '#6B7280' }
        ]
      },
      {
        id: 'thank-you',
        name: 'Thank You',
        preview: '🙏',
        elements: [
          { type: 'shape', shapeType: 'rectangle', x: 0, y: 0, width: 800, height: 600, color: '#3B82F6' },
          { type: 'text', content: 'Thank You!', x: 100, y: 200, width: 600, height: 80, fontSize: 64, fontWeight: 'bold', textAlign: 'center', color: '#FFFFFF' },
          { type: 'text', content: 'Questions?', x: 100, y: 320, width: 600, height: 50, fontSize: 32, textAlign: 'center', color: '#DBEAFE' },
          { type: 'text', content: 'contact@example.com', x: 100, y: 450, width: 600, height: 30, fontSize: 20, textAlign: 'center', color: '#93C5FD' }
        ]
      }
    ]
  }
};

// Template System Component
const TemplateSystem = () => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [currentSlide, setCurrentSlide] = useState({
    elements: []
  });
  const [selectedElement, setSelectedElement] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);

  // Apply template to current slide
  const applyTemplate = (template) => {
    // Clone template elements with unique IDs
    const newElements = template.elements.map((element, index) => ({
      ...element,
      id: `${Date.now()}-${index}`,
      // Add default values for missing properties
      shapeType: element.shapeType || 'rectangle',
      fontFamily: element.fontFamily || 'Arial, sans-serif',
      fontStyle: element.fontStyle || 'normal',
      textAlign: element.textAlign || 'left',
      language: element.language || 'javascript'
    }));
    
    setCurrentSlide({
      elements: newElements,
      templateId: template.id,
      templateName: template.name
    });
    setSelectedElement(null);
  };

  // Render element based on type
  const renderElement = (element, isPreview = false) => {
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: isPreview ? 'default' : 'pointer',
      transition: 'all 0.2s ease'
    };

    const isSelected = !isPreview && selectedElement === element.id;

    switch (element.type) {
      case 'text':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              fontSize: element.fontSize,
              fontWeight: element.fontWeight || 'normal',
              fontStyle: element.fontStyle || 'normal',
              fontFamily: element.fontFamily,
              color: element.color,
              textAlign: element.textAlign,
              display: 'flex',
              alignItems: 'center',
              justifyContent: element.textAlign === 'center' ? 'center' : 'flex-start',
              padding: '8px',
              outline: isSelected ? '2px solid #3B82F6' : 'none',
              outlineOffset: '2px',
              whiteSpace: 'pre-wrap'
            }}
            onClick={() => !isPreview && setSelectedElement(element.id)}
          >
            {element.content}
          </div>
        );

      case 'shape':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: element.color,
              borderRadius: element.shapeType === 'circle' ? '50%' : '0',
              outline: isSelected ? '2px solid #3B82F6' : 'none',
              outlineOffset: '2px'
            }}
            onClick={() => !isPreview && setSelectedElement(element.id)}
          />
        );

      case 'code':
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              backgroundColor: '#1F2937',
              color: '#10B981',
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '16px',
              overflow: 'auto',
              borderRadius: '8px',
              outline: isSelected ? '2px solid #3B82F6' : 'none',
              outlineOffset: '2px'
            }}
            onClick={() => !isPreview && setSelectedElement(element.id)}
          >
            <pre style={{ margin: 0 }}>{element.content}</pre>
          </div>
        );

      default:
        return null;
    }
  };

  // Clear slide
  const clearSlide = () => {
    setCurrentSlide({ elements: [] });
    setSelectedElement(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Template Sidebar */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="w-6 h-6" />
            Slide Templates
          </h2>
          <p className="text-sm text-gray-600 mt-1">Choose a template to get started quickly</p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto border-b">
          {Object.entries(templateCategories).map(([key, category]) => {
            const Icon = category.icon;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`
                  flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                  transition-colors border-b-2
                  ${selectedCategory === key 
                    ? 'text-blue-600 border-blue-600 bg-blue-50' 
                    : 'text-gray-600 border-transparent hover:bg-gray-50'}
                `}
              >
                <Icon className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Template List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            {templateCategories[selectedCategory].templates.map(template => (
              <div
                key={template.id}
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setPreviewTemplate(template)}
              >
                <div className="bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{template.name}</h3>
                    <span className="text-2xl">{template.preview}</span>
                  </div>
                  
                  {/* Mini Preview */}
                  <div className="relative bg-white border rounded" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 transform scale-[0.2] origin-top-left" style={{ width: '500%', height: '500%' }}>
                      <div className="relative w-[800px] h-[600px]">
                        {template.elements.map((element, index) => 
                          renderElement({ ...element, id: `preview-${template.id}-${index}` }, true)
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 bg-white border-t">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      applyTemplate(template);
                    }}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Canvas</h3>
            {currentSlide.templateName && (
              <p className="text-sm text-gray-600">Template: {currentSlide.templateName}</p>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={clearSlide}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
            >
              Clear Slide
            </button>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-8">
          <div 
            className="relative mx-auto bg-white shadow-xl"
            style={{ width: 800, height: 600 }}
            onClick={() => setSelectedElement(null)}
          >
            {currentSlide.elements.map(element => renderElement(element))}
            
            {currentSlide.elements.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Layout className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg">Select a template to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Element Properties (simplified) */}
        {selectedElement && (
          <div className="bg-white border-t p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Element selected</p>
              <button
                onClick={() => {
                  setCurrentSlide(prev => ({
                    ...prev,
                    elements: prev.elements.filter(el => el.id !== selectedElement)
                  }));
                  setSelectedElement(null);
                }}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8"
          onClick={() => setPreviewTemplate(null)}
        >
          <div 
            className="bg-white rounded-lg shadow-2xl max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">{previewTemplate.name} Preview</h3>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6">
              <div 
                className="relative mx-auto bg-white shadow-lg"
                style={{ width: 800, height: 600 }}
              >
                {previewTemplate.elements.map((element, index) => 
                  renderElement({ ...element, id: `modal-preview-${index}` }, true)
                )}
              </div>
            </div>
            
            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  applyTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSystem;