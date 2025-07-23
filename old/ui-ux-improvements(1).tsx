import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, AlertCircle, Info, X, Loader, Upload, Save, Trash2, Copy, Share2, Zap } from 'lucide-react';

// Toast Notification System
const Toast = ({ message, type, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  
  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 10);
    
    // Auto close after 3 seconds
    const timer = setTimeout(() => {
      setIsLeaving(true);
      setTimeout(onClose, 300);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };
  
  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };
  
  const Icon = icons[type];
  
  return (
    <div
      className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg
        transition-all duration-300 transform
        ${colors[type]}
        ${isVisible && !isLeaving ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => {
          setIsLeaving(true);
          setTimeout(onClose, 300);
        }}
        className="p-1 hover:bg-black/10 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

// Loading States Component
const LoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({
    saving: false,
    uploading: false,
    processing: false,
    deleting: false
  });
  
  const simulateAction = (action) => {
    setLoadingStates(prev => ({ ...prev, [action]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [action]: false }));
    }, 2000);
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Button with loading state */}
      <button
        onClick={() => simulateAction('saving')}
        disabled={loadingStates.saving}
        className="relative px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-400 transition-all duration-200"
      >
        <span className={`flex items-center justify-center gap-2 ${loadingStates.saving ? 'opacity-0' : 'opacity-100'}`}>
          <Save className="w-4 h-4" />
          Save
        </span>
        {loadingStates.saving && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-4 h-4 animate-spin" />
          </div>
        )}
      </button>
      
      {/* Upload with progress */}
      <button
        onClick={() => simulateAction('uploading')}
        disabled={loadingStates.uploading}
        className="relative px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-green-400 transition-all duration-200 overflow-hidden"
      >
        <span className={`flex items-center justify-center gap-2 ${loadingStates.uploading ? 'opacity-0' : 'opacity-100'}`}>
          <Upload className="w-4 h-4" />
          Upload
        </span>
        {loadingStates.uploading && (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="w-4 h-4 animate-spin" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/30">
              <div className="h-full bg-white animate-progress" />
            </div>
          </>
        )}
      </button>
      
      {/* Processing animation */}
      <button
        onClick={() => simulateAction('processing')}
        disabled={loadingStates.processing}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-purple-400 transition-all duration-200"
      >
        <span className="flex items-center justify-center gap-2">
          {loadingStates.processing ? (
            <>
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Processing
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Process
            </>
          )}
        </span>
      </button>
      
      {/* Delete with confirmation */}
      <button
        onClick={() => simulateAction('deleting')}
        disabled={loadingStates.deleting}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-red-400 transition-all duration-200"
      >
        <span className="flex items-center justify-center gap-2">
          {loadingStates.deleting ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          {loadingStates.deleting ? 'Deleting...' : 'Delete'}
        </span>
      </button>
    </div>
  );
};

// Animated Elements
const AnimatedElements = () => {
  const [elements, setElements] = useState([
    { id: 1, x: 50, y: 50, scale: 1, rotate: 0 },
    { id: 2, x: 200, y: 50, scale: 1, rotate: 0 },
    { id: 3, x: 350, y: 50, scale: 1, rotate: 0 }
  ]);
  const [draggedElement, setDraggedElement] = useState(null);
  
  return (
    <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
      {elements.map((element, index) => (
        <div
          key={element.id}
          className="absolute w-20 h-20 bg-blue-500 rounded-lg cursor-move transition-all duration-300 hover:shadow-lg"
          style={{
            left: element.x,
            top: element.y,
            transform: `scale(${element.scale}) rotate(${element.rotate}deg)`,
            zIndex: draggedElement === element.id ? 10 : 1
          }}
          onMouseEnter={() => {
            setElements(prev => prev.map(el => 
              el.id === element.id ? { ...el, scale: 1.1, rotate: 5 } : el
            ));
          }}
          onMouseLeave={() => {
            setElements(prev => prev.map(el => 
              el.id === element.id ? { ...el, scale: 1, rotate: 0 } : el
            ));
          }}
          onMouseDown={() => setDraggedElement(element.id)}
          onMouseUp={() => setDraggedElement(null)}
        >
          <div className="w-full h-full flex items-center justify-center text-white font-bold">
            {index + 1}
          </div>
        </div>
      ))}
    </div>
  );
};

// Progress Indicators
const ProgressIndicators = () => {
  const [progress, setProgress] = useState(0);
  const [circularProgress, setCircularProgress] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => (prev >= 100 ? 0 : prev + 2));
      setCircularProgress(prev => (prev >= 100 ? 0 : prev + 2));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circularProgress / 100) * circumference;
  
  return (
    <div className="space-y-6">
      {/* Linear Progress */}
      <div>
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Linear Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      
      {/* Segmented Progress */}
      <div>
        <div className="text-sm text-gray-600 mb-2">Segmented Progress</div>
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                i < Math.floor(progress / 20) 
                  ? 'bg-green-500' 
                  : i === Math.floor(progress / 20)
                  ? 'bg-green-300'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Circular Progress */}
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="gradient">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#8B5CF6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{circularProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const UIUXImprovements = () => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">UI/UX Improvements</h1>
          <p className="text-gray-600">Smooth animations, loading states, and toast notifications</p>
        </div>
        
        {/* Toast Notifications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Toast Notifications</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => addToast('Success! Your changes have been saved.', 'success')}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Success Toast
            </button>
            <button
              onClick={() => addToast('Error! Something went wrong.', 'error')}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Error Toast
            </button>
            <button
              onClick={() => addToast('Info: This is an informational message.', 'info')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Info Toast
            </button>
          </div>
        </div>
        
        {/* Loading States */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Loading States</h2>
          <LoadingStates />
        </div>
        
        {/* Animated Elements */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Hover Animations</h2>
          <p className="text-sm text-gray-600 mb-4">Hover over the elements to see smooth animations</p>
          <AnimatedElements />
        </div>
        
        {/* Progress Indicators */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Progress Indicators</h2>
          <ProgressIndicators />
        </div>
        
        {/* Skeleton Loading */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Skeleton Loading</h2>
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
            <div className="flex gap-4 animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* CSS for custom animations */}
      <style jsx>{`
        @keyframes progress {
          from { width: 0; }
          to { width: 100%; }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default UIUXImprovements;