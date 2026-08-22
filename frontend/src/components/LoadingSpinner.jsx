import React from 'react';
import { Cpu, ShieldAlert, FileSearch, Sparkles } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-8 sm:p-12 text-center my-8 backdrop-blur-md">
      {/* Top Gradient */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-pulse" />

      <div className="max-w-md mx-auto">
        {/* Animated Glowing Ring */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <div className="w-12 h-12 rounded-full bg-zinc-950 text-indigo-400 flex items-center justify-center border border-zinc-800 shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <h3 className="text-xl font-bold text-zinc-100 mb-2 tracking-tight">
          Executing Agentic Code Review Pipeline...
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8">
          LangGraph agents are routing, parsing AST structures, running static analysis, and synthesizing feedback with Gemini.
        </p>

        {/* Multi-step Pipeline Visualizer */}
        <div className="space-y-3 text-left bg-zinc-950/70 rounded-xl p-4 border border-zinc-800">
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Cpu className="w-4 h-4 text-indigo-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-indigo-300">1. Router Node:</span> Classifying review branch
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <FileSearch className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-cyan-300">2. AST & Metrics:</span> Parsing structure, classes & lines
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-rose-300">3. Security Scan:</span> Detecting vulnerabilities & injections
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-purple-300">4. Gemini Review:</span> Generating report & refactored code
          </div>
        </div>
      </div>
    </div>
  );
}
