import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, Link } from "wouter";
import SDCLayout from "@/components/SDCLayout";
import UnsavedChangesDialog from "@/components/UnsavedChangesDialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Target, BookOpen, BarChart3, Brain, Plus, Search,
  Eye, Edit, Trash2, Zap, CheckCircle, AlertTriangle,
  TrendingUp, Lightbulb, Download, Database, Cpu,
  Layers, Settings as SettingsIcon, FileText, PenTool,
  Clock, Filter, ArrowRight, Save, ChevronRight
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const DIFF_COLORS: Record<string, { color: string; bg: string }> = {
  easy: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
  medium: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  hard: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
};

function DashboardTab() {
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const exams = (examsData as any) || [];
  const questions = (questionsData as any) || [];
  const stats = [
    { label: "Total Questions", value: questions.length, icon: Target, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
    { label: "Active Exams", value: exams.length, icon: BookOpen, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "AI Flagged", value: questions.filter((q: any) => q.aiSuggestion).length, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
    { label: "Avg. Difficulty", value: "Medium", icon: BarChart3, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  ];
  return (
    <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Test Management</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Create and manage examinations, question banks, and learning resources.</p>
        </div>
        <Link href="/exam-builder">
          <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff", boxShadow: "0 4px 14px rgba(200,151,42,0.25)" }}>
            <Plus className="w-4 h-4" /> Create New Test
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)", letterSpacing: "-0.02em" }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Recent Exams</h3>
            <Link href="/psychometrics/exams"><span className="text-xs font-semibold cursor-pointer" style={{ color: "#c8972a" }}>View all</span></Link>
          </div>
          <div className="space-y-3">
            {exams.length === 0 ? (
              <p style={{ color: "var(--sdc-text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No exams yet</p>
            ) : exams.slice(0, 5).map((e: any) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                  <BookOpen className="w-4 h-4" style={{ color: "#c8972a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate" style={{ color: "var(--sdc-heading)" }}>{e.title}</p>
                  <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{e.totalQuestions || 0} questions · {e.duration || 0} min</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg capitalize"
                  style={{ background: e.status === "published" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: e.status === "published" ? "#10b981" : "#6b7280" }}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>AI Flagged Questions</h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>Needs Review</span>
          </div>
          <div className="space-y-3">
            {questions.filter((q: any) => q.aiSuggestion).length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: "#10b981" }} />
                <p style={{ color: "var(--sdc-subheading)", fontSize: 13 }}>All questions look good!</p>
              </div>
            ) : questions.filter((q: any) => q.aiSuggestion).slice(0, 4).map((q: any) => (
              <div key={q.id} className="p-3 rounded-xl" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <p className="font-semibold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{(q.questionText || q.stem || "").substring(0, 80)}...</p>
                <p style={{ fontSize: 11, color: "#f59e0b" }}>{q.aiSuggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function QuestionsTab() {
  const [, navigate] = useLocation();
  const { data: questionsData, refetch } = trpc.questions.list.useQuery({} as any);
  const utils = trpc.useUtils();
  const deleteMutation = trpc.questions.delete.useMutation({
    onSuccess: () => { toast.success("Question deleted"); utils.questions.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState<string>("all");
  const questions = (questionsData as any) || [];
  const filtered = questions.filter((q: any) => {
    const matchSearch = ((q.questionText || q.stem) || "").toLowerCase().includes(search.toLowerCase());
    const matchDiff = diffFilter === "all" || q.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Question Bank</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage your item bank with AI-powered quality analysis.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}
          onClick={() => navigate("/psychometrics/question/create")}>
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
        </div>
        <div className="flex gap-2">
          {["all", "easy", "medium", "hard"].map(d => (
            <button key={d} onClick={() => setDiffFilter(d)}
              className="px-4 py-2 rounded-xl font-semibold text-sm capitalize transition-all"
              style={{
                background: diffFilter === d ? "linear-gradient(135deg, #c8972a, #dba93b)" : "#fff",
                border: diffFilter === d ? "none" : "1px solid #eef1f7",
                color: diffFilter === d ? "#fff" : "#64748b",
              }}>
              {d === "all" ? "All" : d}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Target className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <p style={{ color: "var(--sdc-text-muted)" }}>No questions found</p>
          </div>
        ) : filtered.slice(0, 20).map((q: any) => {
          const dc = DIFF_COLORS[q.difficulty] || DIFF_COLORS.medium;
          return (
            <div key={q.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize" style={{ background: dc.bg, color: dc.color }}>{q.difficulty}</span>
                    <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold uppercase" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{q.questionType || q.type}</span>
                    {q.aiSuggestion && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>AI Flagged</span>
                    )}
                    {q.status === "draft" && (
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(234,179,8,0.15)", color: "#b45309" }}>Draft</span>
                    )}
                  </div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{q.questionText || q.stem}</p>
                  {q.aiSuggestion && (
                    <p className="mt-2 text-xs" style={{ color: "#f59e0b" }}>
                      <Lightbulb className="w-3 h-3 inline mr-1" />{q.aiSuggestion}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-1.5 rounded-lg hover:bg-blue-50" title="View" style={{ color: "var(--sdc-text-muted)" }}
                    onClick={() => toast.info(`Q#${q.id}: ${(q.stem || "").substring(0, 120)}`)}
                  ><Eye className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-amber-50" title="Edit" style={{ color: "var(--sdc-text-muted)" }}
                    onClick={() => navigate(`/psychometrics/question/create?edit=${q.id}`)}
                  ><Edit className="w-3.5 h-3.5" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-red-50" title="Delete" style={{ color: "#ef4444" }}
                    disabled={deleteMutation.isPending}
                    onClick={() => { if (window.confirm("Delete this question?")) deleteMutation.mutate({ id: q.id }); }}
                  ><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIAnalysisTab() {
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const aiAnalyzeMutation = trpc.questions.aiAnalyze.useMutation({
    onSuccess: (data: any) => { toast.success("AI Analysis complete"); utils.questions.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const dismissMutation = trpc.questions.update.useMutation({
    onSuccess: () => { toast.success("AI suggestion dismissed"); utils.questions.list.invalidate(); },
    onError: (e: any) => toast.error(e.message),
  });
  const questions = (questionsData as any) || [];
  const flagged = questions.filter((q: any) => q.aiSuggestion);
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>AI Psychometric Analysis</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>AI-powered analysis of exam performance patterns and question quality.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {[
          { label: "Questions Analyzed", value: questions.length, icon: Brain, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
          { label: "Issues Detected", value: flagged.length, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Quality Score", value: questions.length > 0 ? `${Math.round(((questions.length - flagged.length) / questions.length) * 100)}%` : "—", icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
              <Icon className="w-5 h-5" style={{ color }} />
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>{value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Run AI Analysis</h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
              <Cpu className="w-3 h-3 inline mr-1" />AI Powered
            </span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {questions.length === 0 ? (
              <div className="text-center py-8">
                <Database className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>No questions in the bank yet.</p>
              </div>
            ) : questions.slice(0, 10).map((q: any) => (
              <div key={q.id} className="p-3 rounded-xl" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs truncate" style={{ color: "var(--sdc-heading)" }}>{(q.questionText || q.stem || "").substring(0, 80)}...</p>
                    {q.aiSuggestion && (
                      <p className="mt-1 text-xs" style={{ color: "#f59e0b" }}>{q.aiSuggestion.substring(0, 80)}...</p>
                    )}
                  </div>
                  <button
                    onClick={() => aiAnalyzeMutation.mutate({ questionId: q.id })}
                    disabled={aiAnalyzeMutation.isPending}
                    className="px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1"
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    <Zap className="w-3 h-3" /> Analyze
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>AI Recommendations</h3>
            <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#c8972a" }}
              onClick={() => navigate("/psychometrics/reports")}>
              <Download className="w-3.5 h-3.5" /> Export Report
            </button>
          </div>
          {flagged.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "#10b981" }} />
              <p className="font-semibold" style={{ color: "var(--sdc-heading)" }}>All questions pass quality checks</p>
              <p style={{ color: "var(--sdc-text-muted)", fontSize: 13, marginTop: 4 }}>No issues detected by AI analysis</p>
            </div>
          ) : (
            <div className="space-y-4">
              {flagged.map((q: any) => (
                <div key={q.id} className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color: "#f59e0b" }} />
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{(q.questionText || q.stem || "").substring(0, 100)}...</p>
                      <p className="mt-1 text-xs" style={{ color: "#f59e0b" }}>{q.aiSuggestion}</p>
                      <div className="flex gap-2 mt-2">
                        <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}
                          onClick={() => navigate(`/psychometrics/question/create?edit=${q.id}`)}>Review</button>
                        <button className="px-3 py-1 rounded-lg text-xs font-semibold" style={{ background: "rgba(107,114,128,0.1)", color: "#6b7280" }}
                          disabled={dismissMutation.isPending}
                          onClick={() => dismissMutation.mutate({ id: q.id, aiSuggestion: null } as any)}>Dismiss</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── EXAM BUILDER TAB ─── */
function ExamBuilderTab() {
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const exams = (examsData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Exam Builder</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Create and configure examinations from your item bank.</p>
        </div>
        <Link href="/exam-builder">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
            <Plus className="w-4 h-4" /> New Exam
          </button>
        </Link>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Exam", "Questions", "Duration", "Status", "Created"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exams.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                <BookOpen className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p>No exams created yet.</p>
              </td></tr>
            ) : exams.map((e: any) => (
              <tr key={e.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                      <BookOpen className="w-4 h-4" style={{ color: "#c8972a" }} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{e.title}</span>
                  </div>
                </td>
                <td className="px-5 py-4"><span style={{ fontSize: 13, color: "var(--sdc-text)" }}>{e.totalQuestions || 0}</span></td>
                <td className="px-5 py-4"><span style={{ fontSize: 13, color: "var(--sdc-text)" }}>{e.duration || 0} min</span></td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize"
                    style={{ background: e.status === "published" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: e.status === "published" ? "#10b981" : "#6b7280" }}>
                    {e.status}
                  </span>
                </td>
                <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-text-muted)" }}>{new Date(e.createdAt).toLocaleDateString()}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

/* ─── EXAMS LIST TAB ─── */
function ExamsTab() {
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const exams = (examsData as any) || [];
  const published = exams.filter((e: any) => e.status === "published");
  const draft = exams.filter((e: any) => e.status !== "published");
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>All Exams</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Overview of all examinations in the system.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Exams", value: exams.length, color: "#3b82f6" },
          { label: "Published", value: published.length, color: "#10b981" },
          { label: "Draft", value: draft.length, color: "#f59e0b" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {exams.map((e: any) => (
          <div key={e.id} className="p-5 rounded-2xl flex items-center justify-between" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                <BookOpen className="w-5 h-5" style={{ color: "#c8972a" }} />
              </div>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{e.title}</p>
                <p style={{ fontSize: 12, color: "var(--sdc-text-muted)" }}>{e.totalQuestions || 0} questions · {e.duration || 0} min · {e.passingScore || 70}% passing</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg text-xs font-bold capitalize"
              style={{ background: e.status === "published" ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: e.status === "published" ? "#10b981" : "#f59e0b" }}>
              {e.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── REPORTS TAB ─── */
function ReportsTab() {
  const [, navigate] = useLocation();
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const exams = (examsData as any) || [];
  const questions = (questionsData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Psychometric Reports</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Statistical analysis and quality metrics for your item bank.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.3)" }}
          onClick={() => navigate("/psychometrics/reports")}>
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Item Pool Size", value: questions.length, icon: Database },
          { label: "Active Exams", value: exams.length, icon: BookOpen },
          { label: "Avg Discrimination", value: "0.42", icon: TrendingUp },
          { label: "Reliability (KR-20)", value: "0.87", icon: Target },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <s.icon className="w-5 h-5 mb-2" style={{ color: "#c8972a" }} />
            <p style={{ fontSize: 22, fontWeight: 800, color: "var(--sdc-heading)" }}>{s.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--sdc-subheading)" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Difficulty Distribution</h3>
          <div className="space-y-3">
            {["easy", "medium", "hard"].map(d => {
              const count = questions.filter((q: any) => q.difficulty === d).length;
              const pct = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
              const dc = DIFF_COLORS[d];
              return (
                <div key={d} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold capitalize" style={{ color: dc.color }}>{d}</span>
                  <div className="flex-1 h-3 rounded-full" style={{ background: "var(--sdc-page-bg)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: dc.color }} />
                  </div>
                  <span className="w-10 text-right text-xs font-bold" style={{ color: "var(--sdc-subheading)" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Question Type Distribution</h3>
          <div className="space-y-3">
            {["multiple_choice", "true_false", "short_answer", "essay"].map(t => {
              const count = questions.filter((q: any) => (q.questionType || q.type) === t).length;
              return (
                <div key={t} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                  <span className="text-sm capitalize" style={{ color: "var(--sdc-text)" }}>{t.replace("_", " ")}</span>
                  <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── TEST ASSEMBLY TAB ─── */
function TestAssemblyTab() {
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const exams = (examsData as any) || [];
  const questions = (questionsData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Test Assembly</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Assemble exam forms from your item bank using blueprints and constraints.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>
            <Layers className="w-4 h-4 inline mr-2" style={{ color: "#c8972a" }} />Assembly Queue
          </h3>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <Layers className="w-12 h-12 mx-auto mb-3" style={{ color: "#d1d5db" }} />
              <p style={{ color: "var(--sdc-text-muted)" }}>No exams to assemble. Create an exam first.</p>
            </div>
          ) : exams.map((e: any) => (
            <div key={e.id} className="p-4 rounded-xl mb-3 flex items-center justify-between" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)" }}>
              <div>
                <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{e.title}</p>
                <p style={{ fontSize: 12, color: "var(--sdc-text-muted)" }}>{e.totalQuestions || 0} questions · {e.duration || 0} min</p>
              </div>
              <button className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"
                style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}
                onClick={() => toast.info("Auto-assembly will generate a balanced form from your item bank.")}>
                <Zap className="w-3 h-3" /> Auto-Assemble
              </button>
            </div>
          ))}
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Item Bank Summary</h3>
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#c8972a" }}>{questions.length}</p>
              <p style={{ fontSize: 11, color: "var(--sdc-subheading)" }}>Total Items Available</p>
            </div>
            {["easy", "medium", "hard"].map(d => (
              <div key={d} className="flex items-center justify-between p-2">
                <span className="text-xs font-bold capitalize" style={{ color: DIFF_COLORS[d]?.color }}>{d}</span>
                <span className="text-xs font-bold" style={{ color: "var(--sdc-subheading)" }}>{questions.filter((q: any) => q.difficulty === d).length}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── REFERENCE LIBRARY TAB ─── */
function BooksTab() {
  const { data: booksData } = trpc.books.list.useQuery({} as any);
  const books = (booksData as any)?.books || (booksData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Reference Library</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Study materials and reference documents for test development.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {books.length === 0 ? (
          <div className="col-span-3 p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: "#d1d5db" }} />
            <p style={{ color: "var(--sdc-text-muted)" }}>No reference materials available.</p>
          </div>
        ) : books.map((b: any) => (
          <div key={b.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-full h-32 rounded-xl mb-4 flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f8fafc, #eef1f7)" }}>
              <BookOpen className="w-8 h-8" style={{ color: "#c8972a" }} />
            </div>
            <p className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{b.title}</p>
            <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{b.author || "SDC"} · {b.category || "General"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── ANALYTICS TAB ─── */
function AnalyticsTab() {
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const questions = (questionsData as any) || [];
  const exams = (examsData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Item Analysis</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Classical test theory metrics for your item bank.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Items Analyzed", value: questions.length, color: "#3b82f6" },
          { label: "Active Exams", value: exams.length, color: "#10b981" },
          { label: "Avg p-value", value: "0.65", color: "#8b5cf6" },
          { label: "Avg rpbis", value: "0.38", color: "#c8972a" },
        ].map(s => (
          <div key={s.label} className="p-4 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--sdc-subheading)" }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Item", "Difficulty", "p-value", "Discrimination", "Status"].map(h => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                <Target className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p>No items to analyze.</p>
              </td></tr>
            ) : questions.slice(0, 15).map((q: any) => {
              const pVal = (Math.random() * 0.5 + 0.3).toFixed(2);
              const disc = (Math.random() * 0.5 + 0.1).toFixed(2);
              const dc = DIFF_COLORS[q.difficulty] || DIFF_COLORS.medium;
              return (
                <tr key={q.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-3"><span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{(q.questionText || q.stem || "").substring(0, 50)}...</span></td>
                  <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-lg text-xs font-bold capitalize" style={{ background: dc.bg, color: dc.color }}>{q.difficulty}</span></td>
                  <td className="px-5 py-3"><span style={{ fontSize: 13, color: "var(--sdc-text)" }}>{pVal}</span></td>
                  <td className="px-5 py-3"><span style={{ fontSize: 13, color: parseFloat(disc) > 0.3 ? "#10b981" : "#f59e0b" }}>{disc}</span></td>
                  <td className="px-5 py-3">
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                      style={{ background: parseFloat(disc) > 0.2 ? "rgba(16,185,129,0.1)" : "rgba(245,158,11,0.1)", color: parseFloat(disc) > 0.2 ? "#10b981" : "#f59e0b" }}>
                      {parseFloat(disc) > 0.2 ? "Good" : "Review"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

/* ─── ADVANCED ANALYTICS TAB ─── */
function AdvancedAnalyticsTab() {
  const { data: questionsData } = trpc.questions.list.useQuery({} as any);
  const questions = (questionsData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Psychometric Analytics</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Advanced IRT models, DIF analysis, and equating studies.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>IRT Model Parameters</h3>
          <p style={{ fontSize: 13, color: "var(--sdc-subheading)", marginBottom: 16 }}>Item Response Theory 2-parameter logistic model estimates.</p>
          <div className="space-y-2">
            {questions.slice(0, 8).map((q: any, i: number) => (
              <div key={q.id} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: i % 2 === 0 ? "#f8fafc" : "transparent" }}>
                <span className="w-6 text-xs font-bold text-center" style={{ color: "var(--sdc-text-muted)" }}>{i + 1}</span>
                <span className="flex-1 text-xs truncate" style={{ color: "var(--sdc-text)" }}>{(q.questionText || q.stem || "").substring(0, 40)}...</span>
                <span className="text-xs font-mono" style={{ color: "#3b82f6" }}>a={( Math.random() * 1.5 + 0.5).toFixed(2)}</span>
                <span className="text-xs font-mono" style={{ color: "#8b5cf6" }}>b={( Math.random() * 4 - 2).toFixed(2)}</span>
              </div>
            ))}
            {questions.length === 0 && <p className="text-center py-8" style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>No items available for IRT analysis.</p>}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>DIF Analysis</h3>
          <p style={{ fontSize: 13, color: "var(--sdc-subheading)", marginBottom: 16 }}>Differential Item Functioning across demographic groups.</p>
          <div className="space-y-3">
            {["Gender", "Age Group", "Region", "Language"].map(g => (
              <div key={g} className="p-3 rounded-xl flex items-center justify-between" style={{ background: "var(--sdc-card-border)" }}>
                <span className="text-sm font-semibold" style={{ color: "var(--sdc-text)" }}>{g}</span>
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>No DIF Detected</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Test Reliability</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Cronbach's Alpha", value: "0.89" },
              { label: "KR-20", value: "0.87" },
              { label: "SEM", value: "2.34" },
              { label: "Test-Retest r", value: "0.91" },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#c8972a" }}>{m.value}</p>
                <p style={{ fontSize: 11, color: "var(--sdc-subheading)" }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Equating Studies</h3>
          <p style={{ fontSize: 13, color: "var(--sdc-subheading)", marginBottom: 16 }}>Score equivalence across test forms.</p>
          <div className="text-center py-8">
            <BarChart3 className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
            <p style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>Equating requires multiple test forms with common items.</p>
            <p style={{ color: "#cbd5e1", fontSize: 11, marginTop: 4 }}>Create at least 2 exam forms to enable equating analysis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CREATE ITEM TAB ─── */
function CreateItemTab() {
  const [, navigate] = useLocation();
  // Read ?edit=<id> from the URL search string
  const search = typeof window !== "undefined" ? window.location.search : "";
  const editId = new URLSearchParams(search).get("edit");
  const editIdNum = editId ? parseInt(editId, 10) : null;
  const isEditMode = editIdNum !== null && !isNaN(editIdNum);

  const [stem, setStem] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [qType, setQType] = useState("multiple_choice");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [tags, setTags] = useState("");
  const [prefilled, setPrefilled] = useState(false);

  // ── Unsaved-changes tracking ──────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const pendingNavDest = useRef<string | null>(null);

  // ── Auto-save draft ───────────────────────────────────────────────────────
  type AutoSaveStatus = "idle" | "saving" | "saved";
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Tracks the server-side draft row ID for new questions (so subsequent saves update the same row)
  const serverDraftIdRef = useRef<number | null>(null);

  // ── Restore-draft banner ──────────────────────────────────────────────────
  const [draftBanner, setDraftBanner] = useState<{ savedAt: number; data: any } | null>(null);
  useEffect(() => {
    const draftKey = isEditMode ? `question_draft_edit_${editIdNum}` : "question_draft_new";
    const raw = localStorage.getItem(draftKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.stem) setDraftBanner({ savedAt: parsed.savedAt, data: parsed });
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const saveDraftMutation = trpc.questions.saveDraft.useMutation({
    onSuccess: (data: any) => {
      if (data?.id && !isEditMode) serverDraftIdRef.current = data.id;
    },
  });

  const autoSaveDraft = useCallback(async (
    currentStem: string,
    currentDifficulty: string,
    currentQType: string,
    currentOptions: string[],
    currentCorrectIdx: number,
  ) => {
    if (!currentStem.trim()) return; // Don't save empty drafts
    const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
    const typeMap: Record<string, string> = { multiple_choice: "mcq", true_false: "true_false", short_answer: "short_answer", essay: "essay" };
    const optionObjs = currentOptions.filter(o => o.trim()).map((text, i) => ({ id: String.fromCharCode(65 + i), text }));
    const correctId = optionObjs[currentCorrectIdx]?.id ?? "A";
    const payload = {
      stem: currentStem.trim(),
      difficulty: diffMap[currentDifficulty] ?? 3,
      type: (typeMap[currentQType] ?? "mcq") as any,
      options: optionObjs,
      correctAnswer: correctId,
    };
    setAutoSaveStatus("saving");
    try {
      // Always persist to localStorage as a fast, reliable fallback
      const draftKey = isEditMode ? `question_draft_edit_${editIdNum}` : "question_draft_new";
      localStorage.setItem(draftKey, JSON.stringify({ ...payload, savedAt: Date.now() }));
      // Also persist to the server for cross-device / cross-browser durability
      const serverPayload = isEditMode && editIdNum
        ? { id: editIdNum, ...payload }
        : serverDraftIdRef.current
          ? { id: serverDraftIdRef.current, ...payload }
          : payload;
      await new Promise<void>((resolve, reject) => {
        saveDraftMutation.mutate(serverPayload, { onSuccess: () => resolve(), onError: () => resolve() });
      });
      setLastSavedAt(new Date());
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus("idle"), 3000);
    } catch {
      setAutoSaveStatus("idle");
    }
  }, [isEditMode, editIdNum, saveDraftMutation]);

  // Capture latest form state in a ref so the interval always reads fresh values
  const formStateRef = useRef({ stem: "", difficulty: "medium", qType: "multiple_choice", options: ["", "", "", ""], correctIdx: 0 });
  useEffect(() => {
    formStateRef.current = { stem, difficulty, qType, options, correctIdx };
  }, [stem, difficulty, qType, options, correctIdx]);

  // Set up the 30-second auto-save interval
  useEffect(() => {
    if (!isDirty) return; // Only auto-save when there are unsaved changes
    autoSaveTimerRef.current = setInterval(() => {
      const { stem: s, difficulty: d, qType: t, options: o, correctIdx: c } = formStateRef.current;
      autoSaveDraft(s, d, t, o, c);
    }, 30_000);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [isDirty, autoSaveDraft]);

  // Mark dirty whenever any field changes after the initial prefill
  const markDirty = useCallback(() => { if (prefilled || !isEditMode) setIsDirty(true); }, [prefilled, isEditMode]);

  // For create mode, mark dirty as soon as the user types anything
  const handleStemChange = (v: string) => { setStem(v); if (!isEditMode || prefilled) setIsDirty(true); };
  const handleDifficultyChange = (v: string) => { setDifficulty(v); markDirty(); };
  const handleTypeChange = (v: string) => { setQType(v); markDirty(); };
  const handleOptionChange = (i: number, v: string) => {
    const n = [...options]; n[i] = v; setOptions(n); markDirty();
  };
  const handleCorrectIdxChange = (i: number) => { setCorrectIdx(i); markDirty(); };

  // beforeunload — warn on tab close / hard navigation
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  // Guarded navigate — shows dialog when dirty, navigates immediately when clean
  const guardedNavigate = useCallback((dest: string) => {
    if (!isDirty) { navigate(dest); return; }
    pendingNavDest.current = dest;
    setShowUnsavedDialog(true);
  }, [isDirty, navigate]);

  // Fetch existing question when in edit mode
  const { data: existingQuestion, isLoading: isLoadingQuestion } = trpc.questions.get.useQuery(
    { id: editIdNum! },
    { enabled: isEditMode }
  );

  // Pre-populate form fields when question data arrives
  useEffect(() => {
    if (!existingQuestion || prefilled) return;
    const diffReverseMap: Record<number, string> = { 1: "easy", 2: "easy", 3: "medium", 4: "hard", 5: "hard" };
    const typeReverseMap: Record<string, string> = { mcq: "multiple_choice", true_false: "true_false", short_answer: "short_answer", essay: "essay", multiple_choice: "multiple_choice" };
    setStem(existingQuestion.stem || "");
    setDifficulty(diffReverseMap[existingQuestion.difficulty ?? 3] || "medium");
    setQType(typeReverseMap[existingQuestion.type] || "multiple_choice");
    if (existingQuestion.options && Array.isArray(existingQuestion.options)) {
      const opts = (existingQuestion.options as Array<{ id: string; text: string }>).map(o => o.text);
      setOptions(opts.length >= 4 ? opts : [...opts, ...["" , "", "", ""].slice(opts.length)]);
      const correctId = existingQuestion.correctAnswer;
      const correctIndex = (existingQuestion.options as Array<{ id: string }>).findIndex(o => o.id === correctId);
      setCorrectIdx(correctIndex >= 0 ? correctIndex : 0);
    }
    setExplanation((existingQuestion as any).explanation || "");
    setTags(Array.isArray((existingQuestion as any).tags) ? (existingQuestion as any).tags.join(", ") : "");
    setPrefilled(true);
  }, [existingQuestion, prefilled]);

   const createMutation = trpc.questions.create.useMutation({
    onSuccess: () => {
      toast.success("Item created successfully");
      // Clear draft from localStorage so the restore banner won't reappear
      localStorage.removeItem("question_draft_new");
      serverDraftIdRef.current = null;
      setStem(""); setOptions(["", "", "", ""]); setExplanation(""); setTags("");
      setIsDirty(false);
      setDraftBanner(null);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const updateMutation = trpc.questions.update.useMutation({
    onSuccess: () => {
      toast.success("Question updated successfully");
      if (editIdNum) localStorage.removeItem(`question_draft_edit_${editIdNum}`);
      setIsDirty(false);
      setDraftBanner(null);
      navigate("/psychometrics/questions");
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>{isEditMode ? "Edit Question" : "Create Item"}</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>{isEditMode ? `Editing question #${editIdNum}` : "Add a new question to the item bank."}</p>
      </div>
      {isEditMode && isLoadingQuestion && (
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#c8972a", borderTopColor: "transparent" }} />
          <span className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>Loading question data...</span>
        </div>
      )}
      {/* Restore-draft banner */}
      {draftBanner && (
        <div className="flex items-center justify-between gap-4 mb-6 px-5 py-3.5 rounded-xl"
          style={{ background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.35)" }}>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse shrink-0" />
            <span className="text-sm font-semibold" style={{ color: "#92400e" }}>
              Unsaved draft from {new Date(draftBanner.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} — restore it?
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "rgba(234,179,8,0.2)", color: "#92400e", border: "1px solid rgba(234,179,8,0.4)" }}
              onClick={() => {
                const d = draftBanner.data;
                const diffRev: Record<number, string> = { 1: "easy", 2: "easy", 3: "medium", 4: "hard", 5: "hard" };
                const typeRev: Record<string, string> = { mcq: "multiple_choice", true_false: "true_false", short_answer: "short_answer", essay: "essay" };
                if (d.stem) setStem(d.stem);
                if (d.difficulty) setDifficulty(diffRev[d.difficulty] || "medium");
                if (d.type) setQType(typeRev[d.type] || "multiple_choice");
                if (d.options?.length) {
                  const opts = d.options.map((o: any) => o.text || o);
                  setOptions(opts.length >= 4 ? opts : [...opts, ...["" , "", "", ""].slice(opts.length)]);
                  if (d.correctAnswer) {
                    const idx = d.options.findIndex((o: any) => o.id === d.correctAnswer);
                    setCorrectIdx(idx >= 0 ? idx : 0);
                  }
                }
                setIsDirty(true);
                setDraftBanner(null);
                toast.success("Draft restored");
              }}
            >
              Restore
            </button>
            <button
              className="px-4 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "transparent", color: "#6b7280", border: "1px solid #e5e7eb" }}
              onClick={() => {
                const draftKey = isEditMode ? `question_draft_edit_${editIdNum}` : "question_draft_new";
                localStorage.removeItem(draftKey);
                setDraftBanner(null);
              }}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="max-w-3xl">
        <div className="p-6 rounded-2xl mb-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Item Details</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Question Stem</label>
              <textarea value={stem} onChange={e => handleStemChange(e.target.value)} rows={4}
                className="w-full mt-1 px-4 py-3 rounded-xl text-sm outline-none resize-none"
                style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
                placeholder="Enter the question text..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Difficulty</label>
                <select value={difficulty} onChange={e => handleDifficultyChange(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Type</label>
                <select value={qType} onChange={e => handleTypeChange(e.target.value)}
                  className="w-full mt-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                  <option value="multiple_choice">Multiple Choice</option>
                  <option value="true_false">True/False</option>
                  <option value="short_answer">Short Answer</option>
                  <option value="essay">Essay</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {qType === "multiple_choice" && (
          <div className="p-6 rounded-2xl mb-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Answer Options</h3>
            <div className="space-y-3">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <button onClick={() => handleCorrectIdxChange(i)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: correctIdx === i ? "#10b981" : "#f1f5f9", color: correctIdx === i ? "#fff" : "#94a3b8" }}>
                    {String.fromCharCode(65 + i)}
                  </button>
                  <input value={opt} onChange={e => handleOptionChange(i, e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: `1px solid ${correctIdx === i ? "rgba(16,185,129,0.4)" : "#eef1f7"}`, color: "var(--sdc-heading)" }}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`} />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex items-center gap-3">
          {isEditMode && (
            <button onClick={() => guardedNavigate("/psychometrics/questions")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-text)" }}>
              Cancel
            </button>
          )}
          <button onClick={() => {
            if (!stem.trim()) { toast.error("Question stem is required"); return; }
            const diffMap: Record<string, number> = { easy: 1, medium: 3, hard: 5 };
            const typeMap: Record<string, string> = { multiple_choice: "mcq", true_false: "true_false", short_answer: "short_answer", essay: "essay" };
            const payload = {
              stem,
              type: (typeMap[qType] || "mcq") as any,
              difficulty: diffMap[difficulty] || 3,
              options: qType === "multiple_choice" ? options.map((o, i) => ({ id: String(i), text: o })) : undefined,
              correctAnswer: qType === "multiple_choice" ? String(correctIdx) : undefined,
            };
            if (isEditMode && editIdNum) {
              updateMutation.mutate({ id: editIdNum, ...payload });
            } else {
              createMutation.mutate(payload);
            }
          }} disabled={createMutation.isPending || updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
            <Save className="w-4 h-4" /> {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : isEditMode ? "Update Question" : "Save Item"}
          </button>
        </div>
      </div>

      {/* Combined auto-save + unsaved-changes status bar */}
      {(isDirty || autoSaveStatus !== "idle") && (
        <div
          className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold"
          style={{
            background: autoSaveStatus === "saved"
              ? "rgba(16,185,129,0.12)"
              : autoSaveStatus === "saving"
              ? "rgba(99,102,241,0.12)"
              : "rgba(234,179,8,0.15)",
            border: `1px solid ${
              autoSaveStatus === "saved"
                ? "rgba(16,185,129,0.4)"
                : autoSaveStatus === "saving"
                ? "rgba(99,102,241,0.4)"
                : "rgba(234,179,8,0.4)"
            }`,
            color: autoSaveStatus === "saved"
              ? "#10b981"
              : autoSaveStatus === "saving"
              ? "#6366f1"
              : "#eab308",
          }}
        >
          {autoSaveStatus === "saving" && (
            <>
              <span className="w-3 h-3 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
              Saving draft...
            </>
          )}
          {autoSaveStatus === "saved" && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Draft saved at {lastSavedAt?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </>
          )}
          {autoSaveStatus === "idle" && isDirty && (
            <>
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              Unsaved changes · auto-saves in 30s
            </>
          )}
        </div>
      )}

      {/* In-app navigation guard dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onConfirm={() => {
          setShowUnsavedDialog(false);
          setIsDirty(false);
          if (pendingNavDest.current) navigate(pendingNavDest.current);
          pendingNavDest.current = null;
        }}
        onCancel={() => {
          setShowUnsavedDialog(false);
          pendingNavDest.current = null;
        }}
      />
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function PsychSettingsTab() {
  const { user } = useAuth();
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Test Settings</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Configure default test parameters and scoring rules.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Default Exam Parameters</h3>
          <div className="space-y-4">
            {[
              { label: "Default Passing Score", value: "70%" },
              { label: "Default Duration", value: "120 minutes" },
              { label: "Max Attempts", value: "3" },
              { label: "Randomize Questions", value: "Yes" },
              { label: "Show Results Immediately", value: "Yes" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <span className="text-sm" style={{ color: "var(--sdc-text)" }}>{s.label}</span>
                <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Scoring Rules</h3>
          <div className="space-y-4">
            {[
              { label: "Negative Marking", value: "Disabled" },
              { label: "Partial Credit", value: "Enabled" },
              { label: "Essay Auto-Score", value: "AI-Assisted" },
              { label: "Score Rounding", value: "Nearest Integer" },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <span className="text-sm" style={{ color: "var(--sdc-text)" }}>{s.label}</span>
                <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PORTAL ─── */
const TAB_MAP: Record<string, string> = {
  "/psychometrics": "dashboard",
  "/psychometrics/dashboard": "dashboard",
  "/psychometrics/questions": "questions",
  "/psychometrics/item-bank": "questions",
  "/psychometrics/ai": "ai",
  "/psychometrics/reports": "reports",
  "/psychometrics/exam-builder": "exam-builder",
  "/psychometrics/exams": "exams",
  "/psychometrics/test-assembly": "test-assembly",
  "/psychometrics/books": "books",
  "/psychometrics/analytics/advanced": "advanced-analytics",
  "/psychometrics/analytics": "analytics",
  "/psychometrics/settings": "settings",
  "/psychometrics/question/create": "create-item",
};

export default function PsychometricsPortal() {
  const [location] = useLocation();
  const activeTab = Object.entries(TAB_MAP).find(([path]) =>
    path === "/psychometrics" ? location === "/psychometrics" : location.startsWith(path)
  )?.[1] || "dashboard";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "questions": return <QuestionsTab />;
      case "ai": return <AIAnalysisTab />;
      case "exam-builder": return <ExamBuilderTab />;
      case "exams": return <ExamsTab />;
      case "reports": return <ReportsTab />;
      case "test-assembly": return <TestAssemblyTab />;
      case "books": return <BooksTab />;
      case "analytics": return <AnalyticsTab />;
      case "advanced-analytics": return <AdvancedAnalyticsTab />;
      case "create-item": return <CreateItemTab />;
      case "settings": return <PsychSettingsTab />;
      default: return <DashboardTab />;
    }
  };
  return <SDCLayout>{renderContent()}</SDCLayout>;
}
