import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Play, Video, Clock, Users, Shield, CalendarDays, Wifi, Monitor, CheckCircle, AlertTriangle } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

export default function LiveArena() {
  const { user } = useAuth();
  const { data: myAttempts } = trpc.exams.attempts.myAttempts.useQuery();
  const { data: bookingsData } = trpc.scheduling.myBookings.useQuery();
  const attempts = (myAttempts as any) || [];
  const bookings = (bookingsData as any) || [];

  // Upcoming proctored sessions
  const upcoming = bookings
    .filter((b: any) => b.booking?.status === "confirmed" && new Date(b.slot?.startTime) > new Date())
    .sort((a: any, b: any) => new Date(a.slot?.startTime).getTime() - new Date(b.slot?.startTime).getTime());

  // Past proctored sessions
  const past = bookings
    .filter((b: any) => b.booking?.status === "confirmed" && new Date(b.slot?.startTime) <= new Date());

  const systemChecks = [
    { label: "Camera Access", status: "ready", icon: Video },
    { label: "Microphone", status: "ready", icon: Monitor },
    { label: "Internet Speed", status: "ready", icon: Wifi },
    { label: "Browser Compatible", status: "ready", icon: Shield },
  ];

  return (
    <SDCLayout>
      <div className="p-8" style={{ background: "#f5f7fc", minHeight: "100vh" }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Live Arena</h1>
            <p style={{ color: "#64748b", fontSize: 14, marginTop: 2 }}>Join proctored exam sessions and manage your live testing schedule.</p>
          </div>
          <Link href="/candidate/schedule">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
              <CalendarDays className="w-4 h-4" /> Schedule Session
            </button>
          </Link>
        </div>

        {/* System Readiness */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
          <h3 className="font-bold text-sm mb-4" style={{ color: "#1e293b" }}>System Readiness Check</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {systemChecks.map(c => (
              <div key={c.label} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(5,150,105,0.1)" }}>
                  <c.icon className="w-4 h-4" style={{ color: "#059669" }} />
                </div>
                <div>
                  <p className="font-semibold text-xs" style={{ color: "#1e293b" }}>{c.label}</p>
                  <p style={{ fontSize: 10, color: "#059669", fontWeight: 700 }}>Ready</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="p-5 rounded-2xl mb-6" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: "#1e293b" }}>
              <CalendarDays className="w-4 h-4" style={{ color: "#3b82f6" }} /> Upcoming Proctored Sessions
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{upcoming.length} scheduled</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="w-10 h-10 mx-auto mb-3" style={{ color: "#d1d5db" }} />
              <p style={{ color: "#94a3b8", fontSize: 13 }}>No upcoming proctored sessions.</p>
              <Link href="/candidate/schedule">
                <button className="mt-3 px-4 py-2 rounded-xl font-bold text-xs" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>Schedule Now</button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 5).map((b: any) => {
                const start = new Date(b.slot?.startTime);
                const isToday = start.toDateString() === new Date().toDateString();
                const minutesUntil = Math.round((start.getTime() - Date.now()) / 60000);
                const canJoin = minutesUntil <= 15 && minutesUntil >= -10;
                return (
                  <div key={b.booking?.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: isToday ? "rgba(59,130,246,0.04)" : "#f8fafc", border: isToday ? "1px solid rgba(59,130,246,0.15)" : "1px solid transparent" }}>
                    <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center" style={{ background: isToday ? "rgba(59,130,246,0.1)" : "rgba(200,151,42,0.1)" }}>
                      <span style={{ fontSize: 14, fontWeight: 800, color: isToday ? "#3b82f6" : "#c8972a" }}>{start.getDate()}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: isToday ? "#3b82f6" : "#c8972a" }}>{start.toLocaleString("default", { month: "short" })}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm" style={{ color: "#1e293b" }}>{b.exam?.title || "Proctored Exam"}</p>
                      <p style={{ fontSize: 12, color: "#64748b" }}>
                        {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Proctor: {b.proctor?.name || "Assigned"}
                      </p>
                    </div>
                    {canJoin ? (
                      <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs animate-pulse"
                        style={{ background: "linear-gradient(135deg, #059669, #10b981)", color: "#fff" }}>
                        <Play className="w-3 h-3" /> Join Now
                      </button>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(107,114,128,0.1)", color: "#6b7280" }}>
                        {isToday ? `In ${minutesUntil} min` : start.toLocaleDateString()}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Past Sessions */}
        <div className="p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <Clock className="w-4 h-4" style={{ color: "#6b7280" }} /> Past Proctored Sessions
          </h3>
          {past.length === 0 ? (
            <p className="text-center py-6" style={{ color: "#94a3b8", fontSize: 13 }}>No past sessions.</p>
          ) : (
            <div className="space-y-2">
              {past.slice(0, 10).map((b: any) => {
                const start = new Date(b.slot?.startTime);
                return (
                  <div key={b.booking?.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(107,114,128,0.1)" }}>
                      <CheckCircle className="w-4 h-4" style={{ color: "#6b7280" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs" style={{ color: "#1e293b" }}>{b.exam?.title || "Exam"}</p>
                      <p style={{ fontSize: 10, color: "#94a3b8" }}>{start.toLocaleDateString()} · {start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>Completed</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </SDCLayout>
  );
}
