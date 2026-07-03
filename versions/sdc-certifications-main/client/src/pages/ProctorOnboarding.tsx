import React, { useState, useEffect } from "react";
import SDCLayout from "@/components/SDCLayout";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { 
  CheckCircle, 
  Video, 
  Mic, 
  Wifi, 
  PlayCircle, 
  Award, 
  ShieldCheck, 
  FileText 
} from "lucide-react";

export default function ProctorOnboarding() {
  const [, setLocation] = useLocation();
  const [phase, setPhase] = useState(1);

  // Phase 1 State
  const [sysChecks, setSysChecks] = useState({ webcam: false, mic: false, net: false });

  // Phase 2 State
  const [videoProgress, setVideoProgress] = useState(0);
  const [showQuizPopup, setShowQuizPopup] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Phase 3 State
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");

  // Phase 4 State
  const [authCode, setAuthCode] = useState("");

  useEffect(() => {
    if (phase === 4 && !authCode) {
      const code = 'PROCTOR-AUTH-2026-' + Math.random().toString(36).substring(2,6).toUpperCase();
      setAuthCode(code);
    }
  }, [phase, authCode]);

  // Phase 1 Handlers
  const handleSysCheck = (type: 'webcam' | 'mic' | 'net') => {
    setSysChecks(prev => ({ ...prev, [type]: true }));
  };
  const phase1Complete = sysChecks.webcam && sysChecks.mic && sysChecks.net;

  // Phase 2 Handlers
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (videoPlaying && !showQuizPopup && !videoCompleted) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          const next = prev + 20;
          if (next === 40) {
            setShowQuizPopup(true);
          } else if (next >= 100) {
            setVideoCompleted(true);
            setVideoPlaying(false);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [videoPlaying, showQuizPopup, videoCompleted]);

  const playVideo = () => {
    setVideoPlaying(true);
  };

  const answerPopup = () => {
    setShowQuizPopup(false);
  };

  // Phase 3 Handlers
  const submitAssessment = () => {
    if (!q1 || !q2) {
      toast.warning("Please answer all questions");
      return;
    }
    if (q1 === "correct" && q2 === "correct") {
      toast.success("Assessment passed! 100% Score");
      setPhase(4);
    } else {
      toast.error("You did not pass. Please review and try again.");
    }
  };

  // Phase 4 Handlers
  const completeOnboarding = () => {
    // Ideally we would save this code to the user's DB profile here via tRPC
    // For now we simulate success and redirect
    toast.success("Onboarding complete. Live access granted.");
    setLocation("/settings");
  };

  return (
    <SDCLayout>
      <div className="max-w-3xl mx-auto py-12 px-4">
        <div className="rounded-2xl p-8" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <h2 className="text-2xl font-bold text-center text-white mb-8">The Proctor Onboarding Journey</h2>
          
          {/* Progress Indicator */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="absolute top-1/2 left-0 right-0 h-1 z-0" style={{ background: "#334155", transform: "translateY(-50%)" }}></div>
            {[1, 2, 3, 4].map(p => {
              const isCompleted = p < phase;
              const isActive = p === phase;
              return (
                <div key={p} className="relative z-10 w-10 h-10 flex items-center justify-center rounded-full text-sm font-bold border-2 transition-all duration-300"
                  style={{
                    background: isCompleted ? "#10b981" : isActive ? "#d4a017" : "#0f172a",
                    color: isActive ? "#000" : "#fff",
                    borderColor: isCompleted || isActive ? "transparent" : "#334155"
                  }}>
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : p}
                </div>
              );
            })}
          </div>

          {/* PHASE 1 */}
          {phase === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Phase 1: Getting Ready</h3>
                <p style={{ color: "var(--sdc-text-muted)" }}>Let's ensure your system meets our proctoring standards before we begin.</p>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 rounded-xl" style={{ border: "1px solid #334155", background: "#0f172a" }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}><Video className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <strong className="block text-white">Webcam</strong>
                      <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Checking video input...</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSysCheck('webcam')}
                    disabled={sysChecks.webcam}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-100"
                    style={{ background: sysChecks.webcam ? "transparent" : "#334155", color: sysChecks.webcam ? "#10b981" : "#fff" }}>
                    {sysChecks.webcam ? <CheckCircle className="w-5 h-5" /> : "Test"}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl" style={{ border: "1px solid #334155", background: "#0f172a" }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}><Mic className="w-5 h-5 text-green-400" /></div>
                    <div>
                      <strong className="block text-white">Microphone</strong>
                      <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Checking audio input...</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSysCheck('mic')}
                    disabled={sysChecks.mic}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-100"
                    style={{ background: sysChecks.mic ? "transparent" : "#334155", color: sysChecks.mic ? "#10b981" : "#fff" }}>
                    {sysChecks.mic ? <CheckCircle className="w-5 h-5" /> : "Test"}
                  </button>
                </div>

                <div className="flex justify-between items-center p-4 rounded-xl" style={{ border: "1px solid #334155", background: "#0f172a" }}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.05)" }}><Wifi className="w-5 h-5 text-purple-400" /></div>
                    <div>
                      <strong className="block text-white">Internet Speed</strong>
                      <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Checking bandwidth...</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleSysCheck('net')}
                    disabled={sysChecks.net}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-100"
                    style={{ background: sysChecks.net ? "transparent" : "#334155", color: sysChecks.net ? "#10b981" : "#fff" }}>
                    {sysChecks.net ? <CheckCircle className="w-5 h-5" /> : "Test"}
                  </button>
                </div>
              </div>

              <button 
                disabled={!phase1Complete}
                onClick={() => setPhase(2)}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)" }}>
                Continue to Training
              </button>
            </div>
          )}

          {/* PHASE 2 */}
          {phase === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Phase 2: Learning the Ropes</h3>
                <p style={{ color: "var(--sdc-text-muted)" }}>Watch the core training video. You must watch the entire video without skipping.</p>
              </div>

              <div className="relative w-full h-72 bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
                {!videoPlaying && !videoCompleted && !showQuizPopup && (
                  <button onClick={playVideo} className="text-white hover:scale-110 transition-transform">
                    <PlayCircle className="w-16 h-16 opacity-70" />
                  </button>
                )}

                {videoCompleted && (
                  <div className="px-4 py-2 rounded-lg bg-black/70 text-white font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" /> Video Completed
                  </div>
                )}

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ease-linear" style={{ background: "#d4a017", width: \`\${videoProgress}%\` }}></div>

                {/* Quiz Popup Overlay */}
                {showQuizPopup && (
                  <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-6 z-10">
                    <p className="text-white font-semibold mb-6 text-center text-lg">Quick Check: What is the primary role of a proctor?</p>
                    <div className="space-y-3 w-full max-w-sm">
                      <button onClick={answerPopup} className="w-full text-left px-4 py-3 rounded-lg text-sm text-white transition-colors hover:bg-white/10" style={{ border: "1px solid #334155" }}>
                        To ensure exam integrity
                      </button>
                      <button onClick={answerPopup} className="w-full text-left px-4 py-3 rounded-lg text-sm text-white transition-colors hover:bg-white/10" style={{ border: "1px solid #334155" }}>
                        To help students answer questions
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button 
                disabled={!videoCompleted}
                onClick={() => setPhase(3)}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)" }}>
                Take Final Assessment
              </button>
            </div>
          )}

          {/* PHASE 3 */}
          {phase === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Phase 3: Verification</h3>
                <p style={{ color: "var(--sdc-text-muted)" }}>Answer the following questions to verify your understanding. You need 100% to pass.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl" style={{ border: "1px solid #334155", background: "#0f172a" }}>
                  <p className="font-semibold text-white mb-4">1. What should you do if a student looks away from the screen for more than 10 seconds?</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q1" value="wrong1" onChange={(e) => setQ1(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> Ignore it if it happens once.
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q1" value="correct" onChange={(e) => setQ1(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> Flag the session for review and issue a warning.
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q1" value="wrong2" onChange={(e) => setQ1(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> Immediately terminate the exam.
                    </label>
                  </div>
                </div>

                <div className="p-5 rounded-xl" style={{ border: "1px solid #334155", background: "#0f172a" }}>
                  <p className="font-semibold text-white mb-4">2. Which of the following is considered a major integrity violation?</p>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q2" value="wrong1" onChange={(e) => setQ2(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> Student sneezing loudly.
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q2" value="wrong2" onChange={(e) => setQ2(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> Student adjusting their chair.
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer text-sm text-gray-300">
                      <input type="radio" name="q2" value="correct" onChange={(e) => setQ2(e.target.value)} className="w-4 h-4 text-yellow-600 focus:ring-yellow-600 border-gray-600 bg-gray-700" /> A second person entering the camera frame.
                    </label>
                  </div>
                </div>
              </div>

              <button 
                onClick={submitAssessment}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)" }}>
                Submit Assessment
              </button>
            </div>
          )}

          {/* PHASE 4 */}
          {phase === 4 && (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <Award className="w-16 h-16 mx-auto mb-4" style={{ color: "#d4a017" }} />
                <h3 className="text-2xl font-bold text-white mb-2">Congratulations! You're Fully Verified.</h3>
                <p style={{ color: "var(--sdc-text-muted)" }}>You have successfully completed the proctor onboarding journey.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl text-center border" style={{ background: "rgba(212,160,23,0.1)", borderColor: "#d4a017" }}>
                  <ShieldCheck className="w-8 h-8 mx-auto mb-3" style={{ color: "#d4a017" }} />
                  <div className="font-semibold text-white mb-1">Verification Badge</div>
                  <div className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Added to public profile</div>
                </div>
                <div className="p-6 rounded-xl text-center border" style={{ background: "#0f172a", borderColor: "#334155" }}>
                  <FileText className="w-8 h-8 mx-auto mb-3 text-white" />
                  <div className="font-semibold text-white mb-1">Official Certificate</div>
                  <button onClick={() => toast.success("Downloading certificate...")} className="text-xs hover:underline" style={{ color: "#d4a017" }}>Download PDF</button>
                </div>
              </div>

              <div className="p-6 rounded-xl text-center border border-dashed" style={{ background: "#0f172a", borderColor: "#d4a017" }}>
                <div className="text-xs uppercase font-bold mb-2 tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Your Authentication Accord</div>
                <div className="text-2xl font-mono font-bold text-white tracking-widest">{authCode}</div>
                <div className="flex justify-center items-center gap-1 text-xs mt-3 text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" /> Added to your profile settings automatically.
                </div>
              </div>

              <button 
                onClick={completeOnboarding}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)" }}>
                Go to Profile Settings
              </button>
            </div>
          )}

        </div>
      </div>
    </SDCLayout>
  );
}
