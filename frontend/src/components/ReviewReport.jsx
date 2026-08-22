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
  Award,
  ExternalLink,
  ChevronRight,
  Sliders,
  Layers,
  FileCode,
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
  const [activeTab, setActiveTab] = useState('formatted'); // 'formatted' | 'raw'

  // Extract Overall Score from Markdown if present
  const overallScore = useMemo(() => {
    const match = reviewMarkdown.match(/Overall Score:\s*([\d.]+)\s*\/\s*10/i);
    return match ? match[1] : null;
  }, [reviewMarkdown]);

  // Extract sections for structured presentation
  const sections = useMemo(() => {
    if (!reviewMarkdown) return {};
    const parsed = {};
    const parts = reviewMarkdown.split(/\n(?=##\s+)/);

    for (const part of parts) {
      const match = part.match(/^##\s+(.+)$/m);
      if (match) {
        const title = match[1].trim();
        const content = part.replace(/^##\s+.+$/m, '').trim();
        parsed[title] = content;
      }
    }
    return parsed;
  }, [reviewMarkdown]);

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
    link.download = `${filename || 'review'}_report.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  let codeBlockCounter = 0;

  // Custom Markdown Renderers with Dark IDE Aesthetics
  const markdownComponents = {
    h1: ({ node, ...props }) => (
      <h1 className="text-xl sm:text-2xl font-bold text-zinc-100 border-b border-zinc-800 pb-3 mb-6 mt-4 tracking-tight" {...props} />
    ),
    h2: ({ node, ...props }) => (
      <div className="mt-8 mb-4 border-b border-zinc-800 pb-2.5 flex items-center gap-2.5">
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
      <div className="overflow-x-auto my-6 rounded-xl border border-zinc-800 shadow-md">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm" {...props} />
      </div>
    ),
    thead: ({ node, ...props }) => (
      <thead className="bg-zinc-900/90 text-zinc-200 font-semibold font-mono text-xs uppercase tracking-wider" {...props} />
    ),
    tbody: ({ node, ...props }) => (
      <tbody className="divide-y divide-zinc-800/80 bg-zinc-950/50 font-mono text-xs" {...props} />
    ),
    th: ({ node, ...props }) => (
      <th className="px-4 py-3 font-semibold text-zinc-300" {...props} />
    ),
    td: ({ node, ...props }) => (
      <td className="px-4 py-3 text-zinc-300 whitespace-pre-wrap" {...props} />
    ),
    blockquote: ({ node, ...props }) => (
      <blockquote className="border-l-4 border-indigo-500 bg-indigo-950/30 px-4 py-3 my-4 rounded-r-xl text-sm text-zinc-300 italic shadow-inner" {...props} />
    ),
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');

      if (!inline) {
        const currentIndex = codeBlockCounter++;
        return (
          <div className="relative group my-5 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl">
            {/* Header bar of Code Block */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/90 border-b border-zinc-800 text-zinc-400 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
                <span className="ml-2 font-semibold text-zinc-300 uppercase tracking-wider">
                  {match ? match[1] : 'code'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeString, currentIndex)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
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
            <div className="p-4 sm:p-5 overflow-x-auto text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed bg-zinc-950">
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
        <code className="px-1.5 py-0.5 mx-0.5 rounded-md bg-zinc-800 text-indigo-300 font-mono text-xs sm:text-sm border border-zinc-700/80" {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl backdrop-blur-md transition-all duration-300 mt-8">
      {/* Top Banner Bar */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-indigo-950/80 border-b border-zinc-800 text-zinc-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center flex-shrink-0 text-indigo-400 shadow-inner">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Code Review Report
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Completed
              </span>
              {overallScore && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                  Score: {overallScore}/10
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 mt-1 font-mono">
              Target: <span className="text-zinc-200 font-medium">{filename}</span> • Pipeline:{' '}
              <span className="text-indigo-300 font-medium uppercase">{route}</span>
              {executionTime ? ` • Duration: ${executionTime}s` : ''}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleCopyAll}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition shadow-sm"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAll ? 'Copied' : 'Copy Report'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .md</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-lg shadow-indigo-600/30 transition active:scale-[0.98]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Review Another</span>
          </button>
        </div>
      </div>

      {/* Main Review Body */}
      <div className="p-6 sm:p-10 text-zinc-200">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={markdownComponents}
        >
          {reviewMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
