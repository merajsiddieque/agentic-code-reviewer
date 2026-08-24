import React from 'react';
import {
  UploadCloud,
  GitFork,
  FileCode2,
  BarChart3,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'upload', label: 'Upload', icon: UploadCloud, desc: 'File Ingest' },
  { id: 'router', label: 'Router', icon: GitFork, desc: 'Branch Routing' },
  { id: 'ast', label: 'AST', icon: FileCode2, desc: 'Syntax Tree' },
  { id: 'metrics', label: 'Metrics', icon: BarChart3, desc: 'LOC & Lines' },
  { id: 'security', label: 'Security', icon: ShieldCheck, desc: 'Vulnerability Scan' },
  { id: 'gemini', label: 'Gemini 3.6', icon: Sparkles, desc: 'AI Synthesis' },
  { id: 'report', label: 'Report', icon: FileCheck2, desc: 'Final Audit' },
];

export default function PipelineVisualizer({
  isLoading = false,
  reviewData = null,
  selectedFile = null,
}) {
  // If no file selected and not loading and no review, don't show or show idle state
  if (!selectedFile && !reviewData && !isLoading) {
    return null;
  }

  // Determine stage status
  const getStageStatus = (index) => {
    if (reviewData) return 'completed'; // all completed once review is ready
    if (!isLoading) {
      return index === 0 ? 'completed' : 'pending';
    }
    // During loading: simulate progressing through stages
    return index <= 5 ? 'active' : 'pending';
  };

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-5 shadow-xl backdrop-blur-md mb-8 animate-fadeIn">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1F2937]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            LangGraph Execution Pipeline
          </span>
        </div>
        <span className="text-xs font-mono text-zinc-500">
          {reviewData ? 'Status: 7/7 Stages Complete' : (isLoading ? 'Pipeline Active...' : 'Ready for Ingest')}
        </span>
      </div>

      {/* Horizontal Pipeline Steps */}
      <div className="overflow-x-auto py-2">
        <div className="flex items-center justify-between min-w-[640px] gap-2">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = reviewData !== null;
            const isActive = isLoading && !reviewData;
            const isLast = idx === PIPELINE_STAGES.length - 1;

            return (
              <React.Fragment key={stage.id}>
                {/* Stage Node */}
                <div className="flex flex-col items-center text-center group flex-1">
                  <div
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-500/20'
                        : isActive
                        ? 'bg-indigo-500/20 border border-indigo-500 text-indigo-400 animate-pulse shadow-sm shadow-indigo-500/30'
                        : 'bg-[#0B1120] border border-[#1F2937] text-zinc-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {isCompleted && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-[#0B1120] flex items-center justify-center text-[9px] font-bold">
                        ✓
                      </span>
                    )}
                  </div>

                  <span
                    className={`mt-2 text-xs font-medium tracking-tight ${
                      isCompleted
                        ? 'text-zinc-200 font-semibold'
                        : isActive
                        ? 'text-indigo-300 font-semibold'
                        : 'text-zinc-500'
                    }`}
                  >
                    {stage.label}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono hidden sm:block">
                    {stage.desc}
                  </span>
                </div>

                {/* Connector Arrow */}
                {!isLast && (
                  <div className="flex items-center px-1">
                    <div
                      className={`h-0.5 w-6 sm:w-8 transition-colors duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500/50'
                          : isActive
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-500/40 animate-pulse'
                          : 'bg-[#1F2937]'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
