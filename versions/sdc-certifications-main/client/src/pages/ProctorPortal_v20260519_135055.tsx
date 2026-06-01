import { useState } from "react";
import { useLocation } from "wouter";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ProctorEarnings from "./ProctorEarnings";
import LiveProctorMonitor from "./LiveProctorMonitor";
import {
  Monitor, Users, AlertTriangle, CheckCircle, Eye, Video,
  Shield, Zap, Search, Flag, Clock, Activity, BarChart3,
  TrendingUp, Target, Calendar, Settings as SettingsIcon,
  User, Lock, Bell, ChevronRight
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const INCIDENT_TYPES = [
  { value: "gaze_deviation", label: "Gaze Deviation" },
  { value: "face_not_detected", label: "Face Not Detected" },
  { value: "multiple_faces", label: "Multiple Faces" },
  { value: "audio_anomaly", label: "Audio Anomaly" },
  { value: "tab_switch", label: "Tab Switch" },
  { value: "phone_detected", label: "Phone Detected" },
  { value: "manual_flag", label: "Manual Flag" },
];

/* ─── DASHBOARD TAB ─── */
function DashboardTab() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [flagType, setFlagType] = useState("manual_flag");
  const { data: sessions, refetch, isLoading: sessionsLoading } = trpc.proctor.sessions.list.useQuery();
  const { data: incidents } = trpc.proctor.incidents.list.useQuery(
    { sessionId: selectedSession || undefined } as any,
    { enabled: true }
  );
  const flagMutation = trpc.proctor.sessions.flag.useMutation({
    onSuccess: () => { toast.success("Incident flagged"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const sessionList = (sessions as any) || [];
  const active = sessionList.filter((s: any) => s.status === "active");
  const completed = sessionList.filter((s: any) => s.status === "completed");
  const incidentList = (incidents as any) || [];
  const stats = [
    { label: "Active Sessions", value: active.length, icon: Monitor, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
    { label: "Total Sessions", value: sessionList.length, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
    { label: "Completed", value: completed.length, icon: CheckCircle, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
    { label: "Incidents", value: sessionList.reduce((a: number, s: any) => a + (s.incidentCount || 0), 0), icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  ];
  if (sessionsLoading) {
    return (
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-52 bg-[var(--sdc-skeleton-base)]" />
            <Skeleton className="h-4 w-80 bg-[var(--sdc-skeleton-base)]" />
          </div>
          <Skeleton className="h-9 w-36 rounded-xl bg-[var(--sdc-skeleton-base)]" />
        </div>
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {[1,2,3,4].map(i => (
            <div key={i} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <Skeleton className="h-11 w-11 rounded-xl mb-3 bg-[var(--sdc-skeleton-base)]" />
              <Skeleton className="h-8 w-14 mb-1 bg-[var(--sdc-skeleton-base)]" />
              <Skeleton className="h-3 w-24 bg-[var(--sdc-skeleton-base)]" />
            </div>
          ))}
        </div>
        {/* Session grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-36 bg-[var(--sdc-skeleton-base)]" />
              <Skeleton className="h-6 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="p-4 rounded-xl" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)" }}>
                  <Skeleton className="h-28 w-full rounded-xl mb-3" style={{ background: "#1e293b" }} />
                  <div className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24 bg-[var(--sdc-skeleton-base)]" />
                      <Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Skeleton className="h-5 w-32 mb-4 bg-[var(--sdc-skeleton-base)]" />
            <div className="space-y-3">
              {[1,2,3,4].map(i => (
                <div key={i} className="p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                  <div className="flex justify-between mb-1">
                    <Skeleton className="h-3.5 w-28 bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-5 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                  </div>
                  <Skeleton className="h-3 w-full bg-[var(--sdc-skeleton-base)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Proctor Dashboard</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Monitor exam sessions and review AI-flagged incidents in real time.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{ background: active.length > 0 ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", border: `1px solid ${active.length > 0 ? "rgba(16,185,129,0.3)" : "rgba(107,114,128,0.3)"}` }}>
          <div className="w-2 h-2 rounded-full" style={{ background: active.length > 0 ? "#10b981" : "#6b7280" }} />
          <span className="text-sm font-bold" style={{ color: active.length > 0 ? "#10b981" : "#6b7280" }}>
            {active.length > 0 ? `${active.length} Live Session${active.length > 1 ? "s" : ""}` : "No Active Sessions"}
          </span>
        </div>
      </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>
              <Activity className="w-4 h-4 inline mr-2" style={{ color: "#10b981" }} />Active Sessions
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{active.length} Live</span>
          </div>
          {active.length === 0 ? (
            <div className="text-center py-12">
              <Eye className="w-12 h-12 mx-auto mb-3" style={{ color: "#d1d5db" }} />
              <p style={{ fontSize: 14, color: "var(--sdc-text-muted)" }}>No active proctoring sessions</p>
              <p style={{ fontSize: 12, color: "#cbd5e1", marginTop: 4 }}>Sessions will appear here when candidates start exams</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {active.map((session: any) => (
                <div key={session.id} onClick={() => setSelectedSession(session.id)}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  style={{ background: selectedSession === session.id ? "rgba(200,151,42,0.05)" : "#f8fafc", border: `1px solid ${selectedSession === session.id ? "rgba(200,151,42,0.3)" : "#eef1f7"}` }}>
                  <div className="w-full h-28 rounded-xl flex items-center justify-center mb-3 relative"
                    style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)" }}>
                    <Video className="w-8 h-8" style={{ color: "rgba(255,255,255,0.2)" }} />
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.2)", border: "1px solid rgba(16,185,129,0.4)" }}>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#10b981" }} />
                      <span style={{ fontSize: 10, color: "#10b981", fontWeight: 800 }}>LIVE</span>
                    </div>
                    {session.incidentCount > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full" style={{ background: "rgba(220,38,38,0.2)", border: "1px solid rgba(220,38,38,0.4)" }}>
                        <span style={{ fontSize: 10, color: "#dc2626", fontWeight: 800 }}>{session.incidentCount} flags</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>Session #{session.id}</p>
                      <p className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>
                        <Clock className="w-3 h-3" />{new Date(session.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); flagMutation.mutate({ sessionId: session.id, type: "manual_flag" as any, severity: "medium", description: "Manual flag by proctor" }); }}
                      className="p-2 rounded-lg" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold mb-4" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>
            <AlertTriangle className="w-4 h-4 inline mr-2" style={{ color: "#f59e0b" }} />
            {selectedSession ? `Session #${selectedSession} Incidents` : "All Incidents"}
          </h3>
          {incidentList.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="w-10 h-10 mx-auto mb-3" style={{ color: "#10b981" }} />
              <p style={{ fontSize: 13, color: "var(--sdc-text-muted)" }}>No incidents recorded</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {incidentList.map((inc: any) => (
                <div key={inc.id} className="p-3 rounded-xl" style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)" }}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: "var(--sdc-heading)" }}>
                      {INCIDENT_TYPES.find(t => t.value === inc.type)?.label || inc.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold capitalize"
                      style={{ background: inc.severity === "critical" ? "rgba(220,38,38,0.1)" : "rgba(245,158,11,0.1)", color: inc.severity === "critical" ? "#dc2626" : "#f59e0b" }}>
                      {inc.severity}
                    </span>
                  </div>
                  {inc.description && <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{inc.description}</p>}
                  <p style={{ fontSize: 10, color: "#cbd5e1", marginTop: 2 }}>{new Date(inc.timestamp).toLocaleTimeString()}</p>
                </div>
              ))}
            </div>
          )}
          {selectedSession && (
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid #f1f5f9" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--sdc-text-muted)" }}>Flag Incident</p>
              <select value={flagType} onChange={e => setFlagType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
                style={{ background: "var(--sdc-card-border)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                {INCIDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button onClick={() => flagMutation.mutate({ sessionId: selectedSession, type: flagType as any, severity: "high" })}
                disabled={flagMutation.isPending}
                className="w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Flag className="w-3.5 h-3.5" /> Flag Incident
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── SESSIONS TAB ─── */
function SessionsTab() {
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const { data: sessions } = trpc.proctor.sessions.list.useQuery();
  const sessionList = (sessions as any) || [];
  const filtered = filter === "all" ? sessionList : sessionList.filter((s: any) => s.status === filter);

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Sessions</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>All proctoring sessions — past and present.</p>
        </div>
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          {(["all", "active", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-1.5 rounded-lg font-bold text-xs capitalize transition-all"
              style={{ background: filter === f ? "#c8972a" : "transparent", color: filter === f ? "#fff" : "#64748b" }}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Session", "Status", "Started", "Incidents", "Duration"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                <Monitor className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
                <p>No sessions found.</p>
              </td></tr>
            ) : filtered.map((s: any) => (
              <tr key={s.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: s.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)" }}>
                      <Video className="w-4 h-4" style={{ color: s.status === "active" ? "#10b981" : "#6b7280" }} />
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>Session #{s.id}</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize"
                    style={{ background: s.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: s.status === "active" ? "#10b981" : "#6b7280" }}>
                    {s.status}
                  </span>
                </td>
                <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{new Date(s.createdAt).toLocaleString()}</span></td>
                <td className="px-5 py-4">
                  <span className="font-bold text-sm" style={{ color: s.incidentCount > 0 ? "#f59e0b" : "#94a3b8" }}>{s.incidentCount || 0}</span>
                </td>
                <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{s.duration ? `${Math.round(s.duration / 60)} min` : "—"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

/* ─── ANALYTICS TAB ─── */
function AnalyticsTab() {
  const { data: sessions } = trpc.proctor.sessions.list.useQuery();
  const sessionList = (sessions as any) || [];
  const totalSessions = sessionList.length;
  const totalIncidents = sessionList.reduce((a: number, s: any) => a + (s.incidentCount || 0), 0);
  const avgIncidents = totalSessions > 0 ? (totalIncidents / totalSessions).toFixed(1) : "0";
  const completedSessions = sessionList.filter((s: any) => s.status === "completed");
  const avgDuration = completedSessions.length > 0
    ? Math.round(completedSessions.reduce((a: number, s: any) => a + (s.duration || 0), 0) / completedSessions.length / 60)
    : 0;

  // Weekly distribution
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weeklyDist = weekDays.map((day, i) => ({
    day,
    count: sessionList.filter((s: any) => new Date(s.createdAt).getDay() === i).length,
  }));
  const maxWeekly = Math.max(...weeklyDist.map(w => w.count), 1);

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Analytics</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Your proctoring performance and session statistics.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Sessions", value: totalSessions, icon: Monitor, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "Total Incidents", value: totalIncidents, icon: AlertTriangle, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
          { label: "Avg Incidents/Session", value: avgIncidents, icon: Target, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)" },
          { label: "Avg Duration", value: `${avgDuration} min`, icon: Clock, color: "#059669", bg: "rgba(5,150,105,0.1)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p style={{ fontSize: 24, fontWeight: 800, color: "var(--sdc-heading)" }}>{s.value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Distribution */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-5" style={{ color: "var(--sdc-heading)" }}>Sessions by Day of Week</h3>
          <div className="flex items-end gap-3" style={{ height: 160 }}>
            {weeklyDist.map(w => (
              <div key={w.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "#c8972a" }}>{w.count}</span>
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${(w.count / maxWeekly) * 120}px`, minHeight: 4, background: "linear-gradient(180deg, #c8972a, #dba93b)" }} />
                <span style={{ fontSize: 10, color: "var(--sdc-text-muted)", fontWeight: 600 }}>{w.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Types */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-5" style={{ color: "var(--sdc-heading)" }}>Incident Type Breakdown</h3>
          {INCIDENT_TYPES.map(t => {
            const count = sessionList.reduce((a: number, s: any) => a, 0); // Placeholder — real data would come from incidents
            return (
              <div key={t.value} className="flex items-center gap-3 py-2" style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#f59e0b" }} />
                </div>
                <span className="flex-1 text-sm" style={{ color: "var(--sdc-text)" }}>{t.label}</span>
                <span className="font-bold text-xs" style={{ color: "var(--sdc-text-muted)" }}>—</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Performance Rating */}
      <div className="p-6 rounded-2xl mt-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <h3 className="font-bold text-sm mb-4" style={{ color: "var(--sdc-heading)" }}>Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Response Time", value: "< 30s", desc: "Average time to respond to incidents", color: "#059669" },
            { label: "Session Completion", value: `${completedSessions.length}/${totalSessions}`, desc: "Sessions completed without issues", color: "#3b82f6" },
            { label: "Intervention Rate", value: totalSessions > 0 ? `${Math.round((totalIncidents / totalSessions) * 100)}%` : "0%", desc: "Percentage of sessions with interventions", color: "#f59e0b" },
          ].map(m => (
            <div key={m.label} className="p-4 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
              <p style={{ fontSize: 28, fontWeight: 800, color: m.color }}>{m.value}</p>
              <p className="font-bold text-sm mt-1" style={{ color: "var(--sdc-heading)" }}>{m.label}</p>
              <p style={{ fontSize: 11, color: "var(--sdc-text-muted)", marginTop: 2 }}>{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── SETTINGS TAB ─── */
function ProctorSettingsTab() {
  const { user } = useAuth();
  const [notifBooking, setNotifBooking] = useState(true);
  const [notifIncident, setNotifIncident] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Settings</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage your proctor profile and notification preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-5 flex items-center gap-2" style={{ color: "var(--sdc-heading)" }}>
            <User className="w-4 h-4" style={{ color: "#3b82f6" }} /> Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Name</label>
              <p className="mt-1 font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{user?.name || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Email</label>
              <p className="mt-1 font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{user?.email || "—"}</p>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Role</label>
              <p className="mt-1"><span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>Proctor</span></p>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-5 flex items-center gap-2" style={{ color: "var(--sdc-heading)" }}>
            <Bell className="w-4 h-4" style={{ color: "#c8972a" }} /> Notification Preferences
          </h3>
          <div className="space-y-4">
            {[
              { label: "New Booking Alerts", desc: "Get notified when a candidate books a slot", value: notifBooking, set: setNotifBooking },
              { label: "Incident Alerts", desc: "Get notified when AI flags an incident", value: notifIncident, set: setNotifIncident },
              { label: "Email Notifications", desc: "Receive email for important events", value: notifEmail, set: setNotifEmail },
            ].map(n => (
              <div key={n.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{n.label}</p>
                  <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{n.desc}</p>
                </div>
                <button onClick={() => n.set(!n.value)}
                  className="w-11 h-6 rounded-full transition-all relative"
                  style={{ background: n.value ? "#c8972a" : "#d1d5db" }}>
                  <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                    style={{ left: n.value ? 22 : 2, boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <h3 className="font-bold text-sm mb-5 flex items-center gap-2" style={{ color: "var(--sdc-heading)" }}>
            <Lock className="w-4 h-4" style={{ color: "#059669" }} /> Security
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>Change Password</p>
                <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>Update your account password</p>
              </div>
              <ChevronRight className="w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
              <div>
                <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>Two-Factor Authentication</p>
                <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>Add an extra layer of security</p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(107,114,128,0.1)", color: "#6b7280" }}>Not Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PORTAL ─── */
const TAB_MAP: Record<string, string> = {
  "/proctor": "dashboard", "/proctor/dashboard": "dashboard",
  "/proctor/sessions": "sessions", "/proctor/incidents": "incidents",
  "/proctor/reports": "reports", "/proctor/earnings": "earnings",
  "/proctor/monitor": "monitor", "/proctor/analytics": "analytics",
  "/proctor/settings": "settings",
};

export default function ProctorPortal() {
  const [location] = useLocation();
  const activeTab = Object.entries(TAB_MAP).find(([path]) =>
    path === "/proctor" ? location === "/proctor" : location.startsWith(path)
  )?.[1] || "dashboard";

  return (
    <SDCLayout>
      {activeTab === "dashboard" ? <DashboardTab /> :
       activeTab === "sessions" ? <SessionsTab /> :
       activeTab === "earnings" ? <ProctorEarnings /> :
       activeTab === "monitor" ? <LiveProctorMonitor /> :
       activeTab === "analytics" ? <AnalyticsTab /> :
       activeTab === "incidents" ? <SessionsTab /> :
       activeTab === "reports" ? <AnalyticsTab /> :
       activeTab === "settings" ? <ProctorSettingsTab /> :
       <DashboardTab />}
    </SDCLayout>
  );
}
