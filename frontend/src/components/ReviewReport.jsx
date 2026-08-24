import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  FileCheck2,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Bug,
  Zap,
  Code2,
  Terminal,
  Layers,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
} from 'lucide-react';

export default function ReviewReport({
  filename = 'code.py',
  reviewMarkdown = '',
  executionTime = 0,
  route = 'full',
  onReset,
}) {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState(null);

  // Extract Overall Score from Markdown if present
  const overallScore = useMemo(() => {
    const match = reviewMarkdown.match(/Overall Score:\s*([\d.]+)\s*\/\s*10/i);
    return match ? match[1] : null;
  }, [reviewMarkdown]);

  // Compute Severity Distribution
  const severityCounts = useMemo(() => {
    const high = (reviewMarkdown.match(/Severity[\s*:]+`?High`?/gi) || []).length;
    const medium = (reviewMarkdown.match(/Severity[\s*:]+`?Medium`?/gi) || []).length;
    const low = (reviewMarkdown.match(/Severity[\s*:]+`?Low`?/gi) || []).length;
    const total = high + medium + low;
    return {
      high,
      medium,
      low,
      total: total > 0 ? total : 0,
      highPct: total > 0 ? (high / total) * 100 : 0,
      medPct: total > 0 ? (medium / total) * 100 : 0,
      lowPct: total > 0 ? (low / total) * 100 : 0,
    };
  }, [reviewMarkdown]);

  // Extract Analysis Summary Metadata (Functions, Classes, Language, Lines)
  const analysisSummary = useMemo(() => {
    const langMatch = reviewMarkdown.match(/Language[\s*:]+([^\n*]+)/i);
    const linesMatch = reviewMarkdown.match(/Total Lines[\s*:]+([^\n*]+)/i);
    const funcMatch = reviewMarkdown.match(/Functions?[\s*:]+([^\n*]+)/i);
    const classMatch = reviewMarkdown.match(/Classes?[\s*:]+([^\n*]+)/i);

    const ext = filename.split('.').pop()?.toLowerCase() || 'py';
    const langMap = {
      py: 'Python',
      js: 'JavaScript',
      jsx: 'React JSX',
      ts: 'TypeScript',
      tsx: 'React TSX',
      java: 'Java',
      html: 'HTML5',
      css: 'CSS3',
      md: 'Markdown',
      json: 'JSON',
      yaml: 'YAML',
      yml: 'YAML',
    };

    return {
      language: langMatch ? langMatch[1].trim() : (langMap[ext] || ext.toUpperCase()),
      lines: linesMatch ? linesMatch[1].trim() : 'Analyzed',
      functions: funcMatch ? funcMatch[1].trim() : (reviewMarkdown.includes('def ') ? 'Detected' : '--'),
      classes: classMatch ? classMatch[1].trim() : (reviewMarkdown.includes('class ') ? 'Detected' : '--'),
      complexity: severityCounts.high > 0 ? 'High Risk' : severityCounts.medium > 0 ? 'Moderate' : 'Low / Clean',
    };
  }, [reviewMarkdown, filename, severityCounts]);

  const handleCopyAll = () => {
    navigator.clipboard.writeText(reviewMarkdown);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handleCopyCode = (codeText, index) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIndex(index);
    setTimeout(() => setCopiedCodeIndex(null), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([reviewMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename || 'review'}_audit_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  let codeBlockCounter = 0;

  // Custom Markdown Renderers with Modern SaaS Aesthetics
  const markdownComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 border-b border-[#1F2937] pb-3 mb-6 mt-4 tracking-tight" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <div className="mt-8 mb-4 border-b border-[#1F2937] pb-2.5 flex items-center gap-2.5">
        <h2 className="text-lg sm:text-xl font-bold text-indigo-300 tracking-tight m-0" {...props} />
      </div>
    ),
    h3: ({ node, ...props }) => (
      <h3 className="text-base font-semibold text-zinc-200 mt-5 mb-2 tracking-tight flex items-center gap-2" {...props} />
    ),
    p: ({ node, ...props }) => (
      <p className="text-sm sm:text-base text-zinc-300 leading-relaxed my-3" {...props} />
    ),
    ul: ({ node, ...props }) => (
      <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-zinc-300 my-3 pl-2" {...props} />
    ),
    ol: ({ node, ...props }) => (
      <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-zinc-300 my-3 pl-2" {...props} />
    ),
    li: ({ node, ...props }) => (
      <li className="text-sm sm:text-base text-zinc-300 leading-relaxed" {...props} />
    ),
    table: ({ node, ...props }) => (
      <div className="overflow-x-auto my-6 rounded-xl border border-[#1F2937] shadow-md">
        <table className="min-w-full divide-y divide-[#1F2937] text-left text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-[#0B1120] text-zinc-300 font-semibold font-mono text-xs uppercase tracking-wider" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-[#1F2937]/70 bg-[#111827]/40 font-mono text-xs" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-4 py-3 font-semibold text-zinc-300" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-3 text-zinc-300 whitespace-pre-wrap" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-indigo-500 bg-indigo-950/20 px-4 py-3 my-4 rounded-r-xl text-sm text-zinc-300 italic shadow-inner" {...props} />
    ),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline) {
        const currentIndex = codeBlockCounter++;
        return (
          <div className="relative group my-5 rounded-2xl overflow-hidden border border-[#1F2937] bg-[#0B1120] shadow-xl">
            {/* Header bar of Code Block */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#111827] border-b border-[#1F2937] text-zinc-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                <span className="ml-2 font-semibold text-zinc-300 uppercase tracking-wider">
                  {match ? match[1] : 'code'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeString, currentIndex)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0B1120] hover:bg-[#1E293B] text-zinc-300 hover:text-white transition-colors border border-[#1F2937]"
                title="Copy code snippet"
              >
                {copiedCodeIndex === currentIndex ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed bg-[#0B1120]">
              <code>{children}</code>
            </div>
          </div>
        );
      }

      // Severity tags styling
      const trimmed = codeString.trim();
      if (trimmed === 'High' || trimmed.toLowerCase() === 'high') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
            High Severity
          </span>
        );
      }
      if (trimmed === 'Medium' || trimmed.toLowerCase() === 'medium') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Medium Severity
          </span>
        );
      }
      if (trimmed === 'Low' || trimmed.toLowerCase() === 'low') {
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
            Low Severity
          </span>
        );
      }

      return (
        <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-[#0B1120] text-indigo-300 font-mono text-xs sm:text-sm border border-[#1F2937]" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="space-y-6 mt-8 animate-fadeIn">
      {/* 1. Review Dashboard: Severity Distribution & Analysis Summary */}
      <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#1F2937]">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                Review &amp; Vulnerability Dashboard
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Deterministic AST heuristics combined with Gemini 3.6 Flash deep analysis
            </p>
          </div>

          {/* Overall Score Badge */}
          {overallScore && (
            <div className="flex items-center gap-2 bg-[#0B1120] border border-[#1F2937] px-4 py-2 rounded-xl">
              <span className="text-xs text-zinc-400 font-semibold uppercase">Overall Score:</span>
              <span className="text-base font-bold font-mono text-indigo-300">{overallScore}/10</span>
            </div>
          )}
        </div>

        {/* Severity Distribution Stacked Bar */}
        <div className="mt-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-wider text-zinc-400">
              Severity Distribution ({severityCounts.total} Total Issues)
            </span>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-rose-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {severityCounts.high} High
              </span>
              <span className="text-amber-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {severityCounts.medium} Medium
              </span>
              <span className="text-cyan-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-cyan-500" />
                {severityCounts.low} Low
              </span>
            </div>
          </div>

          {/* Stacked Progress Bar */}
          <div className="h-3 w-full rounded-full bg-[#0B1120] border border-[#1F2937] overflow-hidden flex">
            {severityCounts.total === 0 ? (
              <div className="h-full w-full bg-emerald-500/40 rounded-full" title="No security issues detected" />
            ) : (
              <>
                {severityCounts.high > 0 && (
                  <div
                    style={{ width: `${severityCounts.highPct}%` }}
                    className="h-full bg-rose-500 transition-all duration-500"
                    title={`${severityCounts.high} High Severity Issues`}
                  />
                )}
                {severityCounts.medium > 0 && (
                  <div
                    style={{ width: `${severityCounts.medPct}%` }}
                    className="h-full bg-amber-500 transition-all duration-500"
                    title={`${severityCounts.medium} Medium Severity Issues`}
                  />
                )}
                {severityCounts.low > 0 && (
                  <div
                    style={{ width: `${severityCounts.lowPct}%` }}
                    className="h-full bg-cyan-500 transition-all duration-500"
                    title={`${severityCounts.low} Low Severity Issues`}
                  />
                )}
              </>
            )}
          </div>
        </div>

        {/* Analysis Summary Badges Bar */}
        <div className="mt-5 pt-4 border-t border-[#1F2937] flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-500 font-medium mr-1">Metadata:</span>
          <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
            Lang: <strong className="text-white">{analysisSummary.language}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
            Route: <strong className="text-indigo-300 uppercase">{route}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
            Complexity: <strong className="text-amber-300">{analysisSummary.complexity}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
            Functions: <strong className="text-cyan-300">{analysisSummary.functions}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
            Classes: <strong className="text-purple-300">{analysisSummary.classes}</strong>
          </span>
          {executionTime > 0 && (
            <span className="px-3 py-1 rounded-lg bg-[#0B1120] text-zinc-300 border border-[#1F2937] font-mono">
              Latency: <strong className="text-emerald-300">{executionTime}s</strong>
            </span>
          )}
        </div>
      </div>

      {/* 2. Markdown Viewer Container */}
      <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-[#1F2937] shadow-2xl backdrop-blur-md transition-all duration-300">
        {/* Sticky Action Bar */}
        <div className="sticky top-16 z-30 p-4 sm:p-5 bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1F2937] text-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white tracking-tight">
                  Comprehensive Review Report
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Ready
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {filename}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleCopyAll}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111827] hover:bg-[#1E293B] text-zinc-200 border border-[#1F2937] transition shadow-sm"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied' : 'Copy Report'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#111827] hover:bg-[#1E293B] text-zinc-200 border border-[#1F2937] transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Review Another</span>
            </button>
          </div>
        </div>

        {/* Markdown Rendered Content */}
        <div className="p-6 sm:p-10 text-zinc-200">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {reviewMarkdown}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

