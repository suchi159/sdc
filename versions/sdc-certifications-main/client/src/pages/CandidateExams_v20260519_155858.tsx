import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { GraduationCap, Clock, CheckCircle, XCircle, Play, Eye, CalendarDays, Target, TrendingUp, ArrowRight, LogIn, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function CandidateExams() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [tab, setTab] = useState<"attempts" | "available">("attempts");
  const { data: myAttempts } = trpc.exams.attempts.myAttempts.useQuery(
    undefined,
    { enabled: isAuthed }
  );
  const { data: examsData } = trpc.exams.list.useQuery({} as any);
  const attempts = (myAttempts as any) || [];
  const exams = ((examsData as any) || []).filter((e: any) => e.status === "published");

  const passed = attempts.filter((r: any) => r.attempt?.passed).length;
  const failed = attempts.filter((r: any) => r.attempt?.status === "completed" && !r.attempt?.passed).length;
  const inProgress = attempts.filter((r: any) => r.attempt?.status === "in_progress").length;

  const isLoading = isAuthed && (!myAttempts || !examsData);

  if (authLoading) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SDCLayout>
    );
  }

  if (!isAuthed) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full" style={{ background: "rgba(59,130,246,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <GraduationCap className="h-8 w-8" style={{ color: "#3b82f6" }} />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-muted-foreground">
              You must be signed in to view your exam attempts and available certifications.
            </p>
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold"
              style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}
              onClick={() => window.location.href = getLoginUrl("/candidate/exams")}
            >
              <LogIn className="h-4 w-4" />
              Sign In to Continue
            </button>
          </div>
        </div>
      </SDCLayout>
    );
  }

  if (isLoading) {
    return (
      <SDCLayout>
        <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
          <div className="mb-6 space-y-2">
            <Skeleton className="h-8 w-40 bg-[var(--sdc-skeleton-base)]" />
            <Skeleton className="h-4 w-80 bg-[var(--sdc-skeleton-base)]" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <Skeleton className="h-10 w-10 rounded-xl mb-2 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-8 w-12 mb-1 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-3 w-24 bg-[var(--sdc-skeleton-base)]" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-64 rounded-xl mb-6 bg-[var(--sdc-skeleton-base)]" />
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="p-4 border-b border-slate-100 flex gap-4">
              {["Exam","Date","Score","Status","Action"].map(h => <Skeleton key={h} className="h-3 flex-1 bg-[var(--sdc-skeleton-base)]" />)}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="p-4 border-b border-slate-50 flex gap-4 items-center">
                {[1,2,3,4].map(j => <Skeleton key={j} className="h-4 flex-1 bg-[var(--sdc-skeleton-base)]" />)}
                <Skeleton className="h-8 w-20 rounded-lg bg-[var(--sdc-skeleton-base)]" />
              </div>
            ))}
          </div>
        </div>
      </SDCLayout>
    );
  }

  return (
    <SDCLayout>
      <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        <div className="mb-6">
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>My Exams</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Track your exam attempts and discover available certifications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Attempts", value: attempts.length, icon: GraduationCap, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
            { label: "Passed", value: passed, icon: CheckCircle, color: "#059669", bg: "rgba(5,150,105,0.1)" },
            { label: "Failed", value: failed, icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
            { label: "In Progress", value: inProgress, icon: Clock, color: "#d97706", bg: "rgba(217,119,6,0.1)" },
          ].map(s => (
            <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.bg }}>
                  <s.icon className="w-5 h-5" style={{ color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>{s.value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", width: "fit-content" }}>
          {(["attempts", "available"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-lg font-bold text-sm transition-all capitalize"
              style={{ background: tab === t ? "#c8972a" : "transparent", color: tab === t ? "#fff" : "#64748b" }}>
              {t === "attempts" ? "My Attempts" : "Available Exams"}
            </button>
          ))}
        </div>

        {tab === "attempts" ? (
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  {["Exam", "Date", "Score", "Status", "Duration", ""].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attempts.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                    <GraduationCap className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                    <p>No exam attempts yet. Start your first exam from the Available Exams tab.</p>
                  </td></tr>
                ) : attempts.map((row: any) => {
                  const a = row.attempt || row;
                  const statusColor = a.passed ? { bg: "rgba(5,150,105,0.1)", color: "#059669", label: "Passed" }
                    : a.status === "in_progress" ? { bg: "rgba(217,119,6,0.1)", color: "#d97706", label: "In Progress" }
                    : { bg: "rgba(220,38,38,0.1)", color: "#dc2626", label: "Failed" };
                  return (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                            <GraduationCap className="w-4 h-4" style={{ color: "#3b82f6" }} />
                          </div>
                          <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{row.exam?.title || "Exam"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : "—"}</span></td>
                      <td className="px-5 py-4"><span className="font-bold text-sm" style={{ color: a.passed ? "#059669" : a.status === "in_progress" ? "#d97706" : "#dc2626" }}>{a.score != null ? `${a.score}%` : "—"}</span></td>
                      <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: statusColor.bg, color: statusColor.color }}>{statusColor.label}</span></td>
                      <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{a.duration ? `${Math.round(a.duration / 60)} min` : "—"}</span></td>
                      <td className="px-5 py-4">
                        {a.status === "completed" && (
                          <Link href={`/candidate/results/${a.id}`}>
                            <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(99,102,241,0.1)", color: "#6366f1" }}>
                              <Eye className="w-3 h-3" /> Results
                            </button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {exams.length === 0 ? (
              <div className="col-span-full p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <Target className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
                <p className="font-semibold" style={{ color: "var(--sdc-text-muted)" }}>No exams available at this time.</p>
              </div>
            ) : exams.map((e: any) => (
              <div key={e.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                    <GraduationCap className="w-5 h-5" style={{ color: "#3b82f6" }} />
                  </div>
                  {e.industry && <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(139,92,246,0.1)", color: "#8b5cf6" }}>{e.industry}</span>}
                </div>
                <h3 className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{e.title}</h3>
                <p style={{ fontSize: 12, color: "var(--sdc-subheading)", marginBottom: 12 }}>{e.totalQuestions || 0} questions · {e.duration || 0} min · Pass: {e.passingScore || 70}%</p>
                <div className="flex gap-2">
                  <Link href={`/exam/${e.id}`}>
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
                      <Play className="w-3 h-3" /> Start Exam
                    </button>
                  </Link>
                  <Link href="/candidate/schedule">
                    <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                      <CalendarDays className="w-3 h-3" /> Schedule
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
