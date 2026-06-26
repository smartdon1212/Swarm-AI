import type { BoardVotes } from '../types';
import { summarizeVotes } from '../lib/votes';
import VoteBadge from './VoteBadge';

const PERSPECTIVE_LABELS: { key: keyof BoardVotes; label: string }[] = [
  { key: 'market', label: 'Market Analysis' },
  { key: 'risk', label: 'Risk Analysis' },
  { key: 'technical', label: 'Technical Analysis' },
  { key: 'strategic', label: 'Strategic Analysis' },
];

interface BoardVotePanelProps {
  votes: BoardVotes;
}

export default function BoardVotePanel({ votes }: BoardVotePanelProps) {
  const summary = summarizeVotes(votes);

  const summaryParts: string[] = [];
  const approveCount = summary.strongApprove + summary.approve;
  if (approveCount > 0) summaryParts.push(`${approveCount} Approve`);
  if (summary.concerned > 0) summaryParts.push(`${summary.concerned} Concern`);
  if (summary.neutral > 0) summaryParts.push(`${summary.neutral} Neutral`);
  if (summary.reject > 0) summaryParts.push(`${summary.reject} Reject`);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">
        Board Vote
      </h3>

      <div className="space-y-3 mb-5">
        {PERSPECTIVE_LABELS.map(({ key, label }) => (
          <div
            key={key}
            className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0"
          >
            <span className="text-sm text-slate-700 font-medium">{label}</span>
            <VoteBadge vote={votes[key]} compact />
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
        <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-1">
          Vote Summary
        </p>
        <p className="text-sm font-semibold text-blue-900">
          {summaryParts.join(' · ') || 'No votes recorded'}
        </p>
      </div>
    </div>
  );
}
