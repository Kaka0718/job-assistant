import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full flex-col items-center justify-center p-6">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
            <AlertTriangle size={32} className="text-error" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-text-primary">页面出现错误</h2>
          <p className="mb-1 max-w-md text-center text-sm text-text-secondary">
            {this.state.error?.message || "发生了未知错误"}
          </p>
          <Button onClick={this.handleReload} className="mt-4">
            <RefreshCw size={16} className="mr-2" />
            重新加载
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}