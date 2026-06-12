import { motion } from 'motion/react';

interface ScoreGaugeProps {
  score: number;
}

export default function ScoreGauge({ score }: ScoreGaugeProps) {
  // Determine color theme based on score
  const getScoreTheme = (val: number) => {
    if (val >= 80) return {
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
      borderColor: 'border-teal-500/30',
      ringColor: 'stroke-teal-400',
      label: 'High Viability Venture',
      desc: 'Our boardroom analysis assesses this venture as structurally solid, with high market demand, minor technological risk, and clean implementation pathways.',
    };
    if (val >= 60) return {
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      ringColor: 'stroke-amber-400',
      label: 'Conditional Feasibility',
      desc: 'The concept is technically sound, but requires severe pivot cycles or immediate validation of risk objections raised by the Critic.',
    };
    return {
      color: 'text-rose-450',
      bgColor: 'bg-rose-500/10',
      borderColor: 'border-rose-500/20',
      ringColor: 'stroke-rose-500',
      label: 'Significant Hurdles Block',
      desc: 'Substantial structural bottlenecks, low market feasibility, or critical technology roadblocks prevent easy commercialization without complete redesign.',
    };
  };

  const theme = getScoreTheme(score);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`p-5 rounded-xl border ${theme.bgColor} ${theme.borderColor} flex flex-col md:flex-row items-center gap-5 transition-all`}>
      {/* Animated Gauge Wheel */}
      <div className="relative w-32 h-32 flex-shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-800/80"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Animated score arc */}
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
            className="text-3.5xl font-mono font-bold text-white tracking-tight score-glow-text"
          >
            {score}
          </motion.span>
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mt-[-3px]">V-Score</span>
        </div>
      </div>

      {/* Structured Feasibility Text Details */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
          <span className={`text-xs font-mono px-2.5 py-0.5 rounded-full font-bold border ${theme.borderColor} ${theme.color}`}>
            {theme.label}
          </span>
          <span className="text-xs text-slate-500 font-mono">Boardroom Verdict</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
          {theme.desc}
        </p>
      </div>
    </div>
  );
}
