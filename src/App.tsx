import React, { useState, useEffect } from 'react';
import { Project, BoardMember } from './types';
import AgentCard from './components/AgentCard';
import ScoreGauge from './components/ScoreGauge';
import MarkdownView from './components/MarkdownView';
import { LandingPage } from './components/LandingPage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import swarmLogo from "./assets/images/swarm_logo_1783875160230.jpg";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
import LaunchSurvey from './components/LaunchSurvey';
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
  Sparkle,
  Copy,
  Check,
  ExternalLink,
  Download
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

function formatAuthError(err: any): string {
  const code = err?.code || "";
  const msg = err?.message || "";
  
  if (code === 'auth/invalid-credential' || msg.includes('invalid-credential')) {
    return "Invalid email or password. Please verify your credentials and try again. If you don't have an account yet, click 'Don't have an account? Sign up' below!";
  }
  if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
    return "This email address is already in use. Please sign in instead.";
  }
  if (code === 'auth/weak-password' || msg.includes('weak-password')) {
    return "Password is too weak. It must be at least 6 characters long.";
  }
  if (code === 'auth/invalid-email' || msg.includes('invalid-email')) {
    return "Please enter a valid email address.";
  }
  if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
    return "No account found with this email. Please sign up first.";
  }
  if (code === 'auth/wrong-password' || msg.includes('wrong-password')) {
    return "Incorrect password. Please try again.";
  }
  if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
    return "Too many failed login attempts. This account has been temporarily disabled. Please try again later.";
  }
  
  return msg || "An unexpected authentication error occurred.";
}

export default function App() {
  const [ideaInput, setIdeaInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<Project[]>([]);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activeProvider, setActiveProvider] = useState('gemini');
  const [providerLabel, setProviderLabel] = useState('Gemini Provider Active');
  const [activeTab, setActiveTab] = useState<'debate' | 'roadmap'>('debate');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  // Landing page / dashboard display toggle state
  const [showDashboard, setShowDashboard] = useState(false);

  // Authentication architecture state (simulated Firestore OAuth profile parameters)
  const [user, setUser] = useState<{ email: string; name: string; uid: string } | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [copiedHost, setCopiedHost] = useState(false);

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
    
    // Set up real Firebase Auth state persistence boundary
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const u = {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          uid: firebaseUser.uid
        };
        setUser(u);
        fetchHistory(true, u);
      } else {
        setUser(null);
        fetchHistory(true, null);
      }
    });

    return () => unsubscribe();
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
        setActiveProvider(data.activeProvider || "gemini");
        setProviderLabel(data.providerLabel || "Gemini Provider Active");
      }
    } catch (e) {
      console.warn("Could not check active config parameters, dev sandbox running.");
    }
  };

  const fetchHistory = async (loadFirst = false, customUser = user) => {
    try {
      // Pass the active user ID to utilize user account db filtering
      const url = customUser ? `/api/history?userId=${customUser.uid}` : '/api/history';
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(url, { headers });
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
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          idea: ideaInput,
          userId: user?.uid || "mock-guest-uid" // Passing mapped account UID to save to correct user collection
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Analyzing idea failed. Try again.");
      }

      const analyzedProject = await res.json();
      
      // Update local state database
      const reconstructed: Project = {
        id: analyzedProject.saved_id,
        userId: user?.uid || "mock-guest-uid",
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
      await fetchHistory(false, user); // update index with correct user filter

    } catch (err: any) {
      console.error("Boardroom process failed:", err);
      const msg = err?.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMsg("The server connection was temporarily interrupted or timed out. This can happen if the application server was restarting during your request. Please wait a moment and click 'Convene Boardroom' again!");
      } else {
        setErrorMsg(msg || "A secure server feedback channel timed out. Please try again.");
      }
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

  // Auth Action handlers
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Email and Password parameters are required.");
      return;
    }

    setAuthLoading(true);

    if (authMode === 'signup') {
      createUserWithEmailAndPassword(auth, authEmail, authPassword)
        .then((userCredential) => {
          const firebaseUser = userCredential.user;
          const u = {
            email: firebaseUser.email || "",
            name: authName.trim() || firebaseUser.email?.split('@')[0] || "User",
            uid: firebaseUser.uid
          };
          setUser(u);
          setAuthLoading(false);
          setAuthModalOpen(false);
          // Reset fields
          setAuthEmail('');
          setAuthPassword('');
          setAuthName('');
          setShowDashboard(true);
        })
        .catch((err: any) => {
          console.error(err);
          setAuthError(formatAuthError(err));
          setAuthLoading(false);
        });
    } else {
      signInWithEmailAndPassword(auth, authEmail, authPassword)
        .then((userCredential) => {
          const firebaseUser = userCredential.user;
          const u = {
            email: firebaseUser.email || "",
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
            uid: firebaseUser.uid
          };
          setUser(u);
          setAuthLoading(false);
          setAuthModalOpen(false);
          // Reset fields
          setAuthEmail('');
          setAuthPassword('');
          setAuthName('');
          setShowDashboard(true);
        })
        .catch((err: any) => {
          console.error(err);
          setAuthError(formatAuthError(err));
          setAuthLoading(false);
        });
    }
  };

  const handleOAuthGoogleSimulate = () => {
    setAuthLoading(true);
    setAuthError(null);

    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((userCredential) => {
        const firebaseUser = userCredential.user;
        const u = {
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "User",
          uid: firebaseUser.uid
        };
        setUser(u);
        setAuthLoading(false);
        setAuthModalOpen(false);
        setShowDashboard(true);
      })
      .catch((err: any) => {
        console.error("Google Auth failed:", err);
        if (err.code === "auth/unauthorized-domain" || String(err.message || "").includes("unauthorized-domain")) {
          setAuthError(
            "This domain is not authorized in your Firebase console. To fix this: 1. Go to Firebase Console > Authentication > Settings > Authorized Domains. 2. Add your AI Studio preview domain to the whitelist. Or, simply use the Email & Password section below, which requires no domain whitelist!"
          );
        } else {
          setAuthError(err.message || "Failed to sign in with Google.");
        }
        setAuthLoading(false);
      });
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        fetchHistory(true, null);
      })
      .catch((err) => {
        console.error("Logout failed:", err);
      });
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] font-sans text-[#E0E0E0] flex flex-col justify-between selection:bg-blue-500/20 selection:text-blue-300">
      
      {!showDashboard ? (
        <LandingPage
          onStart={() => setShowDashboard(true)}
          onOpenAuth={() => {
            setAuthMode('signin');
            setAuthModalOpen(true);
          }}
          isAuthenticated={!!user}
          currentUser={user}
          onLogout={handleLogout}
        />
      ) : (
        <>
          {/* 1. Global Navigation Frame Header */}
          <header className="border-b border-white/5 bg-[#0D0D0F]/90 sticky top-0 z-50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Logo & Branding */}
              <div className="flex items-center gap-3">
                <div onClick={() => setShowDashboard(false)} className="w-9 h-9 rounded-lg overflow-hidden border border-white/10 shadow-inner cursor-pointer hover:scale-105 transition-all">
                  <img 
                    src={swarmLogo} 
                    alt="Swarm AI Logo" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 onClick={() => setShowDashboard(false)} className="text-lg font-display font-extrabold tracking-[0.2em] text-blue-500 uppercase cursor-pointer hover:text-blue-400">
                      SWARM
                    </h1>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                      by <strong className="font-semibold text-slate-400">SRASS</strong>
                    </span>
                  </div>
                  <p className="text-[9px] text-blue-400 tracking-wider font-mono uppercase mt-0.5">
                    AI Innovation Boardroom System
                  </p>
                </div>
              </div>

              {/* Navigation Actions and Telemetry */}
              <div className="flex items-center flex-wrap gap-3 font-mono text-xs">
                
                <button
                  onClick={() => setShowDashboard(false)}
                  className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-white/5 text-slate-300 hover:text-white transition-all cursor-pointer font-sans text-xs tracking-wide"
                >
                  &larr; Exit to Home
                </button>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border bg-blue-950/40 border-blue-500/20 text-blue-300">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span>
                    Engine: <strong className="font-semibold">{providerLabel}</strong>
                  </span>
                </div>
                
                {user ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/10 bg-emerald-950/25 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="max-w-[120px] truncate" title={user.email}>{user.name}</span>
                    <button 
                      onClick={handleLogout}
                      className="text-[10px] text-slate-500 hover:text-rose-400 hover:underline cursor-pointer ml-1 italic"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      setAuthMode('signin');
                      setAuthModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-sans text-xs transition-colors cursor-pointer"
                  >
                    Connect Account
                  </button>
                )}

                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-800 bg-slate-900/40 text-slate-450">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>DB: Firestore Ready</span>
                </div>
              </div>

            </div>
          </header>

      {/* 2. Main Workspace Layout */}
      <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-grow flex flex-col gap-6">

        {/* The Grid Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* LEFT COLUMN/SIDEBAR - SUBMISSION PANEL & DYNAMIC SEED TEMPLATES */}
        <div className="lg:col-span-1 flex flex-col gap-6">          {/* A. Submit Project Area */}
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
                <label className="block text-xs text-slate-400 mb-1 font-mono">Formulate Your Idea or Project Pitch:</label>
                <textarea
                  id="idea_textarea"
                  value={ideaInput}
                  onChange={(e) => {
                    setIdeaInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="Describe your project, academic theory, side-hustle, or startup idea in detail. Share the purpose, core mechanics, and your vision..."
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
                <div className="w-10 h-10 rounded-full bg-amber-955/40 border border-amber-500/20 flex items-center justify-center text-amber-500 animate-spin">
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
                      'text-rose-450'
                    }`}>
                      {activeProject.score}<span className="text-xs text-slate-500">%</span>
                    </strong>
                  </div>
                  <div className={`w-12 h-12 rounded-lg border flex items-center justify-center ${
                    activeProject.score >= 80 ? 'bg-emerald-955/45 border-emerald-500/30 text-emerald-400' :
                    activeProject.score >= 60 ? 'bg-amber-955/45 border-amber-500/30 text-amber-400' :
                    'bg-rose-955/45 border-rose-500/20 text-rose-450'
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

              {/* Launch Validation Survey */}
              <div className="mt-8 pt-6 border-t border-white/5">
                <LaunchSurvey
                  projectId={activeProject.id}
                  userId={user?.uid || "mock-guest-uid"}
                  userName={user?.name || "Anonymous Guest"}
                />
              </div>

            </div>
          )}

        </div>

      </div>

      </main>

      {/* 3. Global Footer */}
      <footer className="border-t border-white/5 bg-[#0D0D0F] py-5 mt-12 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SWARM • Built by SRASS</span>
          <span className="text-slate-600 font-semibold">Powered by Gemini Swarm Multi-Agent Engine</span>
        </div>
      </footer>
        </>
      )}

      {/* 4. Auth Modal Dialog (Simulated Cloud Firestore / OAuth Connection UI) */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with elegant blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-[#0A0A0B]/80 backdrop-blur-md"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#0D0D10] border border-white/10 rounded-xl p-6 md:p-8 shadow-2xl z-10 font-sans text-[#E0E0E0]"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500 rounded-t-xl" />
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-sans font-bold text-white tracking-tight">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-normal">
                  Access your dynamic innovation deliberations anywhere (Firestore Ready)
                </p>
              </div>

              {authError && (
                authError.includes("unauthorized-domain") ? (
                  <div id="auth-error-banner" className="mb-6 p-4 rounded-lg bg-amber-950/20 border border-amber-500/30 text-xs text-slate-300">
                    <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>Firebase Unauthorized Domain Error</span>
                    </div>
                    <p className="mb-3 leading-relaxed">
                      Google Sign-In requires your current preview domain to be whitelisted in your Firebase project.
                    </p>
                    <div className="bg-[#121215] border border-white/5 rounded p-3 mb-3 font-mono text-[11px] space-y-1">
                      <div className="text-slate-400 font-bold">Domain to copy:</div>
                      <div className="flex items-center justify-between gap-2 bg-black/40 px-2 py-1.5 rounded border border-white/5 font-mono text-amber-200 select-all overflow-x-auto">
                        <span>{window.location.hostname}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname);
                            setCopiedHost(true);
                            setTimeout(() => setCopiedHost(false), 2000);
                          }}
                          className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedHost ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedHost ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-slate-300">
                      <div className="font-semibold text-white">How to fix this:</div>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline inline-flex items-center gap-0.5 font-semibold">Firebase Console <ExternalLink className="w-3 h-3 inline" /></a>.</li>
                        <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.</li>
                        <li>Click <strong>Add domain</strong> and paste the copied domain.</li>
                      </ol>
                    </div>
                    <p className="mt-3 pt-2.5 border-t border-white/5 text-slate-400">
                      <strong>Protip:</strong> You can also skip this entirely by using the <strong>Email &amp; Password</strong> form below, which works immediately without any domain setup!
                    </p>
                  </div>
                ) : (
                  <div id="auth-error-banner" className="p-3 mb-4 rounded bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 font-mono text-center">
                    {authError}
                  </div>
                )
              )}

              {/* Secure simulated Google Login */}
              <button
                type="button"
                id="oauth-google-btn"
                onClick={handleOAuthGoogleSimulate}
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-lg bg-white text-slate-900 font-medium text-xs transition-colors hover:bg-slate-100 flex items-center justify-center gap-2 mb-4 cursor-pointer flex-row"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                ) : (
                  <Sparkles className="w-4 h-4 text-amber-500" />
                )}
                Continue with Google Secure Sign-In
              </button>

              <div className="relative flex py-2.5 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-500 uppercase tracking-widest">or email entry</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              {/* Traditional form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 mt-2">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3 py-2.5 rounded bg-[#121215] border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded bg-[#121215] border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded bg-[#121215] border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <button
                  type="submit"
                  id="email-auth-submit-btn"
                  disabled={authLoading}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs transition-opacity hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>{authMode === 'signin' ? 'Sign In to Swarm' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                  className="text-xs text-blue-400 hover:underline cursor-pointer font-mono"
                >
                  {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
