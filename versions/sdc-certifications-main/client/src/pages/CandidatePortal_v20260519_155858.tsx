import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Award, BookOpen, GraduationCap, Clock, CheckCircle, ArrowRight, TestTube, Play, Download, Share2, Zap } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function CandidatePortal() {
  const { user } = useAuth();
  const { data: myAttempts } = trpc.exams.attempts.myAttempts.useQuery();
  const { data: myCredentials } = trpc.credentials.list.useQuery(undefined as any);
  const { data: myBooks } = trpc.books.myBooks.useQuery();
  const { data: examsData } = trpc.exams.list.useQuery({} as any);

  const rawCreds = Array.isArray(myCredentials) ? myCredentials : [];
  const creds = rawCreds.map((row: any) => ({
    id: row.cred?.id || row.id,
    credentialId: row.cred?.credentialId || row.credentialId,
    status: row.cred?.status || row.status || "active",
    issueDate: row.cred?.issueDate || row.issueDate,
    recipientName: row.holder?.name || "Unknown",
    title: row.template?.name || "Credential",
  }));
  const attempts = (myAttempts as any) || [];
  const books = (myBooks as any) || [];
  const exams = ((examsData as any) || []).filter((e: any) => e.status === "published");
  const passedExams = attempts.filter((a: any) => a.attempt?.passed);

  const isLoading = !myAttempts || !myCredentials || !myBooks || !examsData;

  const stats = [
    { label: "Credentials Earned", value: creds.length, icon: Award, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
    { label: "Exams Attempted", value: attempts.length, icon: GraduationCap, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Exams Passed", value: passedExams.length, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Books Owned", value: books.length, icon: BookOpen, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
  ];

  if (isLoading) {
    return (
      <SDCLayout>
        <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64 bg-[var(--sdc-skeleton-base)]" />
              <Skeleton className="h-4 w-80 bg-[var(--sdc-skeleton-base)]" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-[var(--sdc-skeleton-base)]" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <Skeleton className="h-11 w-11 rounded-xl mb-3 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-8 w-16 mb-1 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-3 w-28 bg-[var(--sdc-skeleton-base)]" />
              </div>
            ))}
          </div>
          {/* Quick actions skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="p-5 rounded-2xl flex items-center gap-4" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)" }}>
                <Skeleton className="h-12 w-12 rounded-xl bg-[var(--sdc-skeleton-base)] shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32 bg-[var(--sdc-skeleton-base)]" />
                  <Skeleton className="h-3 w-48 bg-[var(--sdc-skeleton-base)]" />
                </div>
              </div>
            ))}
          </div>
          {/* Credentials + Exams skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2].map(i => (
              <div key={i} className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="flex items-center justify-between mb-5">
                  <Skeleton className="h-5 w-32 bg-[var(--sdc-skeleton-base)]" />
                  <Skeleton className="h-4 w-16 bg-[var(--sdc-skeleton-base)]" />
                </div>
                <div className="space-y-3">
                  {[1,2,3,4].map(j => (
                    <div key={j} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                      <Skeleton className="h-10 w-10 rounded-xl bg-[var(--sdc-skeleton-base)] shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4 bg-[var(--sdc-skeleton-base)]" />
                        <Skeleton className="h-3 w-1/2 bg-[var(--sdc-skeleton-base)]" />
                      </div>
                      <Skeleton className="h-6 w-16 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SDCLayout>
    );
  }

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>
              Welcome back, {user?.name?.split(" ")[0] || "Candidate"} 👋
            </h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Track your certifications, exams, and learning progress.</p>
          </div>
          <Link href="/test-arena">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff", boxShadow: "0 4px 12px rgba(200,151,42,0.3)" }}>
              <TestTube className="w-4 h-4" /> Test Arena
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)", letterSpacing: "-0.02em" }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: "My Credentials", desc: "View and share your certifications", icon: Award, color: "#c8972a", href: "/wallet" },
            { label: "Take an Exam", desc: "Start a scheduled examination", icon: GraduationCap, color: "#3b82f6", href: "/test-arena" },
            { label: "My Library", desc: "Access your digital books", icon: BookOpen, color: "#8b5cf6", href: "/books" },
          ].map(({ label, desc, icon: Icon, color, href }) => (
            <Link key={label} href={href}>
              <div className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold" style={{ fontSize: 15, color: "var(--sdc-heading)" }}>{label}</p>
                  <p style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 shrink-0" style={{ color: "#cbd5e1" }} />
              </div>
            </Link>
          ))}
        </div>

        {/* Credentials + Exams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>
                <Award className="w-4 h-4" style={{ color: "#c8972a" }} /> My Credentials
              </h3>
              <Link href="/wallet"><span className="text-xs font-semibold cursor-pointer" style={{ color: "#c8972a" }}>View all <ArrowRight className="w-3 h-3 inline" /></span></Link>
            </div>
            {creds.length === 0 ? (
              <div className="text-center py-8">
                <Award className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>No credentials yet. Take an exam to earn your first badge!</p>
                <Link href="/test-arena">
                  <button className="mt-3 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>Start Practicing</button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {creds.slice(0, 4).map((c: any) => (
                    <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                        <Award className="w-5 h-5" style={{ color: "#c8972a" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--sdc-heading)" }}>{c.title}</p>
                        <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>Issued {c.issueDate ? new Date(c.issueDate).toLocaleDateString() : "—"}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold capitalize"
                        style={{ background: c.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: c.status === "active" ? "#10b981" : "#6b7280" }}>
                        {c.status}
                      </span>
                    </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>
                <GraduationCap className="w-4 h-4" style={{ color: "#3b82f6" }} /> Available Exams
              </h3>
              <Link href="/test-arena"><span className="text-xs font-semibold cursor-pointer" style={{ color: "#3b82f6" }}>View all <ArrowRight className="w-3 h-3 inline" /></span></Link>
            </div>
            {exams.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>No exams available right now.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exams.slice(0, 4).map((e: any) => (
                  <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.1)" }}>
                      <GraduationCap className="w-5 h-5" style={{ color: "#3b82f6" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--sdc-heading)" }}>{e.title}</p>
                      <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{e.totalQuestions || 0} questions · {e.duration || 0} min</p>
                    </div>
                    <Link href={`/exam/${e.id}`}>
                      <button className="px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1"
                        style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>
                        <Play className="w-3 h-3" /> Start
                      </button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Attempts */}
        {attempts.length > 0 && (
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <h3 className="font-bold mb-5 flex items-center gap-2" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>
              <Clock className="w-4 h-4" style={{ color: "#6b7280" }} /> Recent Exam Attempts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {attempts.slice(0, 6).map((row: any) => {
                const attempt = row.attempt || row;
                return (
                  <div key={attempt.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: attempt.passed ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)" }}>
                      {attempt.passed
                        ? <CheckCircle className="w-4 h-4" style={{ color: "#10b981" }} />
                        : <Clock className="w-4 h-4" style={{ color: "#dc2626" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs truncate" style={{ color: "var(--sdc-heading)" }}>{row.exam?.title || "Exam"}</p>
                      <p style={{ fontSize: 10, color: "var(--sdc-text-muted)" }}>{new Date(attempt.createdAt).toLocaleDateString()}</p>
                    </div>
                    {attempt.score != null && (
                      <span className="font-bold text-sm" style={{ color: attempt.passed ? "#10b981" : "#dc2626" }}>{attempt.score}%</span>
                    )}
                    {attempt.status === "completed" && (
                      <Link href={`/candidate/results/${attempt.id}`}>
                        <button className="text-xs px-2 py-1 rounded-lg border hover:bg-[var(--sdc-skeleton-base)] transition-colors" style={{ color: "#6366f1", borderColor: "#e0e7ff", fontSize: 10 }}>
                          View
                        </button>
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
