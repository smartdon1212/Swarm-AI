import React, { useState, useEffect } from "react";
import { SurveyFeedback } from "../types";
import { Star, MessageSquare, Send, Sparkles, Trophy, ClipboardList, RefreshCw, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import { auth } from "../App";

interface LaunchSurveyProps {
  projectId: string;
  userId: string;
  userName?: string;
}

export default function LaunchSurvey({ projectId, userId, userName = "Anonymous Guest" }: LaunchSurveyProps) {
  const [overallRating, setOverallRating] = useState(5);
  const [showIndividualRatings, setShowIndividualRatings] = useState(false);
  const [customizedIndividual, setCustomizedIndividual] = useState(false);
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

  const handleOverallRate = (val: number) => {
    setOverallRating(val);
    if (!customizedIndividual) {
      setRatings({
        research: val,
        critic: val,
        engineer: val,
        strategist: val,
      });
    }
  };

  const handleRate = (role: "research" | "critic" | "engineer" | "strategist", value: number) => {
    setCustomizedIndividual(true);
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
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6 text-slate-900">
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-purple-600 rounded-t-xl" />
      
      {/* Quality Assurance Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-purple-600" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-purple-900 font-bold bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded">
              Quality Assurance • Active Validation
            </span>
          </div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 uppercase tracking-wider mt-1.5 flex items-center gap-2">
            Swarm AI Quality & Validation Survey
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-normal font-sans">
            Your evaluation helps tune the dialectical weights, prompt dynamics, and strategic output quality of the multi-agent boardroom.
          </p>
        </div>

        <div className="flex items-center gap-2.5 bg-purple-50 border border-purple-200 rounded-lg p-2.5 px-3">
          <Trophy className="w-5 h-5 text-purple-700" />
          <div>
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono block">Project Approval</span>
            <strong className="text-base text-purple-900 font-mono block">
              {existingSurveys.length > 0 ? `${computeAverage(existingSurveys)} / 5.0` : "No ratings"}
            </strong>
          </div>
        </div>
      </div>

      {/* Main Feedback Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-xs font-mono font-bold tracking-wider text-purple-800 uppercase mb-4 flex items-center gap-1.5">
            <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
            Rate Board Dialectics Action
          </h4>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Primary Overall Rating */}
            <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-purple-950 block font-sans">How useful was this deliberation?</span>
                  <span className="text-[10px] text-purple-700 font-mono">Primary Quality Rating (Required)</span>
                </div>
                <div className="flex gap-1 bg-white p-1 rounded-lg border border-purple-200 shadow-2xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleOverallRate(star)}
                      className="p-1 text-slate-300 hover:text-purple-600 focus:outline-none transition-colors cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= overallRating ? "text-purple-600 fill-purple-600" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapsible Individual Agent Ratings Accordion */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
              <button
                type="button"
                onClick={() => setShowIndividualRatings(!showIndividualRatings)}
                className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-mono font-bold text-slate-700 hover:text-purple-900 hover:bg-slate-100 transition cursor-pointer"
              >
                <span>Rate individual agents (optional)</span>
                {showIndividualRatings ? <ChevronUp className="w-4 h-4 text-purple-600" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>

              {showIndividualRatings && (
                <div className="p-3.5 pt-1 space-y-2.5 border-t border-slate-200 bg-white">
                  {/* 1. Research Agent */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Dr. Evelyn Carter</span>
                      <span className="text-[9px] text-slate-500 font-mono">Research Specialist</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate("research", star)}
                          className="p-1 text-slate-300 hover:text-purple-600 focus:outline-none transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= ratings.research ? "text-purple-600 fill-purple-600" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. Critic Agent */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Julian Vance</span>
                      <span className="text-[9px] text-slate-500 font-mono">Threat &amp; Risk Auditor</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate("critic", star)}
                          className="p-1 text-slate-300 hover:text-purple-600 focus:outline-none transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= ratings.critic ? "text-purple-600 fill-purple-600" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Engineer Agent */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Chief Architect Linus</span>
                      <span className="text-[9px] text-slate-500 font-mono">Systems Architect</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate("engineer", star)}
                          className="p-1 text-slate-300 hover:text-purple-600 focus:outline-none transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= ratings.engineer ? "text-purple-600 fill-purple-600" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Strategist Verdict */}
                  <div className="flex items-center justify-between gap-4 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Consensus Director</span>
                      <span className="text-[9px] text-slate-500 font-mono">Swarm AI Strategy Roadmap</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate("strategist", star)}
                          className="p-1 text-slate-300 hover:text-purple-600 focus:outline-none transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              star <= ratings.strategist ? "text-purple-600 fill-purple-600" : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-700 mb-1.5 flex items-center justify-between font-medium">
                <span>Notes, Wishlist, or Suggestions:</span>
                <span className="text-[10px] text-slate-400">Optional</span>
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Write your suggestions, feature requests, or dialectic feedback for the Swarm AI boardroom..."
                className="w-full h-24 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/10 resize-none custom-scrollbar"
              />
            </div>

            {errorMsg && (
              <div className="text-xs text-rose-700 font-mono bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
                ⚠️ {errorMsg}
              </div>
            )}

            {success ? (
              <div className="flex items-center gap-2 text-xs text-purple-900 font-mono bg-purple-50 border border-purple-200 p-2.5 rounded-lg">
                <CheckCircle className="w-4 h-4 text-purple-600" />
                <span>Thank you! Your survey validation data has been securely saved to Firestore database!</span>
              </div>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold h-10 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 shadow-sm"
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
        <div className="border-t md:border-t-0 md:border-l border-slate-200 md:pl-6 flex flex-col">
          <h4 className="text-xs font-mono font-bold tracking-wider text-purple-900 uppercase mb-4 flex items-center gap-1.5 justify-between">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              🗣️ Corporate Feedback Channel
            </span>
            <span className="text-[10px] text-slate-500 normal-case font-mono">{existingSurveys.length} entry logs</span>
          </h4>

          <div className="space-y-3 overflow-y-auto max-h-[380px] pr-1.5 custom-scrollbar flex-1">
            {loadingExisting ? (
              <div className="text-slate-500 italic text-xs py-10 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
                Syncing with Firestore logs...
              </div>
            ) : existingSurveys.length === 0 ? (
              <div className="text-slate-500 italic text-xs py-12 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50">
                Be the first to submit a validation rating for this session.
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
                  <div key={survey.id} className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-900 text-[10px] font-bold uppercase font-mono">
                          {userName.substring(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                            {survey.userId === userId ? "You" : "Co-Founder Advisor"}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono leading-none block">
                            {new Date(survey.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Active Session
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-purple-100 border border-purple-200 rounded px-1.5 py-0.5">
                        <Star className="w-3 h-3 text-purple-600 fill-purple-600" />
                        <span className="text-[11px] font-bold text-purple-900 font-mono leading-none">{avg}</span>
                      </div>
                    </div>

                    {survey.comments && (
                      <p className="text-xs text-slate-700 bg-white p-2.5 rounded border border-slate-200 line-clamp-4 leading-normal font-sans italic">
                        &ldquo;{survey.comments}&rdquo;
                      </p>
                    )}

                    <div className="grid grid-cols-4 gap-1 text-[8px] font-mono uppercase text-slate-500 items-center justify-between border-t border-slate-200 pt-2">
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
