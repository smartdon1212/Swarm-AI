import React, { useState, useEffect } from 'react';
import { Project, BoardMember, AttachmentFile, AttachmentMetadata, AgentFollowUp } from './types';
import AgentCard from './components/AgentCard';
import ScoreGauge from './components/ScoreGauge';
import MarkdownView from './components/MarkdownView';
import { LandingPage } from './components/LandingPage';
import { exportToPDF, exportToMarkdown } from './lib/exportUtils';
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
  Download,
  Paperclip,
  Camera,
  FileText,
  X,
  ClipboardList,
  Settings,
  ChevronDown,
  ChevronUp,
  Database
} from 'lucide-react';

function getAgentHeadline(agentId: string, project: Project): string {
  let content = "";
  if (agentId === 'research') content = project.research || "";
  else if (agentId === 'critic') content = project.critic || "";
  else if (agentId === 'engineer') content = project.engineer || "";

  if (!content) return "Analysis pending...";

  const lines = content.split('\n').map(l => l.replace(/[*#`_]/g, '').trim()).filter(Boolean);
  const headline = lines.find(l => l.length > 12 && !l.toLowerCase().includes('specialist') && !l.toLowerCase().includes('auditor') && !l.toLowerCase().includes('architect')) || lines[0] || "Analysis Completed";
  return headline.length > 80 ? headline.substring(0, 80) + "..." : headline;
}

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

function getDiscussionCountAndCheckSurvey(completedNewDiscussion: boolean): { count: number; shouldPromptSurvey: boolean; triggerReason: 'first_use' | 'interval_refresh' | null } {
  // 1. Discussion count
  let count = parseInt(localStorage.getItem('swarm_discussion_count') || '0', 10);
  if (completedNewDiscussion) {
    count += 1;
    localStorage.setItem('swarm_discussion_count', count.toString());
  }

  let shouldPromptSurvey = false;
  let triggerReason: 'first_use' | 'interval_refresh' | null = null;

  if (completedNewDiscussion) {
    const firstPromptedDone = localStorage.getItem('swarm_survey_first_prompted_done') === 'true';
    const lastPromptedStr = localStorage.getItem('swarm_survey_last_prompted');
    
    if (!firstPromptedDone && count === 1) {
      // Prompt for the first use
      shouldPromptSurvey = true;
      triggerReason = 'first_use';
      localStorage.setItem('swarm_survey_first_prompted_done', 'true');
      localStorage.setItem('swarm_survey_last_prompted', new Date().toISOString());
    } else if (firstPromptedDone && lastPromptedStr) {
      // Check if some days have passed since the last prompt.
      // To meet user requirements professionally: if at least 3 days have elapsed since last prompted, ask again.
      const lastPrompted = new Date(lastPromptedStr);
      const now = new Date();
      const diffMs = now.getTime() - lastPrompted.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      
      if (diffDays >= 3) {
        shouldPromptSurvey = true;
        triggerReason = 'interval_refresh';
        localStorage.setItem('swarm_survey_last_prompted', now.toISOString());
      }
    }
  }

  return { count, shouldPromptSurvey, triggerReason };
}

export default function App() {
  const [ideaInput, setIdeaInput] = useState('');
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [showSurveyPopup, setShowSurveyPopup] = useState(false);
  const [surveyTriggerReason, setSurveyTriggerReason] = useState<'first_use' | 'interval_refresh' | null>(null);
  const [discussionCount, setDiscussionCount] = useState(0);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

  // Pre-launch UI simplification states
  const [showStatusPopover, setShowStatusPopover] = useState(false);
  const [activeAgentId, setActiveAgentId] = useState<'research' | 'critic' | 'engineer'>('research');
  const [showHeaderScoreBreakdown, setShowHeaderScoreBreakdown] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showArchives, setShowArchives] = useState(true);

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    files.forEach((file: any) => {
      if (file.size > 2.5 * 1024 * 1024) {
        setErrorMsg(`File "${file.name}" exceeds the 2.5MB size limit. Please upload a smaller document or image.`);
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        const newAttachment: AttachmentFile = {
          name: file.name,
          mimeType: file.type || "application/octet-stream",
          base64: resultStr,
          size: file.size
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.onerror = () => {
        setErrorMsg(`Failed to read file: ${file.name}`);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset file input so user can attach same file again if needed
    e.target.value = '';
  };

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      setCameraStream(stream);
      setTimeout(() => {
        const videoElement = document.getElementById('camera_preview') as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play().catch(err => console.error("Error playing camera stream", err));
        }
      }, 150);
    } catch (err: any) {
      console.error("Failed to acquire camera stream:", err);
      setCameraError("Could not access camera. Please make sure camera permissions are granted in your browser settings.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    const videoElement = document.getElementById('camera_preview') as HTMLVideoElement;
    if (!videoElement) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth || 640;
      canvas.height = videoElement.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        const newAttachment: AttachmentFile = {
          name: `camera_capture_${Date.now()}.png`,
          mimeType: 'image/png',
          base64: dataUrl,
          size: Math.round((dataUrl.length * 3) / 4) // Approximate size in bytes
        };
        setAttachments((prev) => [...prev, newAttachment]);
        stopCamera();
      }
    } catch (err) {
      console.error("Failed to capture snapshot:", err);
      setCameraError("Failed to capture snapshot from stream.");
    }
  };

  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

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

    // Calculate initial discussion count on component mount
    const stats = getDiscussionCountAndCheckSurvey(false);
    setDiscussionCount(stats.count);
    
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
        
        // Sync local discussion count if empty
        const storedCountStr = localStorage.getItem('swarm_discussion_count');
        if (!storedCountStr && data.length > 0) {
          localStorage.setItem('swarm_discussion_count', data.length.toString());
          setDiscussionCount(data.length);
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
          userId: user?.uid || "mock-guest-uid", // Passing mapped account UID to save to correct user collection
          attachments: attachments.map(att => ({
            name: att.name,
            mimeType: att.mimeType,
            base64: att.base64,
            size: att.size
          }))
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
        final_plan: analyzedProject.final_plan,
        attachments: analyzedProject.attachments
      };

      setActiveProject(reconstructed);
      setActiveTab('debate'); // Always default to the debate tab so you see Evelyn, Julian, and Linus feedback clashing!
      setIdeaInput(''); // Clear input for next
      setAttachments([]); // Clear attachments input list
      await fetchHistory(false, user); // update index with correct user filter

      // Update discussion count and determine survey eligibility upon successful deliberation completion
      const stats = getDiscussionCountAndCheckSurvey(true);
      setDiscussionCount(stats.count);

      if (stats.shouldPromptSurvey) {
        setSurveyTriggerReason(stats.triggerReason);
        setTimeout(() => {
          setShowSurveyPopup(true);
        }, 1500);
      }

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

  const handleFollowUpAdded = (agentId: string, newFollowUp: AgentFollowUp) => {
    if (!activeProject) return;

    const updatedFollowUps = { ...(activeProject.followUps || {}) };
    if (!updatedFollowUps[agentId]) {
      updatedFollowUps[agentId] = [];
    }
    updatedFollowUps[agentId] = [...updatedFollowUps[agentId], newFollowUp];

    const updatedProject = {
      ...activeProject,
      followUps: updatedFollowUps
    };

    setActiveProject(updatedProject);
    setHistory((prev) => prev.map((p) => p.id === updatedProject.id ? updatedProject : p));
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
          <header className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              
              {/* Logo & Branding */}
              <div className="flex items-center gap-3">
                <div onClick={() => setShowDashboard(false)} className="w-9 h-9 rounded-lg overflow-hidden border border-purple-200 shadow-xs cursor-pointer hover:scale-105 transition-all bg-white p-0.5">
                  <img 
                    src={swarmLogo} 
                    alt="Swarm AI Logo" 
                    className="w-full h-full object-cover rounded-md"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1 onClick={() => setShowDashboard(false)} className="text-lg font-sans font-black tracking-[0.15em] text-slate-900 uppercase cursor-pointer hover:text-purple-600">
                      SWARM <span className="text-purple-600">AI</span>
                    </h1>
                    <span className="text-[10px] text-slate-500 font-mono tracking-wider">
                      by <strong className="font-bold text-slate-700">SRASS</strong>
                    </span>
                  </div>
                  <p className="text-[9px] text-purple-700 tracking-wider font-mono uppercase font-bold mt-0.5">
                    AI Innovation Boardroom System
                  </p>
                </div>
              </div>

              {/* Navigation Actions and Telemetry (TASK 1.1 - Max 3 visible items) */}
              <div className="flex items-center gap-3 font-mono text-xs">
                
                {/* 1. Exit Button */}
                <button
                  onClick={() => setShowDashboard(false)}
                  className="px-3 py-1.5 rounded-lg bg-black hover:bg-zinc-800 text-white transition-all cursor-pointer font-sans text-xs font-semibold tracking-wide"
                >
                  &larr; Exit to Home
                </button>

                {/* 2. Deliberations Badge */}
                {discussionCount > 0 && (
                  <button 
                    type="button"
                    onClick={() => {
                      setSurveyTriggerReason(discussionCount === 1 ? 'first_use' : 'interval_refresh');
                      setShowSurveyPopup(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-purple-200 bg-purple-50 text-purple-900 font-sans font-semibold hover:bg-purple-100 transition-colors cursor-pointer" 
                    title="Provide dialectic quality ratings & system validation feedback"
                  >
                    <span className="text-purple-600">📊</span>
                    <span>{discussionCount} {discussionCount === 1 ? 'Deliberation' : 'Deliberations'}</span>
                  </button>
                )}

                {/* 3. User Identity & System Health Dropdown */}
                <div className="relative">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-1">
                    {user ? (
                      <div className="flex items-center gap-2 px-2.5 py-1 text-purple-900 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="max-w-[120px] truncate font-bold text-xs" title={user.email}>{user.name}</span>
                        <button 
                          onClick={handleLogout}
                          className="text-[10px] text-slate-500 hover:text-purple-700 cursor-pointer ml-1 italic font-normal hover:underline"
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
                        className="px-3 py-1 text-purple-900 font-sans text-xs font-bold transition-colors cursor-pointer hover:text-purple-700"
                      >
                        Connect Account
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setShowStatusPopover(!showStatusPopover)}
                      className="p-1.5 hover:bg-purple-100/60 rounded-md text-slate-600 hover:text-purple-900 transition-colors cursor-pointer relative"
                      title="System Health & Engine Status"
                    >
                      <Settings className="w-4 h-4" />
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-purple-600"></span>
                    </button>
                  </div>

                  {showStatusPopover && (
                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 z-50 text-slate-900 space-y-2.5 font-sans">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-500 tracking-wider">System Health Signals</span>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-mono px-1.5 py-0.5 rounded border border-emerald-200 font-bold">OPERATIONAL</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Cpu className="w-3.5 h-3.5 text-purple-600" />
                            <span>Engine Provider</span>
                          </div>
                          <strong className="font-mono text-purple-900 font-bold text-[11px]">{providerLabel}</strong>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <div className="flex items-center gap-2 text-slate-700 font-medium">
                            <Database className="w-3.5 h-3.5 text-purple-600" />
                            <span>Database</span>
                          </div>
                          <strong className="font-mono text-slate-800 font-bold text-[11px]">Firestore Active</strong>
                        </div>
                      </div>
                    </div>
                  )}
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
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold tracking-wider text-slate-900 uppercase font-mono flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                Idea Incubator
              </h2>
              {activeProject && (
                <button 
                  onClick={clearCurrent}
                  className="text-[10px] px-2 py-0.5 font-bold text-slate-600 hover:text-slate-900 border border-slate-200 rounded bg-slate-50 hover:bg-slate-100 transition cursor-pointer"
                >
                  [Reset Input]
                </button>
              )}
            </div>

            <form onSubmit={executeAnalysis} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-700 mb-1.5 font-mono font-medium">Formulate Your Idea or Project Pitch:</label>
                <textarea
                  id="idea_textarea"
                  value={ideaInput}
                  onChange={(e) => {
                    setIdeaInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  disabled={isAnalyzing}
                  placeholder="Describe your project, academic theory, side-hustle, or startup idea in detail. Share the purpose, core mechanics, and your vision..."
                  className="w-full h-36 bg-white border border-slate-200 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 disabled:opacity-40 custom-scrollbar resize-none"
                />
              </div>

              {/* Attachments Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-mono font-medium">Boardroom Inputs:</span>
                  <div className="flex items-center gap-2">
                    {/* File Attachment Input Button */}
                    <label className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-purple-700 px-2.5 py-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-lg cursor-pointer transition">
                      <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                      <span>Attach File</span>
                      <input 
                        type="file" 
                        multiple 
                        accept=".png,.jpg,.jpeg,.webp,.pdf,.txt,.json,.csv"
                        onChange={handleFileAttach}
                        className="hidden" 
                        disabled={isAnalyzing}
                      />
                    </label>

                    {/* Camera Capture Button */}
                    <button
                      type="button"
                      onClick={isCameraOpen ? stopCamera : startCamera}
                      disabled={isAnalyzing}
                      className="flex items-center gap-1 text-[11px] font-bold text-slate-700 hover:text-purple-700 px-2.5 py-1 bg-slate-50 hover:bg-purple-50 border border-slate-200 rounded-lg transition cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-purple-600" />
                      <span>Camera</span>
                    </button>
                  </div>
                </div>

                {/* Camera Capture UI Overlay */}
                {isCameraOpen && (
                  <div className="relative border border-purple-200 bg-purple-50/50 rounded-lg p-2 overflow-hidden flex flex-col items-center gap-2">
                    <video 
                      id="camera_preview" 
                      className="w-full max-h-48 rounded-md bg-black object-cover scale-x-[-1]"
                      playsInline 
                      muted 
                    />
                    
                    {cameraError ? (
                      <p className="text-[10px] text-rose-600 text-center px-2 font-medium">{cameraError}</p>
                    ) : (
                      <p className="text-[9px] text-slate-600 font-mono font-medium">Capture a snapshot of drawings or notes</p>
                    )}

                    <div className="flex gap-2 w-full">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        disabled={!!cameraError}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 rounded-md text-[10px] uppercase tracking-wider flex items-center justify-center gap-1 transition cursor-pointer"
                      >
                        <Camera className="w-3 h-3" />
                        Take Photo
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 bg-white border border-slate-200 text-slate-700 rounded-md text-[10px] uppercase transition cursor-pointer font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Render Attached Files Thumbnails / Lists */}
                {attachments.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 max-h-[140px] overflow-y-auto custom-scrollbar pr-1 pt-1">
                    {attachments.map((att, idx) => {
                      const isImage = att.mimeType.startsWith('image/');
                      return (
                        <div key={idx} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {isImage ? (
                              <img 
                                src={att.base64} 
                                alt={att.name} 
                                className="w-8 h-8 rounded object-cover border border-slate-200 flex-shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 flex-shrink-0 font-bold">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-900 truncate" title={att.name}>
                                {att.name}
                              </p>
                              <span className="text-[9px] text-slate-500 font-mono block">
                                {isImage ? 'Image' : att.mimeType.split('/')[1]?.toUpperCase() || 'Doc'} • {(att.size / 1024).toFixed(1)} KB
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                            className="text-slate-400 hover:text-rose-600 p-1 transition rounded hover:bg-slate-100 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-lg p-3 text-rose-700 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                id="btn_submit_idea"
                type="submit"
                disabled={isAnalyzing || !ideaInput.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold h-10 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed shadow-xs"
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

          {/* B. Suggested Templates Grid (TASK 4.1 Collapsible Accordion) */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="w-full flex items-center justify-between text-xs font-bold tracking-wide text-slate-900 uppercase font-mono cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Quick-Start Templates</span>
              </div>
              {showTemplates ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showTemplates && (
              <div className="space-y-2.5 mt-3 pt-3 border-t border-slate-100">
                {PRESET_TEMPLATES.map((item, id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => handlePresetSelect(item.prompt)}
                    disabled={isAnalyzing}
                    className="w-full text-left p-3 rounded-lg border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-300 transition flex flex-col gap-1 cursor-pointer group"
                  >
                    <p className="text-xs font-bold text-slate-900 group-hover:text-purple-900 flex items-center gap-1.5 font-sans">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* C. History Indices list (TASK 4.1 Collapsible Accordion) */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900">
            <button
              type="button"
              onClick={() => setShowArchives(!showArchives)}
              className="w-full flex items-center justify-between text-xs font-bold tracking-wide text-slate-900 uppercase font-mono cursor-pointer"
            >
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                <span>Boardroom Archives</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-500 font-bold">{history.length} Saved</span>
                {showArchives ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </button>

            {showArchives && (
              <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {history.length === 0 ? (
                  <p className="text-xs text-slate-500 italic text-center py-4">No archives saved yet.</p>
                ) : (
                  history.map((proj) => {
                    const isActive = activeProject?.id === proj.id;
                    return (
                      <button
                        key={proj.id}
                        onClick={() => selectProject(proj)}
                        className={`w-full text-left p-2.5 rounded-lg border transition flex items-center justify-between gap-2.5 cursor-pointer ${
                          isActive 
                          ? 'bg-purple-50 border-purple-300 font-bold' 
                          : 'border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-bold truncate ${isActive ? 'text-purple-900' : 'text-slate-800'}`}>
                            {proj.idea}
                          </p>
                          <span className="text-[9px] text-slate-500 font-mono mt-0.5 block">
                            {new Date(proj.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                          proj.score >= 80 ? 'text-purple-900 bg-purple-100 border-purple-200' :
                          proj.score >= 60 ? 'text-purple-800 bg-purple-50 border-purple-200' :
                          'text-slate-800 bg-slate-100 border-slate-200'
                        }`}>
                          {proj.score}%
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </section>

        </div>

        {/* RIGHT AREA - MAIN DELIBERATION GRID & CONFLICT VIEWER (lg:col-span-3) */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          
          {/* Active Deliberation Objective Header */}
          <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs text-slate-900">
            {isAnalyzing ? (
              <div className="flex flex-col md:flex-row items-center gap-4 py-3">
                <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-mono font-bold text-purple-900 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkle className="w-4 h-4 text-purple-600 animate-pulse" />
                    Boardroom Convened
                  </h3>
                  <p className="text-sm text-slate-800 mt-1 max-w-xl transition-all duration-500 font-medium">
                    &ldquo;{loadingSteps[loadingStep]}&rdquo;
                  </p>
                </div>
              </div>
            ) : activeProject ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-mono tracking-wider uppercase text-purple-900 font-bold bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full inline-block mb-2">
                    Active Deliberation
                  </span>
                  <h2 className="text-lg md:text-xl font-sans font-bold text-slate-900 tracking-tight leading-snug">
                    {activeProject.idea}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-mono mt-1 font-semibold">
                    BOARD DEBATED ID: {activeProject.id} • RESOLVED AT: {new Date(activeProject.createdAt).toLocaleString()}
                  </p>
                  
                  {activeProject.attachments && activeProject.attachments.length > 0 && (
                    <div className="mt-3.5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                      <span className="text-[10px] text-slate-600 font-mono font-medium">Analyzed Inputs ({activeProject.attachments.length}):</span>
                      {activeProject.attachments.map((att, index) => (
                        <div key={index} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-[10px] text-purple-900 font-mono font-medium">
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>{att.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Score badge indicator with inline expandable breakdown toggle (TASK 2.2) */}
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-3">
                    <div className="text-center md:text-right">
                      <span className="text-[9px] uppercase tracking-wider text-slate-500 font-mono font-bold block">Feasibility Rating</span>
                      <strong className="text-3xl font-mono font-black text-slate-900 block mt-0.5">
                        {activeProject.score}<span className="text-xs text-slate-500">%</span>
                      </strong>
                    </div>
                    <div className="w-12 h-12 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 flex items-center justify-center shadow-xs">
                      <TrendingUp className="w-6 h-6" />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowHeaderScoreBreakdown(!showHeaderScoreBreakdown)}
                    className="text-[10px] font-mono text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer transition underline mt-1"
                  >
                    {showHeaderScoreBreakdown ? "Hide subscores" : "Show subscores"}
                  </button>

                  {showHeaderScoreBreakdown && activeProject.subScores && (
                    <div className="mt-2 p-2.5 bg-purple-50/90 border border-purple-200 rounded-lg text-[10px] font-mono text-purple-950 space-y-1 text-right">
                      <div>Market &amp; Demand (35%): <strong className="font-bold">{activeProject.subScores.market}%</strong></div>
                      <div>Risk Survival (35%): <strong className="font-bold">{activeProject.subScores.riskSurvival}%</strong></div>
                      <div>Tech Feasibility (30%): <strong className="font-bold">{activeProject.subScores.techFeasibility}%</strong></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center py-12 border border-dashed border-slate-200 bg-slate-50/50 rounded-xl">
                  <div className="w-12 h-12 rounded-full border border-purple-200 bg-purple-50 flex items-center justify-center mx-auto mb-4 text-purple-600">
                    <Brain className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 font-sans">AI Innovation Boardroom Vacant</h3>
                  <p className="text-xs text-slate-600 max-w-sm mx-auto mt-1.5 leading-relaxed">
                    The boardroom handles complex startup evaluation. Enter a business model or technology idea to compile research, criticisms, and architecture.
                  </p>
                </div>

                {/* Always-on General Launch Survey to allow feedback submission even before pitch generation */}
                {!isAnalyzing && (
                  <div className="mt-4">
                    <LaunchSurvey
                      projectId="platform_general"
                      userId={user?.uid || "mock-guest-uid"}
                      userName={user?.name || "Anonymous Guest"}
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {activeProject && (
            <div className="flex flex-col gap-6">
              
              {/* Tab Toggles */}
              <div className="border-b border-slate-200 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('debate')}
                    className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'debate' 
                      ? 'border-purple-600 text-purple-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    Boardroom Dialectics
                  </button>
                  <button
                    onClick={() => setActiveTab('roadmap')}
                    className={`pb-3 px-4 text-xs font-mono font-bold border-b-2 tracking-wider uppercase transition flex items-center gap-2 cursor-pointer ${
                      activeTab === 'roadmap' 
                      ? 'border-purple-600 text-purple-900' 
                      : 'border-transparent text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    Strategist Execution Board
                  </button>
                </div>
                
                <span className="text-[10px] font-mono text-slate-600 font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 hidden sm:inline-block">
                  Parallel Agent Swarm Active
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
                    className="flex flex-col gap-5"
                  >
                    {/* TASK 2.1 — 3 Agent Collapsed Summary Strips & Selection Tabs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {BOARD_MEMBERS.map((member) => {
                        const isSelected = activeAgentId === member.id;
                        const headline = getAgentHeadline(member.id, activeProject);

                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => setActiveAgentId(member.id as any)}
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-purple-50/90 border-purple-300 shadow-xs ring-2 ring-purple-500/20'
                                : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-purple-200 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className={`w-10 h-10 rounded-full object-cover flex-shrink-0 border ${
                                  isSelected ? 'border-purple-600 ring-2 ring-purple-300/50' : 'border-slate-200'
                                }`}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-900 truncate">{member.name}</span>
                                  <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                    isSelected ? 'bg-purple-200 text-purple-900' : 'bg-slate-100 text-slate-600'
                                  }`}>
                                    {member.role.split(' ')[0]}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-600 font-mono mt-0.5 truncate leading-snug" title={headline}>
                                  {headline}
                                </p>
                              </div>
                            </div>

                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${isSelected ? 'bg-purple-600 animate-pulse' : 'bg-slate-300'}`} />
                          </button>
                        );
                      })}
                    </div>

                    {/* Single Expanded Active Agent Card View */}
                    <div className="w-full">
                      {BOARD_MEMBERS.map((member) => {
                        if (member.id !== activeAgentId) return null;
                        
                        const content = 
                          member.id === 'research' ? activeProject.research :
                          member.id === 'critic' ? activeProject.critic :
                          activeProject.engineer;

                        return (
                          <AgentCard
                            key={member.id}
                            member={member}
                            content={content}
                            isAnalyzing={isAnalyzing}
                            status={isAnalyzing ? 'thinking' : 'completed'}
                            projectId={activeProject.id}
                            userId={user?.uid || "mock-guest-uid"}
                            groundingSources={member.id === 'research' ? activeProject.groundingSources : undefined}
                            followUps={activeProject.followUps?.[member.id] || []}
                            onFollowUpAdded={handleFollowUpAdded}
                          />
                        );
                      })}
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
                    <ScoreGauge
                      score={activeProject.score}
                      subScores={activeProject.subScores}
                      subScoreWeights={activeProject.subScoreWeights}
                    />

                    {/* Synthesized Roadmap Plan */}
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-md flex flex-col gap-5 relative text-slate-900">
                      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-xl bg-purple-600" />
                      
                      {/* Synthesizer Persona header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&h=200&fit=crop"
                            alt="Strategist AI"
                            className="w-12 h-12 rounded-full object-cover border-2 border-purple-200 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] uppercase tracking-widest text-purple-900 bg-purple-50 px-2.5 py-0.5 rounded border border-purple-200 flex items-center gap-1 font-bold">
                                <Compass className="w-3.5 h-3.5 text-purple-600" />
                                 Consensus Director Swarm AI
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 mt-1">Concurrence Opinion &amp; Strategy Plan</h3>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 leading-snug">
                              Synthesizing research telemetry, counter-acting vulnerability indices, and scaling deployment schematics.
                            </p>
                          </div>
                        </div>

                        {/* Export Action Controls */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => exportToPDF(activeProject)}
                            className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                            title="Export One-Click Executive PDF Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF Export
                          </button>
                          <button
                            onClick={() => exportToMarkdown(activeProject)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition"
                            title="Export Clean Markdown Specification File"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            Markdown
                          </button>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                          <h4 className="text-xs font-mono font-bold tracking-wider uppercase text-purple-900 mb-1.5">Debate Resolution Opinion:</h4>
                          <p className="text-sm text-slate-800 leading-relaxed italic font-medium">
                            &ldquo;{activeProject.strategist}&rdquo;
                          </p>
                        </div>
                        
                        <div className="mt-2 text-slate-800">
                          <MarkdownView content={activeProject.final_plan} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Launch Validation Survey */}
              <div className="mt-8 pt-6 border-t border-slate-200">
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

      {/* 3. Global Footer (Black) */}
      <footer className="border-t border-slate-800 bg-black py-5 mt-12 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SWARM • Built by SRASS • Launched June 18, 2026</span>
          <span className="text-slate-500 font-semibold">Powered by Gemini Swarm Multi-Agent Engine</span>
        </div>
      </footer>
        </>
      )}

      {/* 4. Auth Modal Dialog */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAuthModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-2xl z-10 font-sans text-slate-900"
            >
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-600 rounded-t-2xl" />
              
              <div className="text-center mb-6">
                <h3 className="text-2xl font-sans font-bold text-slate-900 tracking-tight">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-normal">
                  Access your dynamic innovation deliberations anywhere (Firestore Ready)
                </p>
              </div>

              {authError && (
                authError.includes("unauthorized-domain") ? (
                  <div id="auth-error-banner" className="mb-6 p-4 rounded-xl bg-purple-50 border border-purple-200 text-xs text-slate-800">
                    <div className="flex items-center gap-2 text-purple-900 font-bold mb-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0 text-purple-600" />
                      <span>Firebase Unauthorized Domain Error</span>
                    </div>
                    <p className="mb-3 leading-relaxed">
                      Google Sign-In requires your current preview domain to be whitelisted in your Firebase project.
                    </p>
                    <div className="bg-white border border-purple-200 rounded-lg p-3 mb-3 font-mono text-[11px] space-y-1">
                      <div className="text-slate-500 font-bold">Domain to copy:</div>
                      <div className="flex items-center justify-between gap-2 bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 font-mono text-purple-900 select-all overflow-x-auto">
                        <span>{window.location.hostname}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.hostname);
                            setCopiedHost(true);
                            setTimeout(() => setCopiedHost(false), 2000);
                          }}
                          className="flex-shrink-0 text-[10px] px-2 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {copiedHost ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedHost ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-slate-700">
                      <div className="font-semibold text-slate-900">How to fix this:</div>
                      <ol className="list-decimal pl-4 space-y-1">
                        <li>Go to your <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" className="text-purple-700 hover:underline inline-flex items-center gap-0.5 font-bold">Firebase Console <ExternalLink className="w-3 h-3 inline" /></a>.</li>
                        <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Settings</strong> &rarr; <strong>Authorized domains</strong>.</li>
                        <li>Click <strong>Add domain</strong> and paste the copied domain.</li>
                      </ol>
                    </div>
                    <p className="mt-3 pt-2.5 border-t border-purple-200 text-slate-600">
                      <strong>Protip:</strong> You can also skip this entirely by using the <strong>Email &amp; Password</strong> form below!
                    </p>
                  </div>
                ) : (
                  <div id="auth-error-banner" className="p-3 mb-4 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-mono text-center">
                    {authError}
                  </div>
                )
              )}

              {/* Black button for Google Login */}
              <button
                type="button"
                id="oauth-google-btn"
                onClick={handleOAuthGoogleSimulate}
                disabled={authLoading}
                className="w-full py-3 px-4 rounded-xl bg-black hover:bg-zinc-800 text-white font-medium text-xs transition-colors flex items-center justify-center gap-2 mb-4 cursor-pointer flex-row shadow-sm"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Sparkles className="w-4 h-4 text-purple-300" />
                )}
                Continue with Google Secure Sign-In
              </button>

              <div className="relative flex py-2.5 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-bold">or email entry</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Traditional form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4 mt-2">
                {authMode === 'signup' && (
                  <div>
                    <label className="block text-[10px] font-mono text-slate-700 uppercase tracking-wider mb-1 font-bold">Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Jenkins"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-[10px] font-mono text-slate-700 uppercase tracking-wider mb-1 font-bold">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-700 uppercase tracking-wider mb-1 font-bold">Password</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10"
                  />
                </div>

                <button
                  type="submit"
                  id="email-auth-submit-btn"
                  disabled={authLoading}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-xs transition-opacity hover:opacity-95 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
                  className="text-xs text-purple-700 hover:underline cursor-pointer font-mono font-bold"
                >
                  {authMode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Smart Launch Survey Popout Modal */}
      <AnimatePresence>
        {showSurveyPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSurveyPopup(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-5xl bg-white border border-slate-200 rounded-2xl shadow-2xl z-10 max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="relative p-5 md:p-6 bg-purple-50 border-b border-purple-200">
                <button
                  type="button"
                  onClick={() => setShowSurveyPopup(false)}
                  className="absolute top-5 right-5 text-slate-500 hover:text-slate-900 p-1.5 rounded-lg hover:bg-purple-100 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    {surveyTriggerReason === 'first_use' ? (
                      <>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded">
                          INITIAL EVALUATION • SESSION 1
                        </span>
                        <h3 className="text-xl font-sans font-extrabold text-slate-900 mt-1 uppercase tracking-wide">
                          First Deliberation Completed
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          Your first multi-agent boardroom simulation has successfully compiled. To help tune prompt dynamics, please rate your session with the strategic advisors.
                        </p>
                      </>
                    ) : (
                      <>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-900 bg-purple-100 border border-purple-300 px-2.5 py-0.5 rounded">
                          PERIODIC REFRESH • ACTIVE USER
                        </span>
                        <h3 className="text-xl font-sans font-extrabold text-slate-900 mt-1 uppercase tracking-wide">
                          Quality Evaluation Survey
                        </h3>
                        <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                          As an active evaluator of Swarm AI, we'd value your ongoing ratings to refine agent dialectics, critic weighting, and architecture plans.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Render the LaunchSurvey component inside */}
              <div className="p-6">
                <LaunchSurvey
                  projectId={activeProject?.id || "platform_popup_general"}
                  userId={user?.uid || "mock-guest-uid"}
                  userName={user?.name || "Anonymous Guest"}
                />
                
                <div className="mt-5 text-center">
                  <button
                    type="button"
                    onClick={() => setShowSurveyPopup(false)}
                    className="px-6 py-2 bg-black hover:bg-zinc-800 text-white rounded-lg text-xs uppercase font-mono font-bold transition cursor-pointer"
                  >
                    Close & Return to Boardroom
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
