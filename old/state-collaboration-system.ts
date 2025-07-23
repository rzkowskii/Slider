// State Management & Real-time Collaboration System
// Production-ready implementation with Zustand and Y.js

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { IndexeddbPersistence } from 'y-indexeddb';
import { debounce, throttle } from 'lodash';

// ============================================
// 1. CORE STATE MANAGEMENT
// ============================================

interface PresentationState {
  // Core data
  presentation: Presentation | null;
  currentSlideId: string | null;
  selectedElementIds: Set<string>;
  
  // UI state
  zoom: number;
  panOffset: { x: number; y: number };
  showGrid: boolean;
  snapToGrid: boolean;
  
  // Collaboration
  collaborators: Map<string, Collaborator>;
  localUser: User;
  
  // History
  canUndo: boolean;
  canRedo: boolean;
}

interface PresentationActions {
  // Presentation actions
  loadPresentation: (presentation: Presentation) => void;
  updatePresentationMetadata: (updates: Partial<Presentation>) => void;
  
  // Slide actions
  addSlide: (slide: Slide, index?: number) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  deleteSlide: (slideId: string) => void;
  duplicateSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  
  // Element actions
  addElement: (slideId: string, element: Element) => void;
  updateElement: (slideId: string, elementId: string, updates: Partial<Element>) => void;
  deleteElements: (slideId: string, elementIds: string[]) => void;
  duplicateElements: (slideId: string, elementIds: string[]) => void;
  
  // Selection actions
  selectElements: (elementIds: string[]) => void;
  addToSelection: (elementIds: string[]) => void;
  removeFromSelection: (elementIds: string[]) => void;
  clearSelection: () => void;
  
  // View actions
  setZoom: (zoom: number) => void;
  setPan: (offset: { x: number; y: number }) => void;
  resetView: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
}

// Create the main store with middleware
const usePresentationStore = create<PresentationState & PresentationActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      // Initial state
      presentation: null,
      currentSlideId: null,
      selectedElementIds: new Set(),
      zoom: 1,
      panOffset: { x: 0, y: 0 },
      showGrid: true,
      snapToGrid: true,
      collaborators: new Map(),
      localUser: { id: '', name: '', color: '' },
      canUndo: false,
      canRedo: false,

      // Presentation actions
      loadPresentation: (presentation) => {
        set((state) => {
          state.presentation = presentation;
          state.currentSlideId = presentation.slides[0]?.id || null;
          state.selectedElementIds.clear();
        });
      },

      updatePresentationMetadata: (updates) => {
        set((state) => {
          if (state.presentation) {
            Object.assign(state.presentation, updates);
            state.presentation.updatedAt = new Date();
          }
        });
      },

      // Slide actions with history support
      addSlide: (slide, index) => {
        const action = () => {
          set((state) => {
            if (!state.presentation) return;
            
            const insertIndex = index ?? state.presentation.slides.length;
            state.presentation.slides.splice(insertIndex, 0, slide);
            state.currentSlideId = slide.id;
          });
        };
        
        HistoryManager.execute({
          do: action,
          undo: () => get().deleteSlide(slide.id),
          description: 'Add slide'
        });
      },

      updateSlide: (slideId, updates) => {
        const slide = get().presentation?.slides.find(s => s.id === slideId);
        if (!slide) return;
        
        const previousState = { ...slide };
        
        set((state) => {
          const slide = state.presentation?.slides.find(s => s.id === slideId);
          if (slide) {
            Object.assign(slide, updates);
          }
        });
        
        HistoryManager.execute({
          do: () => get().updateSlide(slideId, updates),
          undo: () => get().updateSlide(slideId, previousState),
          description: 'Update slide'
        });
      },

      // Element actions with batching
      updateElement: throttle((slideId: string, elementId: string, updates: Partial<Element>) => {
        set((state) => {
          const slide = state.presentation?.slides.find(s => s.id === slideId);
          const element = slide?.elements.find(e => e.id === elementId);
          if (element) {
            Object.assign(element, updates);
          }
        });
      }, 16), // 60fps throttle

      // Selection management
      selectElements: (elementIds) => {
        set((state) => {
          state.selectedElementIds = new Set(elementIds);
        });
      },

      // View actions
      setZoom: (zoom) => {
        set((state) => {
          state.zoom = Math.max(0.1, Math.min(5, zoom));
        });
      },

      // History actions (connected to HistoryManager)
      undo: () => HistoryManager.undo(),
      redo: () => HistoryManager.redo(),
    }))
  )
);

// ============================================
// 2. HISTORY MANAGEMENT
// ============================================

interface HistoryCommand {
  do: () => void;
  undo: () => void;
  description: string;
  timestamp?: Date;
}

class HistoryManagerClass {
  private history: HistoryCommand[] = [];
  private currentIndex = -1;
  private maxHistorySize = 100;
  private batchTimeout: NodeJS.Timeout | null = null;
  private batchedCommands: HistoryCommand[] = [];

  execute(command: HistoryCommand, batch = false) {
    if (batch) {
      this.batchedCommands.push(command);
      this.scheduleBatchExecution();
      return;
    }

    // Execute the command
    command.do();
    command.timestamp = new Date();

    // Remove any history after current index
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add to history
    this.history.push(command);
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.currentIndex = this.history.length - 1;
    }

    this.updateStoreHistoryState();
  }

  private scheduleBatchExecution() {
    if (this.batchTimeout) return;

    this.batchTimeout = setTimeout(() => {
      if (this.batchedCommands.length > 0) {
        const commands = [...this.batchedCommands];
        this.batchedCommands = [];

        const batchCommand: HistoryCommand = {
          do: () => commands.forEach(cmd => cmd.do()),
          undo: () => commands.reverse().forEach(cmd => cmd.undo()),
          description: `Batch: ${commands[0].description} (${commands.length} actions)`
        };

        this.execute(batchCommand);
      }
      this.batchTimeout = null;
    }, 100);
  }

  undo() {
    if (!this.canUndo()) return;

    this.history[this.currentIndex].undo();
    this.currentIndex--;
    this.updateStoreHistoryState();
  }

  redo() {
    if (!this.canRedo()) return;

    this.currentIndex++;
    this.history[this.currentIndex].do();
    this.updateStoreHistoryState();
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  private updateStoreHistoryState() {
    usePresentationStore.setState({
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  getHistory(): HistoryCommand[] {
    return [...this.history];
  }

  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.updateStoreHistoryState();
  }
}

const HistoryManager = new HistoryManagerClass();

// ============================================
// 3. COLLABORATIVE EDITING WITH Y.JS
// ============================================

interface Collaborator {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
  selection?: string[];
  lastActive: Date;
}

interface User {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

class CollaborationManager {
  private ydoc: Y.Doc;
  private provider: WebrtcProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;
  private awareness: any;
  private roomId: string;
  private syncDebounced: ReturnType<typeof debounce>;

  constructor(roomId: string) {
    this.roomId = roomId;
    this.ydoc = new Y.Doc();
    
    // Debounced sync to avoid too frequent updates
    this.syncDebounced = debounce(this.syncToYjs.bind(this), 100);
    
    this.setupYjsStructure();
    this.setupPersistence();
  }

  private setupYjsStructure() {
    // Define Y.js data structure
    const yPresentation = this.ydoc.getMap('presentation');
    const ySlides = this.ydoc.getArray('slides');
    const yMetadata = this.ydoc.getMap('metadata');

    // Subscribe to Y.js changes
    ySlides.observe(() => {
      this.syncFromYjs();
    });

    yPresentation.observe(() => {
      this.syncFromYjs();
    });
  }

  private setupPersistence() {
    // Local persistence with IndexedDB
    this.persistence = new IndexeddbPersistence(this.roomId, this.ydoc);
    
    this.persistence.on('synced', () => {
      console.log('Document synced with IndexedDB');
    });
  }

  connect(user: User) {
    // WebRTC provider for peer-to-peer collaboration
    this.provider = new WebrtcProvider(this.roomId, this.ydoc, {
      signaling: ['wss://signaling.example.com'], // Your signaling server
      password: null, // Optional room password
      awareness: {
        user
      }
    });

    this.awareness = this.provider.awareness;

    // Set local user state
    this.awareness.setLocalStateField('user', user);

    // Track awareness changes (cursor positions, selections)
    this.awareness.on('change', () => {
      this.updateCollaborators();
    });

    // Subscribe to store changes
    usePresentationStore.subscribe(
      (state) => state.presentation,
      (presentation) => {
        if (presentation) {
          this.syncDebounced();
        }
      }
    );
  }

  disconnect() {
    if (this.provider) {
      this.provider.disconnect();
      this.provider.destroy();
      this.provider = null;
    }
    
    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = null;
    }
  }

  private syncToYjs() {
    const state = usePresentationStore.getState();
    if (!state.presentation) return;

    this.ydoc.transact(() => {
      const yPresentation = this.ydoc.getMap('presentation');
      const ySlides = this.ydoc.getArray('slides');

      // Sync presentation metadata
      yPresentation.set('title', state.presentation.title);
      yPresentation.set('theme', state.presentation.theme);
      yPresentation.set('settings', state.presentation.settings);

      // Sync slides
      ySlides.delete(0, ySlides.length);
      ySlides.insert(0, state.presentation.slides);
    });
  }

  private syncFromYjs() {
    const yPresentation = this.ydoc.getMap('presentation');
    const ySlides = this.ydoc.getArray('slides');

    const presentation: Presentation = {
      id: usePresentationStore.getState().presentation?.id || '',
      title: yPresentation.get('title') || '',
      theme: yPresentation.get('theme') || {},
      settings: yPresentation.get('settings') || {},
      slides: ySlides.toArray(),
      version: '1.0.0',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    usePresentationStore.setState({ presentation });
  }

  private updateCollaborators() {
    const collaborators = new Map<string, Collaborator>();
    
    this.awareness.getStates().forEach((state: any, clientId: number) => {
      if (clientId === this.awareness.clientID) return;
      
      const user = state.user;
      if (user) {
        collaborators.set(user.id, {
          ...user,
          cursor: state.cursor,
          selection: state.selection,
          lastActive: new Date()
        });
      }
    });

    usePresentationStore.setState({ collaborators });
  }

  // Broadcast cursor position
  updateCursor(x: number, y: number) {
    this.awareness.setLocalStateField('cursor', { x, y });
  }

  // Broadcast selection
  updateSelection(elementIds: string[]) {
    this.awareness.setLocalStateField('selection', elementIds);
  }

  // Get conflict-free unique ID
  generateId(): string {
    return `${this.awareness.clientID}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// 4. PERFORMANCE MONITORING
// ============================================

class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  private observers: PerformanceObserver[] = [];

  startMeasure(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasure(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name, 'measure')[0];
    if (measure) {
      this.recordMetric(name, measure.duration);
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || [];
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  setupObservers() {
    // Monitor long tasks
    const longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('long-task', entry.duration);
        console.warn(`Long task detected: ${entry.duration}ms`);
      }
    });
    longTaskObserver.observe({ entryTypes: ['longtask'] });
    this.observers.push(longTaskObserver);

    // Monitor layout shifts
    const layoutShiftObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric('layout-shift', (entry as any).value);
      }
    });
    layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
    this.observers.push(layoutShiftObserver);
  }

  destroy() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// ============================================
// 5. HOOKS FOR REACT COMPONENTS
// ============================================

// Main presentation hook
export const usePresentation = () => {
  const state = usePresentationStore();
  
  return {
    presentation: state.presentation,
    currentSlide: state.presentation?.slides.find(s => s.id === state.currentSlideId),
    selectedElements: state.presentation?.slides
      .flatMap(s => s.elements)
      .filter(e => state.selectedElementIds.has(e.id)) || [],
    actions: {
      addSlide: state.addSlide,
      updateSlide: state.updateSlide,
      deleteSlide: state.deleteSlide,
      addElement: state.addElement,
      updateElement: state.updateElement,
      deleteElements: state.deleteElements
    }
  };
};

// Selection hook
export const useSelection = () => {
  const selectedElementIds = usePresentationStore(state => state.selectedElementIds);
  const selectElements = usePresentationStore(state => state.selectElements);
  const addToSelection = usePresentationStore(state => state.addToSelection);
  const clearSelection = usePresentationStore(state => state.clearSelection);

  return {
    selectedIds: Array.from(selectedElementIds),
    isSelected: (id: string) => selectedElementIds.has(id),
    select: selectElements,
    addToSelection,
    clear: clearSelection
  };
};

// History hook
export const useHistory = () => {
  const canUndo = usePresentationStore(state => state.canUndo);
  const canRedo = usePresentationStore(state => state.canRedo);
  const undo = usePresentationStore(state => state.undo);
  const redo = usePresentationStore(state => state.redo);

  return { canUndo, canRedo, undo, redo };
};

// Collaboration hook
export const useCollaboration = (roomId: string, user: User) => {
  const [manager] = React.useState(() => new CollaborationManager(roomId));
  const collaborators = usePresentationStore(state => state.collaborators);

  React.useEffect(() => {
    manager.connect(user);
    return () => manager.disconnect();
  }, [manager, user]);

  return {
    collaborators: Array.from(collaborators.values()),
    updateCursor: manager.updateCursor.bind(manager),
    updateSelection: manager.updateSelection.bind(manager),
    generateId: manager.generateId.bind(manager)
  };
};

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [monitor] = React.useState(() => new PerformanceMonitor());

  React.useEffect(() => {
    monitor.setupObservers();
    return () => monitor.destroy();
  }, [monitor]);

  return monitor;
};

// ============================================
// 6. EXPORTS
// ============================================

export {
  usePresentationStore,
  HistoryManager,
  CollaborationManager,
  PerformanceMonitor
};