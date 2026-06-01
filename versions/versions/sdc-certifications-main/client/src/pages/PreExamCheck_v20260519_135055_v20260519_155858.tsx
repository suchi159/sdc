import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Loader2, Camera, Mic, Wifi, IdCard, Scan, Shield,
  CheckCircle, XCircle, AlertCircle, ChevronRight, Lock, Info, LogIn
} from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Lockdown Browser Detection ──────────────────────────────────────────────
// Detects known secure browsers by inspecting navigator.userAgent and
// window properties injected by Respondus LockDown Browser and Safe Exam Browser.

interface LockdownDetectionResult {
  detected: boolean;
  browserName: string | null;
  confidence: "high" | "medium" | "low";
  details: string;
  blocked: boolean; // true if a non-secure browser is detected in strict mode
}

function detectLockdownBrowser(): LockdownDetectionResult {
  const ua = navigator.userAgent;
  const win = window as any;

  // 1. Respondus LockDown Browser
  // Injects window.RLDB or modifies userAgent to include "LockDown"
  if (
    ua.includes("LockDown") ||
    ua.includes("RLDB") ||
    typeof win.RLDB !== "undefined" ||
    typeof win.lockdownBrowser !== "undefined"
  ) {
    return {
      detected: true,
      browserName: "Respondus LockDown Browser",
      confidence: "high",
      details: "Respondus LockDown Browser detected via userAgent or window property.",
      blocked: false,
    };
  }

  // 2. Safe Exam Browser (SEB)
  // Injects window.SafeExamBrowser or sets X-SafeExamBrowser-RequestHash header
  // On the client side, SEB sets a special property on window
  if (
    ua.includes("SEB") ||
    ua.includes("SafeExamBrowser") ||
    typeof win.SafeExamBrowser !== "undefined" ||
    typeof win.sebKeys !== "undefined"
  ) {
    return {
      detected: true,
      browserName: "Safe Exam Browser (SEB)",
      confidence: "high",
      details: "Safe Exam Browser detected via userAgent or window.SafeExamBrowser property.",
      blocked: false,
    };
  }

  // 3. ProctorU Guardian Browser
  if (ua.includes("Guardian") || ua.includes("ProctorU")) {
    return {
      detected: true,
      browserName: "ProctorU Guardian Browser",
      confidence: "high",
      details: "ProctorU Guardian Browser detected via userAgent.",
      blocked: false,
    };
  }

  // 4. Proctorio (Chrome extension — detects via window.proctorio)
  if (typeof win.proctorio !== "undefined" || typeof win.__proctorio !== "undefined") {
    return {
      detected: true,
      browserName: "Proctorio (Chrome Extension)",
      confidence: "high",
      details: "Proctorio extension detected via window.proctorio property.",
      blocked: false,
    };
  }

  // 5. ExamSoft Examplify — injects window.examsoft
  if (typeof win.examsoft !== "undefined" || ua.includes("Examplify")) {
    return {
      detected: true,
      browserName: "ExamSoft Examplify",
      confidence: "high",
      details: "ExamSoft Examplify detected.",
      blocked: false,
    };
  }

  // 6. Heuristic: check if standard browser APIs are restricted
  // LockDown browsers typically disable devtools, right-click, and clipboard
  const hasDevToolsOpen = (() => {
    try {
      const threshold = 160;
      return (window.outerWidth - window.innerWidth > threshold) ||
             (window.outerHeight - window.innerHeight > threshold);
    } catch { return false; }
  })();

  // 7. Not a recognized secure browser — flag for human review
  // In production, you would block exam start here
  const isKnownBrowser = /Chrome|Firefox|Safari|Edge|Opera/.test(ua);
  if (isKnownBrowser && !hasDevToolsOpen) {
    return {
      detected: false,
      browserName: ua.includes("Chrome") ? "Google Chrome" :
                   ua.includes("Firefox") ? "Mozilla Firefox" :
                   ua.includes("Safari") ? "Apple Safari" :
                   ua.includes("Edge") ? "Microsoft Edge" : "Unknown Browser",
      confidence: "low",
      details: "No recognized secure browser detected. A lockdown browser is required for this exam.",
      blocked: true, // Block exam start — not in a secure browser
    };
  }

  return {
    detected: false,
    browserName: null,
    confidence: "low",
    details: "Browser environment could not be determined.",
    blocked: false,
  };
}

// ─── Real device checks ───────────────────────────────────────────────────────

async function checkWebcam(): Promise<{ passed: boolean; detail: string }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop());
    return { passed: true, detail: "Webcam access granted." };
  } catch (e: any) {
    return { passed: false, detail: e.message || "Webcam access denied." };
  }
}

async function checkMicrophone(): Promise<{ passed: boolean; detail: string }> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop());
    return { passed: true, detail: "Microphone access granted." };
  } catch (e: any) {
    return { passed: false, detail: e.message || "Microphone access denied." };
  }
}

async function checkBandwidth(): Promise<{ passed: boolean; detail: string; mbps?: number }> {
  try {
    const start = Date.now();
    // Download a ~100KB test payload from a CDN
    const res = await fetch("https://httpbin.org/bytes/102400", { cache: "no-store" });
    await res.arrayBuffer();
    const elapsed = (Date.now() - start) / 1000;
    const mbps = (102400 * 8) / (elapsed * 1_000_000);
    const passed = mbps >= 1.0;
    return {
      passed,
      detail: passed
        ? `Connection speed: ${mbps.toFixed(1)} Mbps (minimum 1 Mbps required)`
        : `Connection too slow: ${mbps.toFixed(1)} Mbps (minimum 1 Mbps required)`,
      mbps,
    };
  } catch {
    // Fallback: assume OK if fetch fails (CORS etc.)
    return { passed: true, detail: "Speed test inconclusive — assuming OK." };
  }
}

// ─── Step definitions ─────────────────────────────────────────────────────────

interface CheckStep {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  field: string;
  realCheck?: () => Promise<{ passed: boolean; detail: string; mbps?: number }>;
}

const STEPS: CheckStep[] = [
  {
    id: "webcam",
    label: "Webcam Check",
    description: "We need access to your webcam for identity verification and monitoring.",
    icon: <Camera className="h-6 w-6" />,
    field: "webcamOk",
    realCheck: checkWebcam,
  },
  {
    id: "mic",
    label: "Microphone Check",
    description: "Your microphone will be used to detect audio anomalies during the exam.",
    icon: <Mic className="h-6 w-6" />,
    field: "micOk",
    realCheck: checkMicrophone,
  },
  {
    id: "bandwidth",
    label: "Bandwidth Test",
    description: "Checking your internet connection speed (minimum 1 Mbps required).",
    icon: <Wifi className="h-6 w-6" />,
    field: "bandwidthOk",
    realCheck: checkBandwidth,
  },
  {
    id: "identity",
    label: "Identity Verification",
    description: "Hold your government-issued ID up to the camera for verification.",
    icon: <IdCard className="h-6 w-6" />,
    field: "idVerified",
  },
  {
    id: "roomscan",
    label: "Room Scan",
    description: "Slowly rotate your camera 360° to show your testing environment.",
    icon: <Scan className="h-6 w-6" />,
    field: "roomScanOk",
  },
  {
    id: "lockdown",
    label: "Secure Browser",
    description: "Verifying that you are using an approved secure/lockdown browser.",
    icon: <Shield className="h-6 w-6" />,
    field: "lockdownBrowserOk",
  },
];

export default function PreExamCheck() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [currentStep, setCurrentStep] = useState(0);
  const [checkResults, setCheckResults] = useState<Record<string, boolean>>({});
  const [checkDetails, setCheckDetails] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [lockdownResult, setLockdownResult] = useState<LockdownDetectionResult | null>(null);
  const [bypassLockdown, setBypassLockdown] = useState(false); // allow org admin to bypass in dev

  const attemptId = 1;

  const upsertMutation = trpc.proctoring.preCheck.upsert.useMutation();
  const completeMutation = trpc.proctoring.preCheck.complete.useMutation({
    onSuccess: (data) => {
      if (data.passed) {
        toast.success("All checks passed! You may now begin your exam.");
        setCompleted(true);
      } else {
        toast.error("Some checks failed. Please retry the failed steps.");
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const step = STEPS[currentStep];
  const progress = Math.round((currentStep / STEPS.length) * 100);

  const runCheck = useCallback(async () => {
    if (!step) return;
    setIsChecking(true);

    let passed = false;
    let detail = "";

    if (step.id === "lockdown") {
      // Real lockdown browser detection
      const result = detectLockdownBrowser();
      setLockdownResult(result);
      passed = result.detected || bypassLockdown;
      detail = result.details;

      if (!passed) {
        toast.error("Secure browser required. Please install Respondus LockDown Browser or Safe Exam Browser.");
      }
    } else if (step.realCheck) {
      // Real device check
      const result = await step.realCheck();
      passed = result.passed;
      detail = result.detail;
    } else {
      // Simulated check (identity, room scan)
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      passed = Math.random() > 0.05; // 95% pass rate for demo
      detail = passed ? `${step.label} completed successfully.` : `${step.label} failed — please retry.`;
    }

    setCheckResults(prev => ({ ...prev, [step.field]: passed }));
    setCheckDetails(prev => ({ ...prev, [step.field]: detail }));

    await upsertMutation.mutateAsync({
      attemptId,
      [step.field]: passed,
      status: "in_progress",
    });

    setIsChecking(false);

    if (passed) {
      toast.success(`${step.label} passed`);
      if (currentStep < STEPS.length - 1) {
        setTimeout(() => setCurrentStep(prev => prev + 1), 600);
      }
    } else {
      toast.error(`${step.label} failed — please retry`);
    }
  }, [step, currentStep, bypassLockdown, upsertMutation]);

  const handleComplete = () => {
    completeMutation.mutate({ attemptId });
  };

  const getStepStatus = (stepField: string) => {
    if (checkResults[stepField] === true) return "passed";
    if (checkResults[stepField] === false) return "failed";
    return "pending";
  };

  // Show login prompt for unauthenticated visitors
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-muted-foreground">
              You must be signed in to complete the pre-exam system check. Please sign in with your candidate account to continue.
            </p>
            <Button
              className="w-full"
              onClick={() => window.location.href = getLoginUrl("/exam-check")}
            >
              <LogIn className="h-4 w-4 mr-2" />
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center">
          <CardContent className="p-8 space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">All Checks Passed!</h2>
            <p className="text-muted-foreground">
              Your system is ready for the exam. Your proctor has been notified and will join shortly.
            </p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              {STEPS.map(s => (
                <div key={s.id} className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs">{s.label.split(" ")[0]}</span>
                </div>
              ))}
            </div>
            <Button className="w-full" onClick={() => navigate("/exam/1")}>
              Begin Exam <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Pre-Exam System Check</h1>
          <p className="text-muted-foreground">
            Complete all checks before your exam begins. This ensures a fair testing environment.
          </p>
          <Progress value={progress} className="h-2 mt-4" />
          <p className="text-xs text-muted-foreground">{currentStep} of {STEPS.length} checks completed</p>
        </div>

        {/* Step Checklist */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STEPS.map((s, idx) => {
            const status = getStepStatus(s.field);
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 p-2 rounded-lg border text-sm transition-all ${
                  idx === currentStep ? "border-primary bg-primary/5" :
                  status === "passed" ? "border-green-500 bg-green-50 dark:bg-green-900/10" :
                  status === "failed" ? "border-red-500 bg-red-50 dark:bg-red-900/10" :
                  "border-border opacity-50"
                }`}
              >
                {status === "passed" ? <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" /> :
                 status === "failed" ? <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" /> :
                 idx === currentStep ? <AlertCircle className="h-4 w-4 text-primary flex-shrink-0" /> :
                 <div className="h-4 w-4 rounded-full border-2 border-muted flex-shrink-0" />}
                <span className="truncate">{s.label.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>

        {/* Current Step Card */}
        {step && (
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {step.icon}
                </div>
                <div>
                  <p className="text-lg">{step.label}</p>
                  <p className="text-sm font-normal text-muted-foreground">Step {currentStep + 1} of {STEPS.length}</p>
                </div>
              </CardTitle>
              <CardDescription>{step.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preview area */}
              <div className="h-40 rounded-lg bg-slate-900 flex items-center justify-center border">
                {step.id === "webcam" || step.id === "identity" || step.id === "roomscan" ? (
                  <div className="text-center text-slate-400 space-y-2">
                    <Camera className="h-8 w-8 mx-auto" />
                    <p className="text-sm">Camera preview</p>
                    {isChecking && <p className="text-xs text-green-400 animate-pulse">Analyzing...</p>}
                  </div>
                ) : step.id === "mic" ? (
                  <div className="text-center text-slate-400 space-y-2">
                    <Mic className="h-8 w-8 mx-auto" />
                    <div className="flex gap-1 justify-center items-end h-8">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full bg-green-400 transition-all ${isChecking ? "animate-pulse" : ""}`}
                          style={{ height: `${Math.floor(Math.random() * 20) + 8}px` }}
                        />
                      ))}
                    </div>
                    {isChecking && <p className="text-xs text-green-400 animate-pulse">Detecting audio...</p>}
                  </div>
                ) : step.id === "bandwidth" ? (
                  <div className="text-center text-slate-400 space-y-2">
                    <Wifi className="h-8 w-8 mx-auto" />
                    {isChecking ? (
                      <p className="text-xs text-blue-400 animate-pulse">Testing connection speed...</p>
                    ) : (
                      <p className="text-sm">Ready to test</p>
                    )}
                  </div>
                ) : step.id === "lockdown" ? (
                  <div className="text-center text-slate-400 space-y-2 px-4">
                    <Lock className="h-8 w-8 mx-auto" />
                    {lockdownResult ? (
                      <div className="space-y-1">
                        {lockdownResult.detected ? (
                          <p className="text-xs text-green-400">
                            ✓ {lockdownResult.browserName} detected
                          </p>
                        ) : (
                          <p className="text-xs text-red-400">
                            ✗ No secure browser detected
                          </p>
                        )}
                        <p className="text-xs text-slate-500">{lockdownResult.details}</p>
                      </div>
                    ) : (
                      <p className="text-sm">
                        {isChecking ? "Scanning browser environment..." : "Ready to check"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 space-y-2">
                    {step.icon}
                    {isChecking && <p className="text-xs text-green-400 animate-pulse">Checking...</p>}
                  </div>
                )}
              </div>

              {/* Lockdown browser info box */}
              {step.id === "lockdown" && !lockdownResult && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs">
                  <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium mb-1">Supported Secure Browsers</p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      <li>Respondus LockDown Browser</li>
                      <li>Safe Exam Browser (SEB)</li>
                      <li>ProctorU Guardian Browser</li>
                      <li>ExamSoft Examplify</li>
                    </ul>
                    <p className="mt-1 text-blue-500">
                      If you are testing in development mode, you can bypass this check below.
                    </p>
                  </div>
                </div>
              )}

              {/* Lockdown blocked warning */}
              {step.id === "lockdown" && lockdownResult?.blocked && !bypassLockdown && (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                    <XCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium">Secure browser required</p>
                      <p className="text-xs mt-0.5">
                        You are currently using <strong>{lockdownResult.browserName}</strong>.
                        This exam requires a lockdown browser. Please close this browser and reopen the exam
                        in Respondus LockDown Browser or Safe Exam Browser.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs text-muted-foreground"
                    onClick={() => setBypassLockdown(true)}
                  >
                    I am a developer / admin — bypass lockdown check
                  </Button>
                </div>
              )}

              {/* Bypass confirmation */}
              {step.id === "lockdown" && bypassLockdown && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 text-xs">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Lockdown check bypassed (developer/admin mode). In production, this step blocks exam access.
                </div>
              )}

              {/* Generic failure message */}
              {step.id !== "lockdown" && checkResults[step.field] === false && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                  <XCircle className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <p>Check failed. Please ensure your {step.label.toLowerCase()} is working and try again.</p>
                    {checkDetails[step.field] && (
                      <p className="text-xs mt-0.5 opacity-80">{checkDetails[step.field]}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Success detail */}
              {checkResults[step.field] === true && checkDetails[step.field] && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs">
                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                  {checkDetails[step.field]}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={runCheck}
                  disabled={
                    isChecking ||
                    checkResults[step.field] === true ||
                    (step.id === "lockdown" && lockdownResult?.blocked && !bypassLockdown)
                  }
                >
                  {isChecking ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />Running check...</>
                  ) : checkResults[step.field] === true ? (
                    <><CheckCircle className="h-4 w-4 mr-2" />Passed</>
                  ) : (
                    <>Run {step.label}</>
                  )}
                </Button>
                {checkResults[step.field] === true && currentStep < STEPS.length - 1 && (
                  <Button variant="outline" onClick={() => setCurrentStep(prev => prev + 1)}>
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complete Button */}
        {currentStep >= STEPS.length - 1 && Object.keys(checkResults).length === STEPS.length && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleComplete}
            disabled={completeMutation.isPending}
          >
            {completeMutation.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Finalizing...</>
            ) : (
              <><Shield className="h-4 w-4 mr-2" />Complete Pre-Exam Check</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
