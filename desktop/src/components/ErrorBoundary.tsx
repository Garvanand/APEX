import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw, Activity } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  recovering: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    recovering: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, recovering: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error intercepted by System Recovery Manager:", error, errorInfo);
    
    // Auto-recovery sequence
    setTimeout(() => {
      this.attemptSoftRecovery();
    }, 2000); // Attempt auto-recovery after 2s
  }

  private attemptSoftRecovery = () => {
    // Flush potentially corrupt local state context
    localStorage.removeItem("apex_auth_token");
    this.setState({ hasError: false, error: null, recovering: false });
  };

  private handleHardReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.state.recovering) {
        return (
          <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#0A0D0B] text-white">
            <div className="flex flex-col items-center gap-6">
              <Activity className="w-12 h-12 text-accent animate-pulse" />
              <div className="text-center">
                <h1 className="text-xl font-bold tracking-[0.2em] uppercase text-white mb-2">System Recovery Manager</h1>
                <p className="text-xs font-mono text-accent">FLUSHING CORRUPT STATE & RECOVERING WORKSPACE...</p>
              </div>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                 <div className="h-full bg-accent animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0D0B] text-white p-8">
          <div className="bg-danger/10 border border-danger/20 p-8 rounded-2xl max-w-xl text-center space-y-6">
            <div className="flex justify-center">
              <AlertTriangle className="w-16 h-16 text-danger" />
            </div>
            <h1 className="text-2xl font-bold tracking-widest uppercase">Unrecoverable System Fault</h1>
            <p className="text-sm text-secondary-text font-mono bg-black/40 p-4 rounded text-left overflow-auto max-h-48">
              {this.state.error?.message || "Unknown Application Error"}
            </p>
            <button
              onClick={this.handleHardReset}
              className="flex items-center gap-2 mx-auto bg-white/10 hover:bg-white/20 px-6 py-2 rounded font-bold uppercase tracking-wider transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Hard Reset System
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
