import { BoardMember } from '../types';
import MarkdownView from './MarkdownView';
import { motion } from 'motion/react';
import { Shield, Brain, HardDrive, Compass } from 'lucide-react';

interface AgentCardProps {
  member: BoardMember;
  content: string;
  isAnalyzing: boolean;
  status: 'thinking' | 'idle' | 'completed';
}

export default function AgentCard({ member, content, isAnalyzing, status }: AgentCardProps) {
  // Get icon based on role
  const getRoleIcon = () => {
    switch (member.id) {
      case 'research':
        return <Brain className="w-4 h-4 text-sky-400" />;
      case 'critic':
        return <Shield className="w-4 h-4 text-rose-400" />;
      case 'engineer':
        return <HardDrive className="w-4 h-4 text-emerald-400" />;
      default:
        return <Compass className="w-4 h-4 text-amber-450" />;
    }
  };

  const statusTags = {
    thinking: { label: "Debating...", color: "bg-amber-500 text-amber-950 border-amber-450 animate-pulse" },
    completed: { label: "Finished", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
    idle: { label: "Standing By", color: "bg-slate-800 text-slate-400 border-slate-700" }
  };

  const currentStatus = isAnalyzing ? 'thinking' : (content ? 'completed' : 'idle');
  const tag = statusTags[currentStatus];

  // Specific shadow and border highlights for characters
  const borderStyles = {
    research: 'hover:border-sky-500/50 border-sky-950/40 focus-within:border-sky-500',
    critic: 'hover:border-rose-500/50 border-rose-950/40 focus-within:border-rose-500',
    engineer: 'hover:border-emerald-500/50 border-emerald-950/40 focus-within:border-emerald-500',
    strategist: 'hover:border-amber-500/50 border-amber-950/40 focus-within:border-amber-500'
  };

  const bgGradient = {
    research: 'from-sky-950/10 via-slate-900/40 to-slate-950/90',
    critic: 'from-rose-950/10 via-slate-900/40 to-slate-950/90',
    engineer: 'from-emerald-950/10 via-slate-900/40 to-slate-950/90',
    strategist: 'from-amber-950/10 via-slate-900/40 to-slate-950/90'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`agent-card relative h-full flex flex-col rounded-lg p-5 transition-all shadow-lg ${borderStyles[member.id as keyof typeof borderStyles]}`}
    >
      {/* Decorative colored glow on card header */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] rounded-t-lg bg-gradient-to-r ${
        member.id === 'research' ? 'from-sky-500 to-sky-300' :
        member.id === 'critic' ? 'from-rose-600 to-rose-400' :
        member.id === 'engineer' ? 'from-emerald-500 to-emerald-300' :
        'from-amber-500 to-amber-300'
      }`} />

      {/* Profile Header */}
      <div className="agent-header flex items-start justify-between gap-3 mb-4 mt-1 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={member.avatar}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-full object-cover border-2 border-slate-800"
            />
            {currentStatus === 'thinking' && (
              <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-slate-950 bg-amber-500 animate-ping" />
            )}
            {currentStatus === 'completed' && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-slate-950 bg-emerald-500" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-wider uppercase text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded flex items-center gap-1">
                {getRoleIcon()}
                {member.role}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white mt-1">{member.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{member.credentials}</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${tag.color}`}>
          {tag.label}
        </span>
      </div>

      {/* Analysis Output Section */}
      <div className="flex-grow overflow-y-auto max-h-[380px] custom-scrollbar pr-1 relative">
        {currentStatus === 'thinking' ? (
          <div className="space-y-3.5 py-2">
            <div className="h-4 bg-slate-800/50 rounded-md w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-800/30 rounded-md w-full animate-pulse" />
              <div className="h-3 bg-slate-800/30 rounded-md w-11/12 animate-pulse" />
              <div className="h-3 bg-slate-800/30 rounded-md w-4/5 animate-pulse" />
            </div>
            <div className="h-3.5 bg-slate-800/40 rounded-md w-[85%] animate-pulse mt-4" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-800/30 rounded-md w-full animate-pulse" />
              <div className="h-3 bg-slate-800/30 rounded-md w-10/12 animate-pulse" />
            </div>
          </div>
        ) : content ? (
          <div className="space-y-1">
            <MarkdownView content={content} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800/40 flex items-center justify-center mb-3">
              <span className="text-slate-600">?</span>
            </div>
            <p className="text-xs text-slate-500 max-w-[180px]">Standing by. Submit an idea above to start the boardroom debate.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
