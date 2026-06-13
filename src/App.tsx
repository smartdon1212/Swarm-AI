import React, { useState, useEffect } from 'react';
import { Project, BoardMember } from './types';
import AgentCard from './components/AgentCard';
import ScoreGauge from './components/ScoreGauge';
import MarkdownView from './components/MarkdownView';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Shield, 
  HardDrive, 
  Compass, 
  Send, 
  History, 
  Sparkles, 
  Cpu, 
  PlusCircle, 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Eye, 
  Zap,
  Layers,
  Sparkle
} from 'lucide-react';

const BOARD_MEMBERS: BoardMember[] = [
  {
    id: "research",
    name: "Dr. Evelyn Carter",
    role: "Research Specialist",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&h=200&fit=crop",
    credentials: "M.S. Wharton Economics, former McKinsey Feasibility Lead",
    color: "sky",
    borderColor: "border-sky-850",
    accentColor: "text-sky-450 bg-sky-500/10"
  },
  {
    id: "critic",
    name: "Julian Vance",
    role: "Threat & Risk Auditor",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&h=200&fit=crop",
    credentials: "Senior Risk Analyst at Vance Advisory, Tech Pessimist",
    color: "rose",
    borderColor: "border-rose-850",
    accentColor: "text-rose-450 bg-rose-500/10"
  },
  {
    id: "engineer",
    name: "Chief Architect Linus",
    role: "Systems Architect",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&h=200&fit=crop",
    credentials: "Former Platform Lead at AWS IoT, Linux Kernel Contributor",
    color: "emerald",
    borderColor: "border-emerald-850",
    accentColor: "text-emerald-450 bg-emerald-500/10"
  }
];

const PRESET_TEMPLATES = [
  {
    title: "EcoDrone Farmer Swarm",
    desc: "Autonomous battery-powered drone fleets inspecting rural crops for diseases using client-side edge computer vision.",
    prompt: "An autonomous crop monitoring swarm of field-patrolling solar-charged drones equipped with microedge computer vision cameras to identify corn and grain diseases without cellular connectivity."
  },
  {
    title: "P2P MicroGrid Exchange",
    desc: "Decentralized modular neighborhood solar networks with dynamic algorithmic smart contract energy balancing.",
    prompt: "A neighborhood peer-to-peer solar trading network where modular batteries and houses exchange electricity values using light weight local ledger smart contract algorithms based on live consumption rates."
  },
  {
    title: "ZKP Personal Medical Vault",
    desc: "Self-custodian encrypted health archives allowing individuals to selectively license metadata to researchers.",
    prompt: "A personal health record application utilizing zero-knowledge proofs (ZKP) and AES-256 local vaults to grant research institutions anonymous clinical study metadata while retaining full owner data rights."
  }
];

export default function App() {
  const [ideaInput, setIdeaInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [qwenActive, setQwenActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'debate' | 'roadmap'>('debate');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Cycling funny status logs during analysis Phase to make the board feel incredibly alive
  const loadingSteps = [
    "Board members taking their seats...",
    "Dr. Evelyn Carter is gathering competitive market telemetry...",
    "Julian Vance is compiling potential security vulnerability indices...",
    "Chief Architect Linus is mapping conceptual relational database schemas...",
    "Synthesizing argument clashes and debating viability parameters...",
    "Executive Board Director is formulating the unified roadmap decree..."
  ];

  useEffect(() => {
    // Initial fetches
    fetchStatus();
    fetchHistory(true); // default: auto-load latest project as active to avoid empty screens
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnalyzing) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAnalyzing]);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setQwenActive(data.qwenActive);
      }
    } catch (e) {
      console.warn("Could not check Qwen active config parameters, dev sandbox running.");
    }
  };

  const fetchHistory = async (loadFirst = false) => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (loadFirst && data.length > 0 && !activeProject) {
          setActiveProject(data[0]);
        }
      }
    } catch (e) {
      console.error("Error retrieving historical boardroom deliberations", e);
    }
  };

  const handlePresetSelect = (promptText: string) => {
    setIdeaInput(promptText);
    setErrorMsg(null);
  };

  const executeAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaInput.trim()) {
      setErrorMsg("Please formulate an idea description before convening the boardroom.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setActiveProject(null); // Clear previous active to show transition loading states

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ idea: ideaInput })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analyzing idea failed. Try again.");
      }

      const analyzedProject = await res.json();
      
      // Update local state database
      const reconstructed: Project = {
        id: analyzedProject.saved_id,
        idea: ideaInput,
        createdAt: new Date().toISOString(),
        research: analyzedProject.research,
        critic: analyzedProject.critic,
        engineer: analyzedProject.engineer,
        strategist: analyzedProject.strategist,
        score: analyzedProject.score,
        final_plan: analyzedProject.final_plan
      };

      setActiveProject(reconstructed);
      setActiveTab('debate'); // Always default to the debate tab so you see Evelyn, Julian, and Linus feedback clashing!
      setIdeaInput(''); // Clear input for next
      await fetchHistory(); // update the index

    } catch (err: any) {
      console.error("Boardroom process failed:", err);
      setErrorMsg(err.message || "A secure server feedback channel timed out. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectProject = (proj: Project) => {
    setActiveProject(proj);
    setActiveTab('debate');
    setErrorMsg(null);
  };

  const clearCurrent = () => {
    setActiveProject(null);
    setIdeaInput('');
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] font-sans text-[#E0E0E0] flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-300">
      
      {/* 1. Global Navigation Frame Header */}
      <header className="border-b border-white/5 bg-[#0D0D0F]/90 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-bold shadow-inner">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-display font-bold tracking-[0.15em] text-blue-500 uppercase">
                  SRASS Swarm
                </h1>
                <span className="text-[9px] font-mono border border-white/10 bg-white/5 text-white/60 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                  SYSTEM
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-mono uppercase mt-0.5">
                AI Multi-Agent Innovation Boardroom System
              </p>
            </div>
          </div>

          {/* Engine Real-time Telemetry Stats */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              qwenActive ? 'bg-blue-950/40 border-blue-500/20 text-blue-300' : 'bg-amber-950/40 border-amber-500/20 text-amber-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${qwenActive ? 'bg-blue-400 animate-pulse' : 'bg-amber-500/80'}`}></span>
              <span>
                Engine: <strong className="font-semibold">{qwenActive ? 'Qwen Swarm API' : 'Qwen Swarm API (Key Pending)'}</strong>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-800 bg-slate-900/40 text-slate-400">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Cwd: ./projects.db.json</span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-grow grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN/SIDEBAR - SUBMISSION PANEL & DYNAMIC SEED TEMPLATES */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* A. Submit Project Area */}
          <section className="bg-slate-900/30 border border-slate-900 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold tracking-wide text-slate-300 uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-400" />
                Idea Incubator
              </h2>
              {activeProject && (
                <button 
                  onClick={clearCurrent}
                  className="text-[10px] px-2 py-0.5 font-semibold text-white/50 hover:text-white border border-white/10 rounded bg-white/5 hover:bg-white/10 transition"
                >
                  [Reset Input]
                </button>
              )}
            </div>

            <form onSubmit={executeAnalysis} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-mono">Formulate Innovation Pitch:</label>
                <textarea
                  id="idea_textarea"
                  value={ideaInput}
                  onChange={(e) => {
                    setIdeaInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="Describe your start-up or technology idea in detail. Detail the purpose, mechanics, and vision..."
                  className="w-full h-36 bg-[#161618] border border-white/10 rounded p-3 text-sm text-blue-100 placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 disabled:opacity-40 custom-scrollbar resize-none"
                />
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 bg-rose-500/5 border border-rose-500/20 rounded-lg p-3 text-rose-450 text-xs">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="btn_submit_idea"
                type="submit"
                disabled={isAnalyzing || !ideaInput.trim()}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold h-10 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-colors duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(59,130,246,0.15)]"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Board Debating...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Convene Boardroom
                  </>
                )}
              </button>
            </form>
          </section>

          {/* B. Suggested Templates Grid */}
          <section className="bg-[#0D0D0F] border border-white/5 rounded-lg p-5 shadow-sm">
            <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase font-mono mb-3.5 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              Quick-Start Templates
            </h2>
            <div className="space-y-3">
              {PRESET_TEMPLATES.map((item, id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handlePresetSelect(item.prompt)}
                  disabled={isAnalyzing}
                  className="w-full text-left p-3 rounded border border-white/5 bg-[#161618]/60 sidebar-item-style hover:bg-white/5 transition flex flex-col gap-1 cursor-pointer"
                >
                  <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-display">
                    {item.title}
                  </p>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* C. History Indices list */}
          <section className="bg-[#0D0D0F] border border-white/5 rounded-lg p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold tracking-wide text-slate-300 uppercase font-mono flex items-center gap-1.5">
                <History className="w-4 h-4 text-sky-400" />
                Boardroom Archives
              </h2>
              <span className="text-[10px] font-mono text-slate-500">{history.length} Saved</span>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
              {history.length === 0 ? (
                <p className="text-xs text-slate-500 italic text-center py-4">No archives saved yet.</p>
              ) : (
                history.map((proj) => {
                  const isActive = activeProject?.id === proj.id;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => selectProject(proj)}
                      className={`w-full text-left p-3 rounded border transition flex items-center justify-between gap-2.5 cursor-pointer sidebar-item-style ${
                        isActive 
                        ? 'bg-white/5 border-l-2 !border-l-blue-500 border-white/10' 
                        : 'border-white/5 bg-transparent hover:border-white/10'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold truncate ${isActive ? 'text-blue-400' : 'text-slate-200'}`}>
                          {proj.idea}
                        </p>
                        <span className="text-[9px] text-white/30 font-mono mt-0.5 block">
                          {new Date(proj.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                        proj.score >= 80 ? 'text-emerald-400 bg-emerald-500/10' :
                        proj.score >= 60 ? 'text-amber-400 bg-amber-500/10' :
                        'text-rose-400 bg-rose-500/10'
                      }`}>
                        {proj.score}%
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

        </div>

        {/* RIGHT AREA - MAIN DELIBERATION GRID & CONFLICT VIEWER (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Active Deliberation Objective Header */}
          <section className="bg-[#0D0D0F] border border-white/5 rounded-lg p-5 shadow-sm">
            {isAnalyzing ? (
              <div className="flex flex-col md:flex-row items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-amber-950/40 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 animate-pulse" />
                    Boardroom Convened
                  </h3>
                  <p className="text-sm text-slate-200 mt-1 max-w-xl transition-all duration-500">
                    &ldquo;{loadingSteps[loadingStep]}&rdquo;
                  </p>
                </div>
              </div>
            ) : activeProject ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-blue-400 font-bold bg-blue-950/40 border border-blue-500/20 px-2 py-0.5 rounded-full inline-block mb-2">
                    Active Deliberation
                  </span>
                  <h2 className="text-lg md:text-xl font-display font-bold text-white tracking-tight leading-snug">
                    {activeProject.idea}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">
                    BOARD DEBATED ID: {activeProject.id} • RESOLVED AT: {new Date(activeProject.createdAt).toLocaleString()}
                  </p>
                </div>
                
                {/* Score badge indicator */}
                <div className="flex items-center gap-3">
                  <div className="text-center md:text-right">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono block">Feasibility Rating</span>
                    <strong className={`text-3xl font-mono font-bold block mt-0.5 score-glow-text ${
                      activeProject.score >= 80 ? 'text-emerald-400' :
                      activeProject.score >= 60 ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {activeProject.score}<span className="text-xs text-slate-500">%</span>
                    </strong>
                  </div>
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                    activeProject.score >= 80 ? 'bg-emerald-950/45 border-emerald-500/30 text-emerald-400' :
                    activeProject.score >= 60 ? 'bg-amber-950/45 border-amber-500/30 text-amber-400' :
                    'bg-rose-950/45 border-rose-500/20 text-rose-450'
                  }`}>
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full border border-slate-800 bg-slate-900/40 flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-200 font-display">AI Innovation Boardroom Vacant</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1.5 leading-relaxed">
                  The boardroom handles complex startup evaluation. Enter a business model or technology idea to compile research, criticisms, and architecture.
                </p>
              </div>
            )}
          </section>

          {activeProject && (
            <div className="flex flex-col gap-6">
              
              {/* Tab Toggles */}
              <div className="border-b border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('debate')}
                    className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'debate' 
                      ? 'border-blue-500 text-blue-400' 
                      : 'border-transparent text-white/40 hover:text-white/80'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Boardroom Dialectics
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'roadmap' 
                      ? 'border-blue-500 text-blue-400' 
                      : 'border-transparent text-white/40 hover:text-white/80'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Strategist Execution Board
                  </button>
                </div>
                
                <span className="text-[10px] font-mono text-slate-500 tracking-wide uppercase px-2 py-0.5 rounded bg-slate-900/70 border border-slate-900 hidden sm:inline-block">
                  Parallel Agent Swarm Action Execution Active
                </span>
              </div>

              {/* TABCONTENT AREA */}
              <AnimatePresence mode="wait">
                {activeTab === 'debate' ? (
                  <motion.div
                    key="debate-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                  >
                    {/* Research Card */}
                    <div className="md:col-span-1">
                      <AgentCard
                        member={BOARD_MEMBERS[0]}
                        content={activeProject.research}
                        isAnalyzing={isAnalyzing}
                        status={isAnalyzing ? 'thinking' : 'completed'}
                      />
                    </div>
                    {/* Critic Card */}
                    <div className="md:col-span-1">
                      <AgentCard
                        member={BOARD_MEMBERS[1]}
                        content={activeProject.critic}
                        isAnalyzing={isAnalyzing}
                        status={isAnalyzing ? 'thinking' : 'completed'}
                      />
                    </div>
                    {/* Engineer Card */}
                    <div className="md:col-span-1">
                      <AgentCard
                        member={BOARD_MEMBERS[2]}
                        content={activeProject.engineer}
                        isAnalyzing={isAnalyzing}
                        status={isAnalyzing ? 'thinking' : 'completed'}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="roadmap-tab"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {/* Viability Rating */}
                    <ScoreGauge score={activeProject.score} />

                    {/* Synthesized Roadmap Plan */}
                    <div className="bg-[#0D0D0F] border border-white/10 rounded-lg p-6 shadow-lg flex flex-col gap-5 relative">
                      <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-lg bg-gradient-to-r from-violet-500 to-blue-500" />
                      
                      {/* Synthesizer Persona header */}
                      <div className="flex items-center gap-3.5 pb-4 border-b border-slate-800/60">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop"
                          alt="Strategist AI"
                          className="w-12 h-12 rounded-full object-cover border-2 border-slate-800 flex-shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] uppercase tracking-widest text-slate-400 bg-slate-800/90 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
                              <Compass className="w-3.5 h-3.5 text-amber-500" />
                               Consensus Director Swarm AI
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white mt-1">Concurrence Opinion & Strategy Plan</h3>
                          <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-snug">
                            Synthesizing research telemetry, counter-acting vulnerability indices, and scaling deployment schematics.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-indigo-950/20 border border-indigo-950/70">
                          <h4 className="text-xs font-mono font-semibold tracking-wider uppercase text-indigo-300 mb-1.5">Debate Resolution Opinion:</h4>
                          <p className="text-sm text-slate-300 leading-relaxed italic">
                            &ldquo;{activeProject.strategist}&rdquo;
                          </p>
                        </div>
                        
                        <div className="mt-2 text-slate-200">
                          <MarkdownView content={activeProject.final_plan} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </div>

      </main>

      {/* 3. Global Footer */}
      <footer className="border-t border-white/5 bg-[#0D0D0F] py-5 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SRASS SWARM • Real-time Innovation Boardroom</span>
          <span className="text-slate-600">No mock code • Powered by Qwen Swarm Multi-Agent Engine</span>
        </div>
      </footer>

    </div>
  );
}
