# Slider - Professional Presentation System

A Marcus-grade presentation system built with React, TypeScript, and professional reliability features. Create stunning presentations with advanced flow diagrams, charts, and bulletproof data protection.

## 🎯 Features

### **Professional Elements**
- **Text Elements**: Rich text with fonts, colors, and alignment
- **Code Blocks**: Syntax-highlighted code with multiple language support
- **Charts**: Interactive bar, line, and pie charts with Recharts
- **Tables**: Editable data tables with professional styling
- **Shapes**: Geometric shapes with customization options
- **Flow Diagrams**: NiFi-style flow diagrams with drag-and-drop nodes

### **Marcus-Grade Reliability** 
- **Bulletproof Storage**: Atomic saves with corruption detection and recovery
- **Auto-Save**: 30-second intervals with visual status indicators
- **Error Boundaries**: Comprehensive crash protection at app, slide, and element levels
- **Undo/Redo**: 50-level history with immutable state management
- **Backup System**: 10 generations of automatic backups

### **Professional Features**
- **Multiple Themes**: Minimal, Dark, Tech, and Blueprint themes
- **Slide Templates**: Title, Code, and Comparison slide templates
- **Presentation Mode**: Full-screen presentation with navigation
- **Export/Import**: JSON-based presentation files
- **Grid System**: Snap-to-grid for precise alignment
- **Keyboard Shortcuts**: Professional workflow shortcuts

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🎨 Creating Presentations

1. **Add Elements**: Use the toolbar to add text, shapes, charts, tables, or flow diagrams
2. **Customize**: Double-click elements to edit content and properties
3. **Organize**: Drag elements around the canvas with grid snapping
4. **Style**: Choose from professional themes or customize colors
5. **Present**: Click "Present" for full-screen presentation mode

## 🔧 Flow Diagrams

Create professional process flows with the integrated NiFi-style editor:

- **Node Types**: Start, Process, Decision, Data, Connector, End
- **Connections**: Bezier curves with smart routing
- **Editing**: Full drag-and-drop interface with connection points
- **Professional Output**: Publication-ready diagrams

## 🛡️ The Marcus Standard

This system was built with the Marcus Test™ - would you trust your $540,000 career interview with this code? Every feature includes:

- **Error Protection**: No crashes during critical moments
- **Data Safety**: Multiple backup layers prevent data loss
- **Performance**: Smooth operation even with complex presentations
- **Reliability**: Tested under stress conditions

## 🏗️ Architecture

### **Core Components**
- `src/components/SlideDeck/` - Main presentation interface
- `src/components/FlowDiagram/` - NiFi-style flow diagram editor
- `src/components/ErrorBoundary/` - Crash protection system
- `src/hooks/` - Auto-save, undo/redo, and performance hooks
- `src/utils/` - Bulletproof storage system

### **Key Technologies**
- **React 18** with TypeScript for type safety
- **Recharts** for interactive data visualization
- **Lucide React** for professional icons
- **Vite** for fast development and building
- **TailwindCSS** for responsive styling

## 🧪 Testing

Includes comprehensive stress testing suite:

- **Memory Leak Detection**: 100 slides × 50 elements
- **Corruption Recovery**: Deliberate data corruption tests
- **Undo/Redo Stress**: 1000 rapid operations
- **Storage Capacity**: Fill localStorage to limits
- **Checksum Validation**: Data integrity verification

Access via: `http://localhost:3000/#stress-test`

## 📝 Development

### **Adding New Element Types**
1. Update `src/types/index.ts` with new element interface
2. Add creation logic to `createElement()` function
3. Implement rendering in `renderElement()` function
4. Add toolbar button and icon

### **Extending Flow Diagrams**
The flow diagram system is fully extensible:
- Add new node types in `nodeTemplates`
- Customize node rendering in `renderNode()`
- Extend connection types and styling

## 🤝 Contributing

This is a professional-grade system. All contributions must:
- Include comprehensive error handling
- Maintain Marcus-grade reliability standards
- Include appropriate TypeScript types
- Pass all stress tests

## 📜 License

MIT License - Build amazing presentations with confidence.

## 🏆 The Promise

Every line of code in this system serves one purpose: ensuring your presentation succeeds when it matters most. No crashes, no data loss, no embarrassing failures - just professional results every time.

**Built for moments that define careers.**
