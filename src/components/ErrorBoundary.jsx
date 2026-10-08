import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetCache = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#001428] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-[#002244] border-2 border-[#c59b27] rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 border-2 border-red-500/40 flex items-center justify-center text-red-400 text-3xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#dfb743] tracking-wide">Interface Recovery</h1>
              <p className="text-sm text-slate-300 mt-2">
                An unexpected display error occurred. Your system data is safe.
              </p>
            </div>

            {this.state.error && (
              <div className="text-left bg-black/40 rounded-xl p-3 text-xs text-red-300 font-mono overflow-auto max-h-32 border border-red-500/20">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-[#c59b27] hover:bg-[#dfb743] text-[#002244] font-black rounded-xl transition shadow-lg flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-rotate-right"></i>
                Reload Page
              </button>
              <button
                onClick={this.handleResetCache}
                className="flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl transition border border-white/10 text-xs flex items-center justify-center gap-1.5"
              >
                <i className="fa-solid fa-trash-can"></i>
                Clear Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
