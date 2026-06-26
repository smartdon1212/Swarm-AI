import { BoardMember, BoardVote } from '../types';
import MarkdownView from './MarkdownView';
import VoteBadge from './VoteBadge';
import { TrendingUp, ShieldAlert, Cpu, Target, Brain } from 'lucide-react';

interface AgentCardProps {
  member: BoardMember;
  content: string;
  vote?: BoardVote;
  isAnalyzing: boolean;
}

const ROLE_ICONS = {
  market: TrendingUp,
  risk: ShieldAlert,
  technical: Cpu,
  strategic: Target,
  moderator: Brain,
};

const TOP_BAR_COLORS = {
  market: 'from-blue-500 to-blue-400',
  risk: 'from-red-500 to-red-400',
  technical: 'from-emerald-500 to-emerald-400',
  strategic: 'from-violet-500 to-violet-400',
  moderator: 'from-slate-600 to-slate-500',
};

export default function AgentCard({ member, content, vote, isAnalyzing }: AgentCardProps) {
  const Icon = ROLE_ICONS[member.id] || Brain;
  const topBar = TOP_BAR_COLORS[member.id] || TOP_BAR_COLORS.moderator;

  return (
    <div className="relative h-full flex flex-col bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${topBar}`} />

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${member.accentColor}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                {member.perspective}
              </p>
              <h3 className="text-sm font-semibold text-slate-900">{member.name}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{member.role}</p>
            </div>
          </div>

          {isAnalyzing ? (
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 animate-pulse">
              Analyzing...
            </span>
          ) : vote ? (
            <VoteBadge vote={vote} compact />
          ) : content ? (
            <span className="text-[10px] font-medium px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
              Complete
            </span>
          ) : null}
        </div>

        <div className="flex-grow overflow-y-auto max-h-[360px] custom-scrollbar pr-1">
          {isAnalyzing ? (
            <div className="space-y-3 py-2">
              <div className="h-3 bg-slate-100 rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-5/6 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded w-4/5 animate-pulse mt-3" />
            </div>
          ) : content ? (
            <MarkdownView content={content} />
          ) : (
            <p className="text-xs text-slate-400 text-center py-12">
              Awaiting board review...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
