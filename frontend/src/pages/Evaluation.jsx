import React, { useEffect, useState } from 'react';
import {
  Gauge,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Layers,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp,
  Terminal,
} from 'lucide-react';
import { getEvaluationReport } from '../services/api';
import EvalSummaryCards from '../components/EvalSummaryCards';
import ProgressMetric from '../components/ProgressMetric';
import BenchmarkTable from '../components/BenchmarkTable';

export default function Evaluation() {
  const [evalData, setEvalData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedFailedId, setExpandedFailedId] = useState(null);

  const fetchEvaluation = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getEvaluationReport();
      setEvalData(data);
    } catch (err) {
      setError('Unable to load evaluation report. Ensure backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluation();
  }, []);

  const summary = evalData?.summary || {};
  const perExample = evalData?.per_example_scores || [];
  const failedCases = evalData?.failed_cases || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Evaluation Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/60 flex items-center justify-center text-indigo-400">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Evaluation Harness &amp; Benchmark Report
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Quantitative performance evaluation of LangGraph agent &amp; Gemini 3.6 Flash against ground truth test suites
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchEvaluation}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Reload Report</span>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-sm flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metric Cards */}
      <EvalSummaryCards summary={summary} />

      {/* Performance Visualizer Progress Bars */}
      <ProgressMetric summary={summary} />

      {/* Benchmark Results Table */}
      <BenchmarkTable examples={perExample} />

      {/* Failed Cases Panel */}
      <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 shadow-xl backdrop-blur-md">
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Benchmark Failures &amp; Discrepancies
        </h3>

        {failedCases.length === 0 ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-emerald-300 mb-1">
              All benchmark tests passed
            </h4>
            <p className="text-xs text-emerald-400/80">
              100% of expected security vulnerabilities and defect patterns were accurately identified.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {failedCases.map((fCase, idx) => {
              const isExpanded = expandedFailedId === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-rose-900/80 bg-zinc-950 p-5 space-y-3"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedFailedId(isExpanded ? null : idx)}
                  >
                    <div>
                      <h4 className="text-sm font-semibold text-rose-300">
                        {fCase.title || `Test Case #${idx + 1}`}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        Missing {fCase.missing_findings?.length || 0} expected findings
                      </p>
                    </div>
                    <button type="button" className="text-zinc-400 hover:text-zinc-200">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pt-3 border-t border-zinc-800/80 space-y-3 text-xs">
                      <div>
                        <span className="font-semibold text-zinc-300">Expected Findings:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {fCase.expected_findings?.map((ef, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                              {ef}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-rose-300">Missing Findings:</span>
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {fCase.missing_findings?.map((mf, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-900 font-mono">
                              {mf}
                            </span>
                          ))}
                        </div>
                      </div>

                      {fCase.review_output && (
                        <div>
                          <span className="font-semibold text-zinc-300">Raw Review Output:</span>
                          <pre className="mt-1 p-3 rounded-lg bg-zinc-900 text-zinc-300 font-mono text-[11px] overflow-x-auto max-h-48">
                            {fCase.review_output}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
