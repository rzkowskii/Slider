import React, { useState, useEffect, useRef } from 'react';
import { Type, Square, Circle, GitBranch, Video, FileText, Plus, Puzzle } from 'lucide-react';

// Base Plugin Class
class SlidePlugin {
  constructor(id, name, description) {
    this.id = id;
    this.name = name;
    this.description = description;
  }
  
  // Override these methods in your plugin
  registerElements() {
    return [];
  }
  
  registerTools() {
    return [];
  }
  
  onInstall() {
    console.log(`Plugin ${this.name} installed`);
  }
  
  onUninstall() {
    console.log(`Plugin ${this.name} uninstalled`);
  }
}

// Example Plugin: Mermaid Diagrams
class MermaidPlugin extends SlidePlugin {
  constructor() {
    super('mermaid', 'Mermaid Diagrams', 'Add flowcharts and diagrams using Mermaid syntax');
  }
  
  registerElements() {
    return [{
      type: 'mermaid',
      name: 'Mermaid Diagram',
      icon: GitBranch,
      create: () => ({
        type: 'mermaid',
        code: 'graph TD\n  A[Start] --> B{Decision}\n  B -->|Yes| C[Do this]\n  B -->|No| D[Do that]',
        width: 400,
        height: 300
      }),
      render: MermaidElement
    }];
  }
}

// Mermaid Element Component
const MermaidElement = ({ element, isSelected, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempCode, setTempCode] = useState(element.code);
  
  const handleSave = () => {
    onUpdate({ code: tempCode });
    setIsEditing(false);
  };
  
  return (
    <div className={`w-full h-full bg-white rounded border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'} p-4`}>
      {isEditing ? (
        <div className="h-full flex flex-col">
          <textarea
            value={tempCode}
            onChange={(e) => setTempCode(e.target.value)}
            className="flex-1 font-mono text-sm p-2 border rounded resize-none"
            placeholder="Enter Mermaid diagram code..."
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTempCode(element.code);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="h-full flex items-center justify-center cursor-pointer hover:bg-gray-50"
          onDoubleClick={() => setIsEditing(true)}
        >
          <div className="text-center">
            <GitBranch className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <pre className="text-xs text-gray-600 max-h-32 overflow-auto">{element.code}</pre>
            <p className="text-xs text-gray-400 mt-2">Double-click to edit</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Example Plugin: YouTube Videos
class YouTubePlugin extends SlidePlugin {
  constructor() {
    super('youtube', 'YouTube Videos', 'Embed YouTube videos in your presentations');
  }
  
  registerElements() {
    return [{
      type: 'youtube',
      name: 'YouTube Video',
      icon: Video,
      create: () => ({
        type: 'youtube',
        videoId: '',
        width: 560,
        height: 315
      }),
      render: YouTubeElement
    }];
  }
}

// YouTube Element Component
const YouTubeElement = ({ element, isSelected, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(!element.videoId);
  const [tempId, setTempId] = useState(element.videoId);
  
  const extractVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  };
  
  const handleSave = () => {
    const videoId = extractVideoId(tempId);
    onUpdate({ videoId });
    setIsEditing(false);
  };
  
  return (
    <div className={`w-full h-full bg-black rounded overflow-hidden ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {isEditing ? (
        <div className="h-full flex flex-col items-center justify-center p-4 bg-gray-900">
          <Video className="w-12 h-12 text-white mb-4" />
          <input
            type="text"
            value={tempId}
            onChange={(e) => setTempId(e.target.value)}
            placeholder="Enter YouTube URL or Video ID"
            className="w-full px-3 py-2 rounded bg-gray-800 text-white placeholder-gray-400"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={handleSave}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Embed Video
          </button>
        </div>
      ) : (
        <div className="relative w-full h-full">
          <iframe
            src={`https://www.youtube.com/embed/${element.videoId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded hover:bg-opacity-70"
          >
            Change Video
          </button>
        </div>
      )}
    </div>
  );
};

// Example Plugin: Markdown Notes
class MarkdownPlugin extends SlidePlugin {
  constructor() {
    super('markdown', 'Markdown Notes', 'Add formatted text using Markdown syntax');
  }
  
  registerElements() {
    return [{
      type: 'markdown',
      name: 'Markdown',
      icon: FileText,
      create: () => ({
        type: 'markdown',
        content: '# Heading\n\n- Point 1\n- Point 2\n- Point 3',
        width: 400,
        height: 300
      }),
      render: MarkdownElement
    }];
  }
  
  registerTools() {
    return [{
      id: 'markdown-preview',
      name: 'Preview Mode',
      icon: FileText,
      action: (editor) => {
        console.log('Toggle markdown preview mode');
      }
    }];
  }
}

// Markdown Element Component
const MarkdownElement = ({ element, isSelected, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempContent, setTempContent] = useState(element.content);
  
  // Simple markdown to HTML converter
  const renderMarkdown = (text) => {
    return text
      .split('\n')
      .map((line, i) => {
        // Headers
        if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold mb-2">{line.slice(2)}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mb-2">{line.slice(3)}</h2>;
        if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold mb-1">{line.slice(4)}</h3>;
        
        // Lists
        if (line.startsWith('- ')) return <li key={i} className="ml-4">{line.slice(2)}</li>;
        
        // Paragraphs
        if (line.trim()) return <p key={i} className="mb-1">{line}</p>;
        
        return null;
      })
      .filter(Boolean);
  };
  
  return (
    <div className={`w-full h-full bg-white rounded border-2 ${isSelected ? 'border-blue-500' : 'border-gray-300'} p-4 overflow-auto`}>
      {isEditing ? (
        <div className="h-full flex flex-col">
          <textarea
            value={tempContent}
            onChange={(e) => setTempContent(e.target.value)}
            className="flex-1 font-mono text-sm p-2 border rounded resize-none"
            placeholder="Enter Markdown..."
          />
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                onUpdate({ content: tempContent });
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => {
                setTempContent(element.content);
                setIsEditing(false);
              }}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div 
          className="h-full cursor-pointer"
          onDoubleClick={() => setIsEditing(true)}
        >
          {renderMarkdown(element.content)}
          <p className="text-xs text-gray-400 mt-4">Double-click to edit</p>
        </div>
      )}
    </div>
  );
};

// Plugin Manager
class PluginManager {
  constructor() {
    this.plugins = new Map();
    this.listeners = [];
  }
  
  install(plugin) {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} is already installed`);
      return;
    }
    
    this.plugins.set(plugin.id, plugin);
    plugin.onInstall();
    this.notifyListeners();
  }
  
  uninstall(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.onUninstall();
      this.plugins.delete(pluginId);
      this.notifyListeners();
    }
  }
  
  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }
  
  getAllPlugins() {
    return Array.from(this.plugins.values());
  }
  
  getAllElements() {
    const elements = [];
    this.plugins.forEach(plugin => {
      elements.push(...plugin.registerElements());
    });
    return elements;
  }
  
  getAllTools() {
    const tools = [];
    this.plugins.forEach(plugin => {
      tools.push(...plugin.registerTools());
    });
    return tools;
  }
  
  subscribe(listener) {
    this.listeners.push(listener);
  }
  
  notifyListeners() {
    this.listeners.forEach(listener => listener());
  }
}

// Main App with Plugin System
const PluginSystemDemo = () => {
  const [pluginManager] = useState(() => new PluginManager());
  const [availablePlugins] = useState([
    new MermaidPlugin(),
    new YouTubePlugin(),
    new MarkdownPlugin()
  ]);
  const [installedPlugins, setInstalledPlugins] = useState([]);
  const [canvas, setCanvas] = useState([]);
  const [selectedElement, setSelectedElement] = useState(null);
  
  useEffect(() => {
    const updatePlugins = () => {
      setInstalledPlugins(pluginManager.getAllPlugins());
    };
    
    pluginManager.subscribe(updatePlugins);
    
    // Install default plugins
    pluginManager.install(availablePlugins[0]); // Mermaid
    pluginManager.install(availablePlugins[1]); // YouTube
  }, [pluginManager, availablePlugins]);
  
  const addElement = (elementType) => {
    const allElements = pluginManager.getAllElements();
    const elementDef = allElements.find(el => el.type === elementType);
    
    if (elementDef) {
      const newElement = {
        id: Date.now(),
        x: 50 + (canvas.length * 20),
        y: 50 + (canvas.length * 20),
        ...elementDef.create()
      };
      setCanvas([...canvas, { ...newElement, render: elementDef.render }]);
    }
  };
  
  const updateElement = (elementId, updates) => {
    setCanvas(prev => prev.map(el => 
      el.id === elementId ? { ...el, ...updates } : el
    ));
  };
  
  const deleteElement = (elementId) => {
    setCanvas(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };
  
  const togglePlugin = (plugin) => {
    if (pluginManager.getPlugin(plugin.id)) {
      pluginManager.uninstall(plugin.id);
    } else {
      pluginManager.install(plugin);
    }
  };
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Plugin Manager Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Puzzle className="w-6 h-6" />
            Plugin Manager
          </h2>
        </div>
        
        {/* Available Plugins */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="font-semibold mb-3">Available Plugins</h3>
            <div className="space-y-3">
              {availablePlugins.map(plugin => {
                const isInstalled = !!pluginManager.getPlugin(plugin.id);
                return (
                  <div key={plugin.id} className="border rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{plugin.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{plugin.description}</p>
                      </div>
                      <button
                        onClick={() => togglePlugin(plugin)}
                        className={`ml-3 px-3 py-1 rounded text-sm ${
                          isInstalled 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {isInstalled ? 'Uninstall' : 'Install'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Installed Elements */}
          <div className="p-4 border-t">
            <h3 className="font-semibold mb-3">Available Elements</h3>
            <div className="grid grid-cols-2 gap-2">
              {/* Built-in elements */}
              <button
                onClick={() => addElement('text')}
                className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
              >
                <Type className="w-6 h-6" />
                <span className="text-xs">Text</span>
              </button>
              <button
                onClick={() => addElement('shape')}
                className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
              >
                <Square className="w-6 h-6" />
                <span className="text-xs">Shape</span>
              </button>
              
              {/* Plugin elements */}
              {pluginManager.getAllElements().map(element => (
                <button
                  key={element.type}
                  onClick={() => addElement(element.type)}
                  className="p-3 border rounded hover:bg-gray-50 flex flex-col items-center gap-1"
                >
                  <element.icon className="w-6 h-6" />
                  <span className="text-xs">{element.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Canvas */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 border-b">
          <h3 className="text-lg font-semibold">Canvas</h3>
          <p className="text-sm text-gray-600">Click elements in the sidebar to add them</p>
        </div>
        
        <div className="flex-1 relative bg-gray-50 overflow-hidden">
          {canvas.map(element => (
            <div
              key={element.id}
              className={`absolute cursor-move ${selectedElement === element.id ? 'ring-2 ring-blue-500' : ''}`}
              style={{
                left: element.x,
                top: element.y,
                width: element.width,
                height: element.height
              }}
              onClick={() => setSelectedElement(element.id)}
            >
              {element.render ? (
                <element.render 
                  element={element} 
                  isSelected={selectedElement === element.id}
                  onUpdate={(updates) => updateElement(element.id, updates)}
                />
              ) : (
                // Default rendering for built-in elements
                <div className="w-full h-full bg-white border-2 border-gray-300 rounded flex items-center justify-center">
                  {element.type === 'text' ? (
                    <p>Text Element</p>
                  ) : (
                    <Square className="w-8 h-8 text-gray-400" />
                  )}
                </div>
              )}
            </div>
          ))}
          
          {canvas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <Plus className="w-12 h-12 mx-auto mb-2" />
                <p>Add elements from the sidebar</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        {selectedElement && (
          <div className="bg-white border-t p-4">
            <button
              onClick={() => deleteElement(selectedElement)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Element
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PluginSystemDemo;