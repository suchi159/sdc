import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Plus, Search, Clock, BarChart3, Edit, Trash2, Eye, GraduationCap, CheckCircle, AlertCircle, FileText, Database, Settings } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { useParams } from "wouter";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  published: { label: "Published", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  archived: { label: "Archived", color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
};

export default function ExamBuilder() {
  const params = useParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<"exams" | "questions" | "create">("exams");

  useEffect(() => {
    if (params.tab && ["exams", "questions", "create"].includes(params.tab)) {
      setActiveTab(params.tab as any);
    }
  }, [params.tab]);

  const [search, setSearch] = useState("");
  const [qSearch, setQSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [settingsExam, setSettingsExam] = useState<any>(null);

  const { data: examsData, refetch: refetchExams } = trpc.exams.list.useQuery({} as any);
  const { data: questionsData, refetch: refetchQuestions } = trpc.questions.list.useQuery({} as any);

  const createExamMutation = trpc.exams.create.useMutation({
    onSuccess: () => { toast.success("Exam created!"); refetchExams(); setActiveTab("exams"); resetExam(); },
    onError: (e: any) => toast.error(e.message),
  });
  const publishMutation = trpc.exams.publish.useMutation({
    onSuccess: () => { toast.success("Exam published!"); refetchExams(); },
  });
  const createQuestionMutation = trpc.questions.create.useMutation({
    onSuccess: () => { toast.success("Question added!"); refetchQuestions(); resetQ(); },
    onError: (e: any) => toast.error(e.message),
  });
  const aiAnalyzeMutation = trpc.questions.aiAnalyze.useMutation({
    onSuccess: (data: any) => toast.success("AI: " + (data.suggestion || "").substring(0, 80) + "..."),
    onError: (e: any) => toast.error(e.message),
  });

  const { register: regExam, handleSubmit: handleExamSubmit, reset: resetExam } = useForm<any>();
  const { register: regQ, handleSubmit: handleQSubmit, reset: resetQ } = useForm<any>();

  const exams = (examsData as any) || [];
  const questions = (questionsData as any) || [];
  const filteredExams = exams.filter((e: any) => e.title?.toLowerCase().includes(search.toLowerCase()));
  const filteredQuestions = questions.filter((q: any) =>
    (q.stem || q.text || "").toLowerCase().includes(qSearch.toLowerCase())
  );

  const onCreateExam = (data: any) => {
    createExamMutation.mutate({
      title: data.title,
      description: data.description,
      passingScore: data.passingScore || "70",
      timeLimit: parseInt(data.timeLimit) || 60,
      totalQuestions: parseInt(data.totalQuestions) || 30,
      randomizeQuestions: data.randomizeQuestions === "true",
      adaptiveTesting: data.adaptiveTesting === "true",
    });
  };

  const onCreateQuestion = (data: any) => {
    createQuestionMutation.mutate({
      type: data.type || "mcq",
      stem: data.stem,
      options: [
        { id: "a", text: data.optionA },
        { id: "b", text: data.optionB },
        { id: "c", text: data.optionC },
        { id: "d", text: data.optionD },
      ].filter(o => o.text),
      correctAnswer: data.correctAnswer,
      explanation: data.explanation,
      difficulty: parseInt(data.difficulty) || 3,
      tags: data.tags ? data.tags.split(",").map((t: string) => t.trim()) : [],
    });
  };

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Exam Builder</h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Create and manage exams, question banks, and adaptive tests.</p>
          </div>
          <button onClick={() => setActiveTab("create")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff", boxShadow: "0 4px 12px rgba(200,151,42,0.3)" }}>
            <Plus className="w-4 h-4" /> New Exam
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: "Total Exams", value: exams.length, icon: GraduationCap, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
            { label: "Published", value: exams.filter((e: any) => e.status === "published").length, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { label: "Questions", value: questions.length, icon: FileText, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
            { label: "Drafts", value: exams.filter((e: any) => e.status === "draft").length, icon: AlertCircle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "var(--sdc-heading)" }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          {[{ key: "exams", label: "Exams" }, { key: "questions", label: "Question Bank" }, { key: "create", label: "+ Create Exam" }].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{ background: activeTab === key ? "#c8972a" : "transparent", color: activeTab === key ? "#fff" : "#64748b" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Exams List */}
        {activeTab === "exams" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search exams..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
            </div>
            {filteredExams.length === 0 ? (
              <div className="py-16 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <GraduationCap className="w-12 h-12 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p style={{ color: "var(--sdc-text-muted)" }}>No exams yet. Create your first exam!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredExams.map((exam: any) => {
                  const sc = STATUS_CONFIG[exam.status] || STATUS_CONFIG.draft;
                  return (
                    <div key={exam.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <h3 className="font-bold text-sm mb-1 truncate" style={{ color: "var(--sdc-heading)" }}>{exam.title}</h3>
                          <p className="text-xs line-clamp-1" style={{ color: "var(--sdc-text-muted)" }}>{exam.description || "No description"}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0" style={{ background: sc.bg, color: sc.color }}>{sc.label}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        {[
                          { label: "Questions", value: exam.totalQuestions || 0 },
                          { label: "Duration", value: `${exam.timeLimit || exam.duration || 0}m` },
                          { label: "Pass", value: `${exam.passingScore || 0}%` },
                        ].map(({ label, value }) => (
                          <div key={label} className="p-2.5 rounded-xl text-center" style={{ background: "var(--sdc-card-border)" }}>
                            <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{value}</p>
                            <p style={{ fontSize: 10, color: "var(--sdc-text-muted)" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-2">
                        {exam.adaptiveTesting && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>Adaptive</span>
                        )}
                        {exam.proctored && (
                          <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>Proctored</span>
                        )}
                        <div className="flex-1" />
                        {exam.status === "draft" && (
                          <button onClick={() => publishMutation.mutate({ id: exam.id })}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                            style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                            <Eye className="w-3 h-3" /> Publish
                          </button>
                        )}
                        <button onClick={() => setSettingsExam(exam)} className="p-2 rounded-lg" style={{ color: "var(--sdc-subheading)", background: "var(--sdc-card-border)" }}>
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Question Bank */}
        {activeTab === "questions" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
                <input value={qSearch} onChange={e => setQSearch(e.target.value)} placeholder="Search questions..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
              </div>
            </div>
            {/* Add Question Form */}
            <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <h3 className="font-bold mb-4" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Add New Question</h3>
              <form onSubmit={handleQSubmit(onCreateQuestion)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Question Stem *</label>
                    <textarea {...regQ("stem", { required: true })} rows={2} placeholder="Enter the question..."
                      className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                      style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Type</label>
                      <select {...regQ("type")} className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                        <option value="mcq">Multiple Choice</option>
                        <option value="multi_select">Multi-Select</option>
                        <option value="true_false">True/False</option>
                        <option value="essay">Essay</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Difficulty (1-5)</label>
                      <input {...regQ("difficulty")} type="number" defaultValue={3} min={1} max={5}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["A", "B", "C", "D"].map(opt => (
                    <div key={opt}>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Option {opt}</label>
                      <input {...regQ(`option${opt}`)} placeholder={`Option ${opt}`}
                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                        style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Correct Answer</label>
                    <select {...regQ("correctAnswer")} className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                      <option value="a">A</option>
                      <option value="b">B</option>
                      <option value="c">C</option>
                      <option value="d">D</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Tags (comma-separated)</label>
                    <input {...regQ("tags")} placeholder="security, network..."
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Explanation</label>
                    <input {...regQ("explanation")} placeholder="Why is this correct?"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                </div>
                <button type="submit" disabled={createQuestionMutation.isPending}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff" }}>
                  {createQuestionMutation.isPending ? "Adding..." : "Add Question"}
                </button>
              </form>
            </div>
            {/* Questions List */}
            <div className="space-y-3">
              {filteredQuestions.map((q: any, i: number) => (
                <div key={q.id} className="p-4 rounded-2xl flex items-start gap-4" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                    style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm mb-1.5" style={{ color: "var(--sdc-heading)" }}>{q.stem || q.text}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold uppercase" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>{q.type}</span>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold"
                        style={{
                          background: q.difficulty <= 2 ? "rgba(16,185,129,0.1)" : q.difficulty >= 4 ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)",
                          color: q.difficulty <= 2 ? "#10b981" : q.difficulty >= 4 ? "#dc2626" : "#f59e0b"
                        }}>Difficulty {q.difficulty}</span>
                      {q.tags?.map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 rounded-lg text-xs" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => aiAnalyzeMutation.mutate({ questionId: q.id })}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>
                    AI Analyze
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Exam Form */}
        {activeTab === "create" && (
          <div className="max-w-2xl p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <h3 className="font-bold mb-6" style={{ color: "var(--sdc-heading)", fontSize: 18 }}>Create New Exam</h3>
            <form onSubmit={handleExamSubmit(onCreateExam)} className="space-y-5">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Exam Title *</label>
                <input {...regExam("title", { required: true })} placeholder="e.g. AWS Solutions Architect Professional"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Description</label>
                <textarea {...regExam("description")} rows={3} placeholder="Describe what this exam covers..."
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none"
                  style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Duration (min)</label>
                  <input {...regExam("timeLimit")} type="number" defaultValue={60} min={1}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Pass Score (%)</label>
                  <input {...regExam("passingScore")} type="number" defaultValue={70} min={1} max={100}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Total Questions</label>
                  <input {...regExam("totalQuestions")} type="number" defaultValue={40} min={1}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Randomize Questions</label>
                  <select {...regExam("randomizeQuestions")} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Adaptive Testing</label>
                  <select {...regExam("adaptiveTesting")} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                    <option value="false">Linear</option>
                    <option value="true">Adaptive (IRT)</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={createExamMutation.isPending}
                  className="px-8 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff", boxShadow: "0 4px 12px rgba(200,151,42,0.3)" }}>
                  {createExamMutation.isPending ? "Creating..." : "Create Exam"}
                </button>
                <button type="button" onClick={() => setActiveTab("exams")}
                  className="px-6 py-3 rounded-xl font-bold text-sm"
                  style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Exam Settings Modal */}
      {settingsExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-[480px] max-w-[95vw]" style={{ background: "var(--sdc-card-bg)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "var(--sdc-heading)" }}>Exam Settings</h3>
              <button onClick={() => setSettingsExam(null)}><span style={{ color: "var(--sdc-text-muted)", fontSize: 20 }}>×</span></button>
            </div>
            <div className="space-y-3 mb-5">
              {[
                { label: "Title", value: settingsExam.title },
                { label: "Status", value: settingsExam.status || "draft" },
                { label: "Total Questions", value: settingsExam.totalQuestions || 0 },
                { label: "Time Limit", value: `${settingsExam.timeLimit || settingsExam.duration || 60} minutes` },
                { label: "Passing Score", value: `${settingsExam.passingScore || 70}%` },
                { label: "Proctored", value: settingsExam.proctored ? "Yes" : "No" },
                { label: "Created", value: settingsExam.createdAt ? new Date(settingsExam.createdAt).toLocaleDateString() : "—" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <span className="text-sm font-semibold" style={{ color: "var(--sdc-subheading)" }}>{label}</span>
                  <span className="text-sm font-bold" style={{ color: "var(--sdc-heading)" }}>{String(value)}</span>
                </div>
              ))}
            </div>
            {settingsExam.description && (
              <p className="text-sm mb-4 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}>{settingsExam.description}</p>
            )}
            <div className="flex gap-3">
              {settingsExam.status === "draft" && (
                <button onClick={() => { publishMutation.mutate({ id: settingsExam.id }); setSettingsExam(null); }}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "#10b981", color: "#fff" }}>
                  Publish Exam
                </button>
              )}
              <button onClick={() => setSettingsExam(null)}
                className="flex-1 px-4 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </SDCLayout>
  );
}
