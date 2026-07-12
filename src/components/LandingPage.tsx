import React from "react";
import { 
  ArrowRight, 
  Brain, 
  ShieldAlert, 
  Terminal, 
  Sparkles, 
  Milestone, 
  Users, 
  Briefcase, 
  Code2, 
  Layers, 
  Lightbulb, 
  Target,
  Download
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
    <div className="bg-[#0A0A0B] text-[#E0E0E0] overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 py-20 text-center border-b border-white/5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/25 via-[#0A0A0B] to-[#0A0A0B]">
        {/* Ambient Decorative Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto z-10 flex flex-col items-center">
          
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-400 font-mono mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
            <span>AI innovation boardroom active</span>
          </div>

          {/* Logo */}
          <div className="group relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-2 shadow-blue-500/15 hover:scale-105 transition-all duration-300">
            <img 
              src={swarmLogo} 
              alt="Swarm AI Logo" 
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <a 
              href={swarmLogo} 
              download="swarm_ai_logo.jpg"
              title="Download Logo"
              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-xs text-white transition-opacity duration-200 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </a>
          </div>
          
          {/* Logo download link */}
          <div className="mb-6">
            <a 
              href={swarmLogo} 
              download="swarm_ai_logo.jpg"
              className="inline-flex items-center gap-1.5 text-xs text-slate-450 hover:text-blue-400 font-mono transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Swarm AI Logo Asset</span>
            </a>
          </div>

          {/* Title */}
          <h1 className="text-6xl sm:text-8xl font-sans font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-105 to-slate-400 leading-none mb-6">
            SWARM
          </h1>
          
          <p className="text-xl sm:text-2xl font-light text-slate-300 max-w-2xl mx-auto tracking-wide mb-4">
            Validate ideas before you build.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 mb-10 max-w-lg">
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5">
              <span className="text-blue-400 font-bold">1.</span> Research
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5">
              <span className="text-rose-400 font-bold">2.</span> Critique
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5">
              <span className="text-emerald-400 font-bold">3.</span> Engineer
            </span>
            <span className="text-slate-600">&rarr;</span>
            <span className="flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded border border-white/5">
              <span className="text-indigo-400 font-bold">4.</span> Decide
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mb-12">
            Get brutally honest feedback, deep technical analysis, and clean multi-agent execution roadmaps before you spend a single dollar on coding.
          </p>

          {/* Try Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button 
              id="try-swarm-hero-btn"
              onClick={onStart}
              className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer min-w-[200px] justify-center"
            >
              Try Swarm
              <ArrowRight className="w-4 h-4 bg-slate-100/10 rounded" />
            </button>
            
            {!isAuthenticated ? (
              <button 
                id="sign-in-hero-btn"
                onClick={onOpenAuth}
                className="px-8 py-4 rounded-lg bg-[#111113] hover:bg-[#161619] border border-white/10 text-slate-350 text-sm font-medium transition-all duration-200 cursor-pointer min-w-[200px] justify-center"
              >
                Sign In / Setup Account
              </button>
            ) : (
              <div className="text-xs text-slate-400 font-mono bg-white/5 px-4 py-3 rounded border border-white/10 flex items-center gap-3">
                <span>Active Cloud Session: <b className="text-emerald-400">{currentUser?.email}</b></span>
                <button 
                  id="sign-out-hero-btn"
                  onClick={onLogout}
                  className="text-slate-500 hover:text-white underline italic ml-2 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Core metrics visual footer */}
          <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-3xl">
            <div>
              <div className="text-2xl font-bold font-mono text-white">4 Dynamic</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Autonomous Experts</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">Gemini Swarm</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Provider Engine</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">Firestore</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Architecture Ready</div>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white">Instant</div>
              <div className="text-xs text-slate-500 uppercase tracking-wider mt-1">Roadmaps Generated</div>
            </div>
          </div>

        </div>
      </section>

      {/* How Swarm Works Section */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#0D0D0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-blue-400 font-mono mb-3">Workflow Mechanics</h2>
            <p className="text-3xl font-bold text-white tracking-tight">How Swarm Works</p>
            <p className="text-sm text-slate-400 mt-2">Our orchestrated multi-agent engine mimics a world-class venture partner vetting process.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-lg bg-blue-500/5 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-6 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Submit an Idea</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Describe your business vision or technical hypothesis in our intuitive input panel. High level or deeply granular specs are both welcome.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-lg bg-rose-500/5 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-6 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">AI Experts Debate It</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Three highly specialized agents—Research, Critic, and Engineering experts—clash autonomously over feasibility, code complexity, and user demand.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Receive Risks &amp; Opportunities</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get parsed viability insights instantly. See severe structural red flags, target user personas, market catalysts, and direct threat landscapes.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-colors" />
              <div className="w-10 h-10 rounded-lg bg-indigo-500/5 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 font-mono font-bold text-sm">
                04
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get an Execution Roadmap</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                An expert Strategist synthesizes the debate to formulate a dynamic 4-phase implementation plan, tech stack outline, and viability readiness score.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Meet the Boardroom Section */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#0A0A0B] relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-[#a855f7] font-mono mb-3">AI Agents</h2>
            <p className="text-3xl font-bold text-white tracking-tight">Meet the Boardroom</p>
            <p className="text-sm text-slate-400 mt-2">Divergent thinking is key to validation. Meet our four specialized board directors below.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Research Agent */}
            <div className="bg-[#121214] border border-blue-500/10 hover:border-blue-500/30 transition-all rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">Evelyn Vance</h3>
                <p className="text-[11px] font-mono text-blue-400 mb-4 uppercase tracking-wider">Research Agent</p>
                <div className="text-[11px] bg-blue-500/5 text-blue-300 rounded px-2.5 py-1 mb-4 inline-block">
                  Ph.D. Tech Economics, MIT
                </div>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Focuses on user needs, market dynamics, and secular catalysts. Scans for addressable pain points first.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-6 pt-4 border-t border-white/5">
                Bias: Optimistic Expansion
              </div>
            </div>

            {/* Critic Agent */}
            <div className="bg-[#121214] border border-rose-500/10 hover:border-rose-500/30 transition-all rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center mb-5">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">Julian Mercer</h3>
                <p className="text-[11px] font-mono text-rose-400 mb-4 uppercase tracking-wider">Critic Agent</p>
                <div className="text-[11px] bg-rose-500/5 text-rose-300 rounded px-2.5 py-1 mb-4 inline-block">
                  Former Director @ Sequoia Capital
                </div>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Focuses on defensibility, risk mapping, scalability pitfalls, and commercial threats. Finds why you'll fail.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-6 pt-4 border-t border-white/5">
                Bias: Brutal Skepticism
              </div>
            </div>

            {/* Engineer Agent */}
            <div className="bg-[#121214] border border-emerald-500/10 hover:border-emerald-500/30 transition-all rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 flex items-center justify-center mb-5">
                  <Terminal className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">Linus Torvalds Jr</h3>
                <p className="text-[11px] font-mono text-emerald-450 mb-4 uppercase tracking-wider">Engineer Agent</p>
                <div className="text-[11px] bg-emerald-500/5 text-emerald-300 rounded px-2.5 py-1 mb-4 inline-block">
                  Principal Architect, Ex-Netflix
                </div>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Focuses on infrastructure, system design, architectural bottlenecks, and developer effort. Looks at real code viability.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-6 pt-4 border-t border-white/5">
                Bias: Pragmatic Simplicity
              </div>
            </div>

            {/* Strategist Agent */ }
            <div className="bg-[#121214] border border-indigo-500/10 hover:border-indigo-500/30 transition-all rounded-xl p-6 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5">
                  <Milestone className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-medium text-white">Sarah Jenkins</h3>
                <p className="text-[11px] font-mono text-indigo-400 mb-4 uppercase tracking-wider">Strategist Agent</p>
                <div className="text-[11px] bg-indigo-500/5 text-indigo-300 rounded px-2.5 py-1 mb-4 inline-block">
                  Executive Partner, McKinsey
                </div>
                <p className="text-xs text-slate-450 leading-relaxed">
                  Synthesizes Evelyn, Julian, and Linus. Scores the dynamic project viability, formulates the launch strategy, and maps milestones.
                </p>
              </div>
              <div className="text-[10px] font-mono text-slate-600 mt-6 pt-4 border-t border-white/5">
                Bias: Balanced Realism
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24 px-4 border-b border-white/5 bg-[#0D0D0F]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs uppercase tracking-widest text-emerald-400 font-mono mb-3">Versatile Verticals</h2>
            <p className="text-3xl font-bold text-white tracking-tight">Swarm Use Cases</p>
            <p className="text-sm text-slate-400 mt-2">Whether vetting a rapid weekend hack or drafting a long-term enterprise pivot.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Startups */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-200">
              <div className="relative mb-6">
                <div className="w-10 h-10 rounded bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Startups</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assess product-market fit, discover latent competitors, and draft clear investor readiness materials before talking to VCs.
              </p>
            </div>

            {/* Engineering Projects */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-200">
              <div className="relative mb-6">
                <div className="w-10 h-10 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                  <Code2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Engineering Projects</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify engineering complex curves, evaluate server maintenance demands, check cloud scale factors, and select optimal code frameworks.
              </p>
            </div>

            {/* Business Ideas */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-200">
              <div className="relative mb-6">
                <div className="w-10 h-10 rounded bg-rose-500/10 flex items-center justify-center text-rose-450 font-bold">
                  <Target className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Business Ideas</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Test localized physical supply lines, investigate product retail pricing systems, and optimize startup operational overhead costs.
              </p>
            </div>

            {/* Product Validation */}
            <div className="bg-[#121214] border border-white/5 rounded-xl p-6 hover:translate-y-[-4px] transition-transform duration-200">
              <div className="relative mb-6">
                <div className="w-10 h-10 rounded bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-white mb-2">Product Validation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Align feature priorities based on targeted personas, design usability strategies, and model customer retention mechanics.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Call To Action Section */}
      <section className="relative py-24 px-4 text-center bg-gradient-to-b from-[#0D0D0F] via-[#0A0A0B] to-[#0A0A0B]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_60%,#1e1b4b35,#00000000)]" />
        <div className="relative max-w-2xl mx-auto z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-4">
            Democratize Venture-Level Vetting
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mb-8 max-w-lg mx-auto">
            Stop guessing if your idea will succeed. Get honest feedback and an ironclad dev roadmap right now.
          </p>
          <button 
            id="start-first-analysis-btn"
            onClick={onStart}
            className="px-8 py-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm transition-all duration-200 flex items-center gap-2 shadow-lg shadow-blue-500/20 mx-auto cursor-pointer"
          >
            Start Your First Analysis
            <ArrowRight className="w-4 h-4 bg-slate-100/10 rounded" />
          </button>
        </div>
      </section>

    </div>
  );
};
