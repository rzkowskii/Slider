import React, { useState, useRef } from 'react';
import { Download, FileText, Image, Code, FileJson, Loader, CheckCircle, AlertCircle, Share2, Mail, Link } from 'lucide-react';

// Export System Component
const ExportSystem = () => {
  const [slides, setSlides] = useState([
    {
      id: 1,
      title: 'Welcome Slide',
      elements: [
        { type: 'text', content: 'Welcome to My Presentation', x: 100, y: 200, fontSize: 48, color: '#1F2937' },
        { type: 'text', content: 'A demo of export capabilities', x: 150, y: 300, fontSize: 24, color: '#6B7280' },
        { type: 'shape', shapeType: 'rectangle', x: 250, y: 400, width: 300, height: 100, color: '#3B82F6' }
      ]
    },
    {
      id: 2,
      title: 'Content Slide',
      elements: [
        { type: 'text', content: 'Key Points', x: 100, y: 100, fontSize: 36, color: '#1F2937' },
        { type: 'text', content: '• First important point\n• Second important point\n• Third important point', x: 100, y: 200, fontSize: 20, color: '#374151' },
        { type: 'chart', chartType: 'bar', x: 400, y: 200, width: 300, height: 200 }
      ]
    },
    {
      id: 3,
      title: 'Thank You',
      elements: [
        { type: 'text', content: 'Thank You!', x: 200, y: 250, fontSize: 64, color: '#3B82F6' },
        { type: 'text', content: 'Questions?', x: 300, y: 350, fontSize: 32, color: '#6B7280' }
      ]
    }
  ]);
  
  const [exportFormat, setExportFormat] = useState('pdf');
  const [exportOptions, setExportOptions] = useState({
    includeNotes: true,
    quality: 'high',
    format: 'A4',
    orientation: 'landscape',
    colorMode: 'color'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportResult, setExportResult] = useState(null);
  
  const canvasRef = useRef(null);

  // Export formats configuration
  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: FileText,
      description: 'Best for printing and sharing',
      extensions: '.pdf',
      color: '#EF4444'
    },
    {
      id: 'images',
      name: 'Image Files',
      icon: Image,
      description: 'PNG images of each slide',
      extensions: '.png, .jpg',
      color: '#10B981'
    },
    {
      id: 'markdown',
      name: 'Markdown',
      icon: Code,
      description: 'Text-based presentation format',
      extensions: '.md',
      color: '#8B5CF6'
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: FileJson,
      description: 'Raw presentation data',
      extensions: '.json',
      color: '#F59E0B'
    },
    {
      id: 'html',
      name: 'HTML Presentation',
      icon: Code,
      description: 'Self-contained web presentation',
      extensions: '.html',
      color: '#3B82F6'
    }
  ];

  // Simulate export process
  const exportPresentation = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportResult(null);
    
    try {
      // Simulate progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setExportProgress(i);
      }
      
      // Generate export based on format
      let result;
      switch (exportFormat) {
        case 'pdf':
          result = await exportToPDF();
          break;
        case 'images':
          result = await exportToImages();
          break;
        case 'markdown':
          result = await exportToMarkdown();
          break;
        case 'json':
          result = await exportToJSON();
          break;
        case 'html':
          result = await exportToHTML();
          break;
      }
      
      setExportResult({
        success: true,
        format: exportFormat,
        file: result,
        timestamp: new Date()
      });
    } catch (error) {
      setExportResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Export to PDF (simulated)
  const exportToPDF = async () => {
    return {
      name: 'presentation.pdf',
      size: '2.4 MB',
      pages: slides.length,
      content: 'PDF content would be generated here'
    };
  };

  // Export to Images (simulated)
  const exportToImages = async () => {
    return {
      name: 'presentation-slides.zip',
      size: '5.2 MB',
      files: slides.map((slide, index) => `slide-${index + 1}.png`),
      content: 'ZIP file with PNG images'
    };
  };

  // Export to Markdown
  const exportToMarkdown = async () => {
    const markdown = slides.map((slide, index) => {
      const textElements = slide.elements.filter(el => el.type === 'text');
      return `# Slide ${index + 1}: ${slide.title}\n\n${
        textElements.map(el => el.content).join('\n\n')
      }\n\n---\n`;
    }).join('\n');
    
    return {
      name: 'presentation.md',
      size: `${(markdown.length / 1024).toFixed(1)} KB`,
      content: markdown
    };
  };

  // Export to JSON
  const exportToJSON = async () => {
    const json = JSON.stringify({ slides, exportOptions }, null, 2);
    
    return {
      name: 'presentation.json',
      size: `${(json.length / 1024).toFixed(1)} KB`,
      content: json
    };
  };

  // Export to HTML (simulated)
  const exportToHTML = async () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Presentation</title>
  <style>
    .slide { width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center; }
  </style>
</head>
<body>
  ${slides.map((slide, index) => `
    <div class="slide" id="slide-${index + 1}">
      <h1>${slide.title}</h1>
    </div>
  `).join('')}
</body>
</html>`;
    
    return {
      name: 'presentation.html',
      size: `${(html.length / 1024).toFixed(1)} KB`,
      content: html
    };
  };

  // Share options
  const shareOptions = [
    { id: 'email', icon: Mail, label: 'Email', color: '#EA4335' },
    { id: 'link', icon: Link, label: 'Copy Link', color: '#4285F4' },
    { id: 'social', icon: Share2, label: 'Social Media', color: '#1DA1F2' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Download className="w-8 h-8 text-blue-500" />
            Export Presentation
          </h1>
          <p className="mt-2 text-gray-600">Choose how you want to export your presentation</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Export Formats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Select Export Format</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exportFormats.map((format) => (
                  <button
                    key={format.id}
                    onClick={() => setExportFormat(format.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      exportFormat === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: format.color + '20' }}
                      >
                        <format.icon className="w-5 h-5" style={{ color: format.color }} />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-medium text-gray-900">{format.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{format.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{format.extensions}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Export Options</h2>
              
              <div className="space-y-4">
                {/* Quality Option */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                  </label>
                  <select
                    value={exportOptions.quality}
                    onChange={(e) => setExportOptions({ ...exportOptions, quality: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low (Smaller file size)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best quality)</option>
                  </select>
                </div>

                {/* Format Option (for PDF) */}
                {exportFormat === 'pdf' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Page Format
                      </label>
                      <select
                        value={exportOptions.format}
                        onChange={(e) => setExportOptions({ ...exportOptions, format: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="A4">A4</option>
                        <option value="Letter">Letter</option>
                        <option value="16:9">16:9 Widescreen</option>
                        <option value="4:3">4:3 Standard</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Orientation
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="landscape"
                            checked={exportOptions.orientation === 'landscape'}
                            onChange={(e) => setExportOptions({ ...exportOptions, orientation: e.target.value })}
                            className="mr-2"
                          />
                          Landscape
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            value="portrait"
                            checked={exportOptions.orientation === 'portrait'}
                            onChange={(e) => setExportOptions({ ...exportOptions, orientation: e.target.value })}
                            className="mr-2"
                          />
                          Portrait
                        </label>
                      </div>
                    </div>
                  </>
                )}

                {/* Include Notes Option */}
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeNotes}
                    onChange={(e) => setExportOptions({ ...exportOptions, includeNotes: e.target.checked })}
                    className="mr-2"
                  />
                  Include speaker notes
                </label>
              </div>
            </div>

            {/* Export Progress */}
            {isExporting && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Loader className="w-5 h-5 animate-spin text-blue-500" />
                  <span className="font-medium">Exporting...</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Processing slide {Math.ceil(exportProgress / (100 / slides.length))} of {slides.length}</p>
              </div>
            )}

            {/* Export Result */}
            {exportResult && (
              <div className={`rounded-lg shadow-md p-6 ${
                exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {exportResult.success ? (
                    <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${exportResult.success ? 'text-green-900' : 'text-red-900'}`}>
                      {exportResult.success ? 'Export Successful!' : 'Export Failed'}
                    </h3>
                    {exportResult.success ? (
                      <div className="mt-2 space-y-2">
                        <p className="text-sm text-green-800">
                          File: {exportResult.file.name} ({exportResult.file.size})
                        </p>
                        <div className="flex gap-2 mt-3">
                          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                            Download
                          </button>
                          <button className="px-4 py-2 bg-white text-green-600 border border-green-600 rounded hover:bg-green-50">
                            Preview
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-red-800 mt-1">{exportResult.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Preview</h2>
              <div className="bg-gray-100 rounded-lg p-4 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">{slides.length} slides will be exported</p>
              </div>
              
              {/* Mini slide previews */}
              <div className="mt-4 space-y-2">
                {slides.map((slide, index) => (
                  <div key={slide.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-12 h-9 bg-gray-300 rounded flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-700">{slide.title}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Share Options */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Share</h2>
              <div className="space-y-3">
                {shareOptions.map((option) => (
                  <button
                    key={option.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: option.color + '20' }}
                    >
                      <option.icon className="w-5 h-5" style={{ color: option.color }} />
                    </div>
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportPresentation}
              disabled={isExporting}
              className="w-full py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isExporting ? 'Exporting...' : 'Export Now'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportSystem;