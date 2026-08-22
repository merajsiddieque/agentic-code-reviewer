import React from 'react';
import {
  Target,
  Zap,
  Award,
  CheckCircle2,
  XCircle,
  FileCheck,
  Layers,
} from 'lucide-react';

export default function EvalSummaryCards({ summary = {} }) {
  const formatPercent = (val) => {
    if (val === undefined || val === null) return '--%';
    return `${Math.round(val * 100)}%`;
  };

  const totalSamples = summary.total_samples ?? '--';
  const passedSamples = summary.passed_samples ?? '--';
  const failedSamples = summary.failed_samples ?? '--';

  const rateCards = [
    {
      title: 'Precision',
      value: formatPercent(summary.overall_precision),
      subtitle: 'True findings / Total flagged',
      icon: Target,
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'from-indigo-500/20 to-transparent',
    },
    {
      title: 'Recall',
      value: formatPercent(summary.overall_recall),
      subtitle: 'True findings / Ground truth',
      icon: Zap,
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'from-cyan-500/20 to-transparent',
    },
    {
      title: 'F1 Score',
      value: formatPercent(summary.overall_f1),
      subtitle: 'Harmonic mean of P & R',
      icon: Award,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'from-emerald-500/20 to-transparent',
    },
    {
      title: 'Exact Match Rate',
      value: formatPercent(summary.overall_exact_match_rate),
      subtitle: '100% strict match across set',
      icon: CheckCircle2,
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      glow: 'from-purple-500/20 to-transparent',
    },
  ];

  const sampleCards = [
    {
      title: 'Total Samples',
      value: totalSamples,
      subtitle: 'Ground truth test suite size',
      icon: Layers,
      badgeColor: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      glow: 'from-zinc-700/20 to-transparent',
    },
    {
      title: 'Passed Cases',
      value: passedSamples,
      subtitle: 'Met benchmark threshold',
      icon: CheckCircle2,
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'from-emerald-500/20 to-transparent',
    },
    {
      title: 'Failed Cases',
      value: failedSamples,
      subtitle: 'Requiring prompt/agent refinement',
      icon: XCircle,
      badgeColor: failedSamples > 0 
        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' 
        : 'bg-zinc-800 text-zinc-400 border-zinc-700',
      glow: failedSamples > 0 ? 'from-rose-500/20 to-transparent' : 'from-zinc-700/20 to-transparent',
    },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Sample Counts Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {sampleCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-lg backdrop-blur transition-all duration-300 hover:border-zinc-700 group"
            >
              <div
                className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.badgeColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
                  {card.value}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1 truncate font-medium">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>

      {/* Metric Rate Percentage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rateCards.map((card, idx) => {
          const IconComponent = card.icon;
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-lg backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-indigo-500/5 group"
            >
              <div
                className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
              />
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.badgeColor}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold text-zinc-100 tracking-tight font-mono">
                  {card.value}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-2 truncate font-medium">
                {card.subtitle}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
