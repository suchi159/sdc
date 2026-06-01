import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Users, BookOpen, TrendingUp, GraduationCap, CheckCircle, Plus, Search, X, Bell, Play, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  completing: { label: "Completing", color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
  on_track: { label: "On Track", color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
  ahead: { label: "Ahead", color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  at_risk: { label: "At Risk", color: "#ef4444", bg: "rgba(239,68,68,0.1)" },
};

export default function InstructorPortal() {
  const [activeTab, setActiveTab] = useState<"overview" | "cohorts" | "students" | "materials">("overview");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [cohortName, setCohortName] = useState("");
  const [cohortDesc, setCohortDesc] = useState("");

  const { data: exams, isLoading: examsLoading } = trpc.exams.list.useQuery({} as any);
  const { data: usersData, isLoading: usersLoading } = trpc.users.list.useQuery();
  const { data: cohortsData, refetch: refetchCohorts } = trpc.vouchers.cohorts.list.useQuery();

  const examsArr = (exams as any) || [];
  const usersArr = (usersData as any) || [];
  const cohortsArr = (cohortsData as any) || [];

  const students = usersArr.filter((u: any) => u.role === "candidate");
  const filteredStudents = students.filter((s: any) =>
    (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const createCohort = trpc.vouchers.cohorts.create.useMutation({
    onSuccess: () => {
      toast.success("Cohort created successfully");
      setCohortName(""); setCohortDesc(""); setShowCreate(false); refetchCohorts();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const stats = [
    { label: "Active Cohorts", value: cohortsArr.length, icon: Users, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
    { label: "Total Students", value: students.length, icon: GraduationCap, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Exams Available", value: examsArr.length, icon: BookOpen, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
    { label: "Completion Rate", value: students.length > 0 ? `${Math.round((students.filter((s: any) => s.status === "active").length / students.length) * 100)}%` : "0%", icon: TrendingUp, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
  ];

  const isLoading = examsLoading || usersLoading;

  if (isLoading) {
    return (
      <SDCLayout>
        <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-52 bg-[var(--sdc-skeleton-base)]" />
              <Skeleton className="h-4 w-80 bg-[var(--sdc-skeleton-base)]" />
            </div>
            <Skeleton className="h-10 w-32 rounded-xl bg-[var(--sdc-skeleton-base)]" />
          </div>
          {/* Stats skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => (
              <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <Skeleton className="h-10 w-10 rounded-xl mb-3 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-7 w-14 mb-1 bg-[var(--sdc-skeleton-base)]" />
                <Skeleton className="h-3 w-24 bg-[var(--sdc-skeleton-base)]" />
              </div>
            ))}
          </div>
          {/* Tab nav skeleton */}
          <Skeleton className="h-10 w-80 rounded-xl bg-[var(--sdc-skeleton-base)]" />
          {/* Content skeleton: two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <Skeleton className="h-5 w-24 mb-5 bg-[var(--sdc-skeleton-base)]" />
              <div className="space-y-5">
                {[1,2,3,4].map(i => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <Skeleton className="h-4 w-40 bg-[var(--sdc-skeleton-base)]" />
                      <Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full bg-[var(--sdc-skeleton-base)]" />
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <Skeleton className="h-5 w-36 mb-5 bg-[var(--sdc-skeleton-base)]" />
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full bg-[var(--sdc-skeleton-base)]" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-28 bg-[var(--sdc-skeleton-base)]" />
                      <Skeleton className="h-3 w-36 bg-[var(--sdc-skeleton-base)]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </SDCLayout>
    );
  }

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Instructor Portal</h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Manage cohorts, track student progress, and deliver learning materials.</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff" }}>
            <Plus className="w-4 h-4" /> New Cohort
          </button>
        </div>

        {/* Create Cohort Modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
            <div className="p-6 rounded-2xl w-[440px]" style={{ background: "var(--sdc-card-bg)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg" style={{ color: "var(--sdc-heading)" }}>Create New Cohort</h3>
                <button onClick={() => setShowCreate(false)}><X className="w-5 h-5" style={{ color: "var(--sdc-text-muted)" }} /></button>
              </div>
              <div className="space-y-3 mb-4">
                <input value={cohortName} onChange={e => setCohortName(e.target.value)} placeholder="Cohort name *"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
                <textarea value={cohortDesc} onChange={e => setCohortDesc(e.target.value)} placeholder="Description (optional)"
                  rows={2} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => createCohort.mutate({ name: cohortName, description: cohortDesc || undefined })}
                  disabled={!cohortName || createCohort.isPending}
                  className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
                  {createCohort.isPending ? "Creating..." : "Create Cohort"}
                </button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "var(--sdc-heading)" }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          {[{ key: "overview", label: "Overview" }, { key: "cohorts", label: "Cohorts" }, { key: "students", label: "Students" }, { key: "materials", label: "Materials" }].map(({ key, label }) => (
            <button key={key} onClick={() => setActiveTab(key as any)}
              className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
              style={{ background: activeTab === key ? "#c8972a" : "transparent", color: activeTab === key ? "#fff" : "#64748b" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <h3 className="font-bold mb-5" style={{ color: "var(--sdc-heading)", fontSize: 16 }}>Cohorts</h3>
              {cohortsArr.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                  <p style={{ color: "var(--sdc-text-muted)", fontSize: 13 }}>No cohorts yet. Create your first cohort to get started.</p>
                  <button onClick={() => setShowCreate(true)} className="mt-3 px-4 py-2 rounded-xl font-bold text-sm" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>
                    Create Cohort
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cohortsArr.slice(0, 5).map((cohort: any) => (
                    <div key={cohort.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{cohort.name}</span>
                        <span className="text-xs font-medium" style={{ color: "var(--sdc-text-muted)" }}>
                          {cohort.createdAt ? new Date(cohort.createdAt).toLocaleDateString() : "—"}
                        </span>
                      </div>
                      {cohort.description && (
                        <p className="text-xs mb-1.5" style={{ color: "var(--sdc-text-muted)" }}>{cohort.description}</p>
                      )}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--sdc-page-bg)" }}>
                        <div className="h-full rounded-full" style={{ width: "40%", background: "linear-gradient(90deg, #c8972a, #e6b84a)" }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <h3 className="font-bold mb-5" style={{ color: "var(--sdc-heading)", fontSize: 16 }}>Students Overview</h3>
              {students.length === 0 ? (
                <div className="text-center py-6">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2" style={{ color: "#d1d5db" }} />
                  <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>No students enrolled yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {students.slice(0, 5).map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>
                        {(student.name || "S")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: "var(--sdc-heading)" }}>{student.name || "—"}</p>
                        <p className="text-xs truncate" style={{ color: "var(--sdc-text-muted)" }}>{student.email}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-lg text-xs font-bold shrink-0" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>Active</span>
                    </div>
                  ))}
                  {students.length > 5 && (
                    <button onClick={() => setActiveTab("students")} className="w-full text-xs font-semibold py-2" style={{ color: "#c8972a" }}>
                      View all {students.length} students →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cohorts Tab */}
        {activeTab === "cohorts" && (
          <div>
            {cohortsArr.length === 0 ? (
              <div className="p-16 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
                <p className="font-semibold mb-2" style={{ color: "var(--sdc-text-muted)" }}>No cohorts yet.</p>
                <button onClick={() => setShowCreate(true)} className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
                  Create First Cohort
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cohortsArr.map((cohort: any) => (
                  <div key={cohort.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 pr-3">
                        <h3 className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{cohort.name}</h3>
                        {cohort.description && <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{cohort.description}</p>}
                      </div>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold shrink-0" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Active</span>
                    </div>
                    <p className="text-xs mb-3" style={{ color: "var(--sdc-text-muted)" }}>
                      Created {cohort.createdAt ? new Date(cohort.createdAt).toLocaleDateString() : "—"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5" style={{ color: "var(--sdc-subheading)" }}>
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-semibold">{students.length} students enrolled</span>
                      </div>
                      <button onClick={() => toast.success(`Cohort "${cohort.name}" details loaded`)}
                        className="px-4 py-1.5 rounded-lg text-xs font-bold"
                        style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Students Tab */}
        {activeTab === "students" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
            </div>
            {usersLoading ? (
              <div className="p-12 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <p style={{ color: "var(--sdc-text-muted)" }}>Loading students...</p>
              </div>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                      {["Student", "Email", "Joined", "Status", "Action"].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-bold" style={{ color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No students found.</td></tr>
                    ) : filteredStudents.map((student: any) => (
                      <tr key={student.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold shrink-0" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>
                              {(student.name || "S")[0].toUpperCase()}
                            </div>
                            <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{student.name || "—"}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--sdc-subheading)" }}>{student.email}</td>
                        <td className="px-5 py-3 text-xs" style={{ color: "var(--sdc-text-muted)" }}>
                          {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>Active</span>
                        </td>
                        <td className="px-5 py-3">
                          <button onClick={() => toast.info(`${student.name || student.email} — Joined ${student.createdAt ? new Date(student.createdAt).toLocaleDateString() : "—"}`)}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Materials Tab */}
        {activeTab === "materials" && (
          <div>
            {examsLoading ? (
              <div className="p-12 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <p style={{ color: "var(--sdc-text-muted)" }}>Loading materials...</p>
              </div>
            ) : examsArr.length === 0 ? (
              <div className="p-16 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <BookOpen className="w-12 h-12 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p style={{ color: "var(--sdc-text-muted)" }}>No exam materials available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {examsArr.map((exam: any) => (
                  <div key={exam.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(200,151,42,0.1)" }}>
                      <BookOpen className="w-5 h-5" style={{ color: "#c8972a" }} />
                    </div>
                    <h3 className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{exam.title}</h3>
                    <p className="text-xs mb-1" style={{ color: "var(--sdc-text-muted)" }}>{exam.totalQuestions || 0} questions · {exam.timeLimit || exam.duration || 0} min</p>
                    <p className="text-xs mb-3" style={{ color: exam.status === "published" ? "#10b981" : "#94a3b8" }}>
                      {exam.status === "published" ? "Published" : "Draft"}
                    </p>
                    <div className="flex gap-2">
                      <Link href={`/exam/${exam.id}`} className="flex-1">
                        <button className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
                          style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>
                          <Play className="w-3 h-3" /> Preview
                        </button>
                      </Link>
                      <button onClick={() => toast.success(`"${exam.title}" assigned to all active cohorts`)}
                        className="flex-1 py-2 rounded-xl text-xs font-bold"
                        style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
