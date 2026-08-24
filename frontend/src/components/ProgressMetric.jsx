import React from 'react';
import { Target, Zap, Award, CheckCircle2, TrendingUp } from 'lucide-react';

export default function ProgressMetric({ summary = {} }) {
  const metrics = [
    {
      label: 'Precision',
      value: summary.overall_precision ?? 0,
      icon: Target,
      barGradient: 'from-indigo-500 to-indigo-400',
      textColor: 'text-indigo-400',
      description: 'Accuracy of generated security findings against ground truth dataset.',
    },
    {
      label: 'Recall',
      value: summary.overall_recall ?? 0,
      icon: Zap,
      barGradient: 'from-cyan-500 to-cyan-400',
      textColor: 'text-cyan-400',
      description: 'Proportion of expected real-world vulnerabilities successfully flagged.',
    },
    {
      label: 'F1 Score',
      value: summary.overall_f1 ?? 0,
      icon: Award,
      barGradient: 'from-emerald-500 to-emerald-400',
      textColor: 'text-emerald-400',
      description: 'Harmonized metric balancing both false positives and missed defects.',
    },
    {
      label: 'Exact Match Rate',
      value: summary.overall_exact_match_rate ?? 0,
      icon: CheckCircle2,
      barGradient: 'from-purple-500 to-purple-400',
      textColor: 'text-purple-400',
      description: 'Percentage of test samples with 100% complete finding match.',
    },
  ];

  return (
    <div className="rounded-2xl bg-[#111827] border border-[#1F2937] p-6 sm:p-7 shadow-xl backdrop-blur-md mb-8">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#1F2937]">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-zinc-100 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            Performance Visualizer
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Benchmark distribution across ground truth test samples
          </p>
        </div>
        <span className="text-xs font-mono text-zinc-400 bg-[#0B1120] px-3 py-1 rounded-full border border-[#1F2937]">
          Target: &gt;90%
        </span>
      </div>

      <div className="space-y-6">
        {metrics.map((item, idx) => {
          const percent = Math.min(100, Math.max(0, Math.round(item.value * 100)));
          const IconComp = item.icon;

          return (
            <div key={idx} className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <IconComp className={`w-4 h-4 ${item.textColor}`} />
                  <span className="text-sm font-semibold text-zinc-200">
                    {item.label}
                  </span>
                </div>
                <span className={`text-sm font-mono font-bold ${item.textColor}`}>
                  {percent}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="w-full h-3 bg-[#0B1120] rounded-full overflow-hidden border border-[#1F2937] p-0.5 shadow-inner">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.barGradient} transition-all duration-700 ease-out shadow-sm`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <p className="text-xs text-zinc-500 mt-1.5 font-medium">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

