import { motion } from 'motion/react';
import { SubScores, SubScoreWeights } from '../types';
import { BarChart3, ShieldAlert, Cpu, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface ScoreGaugeProps {
  score: number;
  subScores?: SubScores;
  subScoreWeights?: SubScoreWeights;
}

export default function ScoreGauge({ score, subScores, subScoreWeights }: ScoreGaugeProps) {
  const [showFormula, setShowFormula] = useState(false);

  const weights = subScoreWeights || { market: 0.35, riskSurvival: 0.35, techFeasibility: 0.30 };

  const getScoreTheme = (val: number) => {
    if (val >= 80) return {
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      ringColor: 'stroke-purple-600',
      label: 'High Viability Venture',
      desc: 'Our boardroom analysis assesses this venture as structurally solid, with high market demand, minor technological risk, and clean implementation pathways.',
    };
    if (val >= 60) return {
      color: 'text-purple-800',
      bgColor: 'bg-purple-50/80',
      borderColor: 'border-purple-200',
      ringColor: 'stroke-purple-700',
      label: 'Conditional Feasibility',
      desc: 'The concept is technically sound, but requires pivot cycles or immediate validation of risk objections raised by the Critic.',
    };
    return {
      color: 'text-slate-800',
      bgColor: 'bg-slate-100',
      borderColor: 'border-slate-300',
      ringColor: 'stroke-slate-700',
      label: 'Significant Hurdles Block',
      desc: 'Substantial structural bottlenecks, low market feasibility, or critical technology roadblocks prevent easy commercialization without complete redesign.',
    };
  };

  const theme = getScoreTheme(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const mScore = subScores?.market ?? 70;
  const rScore = subScores?.riskSurvival ?? 60;
  const tScore = subScores?.techFeasibility ?? 75;

  return (
    <div className={`p-5 md:p-6 rounded-xl border ${theme.bgColor} ${theme.borderColor} flex flex-col gap-5 transition-all shadow-xs`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Gauge Wheel */}
        <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r={radius}
              className="stroke-slate-200"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Score arc */}
            <motion.circle
              cx="64"
              cy="64"
              r={radius}
              className={`${theme.ringColor}`}
              strokeWidth="9"
              fill="transparent"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: 'easeOut' }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-3xl font-mono font-black text-slate-900 tracking-tight"
            >
              {score}%
            </motion.span>
            <span className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mt-[-2px]">Composite V-Score</span>
          </div>
        </div>

        {/* Structured Feasibility Text Details */}
        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold border ${theme.borderColor} ${theme.color} ${theme.bgColor}`}>
                {theme.label}
              </span>
              <span className="text-xs text-slate-500 font-mono font-semibold">Weighted Composite Assessment</span>
            </div>
            <button
              onClick={() => setShowFormula(!showFormula)}
              className="text-[11px] font-mono text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer bg-white px-2.5 py-1 rounded border border-purple-200 shadow-2xs hover:bg-purple-50 transition"
              title="View Composite Rubric Calculation"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showFormula ? "Hide Formula" : "Why this score?"}
            </button>
          </div>
          
          <p className="text-xs text-slate-700 leading-relaxed font-sans mb-3">
            {theme.desc}
          </p>

          {showFormula && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3 bg-white border border-purple-200 rounded-lg text-xs font-mono text-slate-800 space-y-1 mb-3"
            >
              <div className="font-bold text-purple-900 uppercase tracking-wider text-[10px]">Weighted Composite Formula:</div>
              <div className="text-[11px]">
                Score = ({mScore}% × {Math.round(weights.market * 100)}% Market) + ({rScore}% × {Math.round(weights.riskSurvival * 100)}% Risk Survival) + ({tScore}% × {Math.round(weights.techFeasibility * 100)}% Tech Feasibility)
              </div>
              <div className="text-[10px] text-slate-500">
                Calculated by Consensus Director to replace single-shot hallucinated ratings with audited component sub-scores.
              </div>
            </motion.div>
          )}

          {/* Sub-score progress bars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-purple-100">
            {/* Market Sub-score */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1 text-purple-900">
                  <BarChart3 className="w-3 h-3 text-purple-600" />
                  Market &amp; Demand
                </span>
                <span className="text-slate-900">{mScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full" style={{ width: `${mScore}%` }} />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 block">Weight: {Math.round(weights.market * 100)}%</span>
            </div>

            {/* Risk Survival Sub-score */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1 text-slate-900">
                  <ShieldAlert className="w-3 h-3 text-slate-700" />
                  Risk Survival
                </span>
                <span className="text-slate-900">{rScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-slate-700 h-full rounded-full" style={{ width: `${rScore}%` }} />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 block">Weight: {Math.round(weights.riskSurvival * 100)}%</span>
            </div>

            {/* Tech Feasibility Sub-score */}
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold text-slate-800 mb-1">
                <span className="flex items-center gap-1 text-indigo-900">
                  <Cpu className="w-3 h-3 text-indigo-600" />
                  Tech Feasibility
                </span>
                <span className="text-slate-900">{tScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${tScore}%` }} />
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-1 block">Weight: {Math.round(weights.techFeasibility * 100)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
