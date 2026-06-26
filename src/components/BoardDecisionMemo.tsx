import type { BoardDecisionMemo, Recommendation } from '../types';
import MarkdownView from './MarkdownView';
import { CheckCircle2, AlertTriangle, RotateCcw, XCircle } from 'lucide-react';
import type { ReactNode } from 'react';

const RECOMMENDATION_CONFIG: Record<
  Recommendation,
  { icon: ReactNode; bg: string; border: string; text: string }
> = {
  Proceed: {
    icon: <CheckCircle2 className="w-5 h-5" />,
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-800',
  },
  'Proceed With Caution': {
    icon: <AlertTriangle className="w-5 h-5" />,
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-800',
  },
  Pivot: {
    icon: <RotateCcw className="w-5 h-5" />,
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-800',
  },
  Reject: {
    icon: <XCircle className="w-5 h-5" />,
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-800',
  },
};

interface ScoreBarProps {
  label: string;
  score: number;
  invert?: boolean;
}

function ScoreBar({ label, score, invert }: ScoreBarProps) {
  const displayScore = invert ? 100 - score : score;
  const color =
    displayScore >= 70
      ? 'bg-emerald-500'
      : displayScore >= 45
        ? 'bg-amber-500'
        : 'bg-red-500';

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-medium text-slate-600">{label}</span>
        <span className="text-xs font-mono font-semibold text-slate-800">
          {score}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

interface BoardDecisionMemoViewProps {
  memo: BoardDecisionMemo;
}

export default function BoardDecisionMemoView({ memo }: BoardDecisionMemoViewProps) {
  const rec = RECOMMENDATION_CONFIG[memo.recommendation] || RECOMMENDATION_CONFIG['Proceed With Caution'];

  return (
    <div className="space-y-6">
      {/* Header recommendation */}
      <div className={`rounded-xl border p-6 ${rec.bg} ${rec.border}`}>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          Board Decision
        </p>
        <div className={`flex items-center gap-3 ${rec.text}`}>
          {rec.icon}
          <span className="text-2xl font-bold tracking-tight">
            {memo.recommendation}
          </span>
        </div>
        <p className="text-sm text-slate-600 mt-3">
          Confidence Score:{' '}
          <strong className="text-slate-900">{memo.confidenceScore}/100</strong>
        </p>
      </div>

      {/* Score dimensions */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Decision Scores
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScoreBar label="Market Opportunity" score={memo.marketOpportunityScore} />
          <ScoreBar label="Technical Feasibility" score={memo.technicalFeasibilityScore} />
          <ScoreBar label="Risk Level" score={memo.riskScore} invert />
          <ScoreBar label="Execution Difficulty" score={memo.executionDifficultyScore} invert />
        </div>
      </div>

      {/* Opportunities & Risks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-3">
            Key Opportunities
          </h3>
          <ul className="space-y-2">
            {memo.keyOpportunities.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-emerald-500 mt-0.5 flex-shrink-0">●</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-3">
            Key Risks
          </h3>
          <ul className="space-y-2">
            {memo.keyRisks.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next actions & triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-3">
            Recommended Next Actions
          </h3>
          <ol className="space-y-2">
            {memo.recommendedNextActions.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex-shrink-0">
                  {i + 1}
                </span>
                {item}
              </li>
            ))}
          </ol>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
            What Would Change Our Decision?
          </h3>
          <ul className="space-y-2">
            {memo.decisionTriggers.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-400 mt-0.5 flex-shrink-0">→</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Final verdict */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
          Final Board Verdict
        </h3>
        <MarkdownView content={memo.finalVerdict} />
      </div>
    </div>
  );
}
