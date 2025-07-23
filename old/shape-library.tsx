import React, { useState } from 'react';
import { Square, Circle, Triangle, Hexagon, Database, Cloud, Shield, Box, Diamond, Star } from 'lucide-react';

// Shape Library Component
const ShapeLibrary = () => {
  const [selectedCategory, setSelectedCategory] = useState('basic');
  const [selectedShape, setSelectedShape] = useState(null);
  const [canvas, setCanvas] = useState([]);
  const [draggedShape, setDraggedShape] = useState(null);

  // Shape definitions
  const shapeCategories = {
    basic: {
      name: 'Basic Shapes',
      shapes: [
        { id: 'rectangle', name: 'Rectangle', render: RectangleShape },
        { id: 'circle', name: 'Circle', render: CircleShape },
        { id: 'triangle', name: 'Triangle', render: TriangleShape },
        { id: 'diamond', name: 'Diamond', render: DiamondShape },
        { id: 'hexagon', name: 'Hexagon', render: HexagonShape },
        { id: 'star', name: 'Star', render: StarShape },
        { id: 'pentagon', name: 'Pentagon', render: PentagonShape },
        { id: 'arrow', name: 'Arrow', render: ArrowShape }
      ]
    },
    flowchart: {
      name: 'Flowchart',
      shapes: [
        { id: 'process', name: 'Process', render: ProcessShape },
        { id: 'decision', name: 'Decision', render: DecisionShape },
        { id: 'terminal', name: 'Terminal', render: TerminalShape },
        { id: 'data', name: 'Data', render: DataShape },
        { id: 'document', name: 'Document', render: DocumentShape },
        { id: 'preparation', name: 'Preparation', render: PreparationShape },
        { id: 'manual-input', name: 'Manual Input', render: ManualInputShape },
        { id: 'stored-data', name: 'Stored Data', render: StoredDataShape }
      ]
    },
    uml: {
      name: 'UML',
      shapes: [
        { id: 'class', name: 'Class', render: ClassShape },
        { id: 'interface', name: 'Interface', render: InterfaceShape },
        { id: 'package', name: 'Package', render: PackageShape },
        { id: 'note', name: 'Note', render: NoteShape },
        { id: 'actor', name: 'Actor', render: ActorShape },
        { id: 'use-case', name: 'Use Case', render: UseCaseShape },
        { id: 'component', name: 'Component', render: ComponentShape },
        { id: 'node', name: 'Node', render: NodeShape }
      ]
    },
    network: {
      name: 'Network',
      shapes: [
        { id: 'server', name: 'Server', render: ServerShape },
        { id: 'database', name: 'Database', render: DatabaseShape },
        { id: 'cloud', name: 'Cloud', render: CloudShape },
        { id: 'firewall', name: 'Firewall', render: FirewallShape },
        { id: 'router', name: 'Router', render: RouterShape },
        { id: 'switch', name: 'Switch', render: SwitchShape },
        { id: 'computer', name: 'Computer', render: ComputerShape },
        { id: 'mobile', name: 'Mobile', render: MobileShape }
      ]
    }
  };

  // Handle drag start
  const handleDragStart = (shape, e) => {
    setDraggedShape(shape);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // Handle drop on canvas
  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedShape) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left - 50;
      const y = e.clientY - rect.top - 50;
      
      setCanvas(prev => [...prev, {
        id: Date.now(),
        type: draggedShape.id,
        category: selectedCategory,
        x,
        y,
        width: 100,
        height: 100,
        render: draggedShape.render
      }]);
    }
    setDraggedShape(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Shape Library Sidebar */}
      <div className="w-80 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Shape Library</h2>
        </div>
        
        {/* Category Tabs */}
        <div className="flex border-b">
          {Object.entries(shapeCategories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`
                flex-1 px-3 py-2 text-sm font-medium transition-colors
                ${selectedCategory === key 
                  ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        {/* Shapes Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {shapeCategories[selectedCategory].shapes.map(shape => (
              <div
                key={shape.id}
                draggable
                onDragStart={(e) => handleDragStart(shape, e)}
                onClick={() => setSelectedShape(shape)}
                className={`
                  bg-gray-50 border-2 rounded-lg p-4 cursor-move
                  hover:border-blue-400 hover:bg-blue-50 transition-all
                  ${selectedShape?.id === shape.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
                `}
              >
                <div className="w-full h-20 mb-2 flex items-center justify-center">
                  <shape.render size={50} />
                </div>
                <p className="text-xs text-center font-medium text-gray-700">{shape.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white shadow-sm p-4 border-b">
          <h3 className="text-lg font-semibold">Canvas</h3>
          <p className="text-sm text-gray-600">Drag shapes from the library to add them to the canvas</p>
        </div>
        
        <div 
          className="flex-1 relative bg-gray-50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 19px, rgba(0,0,0,0.03) 20px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.03) 0px, transparent 1px, transparent 19px, rgba(0,0,0,0.03) 20px)
              `
            }}
          />
          
          {/* Render shapes on canvas */}
          {canvas.map(shape => (
            <div
              key={shape.id}
              className="absolute cursor-move hover:ring-2 hover:ring-blue-400 transition-all"
              style={{
                left: shape.x,
                top: shape.y,
                width: shape.width,
                height: shape.height
              }}
            >
              <shape.render size="100%" />
            </div>
          ))}
          
          {/* Drop hint */}
          {canvas.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400 text-lg">Drop shapes here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Basic Shapes
function RectangleShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="10" y="20" width="80" height="60" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="2" />
    </svg>
  );
}

function CircleShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="35" fill="#10B981" stroke="#059669" strokeWidth="2" />
    </svg>
  );
}

function TriangleShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,15 85,75 15,75" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
    </svg>
  );
}

function DiamondShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,10 90,50 50,90 10,50" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
    </svg>
  );
}

function HexagonShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="30,20 70,20 85,50 70,80 30,80 15,50" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2" />
    </svg>
  );
}

function StarShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,15 61,35 83,35 68,51 73,72 50,60 27,72 32,51 17,35 39,35" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
    </svg>
  );
}

function PentagonShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,15 81,35 71,70 29,70 19,35" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
    </svg>
  );
}

function ArrowShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 20 50 L 60 50 L 60 35 L 85 50 L 60 65 L 60 50" fill="#10B981" stroke="#059669" strokeWidth="2" />
    </svg>
  );
}

// Flowchart Shapes
function ProcessShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="10" y="30" width="80" height="40" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" rx="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="14">Process</text>
    </svg>
  );
}

function DecisionShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="50,10 90,50 50,90 10,50" fill="#F59E0B" stroke="#D97706" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">Decision</text>
    </svg>
  );
}

function TerminalShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="10" y="30" width="80" height="40" fill="#10B981" stroke="#059669" strokeWidth="2" rx="20" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="14">Start/End</text>
    </svg>
  );
}

function DataShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 20 30 L 80 30 L 90 70 L 30 70 Z" fill="#8B5CF6" stroke="#7C3AED" strokeWidth="2" />
      <text x="55" y="55" textAnchor="middle" fill="white" fontSize="14">Data</text>
    </svg>
  );
}

function DocumentShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 20 20 L 80 20 L 80 70 Q 50 80 20 70 Z" fill="#06B6D4" stroke="#0891B2" strokeWidth="2" />
      <text x="50" y="50" textAnchor="middle" fill="white" fontSize="12">Document</text>
    </svg>
  );
}

function PreparationShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="20,50 35,30 80,30 80,70 35,70" fill="#EC4899" stroke="#DB2777" strokeWidth="2" />
      <text x="55" y="55" textAnchor="middle" fill="white" fontSize="12">Prep</text>
    </svg>
  );
}

function ManualInputShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <polygon points="20,40 80,30 80,70 20,70" fill="#84CC16" stroke="#65A30D" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">Input</text>
    </svg>
  );
}

function StoredDataShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 20 30 C 20 20 80 20 80 30 L 80 70 C 80 80 20 80 20 70 Z" fill="#6366F1" stroke="#4F46E5" strokeWidth="2" />
      <ellipse cx="50" cy="30" rx="30" ry="10" fill="#6366F1" stroke="#4F46E5" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12">Storage</text>
    </svg>
  );
}

// UML Shapes
function ClassShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="10" y="10" width="80" height="80" fill="white" stroke="#374151" strokeWidth="2" />
      <line x1="10" y1="30" x2="90" y2="30" stroke="#374151" strokeWidth="2" />
      <line x1="10" y1="60" x2="90" y2="60" stroke="#374151" strokeWidth="2" />
      <text x="50" y="25" textAnchor="middle" fontSize="12" fontWeight="bold">Class</text>
      <text x="15" y="45" fontSize="10">+attribute</text>
      <text x="15" y="75" fontSize="10">+method()</text>
    </svg>
  );
}

function InterfaceShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="10" y="20" width="80" height="60" fill="white" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" />
      <text x="50" y="35" textAnchor="middle" fontSize="10" fontStyle="italic">«interface»</text>
      <text x="50" y="50" textAnchor="middle" fontSize="12" fontWeight="bold">IShape</text>
      <line x1="10" y1="55" x2="90" y2="55" stroke="#374151" strokeWidth="1" />
      <text x="15" y="70" fontSize="10">+draw()</text>
    </svg>
  );
}

function PackageShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 10 25 L 10 20 L 40 20 L 40 25 M 10 25 L 90 25 L 90 80 L 10 80 Z" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fontSize="12">Package</text>
    </svg>
  );
}

function NoteShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 10 10 L 70 10 L 90 30 L 90 90 L 10 90 Z" fill="#FEFCE8" stroke="#FCD34D" strokeWidth="2" />
      <path d="M 70 10 L 70 30 L 90 30" fill="none" stroke="#FCD34D" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fontSize="11">Note</text>
    </svg>
  );
}

function ActorShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="25" r="10" fill="none" stroke="#374151" strokeWidth="2" />
      <line x1="50" y1="35" x2="50" y2="60" stroke="#374151" strokeWidth="2" />
      <line x1="30" y1="45" x2="70" y2="45" stroke="#374151" strokeWidth="2" />
      <line x1="50" y1="60" x2="35" y2="80" stroke="#374151" strokeWidth="2" />
      <line x1="50" y1="60" x2="65" y2="80" stroke="#374151" strokeWidth="2" />
      <text x="50" y="95" textAnchor="middle" fontSize="10">Actor</text>
    </svg>
  );
}

function UseCaseShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="50" rx="35" ry="20" fill="#EDE9FE" stroke="#7C3AED" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fontSize="11">Use Case</text>
    </svg>
  );
}

function ComponentShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="20" y="20" width="70" height="60" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
      <rect x="10" y="30" width="15" height="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
      <rect x="10" y="50" width="15" height="10" fill="#DBEAFE" stroke="#2563EB" strokeWidth="2" />
      <text x="55" y="55" textAnchor="middle" fontSize="11">Component</text>
    </svg>
  );
}

function NodeShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 20 20 L 80 20 L 90 30 L 90 80 L 30 80 L 20 70 Z" fill="#E0E7FF" stroke="#6366F1" strokeWidth="2" />
      <path d="M 20 20 L 30 30 L 90 30" fill="none" stroke="#6366F1" strokeWidth="2" />
      <path d="M 30 30 L 30 80" fill="none" stroke="#6366F1" strokeWidth="2" />
      <text x="60" y="60" textAnchor="middle" fontSize="11">Node</text>
    </svg>
  );
}

// Network Shapes
function ServerShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="15" fill="#374151" stroke="#111827" strokeWidth="2" rx="2" />
      <rect x="20" y="40" width="60" height="15" fill="#374151" stroke="#111827" strokeWidth="2" rx="2" />
      <rect x="20" y="60" width="60" height="15" fill="#374151" stroke="#111827" strokeWidth="2" rx="2" />
      <circle cx="70" cy="27.5" r="3" fill="#10B981" />
      <circle cx="70" cy="47.5" r="3" fill="#10B981" />
      <circle cx="70" cy="67.5" r="3" fill="#10B981" />
      <text x="50" y="90" textAnchor="middle" fontSize="10">Server</text>
    </svg>
  );
}

function DatabaseShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <ellipse cx="50" cy="25" rx="25" ry="10" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
      <path d="M 25 25 L 25 70 C 25 76 38 80 50 80 C 62 80 75 76 75 70 L 75 25" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
      <ellipse cx="50" cy="70" rx="25" ry="10" fill="#3B82F6" stroke="#1E40AF" strokeWidth="2" />
      <text x="50" y="95" textAnchor="middle" fontSize="10">Database</text>
    </svg>
  );
}

function CloudShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <path d="M 25 60 C 15 60 10 50 15 45 C 15 35 25 30 35 35 C 40 25 55 20 65 30 C 75 25 85 35 80 45 C 85 50 80 60 70 60 Z" fill="#60A5FA" stroke="#2563EB" strokeWidth="2" />
      <text x="50" y="80" textAnchor="middle" fontSize="10">Cloud</text>
    </svg>
  );
}

function FirewallShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="20" y="25" width="60" height="50" fill="#EF4444" stroke="#DC2626" strokeWidth="2" />
      <rect x="25" y="30" width="10" height="8" fill="#DC2626" />
      <rect x="37" y="30" width="10" height="8" fill="#DC2626" />
      <rect x="49" y="30" width="10" height="8" fill="#DC2626" />
      <rect x="61" y="30" width="10" height="8" fill="#DC2626" />
      <rect x="30" y="40" width="10" height="8" fill="#DC2626" />
      <rect x="42" y="40" width="10" height="8" fill="#DC2626" />
      <rect x="54" y="40" width="10" height="8" fill="#DC2626" />
      <text x="50" y="90" textAnchor="middle" fontSize="10">Firewall</text>
    </svg>
  );
}

function RouterShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="25" fill="#6366F1" stroke="#4F46E5" strokeWidth="2" />
      <line x1="50" y1="25" x2="50" y2="10" stroke="#4F46E5" strokeWidth="2" />
      <line x1="75" y1="50" x2="90" y2="50" stroke="#4F46E5" strokeWidth="2" />
      <line x1="50" y1="75" x2="50" y2="90" stroke="#4F46E5" strokeWidth="2" />
      <line x1="25" y1="50" x2="10" y2="50" stroke="#4F46E5" strokeWidth="2" />
      <text x="50" y="55" textAnchor="middle" fill="white" fontSize="10">Router</text>
    </svg>
  );
}

function SwitchShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="20" y="40" width="60" height="20" fill="#10B981" stroke="#059669" strokeWidth="2" rx="10" />
      <line x1="30" y1="35" x2="30" y2="40" stroke="#059669" strokeWidth="2" />
      <line x1="40" y1="35" x2="40" y2="40" stroke="#059669" strokeWidth="2" />
      <line x1="50" y1="35" x2="50" y2="40" stroke="#059669" strokeWidth="2" />
      <line x1="60" y1="35" x2="60" y2="40" stroke="#059669" strokeWidth="2" />
      <line x1="70" y1="35" x2="70" y2="40" stroke="#059669" strokeWidth="2" />
      <text x="50" y="75" textAnchor="middle" fontSize="10">Switch</text>
    </svg>
  );
}

function ComputerShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="20" y="20" width="60" height="40" fill="#6B7280" stroke="#374151" strokeWidth="2" rx="2" />
      <rect x="25" y="25" width="50" height="30" fill="#1F2937" />
      <rect x="35" y="65" width="30" height="5" fill="#6B7280" />
      <rect x="25" y="70" width="50" height="3" fill="#6B7280" stroke="#374151" strokeWidth="1" />
      <text x="50" y="85" textAnchor="middle" fontSize="10">Computer</text>
    </svg>
  );
}

function MobileShape({ size = 100 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="35" y="15" width="30" height="50" fill="#374151" stroke="#111827" strokeWidth="2" rx="3" />
      <rect x="38" y="20" width="24" height="35" fill="#1F2937" />
      <circle cx="50" cy="60" r="3" fill="#6B7280" />
      <text x="50" y="80" textAnchor="middle" fontSize="10">Mobile</text>
    </svg>
  );
}

export default ShapeLibrary;