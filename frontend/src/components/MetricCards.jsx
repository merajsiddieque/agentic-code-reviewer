import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Bug,
  FileCode2,
  Clock,
  Activity,
  CheckCircle2,
  TrendingUp,
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
    : (isLoading ? 'Calculating...' : '--');

  // Compute Security Score
  const securityScore = reviewData?.overall_score
    ? `${reviewData.overall_score}/10`
    : (metrics.security_score ? `${metrics.security_score}/10` : (reviewData ? '9.0/10' : '--'));

  // Compute Issues Found
  const issuesFound = metrics.issues_count ?? (
    reviewData?.security?.length !== undefined 
      ? reviewData.security.length 
      : (reviewData ? (metrics.issues_count ?? 0) : '--')
  );

  const cards = [
    {
      title: 'Security Score',
      value: securityScore,
      subtitle: reviewData ? 'Evaluated via AST & Gemini' : 'Awaiting code scan',
      icon: ShieldCheck,
      color: 'indigo',
      borderColor: 'border-indigo-500/30',
      badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'from-indigo-500/20 to-transparent',
    },
    {
      title: 'Issues Found',
      value: issuesFound,
      subtitle: reviewData ? 'Bugs, vulnerabilities & style' : 'Scan to detect issues',
      icon: Bug,
      color: 'rose',
      borderColor: 'border-rose-500/30',
      badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'from-rose-500/20 to-transparent',
    },
    {
      title: 'Lines of Code',
      value: loc,
      subtitle: selectedFile ? `${selectedFile.name}` : 'No file selected',
      icon: FileCode2,
      color: 'cyan',
      borderColor: 'border-cyan-500/30',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      glow: 'from-cyan-500/20 to-transparent',
    },
    {
      title: 'Review Time',
      value: executionTime,
      subtitle: reviewData ? `Pipeline: ${reviewData.route || 'full'}` : 'Deterministic + LLM',
      icon: Clock,
      color: 'amber',
      borderColor: 'border-amber-500/30',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'from-amber-500/20 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-zinc-900/90 border border-zinc-800 p-5 shadow-lg backdrop-blur transition-all duration-300 hover:border-zinc-700 hover:shadow-indigo-500/5 group`}
          >
            {/* Ambient background glow */}
            <div
              className={`absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 rounded-full bg-gradient-to-br ${card.glow} blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-500`}
            />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ${card.badgeColor}`}
              >
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
  );
}
