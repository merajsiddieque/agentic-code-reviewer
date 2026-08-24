import React from 'react';
import {
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Github,
  Terminal,
} from 'lucide-react';

export default function Header({
  isConnected = false,
  isChecking = false,
  onRefreshHealth = () => {},
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/80 backdrop-blur-xl border-b border-[#1F2937] text-zinc-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-3.5">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
              <div className="relative w-10 h-10 rounded-xl bg-[#111827] border border-[#1F2937] flex items-center justify-center text-indigo-400 shadow-inner">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  Agentic Code Reviewer
                </h1>

                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                  Gemini 3.6 Flash
                </span>
              </div>

              <p className="text-xs text-zinc-400 hidden sm:block font-normal">
                LangGraph Multi-Agent Orchestration • Static AST Analysis • Automated Security Audit
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Backend Health Status Badge */}
            <div
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
              }`}
            >
              <span className="relative flex h-2 w-2">
                {isConnected && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    isConnected ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
              </span>
              <span className="hidden sm:inline font-mono">
                {isConnected ? 'Backend Live' : 'Backend Offline'}
              </span>
            </div>

            {/* Refresh Connection Button */}
            <button
              type="button"
              onClick={onRefreshHealth}
              disabled={isChecking}
              title="Check backend status"
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-100 hover:bg-[#111827] active:bg-[#1F2937] disabled:opacity-50 transition border border-[#1F2937]"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-indigo-400' : ''}`}
              />
            </button>

            {/* GitHub Repository Button */}
            <a
              href="https://github.com/merajsiddieque/agentic-code-reviewer"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#111827] hover:bg-[#1E293B] px-3.5 py-1.5 text-xs font-medium text-zinc-200 border border-[#1F2937] hover:border-zinc-600 transition shadow-sm"
            >
              <Github className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}