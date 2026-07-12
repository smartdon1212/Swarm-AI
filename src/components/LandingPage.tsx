import React from "react";
import { 
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Brain,
  Code2,
  Activity
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
    <div className="min-h-screen bg-[#070709] text-[#F3F4F6] overflow-x-hidden flex flex-col justify-between relative font-sans">
      
      {/* Dynamic Grid Overlay & Soft Vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl overflow-hidden border border-white/10 shadow-lg">
            <img 
              src={swarmLogo} 
              alt="Swarm AI" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="font-sans font-semibold tracking-[0.25em] text-white text-xs">SWARM: AI BOARDROOM</span>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <button 
              id="header-sign-in-btn"
              onClick={onOpenAuth}
              className="text-xs font-mono text-slate-400 hover:text-white transition-all cursor-pointer border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] px-4 py-2 rounded-lg"
            >
              Sign In
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5" title={currentUser?.email}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {currentUser?.name || currentUser?.email}
              </span>
              <button 
                id="header-sign-out-btn"
                onClick={onLogout}
                className="text-xs font-mono text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-16 text-center max-w-4xl mx-auto">
        
        {/* Modern minimal status pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10 text-[11px] text-blue-400 font-mono mb-10 animate-fade-in tracking-wider uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          <span>Collective intelligence node active</span>
        </div>

        {/* Premium Clean Logo Placement (No interactive overlays or download links) */}
        <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-8 shadow-blue-500/5">
          <img 
            src={swarmLogo} 
            alt="Swarm AI Logo" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Clean, Editorial Typography */}
        <h1 className="text-5xl sm:text-7xl font-sans font-extrabold tracking-tight text-white mb-2 leading-none">
          SWARM <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">AI</span>
        </h1>
        
        <p className="text-xs sm:text-sm font-mono tracking-[0.2em] uppercase text-blue-400 mb-8 font-semibold">
          AI Innovation Boardroom System
        </p>
        
        <p className="text-lg sm:text-xl font-light text-slate-300 max-w-2xl mx-auto tracking-wide mb-6 leading-relaxed">
          Validate startup theories, business hypotheses, or academic projects with a multi-agent simulation boardroom.
        </p>

        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mb-12 leading-relaxed">
          Stress-test your concepts with customized dynamic intelligence nodes. Instantly get deep research insights, critical friction audits, code architecture blueprints, and milestone roadmaps.
        </p>

        {/* Primary Premium Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
          <button 
            id="try-swarm-simple-btn"
            onClick={onStart}
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 flex items-center gap-2.5 shadow-lg shadow-blue-500/10 cursor-pointer min-w-[240px] justify-center hover:scale-[1.01]"
          >
            <span>Convene Boardroom</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Premium Grid Cards */}
        <div className="mt-20 pt-10 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl text-left">
          
          <div className="bg-[#0C0C0F] border border-white/[0.04] p-5 rounded-xl hover:border-blue-500/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-blue-500/5 border border-blue-500/10 flex items-center justify-center text-blue-400 mb-3 group-hover:bg-blue-500/10 transition-colors">
              <Brain className="w-4 h-4" />
            </div>
            <div className="text-white font-sans text-xs font-semibold mb-1 tracking-wide">01. RESEARCH</div>
            <p className="text-[11px] text-slate-400 leading-normal">Deep-dive analysis on demand, personas, and macro trends.</p>
          </div>

          <div className="bg-[#0C0C0F] border border-white/[0.04] p-5 rounded-xl hover:border-rose-500/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-450 mb-3 group-hover:bg-rose-500/10 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div className="text-white font-sans text-xs font-semibold mb-1 tracking-wide">02. CRITIQUE</div>
            <p className="text-[11px] text-slate-400 leading-normal">Unbiased adversarial friction points, threats, and risk vectors.</p>
          </div>

          <div className="bg-[#0C0C0F] border border-white/[0.04] p-5 rounded-xl hover:border-emerald-500/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-400 mb-3 group-hover:bg-emerald-500/10 transition-colors">
              <Code2 className="w-4 h-4" />
            </div>
            <div className="text-white font-sans text-xs font-semibold mb-1 tracking-wide">03. ARCHITECT</div>
            <p className="text-[11px] text-slate-400 leading-normal">Structured server models, database design, and framework blue-prints.</p>
          </div>

          <div className="bg-[#0C0C0F] border border-white/[0.04] p-5 rounded-xl hover:border-indigo-500/20 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/5 border border-indigo-500/10 flex items-center justify-center text-indigo-400 mb-3 group-hover:bg-indigo-500/10 transition-colors">
              <Activity className="w-4 h-4" />
            </div>
            <div className="text-white font-sans text-xs font-semibold mb-1 tracking-wide">04. MILESTONES</div>
            <p className="text-[11px] text-slate-400 leading-normal">Comprehensive phases, scoring indexes, and active execution pathways.</p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-6 text-xs text-slate-500 font-mono bg-[#070709]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>SWARM • AI Innovation Boardroom System</span>
          <span className="text-slate-600">Academic & Enterprise Edition • Secure Sandbox Active</span>
        </div>
      </footer>

    </div>
  );
};
