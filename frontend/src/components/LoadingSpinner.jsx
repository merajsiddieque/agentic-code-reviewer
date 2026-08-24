import React from 'react';
import { Cpu, ShieldAlert, FileSearch, Sparkles, GitFork, BarChart3, FileCheck2 } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] shadow-2xl p-8 sm:p-12 text-center my-8 backdrop-blur-md animate-fadeIn">
      {/* Top Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 animate-pulse" />

      <div className="max-w-md mx-auto">
        {/* Animated Glowing Ring */}
        <div className="relative mx-auto w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          <div className="w-12 h-12 rounded-full bg-[#0B1120] text-indigo-400 flex items-center justify-center border border-[#1F2937] shadow-inner">
            <Sparkles className="w-6 h-6 animate-pulse text-indigo-400" />
          </div>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-zinc-100 mb-2 tracking-tight">
          Executing Agentic Code Review Pipeline...
        </h3>
        <p className="text-xs sm:text-sm text-zinc-400 mb-8 font-normal">
          LangGraph agents are routing, parsing AST structures, running static analysis, and synthesizing feedback with Gemini 3.6 Flash.
        </p>

        {/* Multi-step Pipeline Visualizer */}
        <div className="space-y-3 text-left bg-[#0B1120]/80 rounded-xl p-4 border border-[#1F2937]">
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <GitFork className="w-4 h-4 text-indigo-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-indigo-300">1. Router Node:</span> Classifying review branch
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <FileSearch className="w-4 h-4 text-cyan-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-cyan-300">2. AST &amp; Metrics:</span> Parsing structure, classes &amp; lines
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-rose-300">3. Security Scan:</span> Detecting vulnerabilities &amp; injections
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-300">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse flex-shrink-0" />
            <span className="font-semibold text-purple-300">4. Gemini Review:</span> Generating report &amp; refactored code
          </div>
        </div>
      </div>
    </div>
  );
}

