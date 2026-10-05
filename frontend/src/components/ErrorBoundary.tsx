import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#040711] text-red-500">
          <h1 className="text-3xl font-bold mb-4">SYSTEM FAILURE</h1>
          <p className="text-slate-300 font-mono mb-2">An unexpected error occurred in the Command Center UI.</p>
          <pre className="text-xs bg-slate-900 p-4 rounded border border-red-900 overflow-auto max-w-2xl">
            {this.state.error?.message}
          </pre>
          <button 
            className="mt-6 px-4 py-2 bg-red-900/50 hover:bg-red-900 border border-red-700 rounded text-slate-100 font-mono transition-colors"
            onClick={() => window.location.reload()}
          >
            REBOOT INTERFACE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
