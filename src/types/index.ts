// Core Types for Professional Slide Deck Builder
export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface BaseElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  zIndex?: number;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight?: string;
  color: string;
  textAlign: 'left' | 'center' | 'right';
}

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: 'rectangle' | 'circle' | 'triangle' | 'diamond' | 'hexagon' | 'star' | 'process' | 'decision' | 'terminal' | 'data' | 'server' | 'database' | 'cloud' | 'firewall';
  fill: string;
  stroke?: string;
  strokeWidth?: number;
}

export interface CodeElement extends BaseElement {
  type: 'code';
  content: string;
  language: string;
}

export interface ChartElement extends BaseElement {
  type: 'chart';
  chartType: 'bar' | 'line' | 'pie';
  data: Array<{ label: string; value: number }>;
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  alt?: string;
}

export interface ConnectorElement extends BaseElement {
  type: 'connector';
  startElementId?: string;
  endElementId?: string;
  points: Position[];
  stroke: string;
  strokeWidth: number;
  arrowEnd?: boolean;
}

export interface TableElement extends BaseElement {
  type: 'table';
  rows: number;
  cols: number;
  data: string[][];
}

export interface FlowDiagramElement extends BaseElement {
  type: 'flowDiagram';
  nodes: FlowNode[];
  connections: FlowConnection[];
}

// Flow diagram types (imported from FlowDiagram component)
export interface FlowNode {
  id: string;
  type: 'start' | 'process' | 'decision' | 'data' | 'connector' | 'end';
  position: { x: number; y: number };
  size: { width: number; height: number };
  label: string;
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    shadow: string;
  };
  connectionPoints: {
    id: string;
    side: 'top' | 'right' | 'bottom' | 'left';
    offset: number;
  }[];
}

export interface FlowConnection {
  id: string;
  from: { nodeId: string; pointId: string };
  to: { nodeId: string; pointId: string };
  label?: string;
  style: 'solid' | 'dashed' | 'dotted';
  color: string;
}

export type SlideElement = 
  | TextElement 
  | ShapeElement 
  | CodeElement 
  | ChartElement 
  | ImageElement 
  | ConnectorElement
  | TableElement
  | FlowDiagramElement;

export interface Slide {
  id: string;
  elements: SlideElement[];
  background?: string;
  notes?: string;
  gridEnabled?: boolean;
}

export interface Presentation {
  id: string;
  title: string;
  slides: Slide[];
  theme: string;
  settings: PresentationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface PresentationSettings {
  gridEnabled: boolean;
  snapToGrid: boolean;
  gridSize: number;
  showGuides: boolean;
}

export interface Theme {
  name: string;
  bg: string;
  text: string;
  accent: string;
  code?: string;
  slideClass?: string;
  grid: string;
}

export interface AlignmentGuide {
  position: number;
  from: number;
  to: number;
  type: 'vertical' | 'horizontal';
}

export interface HistoryState {
  slides: Slide[];
  timestamp: number;
}

export interface AppState {
  presentation: Presentation;
  currentSlideIndex: number;
  selectedElements: Set<string>;
  tool: string;
  zoom: number;
  showGrid: boolean;
  showShapeLibrary: boolean;
  selectedShapeCategory: string;
  clipboard: SlideElement[] | null;
  alignmentGuides: AlignmentGuide[];
  showAlignmentGuides: boolean;
  history: HistoryState[];
  historyIndex: number;
}

export interface PluginAPI {
  addTool: (tool: any) => void;
  addExporter: (exporter: any) => void;
  addTemplate: (template: any) => void;
  getSlides: () => Slide[];
  getCurrentSlide: () => Slide;
  updateSlide: (slide: Slide) => void;
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  activate: (api: PluginAPI) => void;
  deactivate: () => void;
}
