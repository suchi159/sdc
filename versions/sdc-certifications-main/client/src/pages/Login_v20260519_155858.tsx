import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff, Award, BookOpen, Brain, Shield, Zap } from "lucide-react";
import { Link } from "wouter";

const ROLE_ROUTES: Record<string, string> = {
  super_admin: "/admin",
  org_admin: "/org",
  psychometrician: "/psychometrics",
  exam_developer: "/exam-builder",
  instructor: "/instructor",
  proctor: "/proctor",
  candidate: "/candidate",
};

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const utils = trpc.useUtils();

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async (data) => {
      toast.success(`Welcome back, ${data.user.name}!`);
      // Invalidate auth cache so useAuth() picks up the new session immediately
      await utils.auth.me.invalidate();
      const dest = ROLE_ROUTES[data.user.role] || "/candidate";
      // Use window.location for a hard redirect so the cookie is picked up
      window.location.href = dest;
    },
    onError: (err) => {
      toast.error(err.message || "Login failed. Check your email and password.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter email and password");
      return;
    }
    loginMutation.mutate({ email, password });
  };

  const handleDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("Demo1234!");
    loginMutation.mutate({ email: demoEmail, password: "Demo1234!" });
  };

  const demoAccounts = [
    { label: "Super Admin", email: "sarah.mitchell@sdc.global", color: "text-red-400", bg: "hover:border-red-500/40 hover:bg-red-500/5" },
    { label: "Org Admin", email: "james.okonkwo@sdcglobal.com", color: "text-purple-400", bg: "hover:border-purple-500/40 hover:bg-purple-500/5" },
    { label: "Candidate", email: "liam.t@example.com", color: "text-yellow-400", bg: "hover:border-yellow-500/40 hover:bg-yellow-500/5" },
    { label: "Proctor", email: "david.kim@sdcglobal.com", color: "text-orange-400", bg: "hover:border-orange-500/40 hover:bg-orange-500/5" },
    { label: "Psychometrician", email: "priya.sharma@sdcglobal.com", color: "text-blue-400", bg: "hover:border-blue-500/40 hover:bg-blue-500/5" },
    { label: "Exam Developer", email: "marcus.chen@sdcglobal.com", color: "text-teal-400", bg: "hover:border-teal-500/40 hover:bg-teal-500/5" },
  ];

  const isPending = loginMutation.isPending;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[oklch(0.15_0.04_260)] via-[oklch(0.18_0.06_260)] to-[oklch(0.12_0.03_260)] flex-col justify-between p-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[oklch(0.75_0.15_85/0.08)] blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[oklch(0.65_0.18_200/0.08)] blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_75)] flex items-center justify-center shadow-lg">
              <Award className="w-7 h-7 text-[oklch(0.15_0.04_260)]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white tracking-tight">SDC Certifications</div>
              <div className="text-xs text-white/50 uppercase tracking-widest">Next-Gen AI Platform</div>
            </div>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h2 className="text-3xl font-bold text-white leading-tight">
            The Future of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_200)]">
              Digital Credentialing
            </span>
          </h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-sm">
            AI-powered examination, blockchain-grade credentials, and intelligent proctoring — all in one enterprise platform.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, label: "AI Proctoring", desc: "3-tier security" },
              { icon: Award, label: "Open Badge 2.0", desc: "Crypto-signed certs" },
              { icon: BookOpen, label: "Digital Books", desc: "DRM + AI Tutor" },
              { icon: Brain, label: "Psychometrics", desc: "IRT adaptive testing" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                <Icon className="w-5 h-5 text-[oklch(0.75_0.15_85)] mb-2" />
                <div className="text-white text-sm font-semibold">{label}</div>
                <div className="text-white/40 text-xs">{desc}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex gap-8">
          {[
            { value: "50K+", label: "Credentials Issued" },
            { value: "200+", label: "Organizations" },
            { value: "99.9%", label: "Uptime SLA" },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_200)]">{value}</div>
              <div className="text-white/40 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_75)] flex items-center justify-center">
              <Award className="w-6 h-6 text-[oklch(0.15_0.04_260)]" />
            </div>
            <div className="text-xl font-bold text-foreground">SDC Certifications</div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                autoComplete="email"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                <Link href="/forgot-password" className="text-xs hover:underline" style={{ color: "oklch(0.75 0.15 85)" }}>
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12 bg-card border-border text-foreground placeholder:text-muted-foreground"
                  autoComplete="current-password"
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_75)] text-[oklch(0.15_0.04_260)] font-semibold hover:opacity-90 transition-opacity shadow-lg"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : "Sign In"}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/register" className="text-[oklch(0.75_0.15_85)] hover:underline font-medium">
                Create account
              </Link>
            </div>
          </form>

          {/* Demo Accounts — One-Click Login */}
          <div className="mt-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-3 text-muted-foreground flex items-center gap-1.5">
                  <Zap className="w-3 h-3 text-[oklch(0.75_0.15_85)]" />
                  One-Click Demo Login
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleDemoLogin(acc.email)}
                  disabled={isPending}
                  className={`text-left p-3 rounded-lg border border-border bg-card transition-all group disabled:opacity-50 disabled:cursor-not-allowed ${acc.bg}`}
                >
                  <div className={`text-xs font-semibold ${acc.color} flex items-center gap-1.5`}>
                    {isPending && email === acc.email ? (
                      <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                    ) : null}
                    {acc.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate mt-0.5">{acc.email}</div>
                </button>
              ))}
            </div>
            <p className="text-center text-[11px] text-muted-foreground mt-3">
              All demo accounts use password: <code className="bg-muted px-1 py-0.5 rounded font-mono text-foreground">Demo1234!</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
