import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import {
  Building2, Settings, CheckCircle, CreditCard, Rocket,
  ChevronLeft, ChevronRight, Plus, Trash2, Globe, Users,
  Shield, BookOpen, Brain, Video, MapPin, Gamepad2, Bot,
  CheckCircle2, ArrowRight, Sparkles, AlertCircle, X
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Step1Data {
  name: string;
  industry: string;
  size: string;
  website: string;
  description: string;
}

interface Step2Data {
  examTypes: string[];
  passingScore: number;
  timeLimit: number;
  randomizeQuestions: boolean;
  allowRetakes: boolean;
  maxRetakes: number;
  proctoring: string;
  certValidity: number;
}

interface Step3Features {
  badges: boolean;
  publicRoster: boolean;
  tier1Proctoring: boolean;
  tier2Proctoring: boolean;
  tier3Proctoring: boolean;
  gamification: boolean;
  aiTutor: boolean;
}

interface TeamInvite {
  email: string;
  role: string;
  name: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const INDUSTRIES = [
  "Information Technology", "Healthcare & Medical", "Finance & Banking",
  "Legal & Compliance", "Engineering", "Education", "Government",
  "Manufacturing", "Retail & E-commerce", "Non-profit", "Other"
];

const ORG_SIZES = [
  "1–10 employees", "11–50 employees", "51–200 employees",
  "201–500 employees", "501–1,000 employees", "1,000+ employees"
];

const EXAM_TYPES = [
  "Multiple Choice (MCQ)", "True/False", "Short Answer",
  "Essay", "Practical/Performance", "Adaptive (IRT)"
];

const PROCTORING_OPTIONS = [
  { value: "none", label: "No Proctoring", desc: "Honor-based self-assessment" },
  { value: "ai", label: "AI Proctoring (Tier 1)", desc: "Automated AI monitoring" },
  { value: "virtual", label: "Virtual Human (Tier 2)", desc: "Live remote proctoring" },
  { value: "inperson", label: "In-Person (Tier 3)", desc: "Physical test center" },
];

const FEATURES = [
  {
    id: "badges", name: "Digital Badges", price: 20, recommended: true,
    icon: Shield, desc: "Issue Open Badge 2.0 compliant credentials",
    color: "#3b82f6"
  },
  {
    id: "publicRoster", name: "Public Roster", price: 15, recommended: false,
    icon: Globe, desc: "Searchable directory of certified professionals",
    color: "#8b5cf6"
  },
  {
    id: "tier1Proctoring", name: "AI Proctoring (Tier 1)", price: 30, recommended: true,
    icon: Video, desc: "Automated AI-driven exam monitoring",
    color: "#ef4444"
  },
  {
    id: "tier2Proctoring", name: "Virtual Human Proctor (Tier 2)", price: 50, recommended: false,
    icon: Users, desc: "Live remote proctoring by human supervisors",
    color: "#f97316"
  },
  {
    id: "tier3Proctoring", name: "In-Person Testing (Tier 3)", price: 75, recommended: false,
    icon: MapPin, desc: "Physical test center management",
    color: "#14b8a6"
  },
  {
    id: "gamification", name: "Gamification", price: 25, recommended: true,
    icon: Gamepad2, desc: "XP, levels, badges, and leaderboards",
    color: "#f59e0b"
  },
  {
    id: "aiTutor", name: "AI Tutor (RAG)", price: 40, recommended: false,
    icon: Bot, desc: "Contextual learning assistant powered by LLM",
    color: "#10b981"
  },
];

const ROLES = [
  { value: "org_admin", label: "Org Admin" },
  { value: "psychometrician", label: "Psychometrician" },
  { value: "exam_developer", label: "Exam Developer" },
  { value: "instructor", label: "Instructor" },
  { value: "proctor", label: "Proctor" },
  { value: "candidate", label: "Candidate" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OnboardingWizard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [animating, setAnimating] = useState(false);

  // Step data
  const [step1, setStep1] = useState<Step1Data>({
    name: "", industry: "", size: "", website: "", description: ""
  });
  const [step2, setStep2] = useState<Step2Data>({
    examTypes: ["Multiple Choice (MCQ)"],
    passingScore: 70,
    timeLimit: 60,
    randomizeQuestions: true,
    allowRetakes: true,
    maxRetakes: 3,
    proctoring: "ai",
    certValidity: 24,
  });
  const [step3Features, setStep3Features] = useState<Step3Features>({
    badges: true, publicRoster: false, tier1Proctoring: true,
    tier2Proctoring: false, tier3Proctoring: false, gamification: true, aiTutor: false,
  });
  const [teamInvites, setTeamInvites] = useState<TeamInvite[]>([
    { email: "", role: "exam_developer", name: "" }
  ]);
  const [candidateCount, setCandidateCount] = useState(100);

  // Load existing onboarding state
  const { data: onboardingState } = trpc.onboarding.getState.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (onboardingState) {
      if (onboardingState.completed) {
        navigate("/org");
        return;
      }
      setCurrentStep(onboardingState.step || 1);
      if (onboardingState.name) setStep1(prev => ({ ...prev, name: onboardingState.name || "" }));
      if (onboardingState.industry) setStep1(prev => ({ ...prev, industry: onboardingState.industry || "" }));
      if (onboardingState.size) setStep1(prev => ({ ...prev, size: onboardingState.size || "" }));
      if (onboardingState.website) setStep1(prev => ({ ...prev, website: onboardingState.website || "" }));
    }
  }, [onboardingState]);

  // Mutations
  const saveCompany = trpc.onboarding.saveCompanyDetails.useMutation();
  const saveExamConfig = trpc.onboarding.saveExamConfig.useMutation();
  const saveFeatures = trpc.onboarding.saveFeatures.useMutation();
  const savePricing = trpc.onboarding.savePricing.useMutation();
  const completeOnboarding = trpc.onboarding.complete.useMutation();
  const inviteTeam = trpc.onboarding.inviteTeam.useMutation();
  const utils = trpc.useUtils();

  // Pricing calculation
  const BASE_PRICE = 99;
  const selectedFeaturesTotal = FEATURES
    .filter(f => step3Features[f.id as keyof Step3Features])
    .reduce((sum, f) => sum + f.price, 0);
  const candidateCost = candidateCount * 0.5;
  const monthlyTotal = BASE_PRICE + selectedFeaturesTotal + candidateCost;

  // Steps config
  const steps = [
    { number: 1, title: "Company Details", icon: Building2 },
    { number: 2, title: "Exam Configuration", icon: Settings },
    { number: 3, title: "Features & Team", icon: CheckCircle },
    { number: 4, title: "Pricing Review", icon: CreditCard },
    { number: 5, title: "Launch", icon: Rocket },
  ];

  const goToStep = (step: number) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(step);
      setAnimating(false);
    }, 200);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 1) {
        if (!step1.name.trim()) {
          toast.error("Please enter your organization name");
          return;
        }
        await saveCompany.mutateAsync(step1);
        toast.success("Company details saved!");
      } else if (currentStep === 2) {
        await saveExamConfig.mutateAsync(step2);
        toast.success("Exam configuration saved!");
      } else if (currentStep === 3) {
        await saveFeatures.mutateAsync({ features: step3Features as unknown as Record<string, boolean> });
        // Also send team invites if any have emails
        const validInvites = teamInvites.filter(i => i.email.trim());
        if (validInvites.length > 0) {
          await inviteTeam.mutateAsync({ invites: validInvites as any });
          toast.success(`Features saved! ${validInvites.length} team member(s) invited.`);
        } else {
          toast.success("Features saved!");
        }
      } else if (currentStep === 4) {
        await savePricing.mutateAsync({ monthlyBudget: Math.round(monthlyTotal), candidates: candidateCount });
        toast.success("Pricing confirmed!");
      }
      await utils.onboarding.getState.invalidate();
      goToStep(currentStep + 1);
    } catch (err: any) {
      toast.error(err?.message || "Failed to save. Please try again.");
    }
  };

  const handleComplete = async () => {
    try {
      await completeOnboarding.mutateAsync({ paymentConnected: false });
      toast.success("🎉 Your organization is ready! Welcome to SDC Certifications!");
      setTimeout(() => navigate("/org"), 2000);
    } catch (err: any) {
      toast.error(err?.message || "Failed to complete setup.");
    }
  };

  const addInvite = () => setTeamInvites(prev => [...prev, { email: "", role: "candidate", name: "" }]);
  const removeInvite = (i: number) => setTeamInvites(prev => prev.filter((_, idx) => idx !== i));
  const updateInvite = (i: number, field: keyof TeamInvite, value: string) => {
    setTeamInvites(prev => prev.map((inv, idx) => idx === i ? { ...inv, [field]: value } : inv));
  };

  const isLoading = saveCompany.isPending || saveExamConfig.isPending ||
    saveFeatures.isPending || savePricing.isPending || completeOnboarding.isPending;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#c8972a" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-lg leading-tight">SDC Certifications</div>
            <div className="text-white/60 text-xs">Organization Setup</div>
          </div>
        </div>
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-sm"
        >
          <X className="w-4 h-4" />
          Exit Setup
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12">
        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isComplete = currentStep > step.number;
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-all duration-300"
                      style={{
                        background: isComplete ? "#10b981" : isActive ? "#c8972a" : "rgba(255,255,255,0.15)",
                        border: `2px solid ${isComplete ? "#10b981" : isActive ? "#c8972a" : "rgba(255,255,255,0.25)"}`,
                        boxShadow: isActive ? "0 0 20px rgba(200,151,42,0.5)" : "none",
                      }}
                    >
                      {isComplete ? (
                        <CheckCircle2 className="w-6 h-6 text-white" />
                      ) : (
                        <Icon className="w-6 h-6" style={{ color: isActive ? "#ffffff" : "rgba(255,255,255,0.6)" }} />
                      )}
                    </div>
                    <span
                      className="text-center text-xs font-semibold hidden sm:block"
                      style={{ color: isActive || isComplete ? "#ffffff" : "rgba(255,255,255,0.5)" }}
                    >
                      {step.title}
                    </span>
                    <span
                      className="text-center text-xs font-semibold sm:hidden"
                      style={{ color: isActive || isComplete ? "#ffffff" : "rgba(255,255,255,0.5)" }}
                    >
                      {step.number}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className="flex-1 h-0.5 mx-3 mt-[-24px] transition-all duration-500"
                      style={{ background: isComplete ? "#10b981" : "rgba(255,255,255,0.2)" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
          {/* Step indicator */}
          <div className="text-center mt-4">
            <span className="text-white/60 text-sm">Step {currentStep} of {steps.length}</span>
          </div>
        </div>

        {/* Form Card */}
        <div
          className={`rounded-3xl transition-all duration-200 ${animating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"}`}
          style={{
            background: "rgba(255,255,255,0.98)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}
        >
          <div className="p-8 md:p-10">

            {/* ── STEP 1: Company Details ─────────────────────────────────── */}
            {currentStep === 1 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
                    Company Details
                  </h2>
                </div>
                <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
                  Tell us about your organization so we can personalize your experience.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>
                      Organization Name <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <input
                      type="text"
                      value={step1.name}
                      onChange={e => setStep1(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Acme Certifications Inc."
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{
                        border: "1.5px solid #e2e8f0",
                        color: "#1e293b",
                        background: "#f8fafc",
                      }}
                      onFocus={e => e.target.style.borderColor = "#c8972a"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>Industry</label>
                    <select
                      value={step1.industry}
                      onChange={e => setStep1(prev => ({ ...prev, industry: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                    >
                      <option value="">Select industry...</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>Organization Size</label>
                    <select
                      value={step1.size}
                      onChange={e => setStep1(prev => ({ ...prev, size: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none"
                      style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                    >
                      <option value="">Select size...</option>
                      {ORG_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>Website</label>
                    <input
                      type="url"
                      value={step1.website}
                      onChange={e => setStep1(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                      onFocus={e => e.target.style.borderColor = "#c8972a"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>Description</label>
                    <textarea
                      value={step1.description}
                      onChange={e => setStep1(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of your organization and certification programs..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-all"
                      style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                      onFocus={e => e.target.style.borderColor = "#c8972a"}
                      onBlur={e => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Exam Configuration ──────────────────────────────── */}
            {currentStep === 2 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f59e0b, #ef4444)" }}>
                    <Settings className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
                    Exam Configuration
                  </h2>
                </div>
                <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
                  Configure default settings for your certification exams.
                </p>

                <div className="space-y-6">
                  {/* Exam Types */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold" style={{ color: "#1e293b" }}>Question Types</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {EXAM_TYPES.map(type => {
                        const selected = step2.examTypes.includes(type);
                        return (
                          <button
                            key={type}
                            onClick={() => setStep2(prev => ({
                              ...prev,
                              examTypes: selected
                                ? prev.examTypes.filter(t => t !== type)
                                : [...prev.examTypes, type]
                            }))}
                            className="px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all"
                            style={{
                              background: selected ? "linear-gradient(135deg, rgba(200,151,42,0.15), rgba(219,169,59,0.1))" : "#f8fafc",
                              border: `1.5px solid ${selected ? "#c8972a" : "#e2e8f0"}`,
                              color: selected ? "#92700f" : "#64748b",
                            }}
                          >
                            {selected && <CheckCircle2 className="w-3 h-3 inline mr-1.5" />}
                            {type}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>
                        Default Passing Score: <span style={{ color: "#c8972a" }}>{step2.passingScore}%</span>
                      </label>
                      <input
                        type="range" min={50} max={100} step={5}
                        value={step2.passingScore}
                        onChange={e => setStep2(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                        className="w-full accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
                        <span>50%</span><span>75%</span><span>100%</span>
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>
                        Time Limit: <span style={{ color: "#c8972a" }}>{step2.timeLimit} min</span>
                      </label>
                      <input
                        type="range" min={15} max={240} step={15}
                        value={step2.timeLimit}
                        onChange={e => setStep2(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                        className="w-full accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
                        <span>15m</span><span>2h</span><span>4h</span>
                      </div>
                    </div>
                  </div>

                  {/* Proctoring */}
                  <div>
                    <label className="block mb-3 text-sm font-semibold" style={{ color: "#1e293b" }}>Default Proctoring Level</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {PROCTORING_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => setStep2(prev => ({ ...prev, proctoring: opt.value }))}
                          className="p-3 rounded-xl text-left transition-all"
                          style={{
                            background: step2.proctoring === opt.value ? "linear-gradient(135deg, rgba(200,151,42,0.15), rgba(219,169,59,0.1))" : "#f8fafc",
                            border: `1.5px solid ${step2.proctoring === opt.value ? "#c8972a" : "#e2e8f0"}`,
                          }}
                        >
                          <div className="text-xs font-bold mb-1" style={{ color: step2.proctoring === opt.value ? "#92700f" : "#1e293b" }}>
                            {opt.label}
                          </div>
                          <div className="text-xs" style={{ color: "#94a3b8" }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#1e293b" }}>Randomize Questions</div>
                        <div className="text-xs" style={{ color: "#94a3b8" }}>Shuffle question order per attempt</div>
                      </div>
                      <button
                        onClick={() => setStep2(prev => ({ ...prev, randomizeQuestions: !prev.randomizeQuestions }))}
                        className="w-12 h-6 rounded-full transition-all relative"
                        style={{ background: step2.randomizeQuestions ? "#c8972a" : "#e2e8f0" }}
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                          style={{ left: step2.randomizeQuestions ? "26px" : "2px" }}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: "#1e293b" }}>Allow Retakes</div>
                        <div className="text-xs" style={{ color: "#94a3b8" }}>
                          {step2.allowRetakes ? `Up to ${step2.maxRetakes} attempts` : "One attempt only"}
                        </div>
                      </div>
                      <button
                        onClick={() => setStep2(prev => ({ ...prev, allowRetakes: !prev.allowRetakes }))}
                        className="w-12 h-6 rounded-full transition-all relative"
                        style={{ background: step2.allowRetakes ? "#c8972a" : "#e2e8f0" }}
                      >
                        <div
                          className="w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm"
                          style={{ left: step2.allowRetakes ? "26px" : "2px" }}
                        />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>
                      Certificate Validity: <span style={{ color: "#c8972a" }}>{step2.certValidity} months</span>
                    </label>
                    <input
                      type="range" min={6} max={60} step={6}
                      value={step2.certValidity}
                      onChange={e => setStep2(prev => ({ ...prev, certValidity: parseInt(e.target.value) }))}
                      className="w-full accent-yellow-500"
                    />
                    <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
                      <span>6 mo</span><span>2 yr</span><span>5 yr</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: Features & Team ─────────────────────────────────── */}
            {currentStep === 3 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #10b981, #3b82f6)" }}>
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
                    Features & Team
                  </h2>
                </div>
                <p className="mb-6 text-sm" style={{ color: "#64748b" }}>
                  Select the features you need and invite your team members.
                </p>

                {/* Features Grid */}
                <div className="mb-8">
                  <h3 className="text-sm font-bold mb-4" style={{ color: "#1e293b" }}>Platform Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {FEATURES.map(feature => {
                      const Icon = feature.icon;
                      const enabled = step3Features[feature.id as keyof Step3Features];
                      return (
                        <button
                          key={feature.id}
                          onClick={() => setStep3Features(prev => ({ ...prev, [feature.id]: !enabled }))}
                          className="p-4 rounded-xl text-left transition-all flex items-start gap-3"
                          style={{
                            background: enabled ? `linear-gradient(135deg, ${feature.color}15, ${feature.color}08)` : "#f8fafc",
                            border: `1.5px solid ${enabled ? feature.color : "#e2e8f0"}`,
                          }}
                        >
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: enabled ? feature.color : "#e2e8f0" }}
                          >
                            <Icon className="w-4 h-4" style={{ color: enabled ? "#ffffff" : "#94a3b8" }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold" style={{ color: "#1e293b" }}>{feature.name}</span>
                              {feature.recommended && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fef3c7", color: "#92700f" }}>
                                  Recommended
                                </span>
                              )}
                            </div>
                            <div className="text-xs mt-0.5" style={{ color: "#64748b" }}>{feature.desc}</div>
                            <div className="text-xs font-bold mt-1" style={{ color: feature.color }}>+${feature.price}/mo</div>
                          </div>
                          <div
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                            style={{
                              borderColor: enabled ? feature.color : "#e2e8f0",
                              background: enabled ? feature.color : "transparent",
                            }}
                          >
                            {enabled && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Team Invites */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold" style={{ color: "#1e293b" }}>Invite Team Members</h3>
                    <button
                      onClick={addInvite}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#ffffff" }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Member
                    </button>
                  </div>
                  <div className="space-y-3">
                    {teamInvites.map((invite, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <input
                          type="email"
                          value={invite.email}
                          onChange={e => updateInvite(i, "email", e.target.value)}
                          placeholder="email@company.com"
                          className="flex-1 px-3 py-2.5 rounded-xl border text-sm outline-none"
                          style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                        />
                        <input
                          type="text"
                          value={invite.name}
                          onChange={e => updateInvite(i, "name", e.target.value)}
                          placeholder="Full name"
                          className="w-36 px-3 py-2.5 rounded-xl border text-sm outline-none"
                          style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                        />
                        <select
                          value={invite.role}
                          onChange={e => updateInvite(i, "role", e.target.value)}
                          className="w-40 px-3 py-2.5 rounded-xl border text-sm outline-none"
                          style={{ border: "1.5px solid #e2e8f0", color: "#1e293b", background: "#f8fafc" }}
                        >
                          {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                        {teamInvites.length > 1 && (
                          <button
                            onClick={() => removeInvite(i)}
                            className="p-2 rounded-lg transition-all"
                            style={{ color: "#ef4444" }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
                    Team members will receive an invitation email. You can also invite more people later from your dashboard.
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 4: Pricing Review ──────────────────────────────────── */}
            {currentStep === 4 && (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)" }}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-extrabold" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
                    Pricing Review
                  </h2>
                </div>
                <p className="mb-8 text-sm" style={{ color: "#64748b" }}>
                  Review your estimated monthly cost based on selected features.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left: Breakdown */}
                  <div>
                    <h3 className="text-sm font-bold mb-4" style={{ color: "#1e293b" }}>Cost Breakdown</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                        <span className="text-sm" style={{ color: "#64748b" }}>Base Platform</span>
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>${BASE_PRICE}/mo</span>
                      </div>
                      {FEATURES.filter(f => step3Features[f.id as keyof Step3Features]).map(f => (
                        <div key={f.id} className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                          <span className="text-sm" style={{ color: "#64748b" }}>{f.name}</span>
                          <span className="text-sm font-bold" style={{ color: "#1e293b" }}>+${f.price}/mo</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                        <div>
                          <span className="text-sm" style={{ color: "#64748b" }}>Candidates ({candidateCount} × $0.50)</span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: "#1e293b" }}>${candidateCost.toFixed(2)}/mo</span>
                      </div>
                    </div>

                    {/* Candidate slider */}
                    <div className="mt-6">
                      <label className="block mb-2 text-sm font-semibold" style={{ color: "#1e293b" }}>
                        Expected Candidates: <span style={{ color: "#c8972a" }}>{candidateCount}</span>
                      </label>
                      <input
                        type="range" min={10} max={10000} step={10}
                        value={candidateCount}
                        onChange={e => setCandidateCount(parseInt(e.target.value))}
                        className="w-full accent-yellow-500"
                      />
                      <div className="flex justify-between text-xs mt-1" style={{ color: "#94a3b8" }}>
                        <span>10</span><span>5,000</span><span>10,000</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Total + Summary */}
                  <div>
                    <div
                      className="p-6 rounded-2xl mb-4"
                      style={{ background: "linear-gradient(135deg, #03071e, #0a1628)", border: "1px solid rgba(200,151,42,0.3)" }}
                    >
                      <div className="text-xs font-bold mb-1" style={{ color: "rgba(200,151,42,0.8)" }}>ESTIMATED MONTHLY COST</div>
                      <div className="text-5xl font-black mb-1" style={{ color: "#c8972a", letterSpacing: "-0.03em" }}>
                        ${monthlyTotal.toFixed(2)}
                      </div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>per month, billed monthly</div>
                    </div>

                    <div
                      className="p-4 rounded-xl mb-4"
                      style={{ background: "linear-gradient(135deg, rgba(200,151,42,0.1), rgba(219,169,59,0.05))", border: "1px solid rgba(200,151,42,0.2)" }}
                    >
                      <p className="text-xs font-bold mb-3" style={{ color: "#1e293b" }}>Selected Features:</p>
                      <div className="flex flex-wrap gap-2">
                        {FEATURES.filter(f => step3Features[f.id as keyof Step3Features]).map(f => (
                          <span key={f.id} className="px-2 py-1 rounded-lg text-xs font-semibold" style={{ background: "#ffffff", color: "#1e293b" }}>
                            {f.name}
                          </span>
                        ))}
                        {!Object.values(step3Features).some(Boolean) && (
                          <span className="text-xs" style={{ color: "#94a3b8" }}>No features selected</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl" style={{ background: "#dbeafe", border: "1px solid #93c5fd" }}>
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#1d4ed8" }} />
                        <p className="text-xs" style={{ color: "#1e40af" }}>
                          14-day free trial included. Cancel anytime. No long-term commitments required.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: Launch ──────────────────────────────────────────── */}
            {currentStep === 5 && (
              <div className="text-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: "linear-gradient(135deg, #10b981, #34d399)", boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}>
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-extrabold mb-3" style={{ color: "#1e293b", letterSpacing: "-0.02em" }}>
                  You're All Set! 🎉
                </h2>
                <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "#64748b" }}>
                  Your organization <strong style={{ color: "#1e293b" }}>{step1.name || "your org"}</strong> is configured and ready to launch.
                  Review your setup summary below.
                </p>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
                  <div className="p-4 rounded-xl" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Building2 className="w-4 h-4" style={{ color: "#c8972a" }} />
                      <span className="text-xs font-bold" style={{ color: "#1e293b" }}>Organization</span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "#1e293b" }}>{step1.name || "—"}</div>
                    <div className="text-xs mt-1" style={{ color: "#64748b" }}>{step1.industry || "—"} · {step1.size || "—"}</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-4 h-4" style={{ color: "#3b82f6" }} />
                      <span className="text-xs font-bold" style={{ color: "#1e293b" }}>Exam Config</span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "#1e293b" }}>{step2.passingScore}% pass score</div>
                    <div className="text-xs mt-1" style={{ color: "#64748b" }}>{step2.timeLimit} min · {step2.proctoring} proctoring</div>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background: "#f8fafc", border: "1.5px solid #e2e8f0" }}>
                    <div className="flex items-center gap-2 mb-3">
                      <CreditCard className="w-4 h-4" style={{ color: "#10b981" }} />
                      <span className="text-xs font-bold" style={{ color: "#1e293b" }}>Monthly Plan</span>
                    </div>
                    <div className="text-sm font-bold" style={{ color: "#c8972a" }}>${monthlyTotal.toFixed(2)}/mo</div>
                    <div className="text-xs mt-1" style={{ color: "#64748b" }}>
                      {Object.values(step3Features).filter(Boolean).length} features · {candidateCount} candidates
                    </div>
                  </div>
                </div>

                {/* Payment notice */}
                <div
                  className="p-5 rounded-2xl mb-8"
                  style={{ background: "#f8fafc", border: "2px dashed #e2e8f0" }}
                >
                  <CreditCard className="w-10 h-10 mx-auto mb-3" style={{ color: "#cbd5e1" }} />
                  <p className="text-sm font-semibold mb-1" style={{ color: "#1e293b" }}>Payment Setup (Optional)</p>
                  <p className="text-xs mb-4" style={{ color: "#64748b" }}>
                    Your 14-day free trial starts now. Add a payment method later from your billing settings.
                  </p>
                  <button
                    className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all"
                    style={{ background: "#635bff", color: "#ffffff" }}
                    onClick={() => toast.info("Your 14-day free trial has started! You can configure Stripe payments in Settings > Payments after onboarding.")}
                  >
                    Connect Stripe (Optional)
                  </button>
                </div>

                {/* Launch button */}
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all"
                  style={{
                    background: isLoading ? "#e2e8f0" : "linear-gradient(135deg, #10b981, #34d399)",
                    color: isLoading ? "#94a3b8" : "#ffffff",
                    boxShadow: isLoading ? "none" : "0 8px 24px rgba(16,185,129,0.4)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Setting up your workspace...
                    </>
                  ) : (
                    <>
                      <Rocket className="w-5 h-5" />
                      Launch My Organization
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ── Navigation Buttons ─────────────────────────────────────── */}
            {currentStep < 5 && (
              <div className="flex gap-3 mt-10 pt-6" style={{ borderTop: "1px solid #e2e8f0" }}>
                {currentStep > 1 && (
                  <button
                    onClick={() => goToStep(currentStep - 1)}
                    className="px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
                    style={{ background: "#f1f5f9", color: "#64748b" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                    Previous
                  </button>
                )}
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: isLoading ? "#e2e8f0" : "linear-gradient(135deg, #c8972a, #dba93b)",
                    color: isLoading ? "#94a3b8" : "#ffffff",
                    boxShadow: isLoading ? "none" : "0 4px 16px rgba(200,151,42,0.4)",
                  }}
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {currentStep === 4 ? "Review & Launch" : "Next Step"}
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
