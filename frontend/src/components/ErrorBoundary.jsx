import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error("UI error:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="container-centered py-10">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="text-xl font-semibold text-white mb-2">Something went wrong</div>
          <div className="text-slate-400 mb-6 max-w-md mx-auto">
            The UI crashed while rendering. Try refreshing the page or navigating to another route.
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-2.5 font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition"
              onClick={() => window.location.reload()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reload Page
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 px-5 py-2.5 font-medium border border-slate-700 transition"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Again
            </button>
          </div>

          {this.state.error?.message && (
            <div className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-left">
              <div className="text-xs text-rose-400 font-medium mb-1">Error Details</div>
              <code className="text-xs text-rose-200 break-all">{this.state.error.message}</code>
            </div>
          )}
        </div>
      </div>
    );
  }
}
