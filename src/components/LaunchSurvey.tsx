import React, { useState, useEffect } from "react";
import { SurveyFeedback } from "../types";
import { Star, MessageSquare, Send, Sparkles, Trophy, Cake, RefreshCw, CheckCircle } from "lucide-react";
import { auth } from "../App";

interface LaunchSurveyProps {
  projectId: string;
  userId: string;
  userName?: string;
}

export default function LaunchSurvey({ projectId, userId, userName = "Anonymous Guest" }: LaunchSurveyProps) {
  const [ratings, setRatings] = useState({
    research: 5,
    critic: 5,
    engineer: 5,
    strategist: 5,
  });
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [existingSurveys, setExistingSurveys] = useState<SurveyFeedback[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);

  useEffect(() => {
    fetchSurveys();
  }, [projectId]);

  const fetchSurveys = async () => {
    setLoadingExisting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/surveys?projectId=${projectId}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setExistingSurveys(data);
      }
    } catch (e) {
      console.error("Error loading surveys", e);
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleRate = (role: "research" | "critic" | "engineer" | "strategist", value: number) => {
    setRatings((prev) => ({
      ...prev,
      [role]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/survey", {
        method: "POST",
        headers,
        body: JSON.stringify({
          projectId,
          userId,
          ratings,
          comments: comments.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback. Try again.");
      }

      setSuccess(true);
      setComments("");
      await fetchSurveys();
      
      // Auto success banner timeout
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (err: any) {
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  // Compute average of all submitted ratings for current project
  const computeAverage = (surveyList: SurveyFeedback[]) => {
    if (surveyList.length === 0) return 0;
    const totals = surveyList.reduce((acc, current) => {
      const sum = current.ratings.research + current.ratings.critic + current.ratings.engineer + current.ratings.strategist;
      return acc + (sum / 4);
    }, 0);
    return (totals / surveyList.length).toFixed(1);
  };

  return (
    <div className="bg-[#0D0D10] border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-md flex flex-col gap-6">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-teal-500 via-pink-500 to-blue-500 rounded-t-xl" />
      
      {/* Celebration Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Cake className="w-5 h-5 text-pink-400 animate-bounce" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-pink-400 font-bold bg-pink-950/45 border border-pink-500/20 px-2.5 py-0.5 rounded">
              Launch Day Special • June 18
            </span>
          </div>
          <h3 className="text-lg font-display font-extrabold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            Swarm Launch Validation Survey
          </h3>
          <p className="text-xs text-slate-400 mt-1 leading-normal font-sans">
            It is launch day! Express your feedback to optimize agent clashing dialectics and congratulate the creators.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-teal-500/10 border border-teal-500/30 rounded-lg p-2.5 px-3">
          <Trophy className="w-5 h-5 text-teal-400" />
          <div>
            <span className="text-[9px] text-slate-450 uppercase tracking-widest font-mono block">Project Approval</span>
            <strong className="text-base text-teal-300 font-mono block">
              {existingSurveys.length > 0 ? `${computeAverage(existingSurveys)} / 5.0` : "No ratings"}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Feedback Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-mono font-semibold tracking-wider text-teal-300 uppercase mb-4 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-teal-400 fill-teal-400" />
            Rate Board Dialectics Action
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Research Agent */}
            <div className="flex items-center justify-between gap-4 p-2 bg-[#121215] border border-white/5 rounded">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Dr. Evelyn Carter</span>
                <span className="text-[9px] text-slate-500 font-mono">Research Specialist Accuracy</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate("research", star)}
                    className="p-1 text-slate-600 hover:text-amber-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.research ? "text-amber-400 fill-amber-400" : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Critic Agent */}
            <div className="flex items-center justify-between gap-4 p-2 bg-[#121215] border border-white/5 rounded">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Julian Vance</span>
                <span className="text-[9px] text-slate-500 font-mono">Threat & Risk Audit Sharpness</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate("critic", star)}
                    className="p-1 text-slate-600 hover:text-rose-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.critic ? "text-rose-400 fill-rose-400" : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Engineer Agent */}
            <div className="flex items-center justify-between gap-4 p-2 bg-[#121215] border border-white/5 rounded">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Chief Architect Linus</span>
                <span className="text-[9px] text-slate-500 font-mono">Systems Architecture Feasibility</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate("engineer", star)}
                    className="p-1 text-slate-600 hover:text-emerald-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.engineer ? "text-emerald-400 fill-emerald-400" : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Strategist Verdict */}
            <div className="flex items-center justify-between gap-4 p-2 bg-[#121215] border border-white/5 rounded">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">Consensus Director Swarm AI</span>
                <span className="text-[9px] text-slate-500 font-mono">Roadmap and Overall Verdict Value</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate("strategist", star)}
                    className="p-1 text-slate-600 hover:text-blue-400 focus:outline-none transition-colors"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.strategist ? "text-blue-400 fill-blue-400" : "text-slate-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Notes, Wishlist, or Birthday Greetings:</span>
                <span className="text-[10px] text-slate-600">Optional</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Write your suggestions, feedback, or sweet birthday wishes for this June 18 launch..."
                className="w-full h-24 bg-[#161618] border border-white/10 rounded p-3 text-xs text-blue-100 placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/10 resize-none custom-scrollbar"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-400 font-mono bg-rose-950/20 border border-rose-500/10 p-2.5 rounded">
                ⚠️ {errorMsg}
              </div>
            )}

            {success ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/20 border border-emerald-500/10 p-2.5 rounded">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Thank you! Your survey validation data has been securely saved to Firestore database!</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:opacity-95 text-white font-bold h-10 rounded text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer transition-all duration-200"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Saving Validation...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Validation Survey
                  </>
                )}
              </button>
            )}
          </form>
        </div>

        {/* Live Feedback Feed on the Right */}
        <div className="border-t md:border-t-0 md:border-l border-white/5 md:pl-6 flex flex-col">
          <h4 className="text-xs font-mono font-semibold tracking-wider text-pink-300 uppercase mb-4 flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              🗣️ Corporate Feedback Channel
            </span>
            <span className="text-[10px] text-slate-500 normal-case font-mono">{existingSurveys.length} entry logs</span>
          </h4>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1.5 custom-scrollbar flex-1">
            {loadingExisting ? (
              <div className="text-slate-500 italic text-xs py-10 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-400" />
                Syncing with Firestore logs...
              </div>
            ) : existingSurveys.length === 0 ? (
              <div className="text-slate-500 italic text-xs py-12 text-center border border-dashed border-white/5 rounded-lg bg-white/2">
                Launch day awaits! Be the first to validation-test this micro-campaign.
              </div>
            ) : (
              existingSurveys.map((survey) => {
                const avg = (
                  (survey.ratings.research +
                    survey.ratings.critic +
                    survey.ratings.engineer +
                    survey.ratings.strategist) /
                  4
                ).toFixed(1);

                return (
                  <div key={survey.id} className="p-3.5 rounded bg-[#121215] border border-white/5 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 text-[10px] font-bold uppercase font-mono">
                          {userName.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-200 block truncate leading-tight">
                            {survey.userId === userId ? "You" : "Co-Founder Advisor"}
                          </span>
                          <span className="text-[9px] text-slate-550 font-mono leading-none block">
                            {new Date(survey.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active Session
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        <span className="text-[11px] font-bold text-amber-400 font-mono leading-none">{avg}</span>
                      </div>
                    </div>

                    {survey.comments && (
                      <p className="text-xs text-slate-350 bg-slate-950/30 p-2.5 rounded border border-white/2 line-clamp-4 leading-normal font-sans italic">
                        &ldquo;{survey.comments}&rdquo;
                      </p>
                    )}

                    <div className="grid grid-cols-4 gap-1 text-[8px] font-mono uppercase text-slate-500 items-center justify-between border-t border-white/2 pt-2">
                      <span className="truncate">Res: {survey.ratings.research}⭐</span>
                      <span className="truncate">Crt: {survey.ratings.critic}⭐</span>
                      <span className="truncate">Eng: {survey.ratings.engineer}⭐</span>
                      <span className="truncate">Str: {survey.ratings.strategist}⭐</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
