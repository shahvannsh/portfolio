import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No error-reporting service wired up (out of scope) — at minimum
    // this keeps the failure visible in devtools instead of silently
    // swallowed by an unhandled render crash.
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-void px-6 text-center text-ink">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-amber">System Error</p>
          <h1 className="font-display text-2xl font-bold">Something went wrong.</h1>
          <p className="max-w-sm text-sm text-mute">
            This page hit an unexpected error. Refreshing usually fixes it.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg border border-amber/50 bg-amber/10 px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-amber-soft transition-colors hover:bg-amber/20"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
