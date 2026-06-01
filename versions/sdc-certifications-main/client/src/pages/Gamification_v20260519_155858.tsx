import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Star, Trophy, Target, Flame, Award, BookOpen, GraduationCap, Zap, Medal, Crown, LogIn } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const BADGES = [
  { id: "first_exam", label: "First Exam", desc: "Complete your first exam", icon: GraduationCap, color: "#3b82f6", condition: (a: number) => a >= 1 },
  { id: "five_exams", label: "Exam Veteran", desc: "Complete 5 exams", icon: Target, color: "#8b5cf6", condition: (a: number) => a >= 5 },
  { id: "ten_exams", label: "Exam Master", desc: "Complete 10 exams", icon: Crown, color: "#c8972a", condition: (a: number) => a >= 10 },
  { id: "first_pass", label: "First Pass", desc: "Pass your first exam", icon: Trophy, color: "#059669", condition: (_a: number, p: number) => p >= 1 },
  { id: "five_pass", label: "High Achiever", desc: "Pass 5 exams", icon: Medal, color: "#f59e0b", condition: (_a: number, p: number) => p >= 5 },
  { id: "perfect_score", label: "Perfectionist", desc: "Score 100% on any exam", icon: Star, color: "#ec4899", condition: (_a: number, _p: number, perfect: boolean) => perfect },
  { id: "bookworm", label: "Bookworm", desc: "Own 3+ digital books", icon: BookOpen, color: "#06b6d4", condition: (_a: number, _p: number, _pf: boolean, books: number) => books >= 3 },
  { id: "streak", label: "On Fire", desc: "Pass 3 exams in a row", icon: Flame, color: "#ef4444", condition: (_a: number, _p: number, _pf: boolean, _b: number, streak: boolean) => streak },
];

export default function Gamification() {
  const { user, loading } = useAuth();
  const isAuthed = Boolean(user);
  const { data: myAttempts } = trpc.exams.attempts.myAttempts.useQuery(undefined, { enabled: isAuthed });
  const { data: myBooks } = trpc.books.myBooks.useQuery(undefined, { enabled: isAuthed });
  const { data: myCredentials } = trpc.credentials.list.useQuery(undefined as any, { enabled: isAuthed });

  const attempts = (myAttempts as any) || [];
  // myBooks returns {access, book} join rows — count valid book entries
  const booksOwned = ((myBooks as any) || []).filter((b: any) => b.book?.id ?? b.id).length;
  const rawCreds = Array.isArray(myCredentials) ? myCredentials : [];
  const creds = rawCreds.map((row: any) => row.cred || row);

  const totalAttempts = attempts.filter((r: any) => r.attempt?.status === "completed").length;
  const passedCount = attempts.filter((r: any) => r.attempt?.passed).length;
  const hasPerfect = attempts.some((r: any) => r.attempt?.score === 100);

  // Check for 3-pass streak
  const completedSorted = attempts
    .filter((r: any) => r.attempt?.status === "completed")
    .sort((a: any, b: any) => new Date(b.attempt?.createdAt).getTime() - new Date(a.attempt?.createdAt).getTime());
  const hasStreak = completedSorted.length >= 3 && completedSorted.slice(0, 3).every((r: any) => r.attempt?.passed);

  const earnedBadges = BADGES.filter(b => b.condition(totalAttempts, passedCount, hasPerfect, booksOwned, hasStreak));
  const lockedBadges = BADGES.filter(b => !b.condition(totalAttempts, passedCount, hasPerfect, booksOwned, hasStreak));

  // XP calculation
  const xp = (passedCount * 100) + (totalAttempts * 25) + (booksOwned * 50) + (creds.length * 200) + (earnedBadges.length * 75);
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const xpToNext = 500;

  if (!loading && !user) {
    return (
      <SDCLayout>
        <div className="flex flex-col items-center justify-center" style={{ minHeight: "60vh", background: "#f5f7fc" }}>
          <div className="p-10 rounded-2xl text-center" style={{ background: "#fff", border: "1px solid #eef1f7", maxWidth: 400 }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(200,151,42,0.1)" }}>
              <Trophy className="w-8 h-8" style={{ color: "#c8972a" }} />
            </div>
            <h2 className="font-bold text-xl mb-2" style={{ color: "#0f172a" }}>Sign in to view Achievements</h2>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>Track your XP, badges, and progress by signing in to your account.</p>
            <a href={getLoginUrl("/candidate/gamification")}>
              <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm mx-auto"
                style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff" }}>
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            </a>
          </div>
        </div>
      </SDCLayout>
    );
  }

  return (
    <SDCLayout>
      <div className="p-8" style={{ background: "#f5f7fc", minHeight: "100vh" }}>
        <div className="mb-6">
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0f172a" }}>Achievements</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 2 }}>Track your progress and unlock badges as you learn.</p>
        </div>

        {/* Level Card */}
        <div className="p-6 rounded-2xl mb-6" style={{ background: "linear-gradient(135deg, #0f172a, #1e293b)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", boxShadow: "0 8px 24px rgba(200,151,42,0.3)" }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: "#fff" }}>{level}</span>
            </div>
            <div className="flex-1">
              <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>Level {level}</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginTop: 2 }}>{user?.name || "Candidate"}</p>
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{xpInLevel} / {xpToNext} XP</span>
                  <span style={{ fontSize: 11, color: "#c8972a", fontWeight: 700 }}>{xp} total XP</span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${(xpInLevel / xpToNext) * 100}%`, background: "linear-gradient(90deg, #c8972a, #e6b84a)" }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 shrink-0">
              {[
                { label: "Badges", value: earnedBadges.length, icon: Star },
                { label: "Credentials", value: creds.length, icon: Award },
                { label: "Exams Passed", value: passedCount, icon: Trophy },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <s.icon className="w-5 h-5 mx-auto mb-1" style={{ color: "#c8972a" }} />
                  <p style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>{s.value}</p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Earned Badges */}
        <div className="mb-6">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <Trophy className="w-4 h-4" style={{ color: "#c8972a" }} /> Earned Badges ({earnedBadges.length}/{BADGES.length})
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {earnedBadges.map(b => (
              <div key={b.id} className="p-5 rounded-2xl text-center" style={{ background: "#fff", border: "1px solid #eef1f7", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: `${b.color}15`, border: `2px solid ${b.color}30` }}>
                  <b.icon className="w-7 h-7" style={{ color: b.color }} />
                </div>
                <p className="font-bold text-sm" style={{ color: "#1e293b" }}>{b.label}</p>
                <p style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Locked Badges */}
        {lockedBadges.length > 0 && (
          <div>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#94a3b8" }}>
              <Target className="w-4 h-4" /> Locked Badges ({lockedBadges.length})
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {lockedBadges.map(b => (
                <div key={b.id} className="p-5 rounded-2xl text-center opacity-50" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: "#f1f5f9" }}>
                    <b.icon className="w-7 h-7" style={{ color: "#94a3b8" }} />
                  </div>
                  <p className="font-bold text-sm" style={{ color: "#94a3b8" }}>{b.label}</p>
                  <p style={{ fontSize: 11, color: "#cbd5e1", marginTop: 2 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* XP Breakdown */}
        <div className="p-5 rounded-2xl mt-6" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2" style={{ color: "#1e293b" }}>
            <Zap className="w-4 h-4" style={{ color: "#c8972a" }} /> XP Breakdown
          </h3>
          <div className="space-y-2">
            {[
              { label: "Exams Passed", value: passedCount, xp: passedCount * 100, unit: "× 100 XP" },
              { label: "Exams Attempted", value: totalAttempts, xp: totalAttempts * 25, unit: "× 25 XP" },
              { label: "Books Owned", value: booksOwned, xp: booksOwned * 50, unit: "× 50 XP" },
              { label: "Credentials Earned", value: creds.length, xp: creds.length * 200, unit: "× 200 XP" },
              { label: "Badges Earned", value: earnedBadges.length, xp: earnedBadges.length * 75, unit: "× 75 XP" },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f8fafc" }}>
                <span className="text-sm font-medium" style={{ color: "#475569" }}>{r.label}</span>
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>{r.value} {r.unit}</span>
                  <span className="font-bold text-sm" style={{ color: "#c8972a" }}>+{r.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SDCLayout>
  );
}
