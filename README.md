# Slider - Simple Presentation Tool

A basic presentation system built with React and TypeScript. Create simple presentations with text, charts, and flow diagrams.

## Features

- **Text Elements**: Add and edit text with basic formatting
- **Code Blocks**: Syntax-highlighted code display
- **Charts**: Basic bar, line, and pie charts using Recharts
- **Tables**: Simple editable data tables
- **Shapes**: Basic geometric shapes
- **Flow Diagrams**: Simple flowchart creation with drag-and-drop nodes

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. Use the toolbar to add elements to your slides
2. Double-click elements to edit them
3. Drag elements around the canvas
4. Switch between different themes
5. Use "Present" mode for full-screen viewing

## Flow Diagrams

Create simple flowcharts with:
- Basic node types (Start, Process, Decision, Data, End)
- Drag-and-drop interface
- Simple connections between nodes

## Technical Details

Built with:
- React 18 with TypeScript
- Recharts for charts
- Lucide React for icons
- Vite for development
- TailwindCSS for styling

## Development

To add new element types:
1. Update the types in `src/types/index.ts`
2. Add creation logic in the main component
3. Implement rendering for the new element type

## License

MIT License
