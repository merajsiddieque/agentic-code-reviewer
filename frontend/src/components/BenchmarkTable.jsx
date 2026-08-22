import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileCode,
  Tag,
  AlertCircle,
  TableProperties,
} from 'lucide-react';

export default function BenchmarkTable({ examples = [] }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatScore = (val) => {
    if (val === undefined || val === null) return '--%';
    return `${Math.round(val * 100)}%`;
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!examples || examples.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-8 text-center text-zinc-400">
        No per-example benchmark data available.
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl backdrop-blur-md overflow-hidden mb-8">
      <div className="p-5 sm:p-6 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <TableProperties className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base sm:text-lg font-bold text-zinc-100">
            Benchmark Test Cases
          </h3>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-zinc-800 px-3 py-1 rounded-full border border-zinc-700">
          {examples.length} Cases Evaluated
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-800 text-left text-sm">
          <thead className="bg-zinc-950/80 text-zinc-400 font-mono text-xs uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">ID</th>
              <th className="px-5 py-3.5">Benchmark</th>
              <th className="px-5 py-3.5">Precision</th>
              <th className="px-5 py-3.5">Recall</th>
              <th className="px-5 py-3.5">F1</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40 font-mono text-xs">
            {examples.map((item) => {
              const isPassed = (item.exact_match === 1.0 || item.f1_score >= 0.8);
              const isExpanded = expandedId === item.id;

              return (
                <React.Fragment key={item.id}>
                  <tr
                    onClick={() => toggleExpand(item.id)}
                    className="hover:bg-zinc-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4 font-semibold text-zinc-300">
                      #{item.id}
                    </td>
                    <td className="px-5 py-4 font-sans font-medium text-zinc-100 text-sm">
                      {item.title}
                    </td>
                    <td className="px-5 py-4 text-indigo-300 font-bold">
                      {formatScore(item.precision)}
                    </td>
                    <td className="px-5 py-4 text-cyan-300 font-bold">
                      {formatScore(item.recall)}
                    </td>
                    <td className="px-5 py-4 text-emerald-300 font-bold">
                      {formatScore(item.f1_score)}
                    </td>
                    <td className="px-5 py-4">
                      {isPassed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Passed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3.5 h-3.5" />
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        className="p-1 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>

                  {/* Expanded Findings Details */}
                  {isExpanded && (
                    <tr className="bg-zinc-950/70">
                      <td colSpan={7} className="p-5">
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 space-y-4 font-sans text-xs">
                          {/* Matched Findings */}
                          <div>
                            <span className="font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              Matched Findings ({item.matched_findings?.length || 0}):
                            </span>
                            {item.matched_findings && item.matched_findings.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {item.matched_findings.map((f, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-zinc-500 italic">None</span>
                            )}
                          </div>

                          {/* Missing Findings */}
                          <div>
                            <span className="font-semibold text-zinc-300 flex items-center gap-1.5 mb-2">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                              Missing Findings ({item.missing_findings?.length || 0}):
                            </span>
                            {item.missing_findings && item.missing_findings.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {item.missing_findings.map((f, i) => (
                                  <span
                                    key={i}
                                    className="px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono"
                                  >
                                    {f}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-emerald-400 font-medium">None (100% matched)</span>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
