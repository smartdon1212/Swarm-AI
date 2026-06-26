import type { BoardVote } from '../types';

const VOTE_STYLES: Record<BoardVote, { bg: string; text: string; border: string }> = {
  'Strong Approve': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  Approve: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
  },
  Neutral: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  Concerned: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  Reject: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
};

interface VoteBadgeProps {
  vote: BoardVote;
  compact?: boolean;
}

export default function VoteBadge({ vote, compact }: VoteBadgeProps) {
  const style = VOTE_STYLES[vote];
  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full ${style.bg} ${style.text} ${style.border} ${
        compact ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      {vote}
    </span>
  );
}

export { VOTE_STYLES };
