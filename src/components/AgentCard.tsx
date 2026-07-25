import { BoardMember, GroundingSource, AgentFollowUp } from '../types';
import MarkdownView from './MarkdownView';
import { motion } from 'motion/react';
import { Shield, Brain, HardDrive, Compass, ExternalLink, MessageSquare, Send, RefreshCw, AlertCircle } from 'lucide-react';
import React, { useState, FormEvent } from 'react';

interface AgentCardProps {
  key?: string;
  member: BoardMember;
  content: string;
  isAnalyzing: boolean;
  status: 'thinking' | 'idle' | 'completed';
  projectId?: string;
  userId?: string;
  groundingSources?: GroundingSource[];
  followUps?: AgentFollowUp[];
  onFollowUpAdded?: (agentId: string, followUp: AgentFollowUp) => void;
}

export default function AgentCard({
  member,
  content,
  isAnalyzing,
  projectId,
  userId,
  groundingSources,
  followUps = [],
  onFollowUpAdded
}: AgentCardProps) {
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Role icon with clean purple focus
  const getRoleIcon = () => {
    switch (member.id) {
      case 'research':
        return <Brain className="w-3.5 h-3.5 text-purple-600" />;
      case 'critic':
        return <Shield className="w-3.5 h-3.5 text-purple-700" />;
      case 'engineer':
        return <HardDrive className="w-3.5 h-3.5 text-purple-600" />;
      default:
        return <Compass className="w-3.5 h-3.5 text-purple-700" />;
    }
  };

  const statusTags = {
    thinking: { label: "Debating...", color: "bg-purple-100 text-purple-900 border-purple-300" },
    completed: { label: "Finished", color: "bg-purple-50 text-purple-700 border-purple-200" },
    idle: { label: "Standing By", color: "bg-slate-100 text-slate-600 border-slate-200" }
  };

  const currentStatus = isAnalyzing ? 'thinking' : (content ? 'completed' : 'idle');
  const tag = statusTags[currentStatus];

  const handleSendFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !projectId) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agent-followup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          agentId: member.id,
          question: question.trim(),
          userId: userId || "mock-guest-uid"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit follow-up question.");
      }

      if (data.followUp && onFollowUpAdded) {
        onFollowUpAdded(member.id, data.followUp);
      }
      setQuestion("");
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="agent-card relative h-full flex flex-col rounded-xl p-5 bg-white border border-slate-200 shadow-sm hover:border-purple-300 transition-all text-slate-900"
    >
      {/* Top purple accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-purple-600" />

      {/* Profile Header */}
      <div className="agent-header flex items-start justify-between gap-3 mb-3 mt-1 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={member.avatar}
              alt={member.name}
              referrerPolicy="no-referrer"
              className="w-11 h-11 rounded-full object-cover border-2 border-purple-100 shadow-xs"
            />
            {currentStatus === 'thinking' && (
              <span className="absolute bottom-0 right-0 block h-3.5 w-3.5 rounded-full ring-2 ring-white bg-purple-600 animate-ping" />
            )}
            {currentStatus === 'completed' && (
              <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-purple-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] tracking-wider uppercase text-purple-900 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                {getRoleIcon()}
                {member.role}
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">{member.name}</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{member.credentials}</p>
          </div>
        </div>

        <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${tag.color}`}>
          {tag.label}
        </span>
      </div>

      {/* Task 0.4 Visible Disclaimer for Dr. Evelyn Carter */}
      {member.id === 'research' && currentStatus === 'completed' && (
        <div className="mb-3 p-2.5 rounded-lg bg-purple-50/80 border border-purple-200 text-[11px] text-slate-700 flex items-start gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
          <p className="leading-tight font-sans">
            <strong className="text-purple-900 font-semibold">Data Currency Disclaimer:</strong> Research findings are augmented with live web grounding. Always verify financial &amp; regulatory filings prior to capital deployment.
          </p>
        </div>
      )}

      {/* Analysis Output Section */}
      <div className="flex-grow overflow-y-auto max-h-[380px] custom-scrollbar pr-1 relative space-y-3">
        {currentStatus === 'thinking' ? (
          <div className="space-y-3.5 py-2">
            <div className="h-4 bg-purple-100/60 rounded-md w-3/4 animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-md w-11/12 animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-md w-4/5 animate-pulse" />
            </div>
            <div className="h-3.5 bg-purple-100/50 rounded-md w-[85%] animate-pulse mt-4" />
            <div className="space-y-2">
              <div className="h-3 bg-slate-100 rounded-md w-full animate-pulse" />
              <div className="h-3 bg-slate-100 rounded-md w-10/12 animate-pulse" />
            </div>
          </div>
        ) : content ? (
          <div className="space-y-3">
            <MarkdownView content={content} />

            {/* Task 2.1 Live Search Grounding Sources for Research node */}
            {member.id === 'research' && groundingSources && groundingSources.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-900 font-bold block mb-1.5">
                  Live Web Grounding Sources:
                </span>
                <div className="space-y-1">
                  {groundingSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-purple-700 hover:text-purple-900 hover:underline flex items-center gap-1 font-mono truncate"
                    >
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{source.title || source.url}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Task 2.3 Follow-up Q&A History */}
            {followUps.length > 0 && (
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-900 font-bold block">
                  Follow-Up Deliberations ({followUps.length}):
                </span>
                {followUps.map((fu, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-slate-800 flex items-center gap-1">
                      <span className="text-purple-700 font-mono">Q:</span> &ldquo;{fu.question}&rdquo;
                    </div>
                    <div className="text-slate-700 text-[11px] leading-relaxed">
                      <MarkdownView content={fu.answer} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center mb-3 text-purple-600 font-bold text-sm">
              ?
            </div>
            <p className="text-xs text-slate-500 max-w-[180px]">Standing by. Submit an idea above to start the boardroom debate.</p>
          </div>
        )}
      </div>

      {/* Task 2.3 Interactive Follow-up Question Drawer Toggle */}
      {currentStatus === 'completed' && projectId && (
        <div className="mt-3 pt-2 border-t border-slate-100">
          {!showFollowUp ? (
            <button
              onClick={() => setShowFollowUp(true)}
              className="w-full py-1.5 px-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              Ask {member.name.split(" ")[0]} Follow-Up Question
            </button>
          ) : (
            <form onSubmit={handleSendFollowUp} className="space-y-2 mt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase font-bold text-purple-900">
                  Ask {member.role}:
                </label>
                <button
                  type="button"
                  onClick={() => setShowFollowUp(false)}
                  className="text-[10px] text-slate-500 hover:text-slate-800 font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {error && (
                <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded border border-rose-200">
                  {error}
                </div>
              )}

              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder={`Ask ${member.name.split(" ")[0]} a specific question...`}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  disabled={submitting}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-md focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
                />
                <button
                  type="submit"
                  disabled={submitting || !question.trim()}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-md text-xs font-bold transition flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
}
