import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Bug,
  FileCode2,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function MetricCards({
  metrics = {},
  selectedFile = null,
  reviewData = null,
  isLoading = false,
}) {
  // Compute Lines of Code
  const loc = metrics.loc ?? metrics.lines_of_code ?? (reviewData?.metrics?.total_lines || '--');
  
  // Compute Review Time
  const executionTime = reviewData?.execution_time 
    ? `${reviewData.execution_time}s` 
    : (isLoading ? 'Analyzing...' : '--');

  // Compute Raw Numeric Security Score
  const rawScore = reviewData?.overall_score ?? (metrics.security_score ?? null);
  const numericScore = rawScore !== null ? parseFloat(rawScore) : null;
  const displayScore = numericScore !== null ? numericScore.toFixed(1) : '--';

  // Compute Issues Found
  const issuesFound = metrics.issues_count ?? (
    reviewData?.security?.length !== undefined 
      ? reviewData.security.length 
      : (reviewData ? (metrics.issues_count ?? 0) : '--')
  );

  // Dynamic color for score ring
  const getScoreColor = (score) => {
    if (score === null || isNaN(score)) return { stroke: '#4B5563', text: 'text-zinc-400', badge: 'bg-zinc-800 text-zinc-400 border-zinc-700' };
    if (score >= 8.0) return { stroke: '#10B981', text: 'text-emerald-400', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' };
    if (score >= 5.0) return { stroke: '#F59E0B', text: 'text-amber-400', badge: 'bg-amber-500/10 text-amber-300 border-amber-500/30' };
    return { stroke: '#F43F5E', text: 'text-rose-400', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/30' };
  };

  const scoreTheme = getScoreColor(numericScore);
  const scorePercent = numericScore !== null ? Math.min(Math.max((numericScore / 10) * 100, 0), 100) : 0;
  const strokeDashoffset = 100 - scorePercent;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* 1. Security Score with Radial Progress Ring */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] p-5 shadow-xl backdrop-blur transition-all duration-300 hover:border-indigo-500/50 hover:shadow-indigo-500/5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Security Score
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${scoreTheme.badge}`}>
            {numericScore !== null ? (numericScore >= 8 ? 'High Grade' : numericScore >= 5 ? 'Moderate' : 'Critical Issues') : 'Pending Scan'}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-extrabold tracking-tight font-mono ${scoreTheme.text}`}>
                {displayScore}
              </span>
              <span className="text-sm font-semibold text-zinc-500 font-mono">/ 10</span>
            </div>
            <p className="text-xs text-zinc-400 mt-2 truncate font-medium">
              {reviewData ? 'Evaluated via AST & Gemini' : 'Awaiting code scan'}
            </p>
          </div>

          {/* SVG Radial Gauge */}
          <div className="relative w-14 h-14 flex items-center justify-center flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-zinc-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                strokeWidth="3.5"
                strokeDasharray="100, 100"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={scoreTheme.stroke}
                fill="none"
                className="transition-all duration-1000 ease-out"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <ShieldCheck className={`w-5 h-5 absolute ${scoreTheme.text}`} />
          </div>
        </div>
      </div>

      {/* 2. Issues Found */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] p-5 shadow-xl backdrop-blur transition-all duration-300 hover:border-rose-500/50 hover:shadow-rose-500/5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Issues Found
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Bug className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {issuesFound}
          </span>
          {typeof issuesFound === 'number' && issuesFound > 0 && (
            <span className="text-xs font-semibold text-rose-400 font-mono">Flagged</span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mt-2 truncate font-medium">
          {reviewData ? 'Bugs, vulnerabilities & style' : 'Scan to detect issues'}
        </p>
      </div>

      {/* 3. Lines of Code */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] p-5 shadow-xl backdrop-blur transition-all duration-300 hover:border-cyan-500/50 hover:shadow-cyan-500/5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Lines of Code
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FileCode2 className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {loc}
          </span>
          {loc !== '--' && (
            <span className="text-xs font-semibold text-cyan-400 font-mono">Lines</span>
          )}
        </div>

        <p className="text-xs text-zinc-400 mt-2 truncate font-mono">
          {selectedFile ? selectedFile.name : 'No file selected'}
        </p>
      </div>

      {/* 4. Review Time */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] p-5 shadow-xl backdrop-blur transition-all duration-300 hover:border-amber-500/50 hover:shadow-amber-500/5 group">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Review Time
          </span>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
            {executionTime}
          </span>
        </div>

        <p className="text-xs text-zinc-400 mt-2 truncate font-medium">
          {reviewData ? `Route: ${reviewData.route?.toUpperCase() || 'FULL'}` : 'Deterministic + LLM'}
        </p>
      </div>
    </div>
  );
}

