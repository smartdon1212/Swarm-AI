import React from "react";
import { 
  ArrowRight,
  Brain,
  ShieldAlert,
  Code2,
  Activity,
  CheckCircle2
} from "lucide-react";
import swarmLogo from "../assets/images/swarm_logo_1783875160230.jpg";

interface LandingPageProps {
  onStart: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  currentUser: { email: string; name: string } | null;
  onLogout: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ 
  onStart, 
  onOpenAuth, 
  isAuthenticated, 
  currentUser,
  onLogout
}) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden flex flex-col justify-between relative font-sans">
      
      {/* Subtle Grid Overlay & Ambient Purple Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-100/50 via-purple-50/20 to-transparent pointer-events-none blur-3xl opacity-70" />
      
      {/* Structural Header (Black Top Bar) */}
      <header className="relative z-10 w-full bg-black text-white px-6 py-4 shadow-md">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-purple-500/30 bg-white shadow-sm">
              <img 
                src={swarmLogo} 
                alt="Swarm AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-sans font-bold tracking-[0.2em] text-white text-xs uppercase">
              SWARM <span className="text-purple-400">AI BOARDROOM</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <button 
                id="header-sign-in-btn"
                onClick={onOpenAuth}
                className="text-xs font-mono text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700 hover:border-purple-400 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg"
              >
                Sign In
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-xs font-mono text-purple-300 flex items-center gap-1.5" title={currentUser?.email}>
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                  {currentUser?.name || currentUser?.email}
                </span>
                <button 
                  id="header-sign-out-btn"
                  onClick={onLogout}
                  className="text-xs font-mono text-slate-400 hover:text-purple-300 transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (Mostly White) */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        
        {/* Minimal Status Pills in Purple & Black */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100/80 border border-purple-200 text-[11px] text-purple-900 font-mono font-medium tracking-wider uppercase shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
            <span>Collective Intelligence Node Active</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-[11px] text-slate-700 font-mono font-medium tracking-wider uppercase shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Quality Validation Engine Active</span>
          </div>
        </div>

        {/* Logo Icon */}
        <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-purple-200 shadow-xl mb-6 bg-white p-1">
          <img 
            src={swarmLogo} 
            alt="Swarm AI Logo" 
            className="w-full h-full object-cover rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Clean, Strong Black & Purple Typography */}
        <h1 className="text-5xl sm:text-7xl font-sans font-black tracking-tight text-slate-900 mb-3 leading-none">
          SWARM <span className="text-purple-600">AI</span>
        </h1>
        
        <p className="text-xs sm:text-sm font-mono tracking-[0.25em] uppercase text-purple-700 mb-6 font-bold">
          AI Innovation Boardroom System
        </p>
        
        <p className="text-lg sm:text-xl font-medium text-slate-700 max-w-2xl mx-auto tracking-normal mb-4 leading-relaxed">
          Validate startup theories, business hypotheses, or academic projects with a multi-agent simulation boardroom.
        </p>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mb-10 leading-relaxed font-sans">
          Stress-test your concepts with customized dynamic intelligence nodes. Instantly get deep research insights, critical friction audits, code architecture blueprints, and milestone roadmaps.
        </p>

        {/* Primary Action Button (Purple / Black High Contrast) */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button 
            id="try-swarm-simple-btn"
            onClick={onStart}
            className="px-8 py-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold text-sm transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-purple-600/20 cursor-pointer min-w-[240px] justify-center hover:scale-[1.01]"
          >
            <span>Convene Boardroom</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* High-Contrast White Feature Cards */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          
          <div className="bg-white border border-slate-200 hover:border-purple-400 p-5 rounded-xl transition-all shadow-xs group">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-slate-900 font-sans text-xs font-bold mb-1 tracking-wide">01. RESEARCH</div>
            <p className="text-[11px] text-slate-600 leading-normal">Deep-dive analysis on demand, target personas, and market trends.</p>
          </div>

          <div className="bg-white border border-slate-200 hover:border-purple-400 p-5 rounded-xl transition-all shadow-xs group">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-slate-900 font-sans text-xs font-bold mb-1 tracking-wide">02. CRITIQUE</div>
            <p className="text-[11px] text-slate-600 leading-normal">Unbiased adversarial friction points, threats, and risk vectors.</p>
          </div>

          <div className="bg-white border border-slate-200 hover:border-purple-400 p-5 rounded-xl transition-all shadow-xs group">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="text-slate-900 font-sans text-xs font-bold mb-1 tracking-wide">03. ARCHITECT</div>
            <p className="text-[11px] text-slate-600 leading-normal">Structured server models, database design, and framework blueprints.</p>
          </div>

          <div className="bg-white border border-slate-200 hover:border-purple-400 p-5 rounded-xl transition-all shadow-xs group">
            <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-slate-900 font-sans text-xs font-bold mb-1 tracking-wide">04. MILESTONES</div>
            <p className="text-[11px] text-slate-600 leading-normal">Comprehensive phases, scoring indexes, and active execution pathways.</p>
          </div>

        </div>

      </main>

      {/* Footer (Black) */}
      <footer className="relative z-10 border-t border-slate-800 py-5 text-xs text-slate-400 font-mono bg-black">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>SWARM • AI Boardroom System • Launched June 18, 2026</span>
          <span className="text-slate-500 font-semibold">Academic & Enterprise Edition</span>
        </div>
      </footer>

    </div>
  );
};
