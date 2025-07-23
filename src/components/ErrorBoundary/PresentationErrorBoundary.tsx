/**
 * MARCUS-GRADE ERROR BOUNDARY SYSTEM
 * 
 * This prevents ANY component failure from destroying a presentation.
 * Every chart, every element, every interaction is protected.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Bug, Download } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackType?: 'element' | 'slide' | 'app';
  elementType?: string;
  elementId?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId: string;
  retryCount: number;
}

export class PresentationErrorBoundary extends Component<Props, State> {
  private maxRetries = 3;
  private errorReportingTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    
    this.state = {
      hasError: false,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    console.error('PRESENTATION ERROR CAUGHT:', error);
    
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details for debugging
    console.error('DETAILED ERROR INFO:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      elementType: this.props.elementType,
      elementId: this.props.elementId,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString()
    });

    this.setState({
      error,
      errorInfo
    });

    // Report to parent component if callback provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-recovery attempt for non-critical errors
    if (this.props.fallbackType === 'element' && this.state.retryCount < this.maxRetries) {
      this.scheduleRetry();
    }

    // Track error metrics (in production, this would go to analytics)
    this.trackError(error, errorInfo);
  }

  private scheduleRetry = () => {
    if (this.errorReportingTimeout) {
      clearTimeout(this.errorReportingTimeout);
    }

    this.errorReportingTimeout = setTimeout(() => {
      console.log(`Attempting auto-recovery for ${this.props.elementType} (attempt ${this.state.retryCount + 1})`);
      
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        retryCount: prevState.retryCount + 1
      }));
    }, 2000);
  };

  private handleManualRetry = () => {
    console.log('Manual retry triggered by user');
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: 0,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
  };

  private trackError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, send to error tracking service
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      elementType: this.props.elementType,
      elementId: this.props.elementId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    // Store locally for debugging
    try {
      const existingErrors = JSON.parse(localStorage.getItem('slider_error_log') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 50 errors
      const trimmedErrors = existingErrors.slice(-50);
      localStorage.setItem('slider_error_log', JSON.stringify(trimmedErrors));
    } catch (storageError) {
      console.warn('Could not store error report:', storageError);
    }
  };

  private downloadErrorReport = () => {
    const errorReport = {
      errorId: this.state.errorId,
      error: {
        message: this.state.error?.message,
        stack: this.state.error?.stack,
      },
      errorInfo: this.state.errorInfo,
      elementType: this.props.elementType,
      elementId: this.props.elementId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    const blob = new Blob([JSON.stringify(errorReport, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `slider_error_${this.state.errorId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  componentWillUnmount() {
    if (this.errorReportingTimeout) {
      clearTimeout(this.errorReportingTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      // Return different fallback UIs based on the error type
      switch (this.props.fallbackType) {
        case 'element':
          return this.renderElementFallback();
        case 'slide':
          return this.renderSlideFallback();
        case 'app':
          return this.renderAppFallback();
        default:
          return this.renderElementFallback();
      }
    }

    return this.props.children;
  }

  private renderElementFallback() {
    const isChartError = this.props.elementType?.includes('chart');
    const isCodeError = this.props.elementType?.includes('code');
    
    return (
      <div 
        className="border-2 border-dashed border-red-300 bg-red-50 rounded-lg p-4 m-2 text-center"
        style={{ minWidth: '200px', minHeight: '100px' }}
      >
        <div className="flex flex-col items-center justify-center h-full gap-2">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <div className="text-sm font-medium text-red-700">
            {isChartError && 'Chart Unavailable'}
            {isCodeError && 'Code Block Error'}
            {!isChartError && !isCodeError && 'Element Error'}
          </div>
          <div className="text-xs text-red-600">
            {isChartError && 'Data visualization failed, but your presentation continues'}
            {isCodeError && 'Code syntax issue detected'}
            {!isChartError && !isCodeError && `${this.props.elementType || 'Element'} failed to render`}
          </div>
          
          {this.state.retryCount < this.maxRetries && (
            <button
              onClick={this.handleManualRetry}
              className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  private renderSlideFallback() {
    return (
      <div className="w-full h-full bg-red-50 border-2 border-red-200 rounded-lg flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">Slide Error</h3>
          <p className="text-red-600 mb-4">
            This slide encountered an error, but your presentation is still running.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={this.handleManualRetry}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Slide
            </button>
            <button
              onClick={this.downloadErrorReport}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Error Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  private renderAppFallback() {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
        <div className="max-w-lg w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Bug className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-red-700 mb-4">
            Presentation System Error
          </h1>
          <p className="text-red-600 mb-6">
            The presentation system encountered a critical error. Your data is safe and 
            auto-saved. Please refresh to continue.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
            >
              Refresh Application
            </button>
            
            <button
              onClick={this.downloadErrorReport}
              className="w-full px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 font-medium flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download Error Report
            </button>
            
            <div className="text-xs text-gray-500 mt-4">
              Error ID: {this.state.errorId}
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-100 rounded text-left text-xs">
            <div className="font-medium mb-2">Error Details:</div>
            <div className="text-gray-700">
              {this.state.error?.message}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Convenience wrapper components for different contexts
export const ElementErrorBoundary: React.FC<{
  children: ReactNode;
  elementType?: string;
  elementId?: string;
}> = ({ children, elementType, elementId }) => (
  <PresentationErrorBoundary 
    fallbackType="element" 
    elementType={elementType} 
    elementId={elementId}
  >
    {children}
  </PresentationErrorBoundary>
);

export const SlideErrorBoundary: React.FC<{
  children: ReactNode;
  slideId?: string;
}> = ({ children, slideId }) => (
  <PresentationErrorBoundary 
    fallbackType="slide"
    elementId={slideId}
  >
    {children}
  </PresentationErrorBoundary>
);

export const AppErrorBoundary: React.FC<{
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}> = ({ children, onError }) => (
  <PresentationErrorBoundary 
    fallbackType="app"
    onError={onError}
  >
    {children}
  </PresentationErrorBoundary>
);
