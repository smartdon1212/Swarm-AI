import React, { useState, useEffect } from 'react';
import { Project, BoardMember } from './types';
import AgentCard from './components/AgentCard';
import BoardDecisionMemoView from './components/BoardDecisionMemo';
import BoardVotePanel from './components/BoardVotePanel';
import { normalizeProject, getAgentContent, getAgentVote } from './lib/project';
import {
  Send,
  History,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Zap,
  Layers,
  FileText,
  Brain,
} from 'lucide-react';

const BOARD_MEMBERS: BoardMember[] = [
  {
    id: 'market',
    name: 'Dr. Evelyn Carter',
    role: 'Market Intelligence Lead',
    perspective: 'Market Analysis',
    avatar: '',
    credentials: 'Former McKinsey, Wharton Economics',
    color: 'blue',
    borderColor: 'border-blue-200',
    accentColor: 'bg-blue-50 text-blue-600',
  },
  {
    id: 'risk',
    name: 'Julian Vance',
    role: 'Risk & Assumptions Auditor',
    perspective: 'Risk Analysis',
    avatar: '',
    credentials: 'Senior Risk Analyst, Vance Advisory',
    color: 'red',
    borderColor: 'border-red-200',
    accentColor: 'bg-red-50 text-red-600',
  },
  {
    id: 'technical',
    name: 'Chief Architect Linus',
    role: 'Technical Feasibility Lead',
    perspective: 'Technical Analysis',
    avatar: '',
    credentials: 'Former AWS Platform Lead',
    color: 'emerald',
    borderColor: 'border-emerald-200',
    accentColor: 'bg-emerald-50 text-emerald-600',
  },
  {
    id: 'strategic',
    name: 'Sarah Okonkwo',
    role: 'Strategy & GTM Director',
    perspective: 'Strategic Analysis',
    avatar: '',
    credentials: 'Ex-Stripe, 3x startup advisor',
    color: 'violet',
    borderColor: 'border-violet-200',
    accentColor: 'bg-violet-50 text-violet-600',
  },
];

const PRESET_TEMPLATES = [
  {
    title: 'EcoDrone Farmer Swarm',
    desc: 'Autonomous drone fleets for crop disease detection with edge AI.',
    prompt:
      'An autonomous crop monitoring swarm of solar-charged drones with edge computer vision to identify corn and grain diseases without cellular connectivity.',
  },
  {
    title: 'P2P MicroGrid Exchange',
    desc: 'Neighborhood solar trading with smart contract energy balancing.',
    prompt:
      'A neighborhood peer-to-peer solar trading network where modular batteries and houses exchange electricity using lightweight local ledger smart contracts.',
  },
  {
    title: 'ZKP Medical Vault',
    desc: 'Self-custodian health records with selective research licensing.',
    prompt:
      'A personal health record app using zero-knowledge proofs and AES-256 local vaults to grant research institutions anonymous clinical metadata while retaining full owner data rights.',
  },
];

const LOADING_STEPS = [
  'Convening the advisory board...',
  'Market Analysis: evaluating demand and competition...',
  'Risk Analysis: stress-testing assumptions...',
  'Technical Analysis: assessing build feasibility...',
  'Strategic Analysis: mapping go-to-market path...',
  'Board Moderator: synthesizing decision memo...',
];

const RECOMMENDATION_COLORS: Record<string, string> = {
  Proceed: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  'Proceed With Caution': 'text-amber-700 bg-amber-50 border-amber-200',
  Pivot: 'text-blue-700 bg-blue-50 border-blue-200',
  Reject: 'text-red-700 bg-red-50 border-red-200',
};

export default function App() {
  const [ideaInput, setIdeaInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [providerLabel, setProviderLabel] = useState('Qwen Decision Engine');
  const [keyConfigured, setKeyConfigured] = useState(true);
  const [activeTab, setActiveTab] = useState<'perspectives' | 'memo'>('memo');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    fetchStatus();
    fetchHistory(true);
  }, []);

  useEffect(() => {
    if (!isAnalyzing) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setProviderLabel(data.providerLabel || 'Qwen Decision Engine');
        setKeyConfigured(data.keyConfigured !== false);
      }
    } catch {
      /* dev sandbox */
    }
  };

  const fetchHistory = async (loadFirst = false) => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map((p: Record<string, unknown>) => normalizeProject(p));
        setHistory(normalized);
        if (loadFirst && normalized.length > 0 && !activeProject) {
          setActiveProject(normalized[0]);
        }
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  };

  const executeAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInput.trim()) {
      setErrorMsg('Describe your idea or decision before convening the board.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setActiveProject(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: ideaInput }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Analysis failed.');
      }

      const data = await res.json();
      const project = normalizeProject(data);
      setActiveProject(project);
      setActiveTab('memo');
      setIdeaInput('');
      await fetchHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed.';
      setErrorMsg(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const recColor =
    activeProject?.memo?.recommendation
      ? RECOMMENDATION_COLORS[activeProject.memo.recommendation] ||
        RECOMMENDATION_COLORS['Proceed With Caution']
      : '';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                Swarm
              </h1>
              <p className="text-[11px] text-slate-500">
                AI Decision Intelligence Platform
              </p>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${
              keyConfigured
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                keyConfigured ? 'bg-blue-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
            {providerLabel}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-grow flex flex-col gap-6">
        {/* Hero */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 md:p-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Structured Boardroom Review
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
            Validate decisions before you invest
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            Submit an idea, startup, feature, or strategic question. Swarm orchestrates
            expert perspectives, evaluates evidence, challenges assumptions, and delivers
            a board-level decision memo — not a chatbot answer.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 text-xs text-slate-500">
            {['Market', 'Risk', 'Technical', 'Strategic', 'Board Moderator'].map(
              (label, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <span className="text-slate-300">→</span>}
                  <span className="px-2 py-1 bg-slate-100 rounded font-medium text-slate-600">
                    {label}
                  </span>
                </React.Fragment>
              )
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Sidebar */}
          <div className="lg:col-span-1 flex flex-col gap-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-500" />
                Submit for Review
              </h2>

              <form onSubmit={executeAnalysis} className="space-y-4">
                <textarea
                  value={ideaInput}
                  onChange={(e) => {
                    setIdeaInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="Describe your startup idea, product feature, business decision, or strategic question..."
                  className="w-full h-36 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 resize-none"
                />

                {errorMsg && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-lg p-3 text-red-700 text-xs">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {errorMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isAnalyzing || !ideaInput.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Board in Session...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Convene Board
                    </>
                  )}
                </button>
              </form>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-blue-500" />
                Demo Templates
              </h2>
              <div className="space-y-2">
                {PRESET_TEMPLATES.map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setIdeaInput(item.prompt);
                      setErrorMsg(null);
                    }}
                    disabled={isAnalyzing}
                    className="w-full text-left p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/50 transition text-sm"
                  >
                    <p className="font-medium text-slate-800">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-500" />
                  Review History
                </h2>
                <span className="text-[10px] text-slate-400">{history.length}</span>
              </div>
              <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No reviews yet
                  </p>
                ) : (
                  history.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProject(proj);
                        setActiveTab('memo');
                        setErrorMsg(null);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition text-sm ${
                        activeProject?.id === proj.id
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <p className="font-medium text-slate-800 truncate text-xs">
                        {proj.idea}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-slate-400">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-semibold text-blue-600">
                          {proj.memo?.recommendation || '—'}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              {isAnalyzing ? (
                <div className="flex items-center gap-4 py-4">
                  <RefreshCw className="w-8 h-8 text-blue-500 animate-spin flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Board in Session
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5 transition-all">
                      {LOADING_STEPS[loadingStep]}
                    </p>
                  </div>
                </div>
              ) : activeProject ? (
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600 mb-1">
                      Active Review
                    </p>
                    <h2 className="text-lg font-semibold text-slate-900 leading-snug">
                      {activeProject.idea}
                    </h2>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {new Date(activeProject.createdAt).toLocaleString()} ·{' '}
                      {activeProject.id}
                    </p>
                  </div>
                  {activeProject.memo && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">
                          Confidence
                        </p>
                        <p className="text-2xl font-bold text-slate-900">
                          {activeProject.memo.confidenceScore}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-semibold px-3 py-2 rounded-lg border ${recColor}`}
                      >
                        {activeProject.memo.recommendation}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  <Brain className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-slate-700">
                    No active review
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                    Submit an idea or select a demo template to receive a structured
                    board decision memo.
                  </p>
                </div>
              )}
            </section>

            {activeProject && (
              <>
                <div className="border-b border-slate-200 flex gap-1">
                  <button
                    onClick={() => setActiveTab('memo')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                      activeTab === 'memo'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    Board Decision Memo
                  </button>
                  <button
                    onClick={() => setActiveTab('perspectives')}
                    className={`pb-3 px-4 text-sm font-medium border-b-2 transition flex items-center gap-2 ${
                      activeTab === 'perspectives'
                        ? 'border-blue-600 text-blue-700'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                    Expert Perspectives
                  </button>
                </div>

                {activeTab === 'memo' ? (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                    <div className="xl:col-span-2">
                      {activeProject.memo ? (
                        <BoardDecisionMemoView memo={activeProject.memo} />
                      ) : (
                        <p className="text-sm text-slate-500">
                          No decision memo available for this review.
                        </p>
                      )}
                    </div>
                    <div className="xl:col-span-1">
                      {activeProject.votes && (
                        <BoardVotePanel votes={activeProject.votes} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {BOARD_MEMBERS.filter((m) => m.id !== 'moderator').map((member) => (
                      <AgentCard
                        key={member.id}
                        member={member}
                        content={getAgentContent(
                          activeProject,
                          member.id as 'market' | 'risk' | 'technical' | 'strategic'
                        )}
                        vote={getAgentVote(
                          activeProject,
                          member.id as 'market' | 'risk' | 'technical' | 'strategic'
                        )}
                        isAnalyzing={false}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Swarm — AI Decision Intelligence Platform</span>
          <span>Powered by Qwen · Structured decision framework</span>
        </div>
      </footer>
    </div>
  );
}
