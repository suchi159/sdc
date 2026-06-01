import { useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Eye, EyeOff, Award, CheckCircle2 } from "lucide-react";

const ROLES = [
  { value: "candidate", label: "Candidate — Take exams & earn credentials" },
  { value: "instructor", label: "Instructor — Teach & manage learners" },
  { value: "proctor", label: "Proctor — Monitor exam sessions" },
  { value: "exam_developer", label: "Exam Developer — Build question banks" },
  { value: "psychometrician", label: "Psychometrician — Analyze exam quality" },
  { value: "org_admin", label: "Org Admin — Manage organization" },
] as const;

export default function Register() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "candidate" as (typeof ROLES)[number]["value"],
  });
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      toast.success("Account created! Welcome to SDC Certifications.");
      const role = data.role as string;
      if (role === "org_admin") navigate("/onboarding");
      else if (role === "psychometrician") navigate("/psychometrics");
      else if (role === "exam_developer") navigate("/exam-builder");
      else if (role === "instructor") navigate("/instructor");
      else if (role === "proctor") navigate("/proctor");
      else navigate("/dashboard");
    },
    onError: (err) => {
      toast.error(err.message || "Registration failed");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill all required fields");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    registerMutation.mutate({
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
    });
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 1) return { label: "Weak", color: "bg-red-500", width: "w-1/4" };
    if (score === 2) return { label: "Fair", color: "bg-yellow-500", width: "w-2/4" };
    if (score === 3) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const strength = passwordStrength();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_75)] flex items-center justify-center">
            <Award className="w-6 h-6 text-[oklch(0.15_0.04_260)]" />
          </div>
          <div className="text-xl font-bold text-foreground">SDC Certifications</div>
        </div>

        <div className="glass-card rounded-2xl border border-border p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-1">Create your account</h1>
            <p className="text-muted-foreground text-sm">Join the next-gen credentialing platform</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground font-medium">Full Name</Label>
              <Input
                id="name"
                placeholder="Dr. Jane Smith"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="h-11 bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@organization.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="h-11 bg-background border-border text-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as typeof form.role })}>
                <SelectTrigger className="h-11 bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="h-11 pr-12 bg-background border-border text-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {strength && (
                <div className="space-y-1">
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${strength.color} ${strength.width}`} />
                  </div>
                  <p className="text-xs text-muted-foreground">Password strength: <span className="font-medium text-foreground">{strength.label}</span></p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-foreground font-medium">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Repeat your password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="h-11 pr-10 bg-background border-border text-foreground"
                />
                {form.confirmPassword && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {form.password === form.confirmPassword
                      ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                      : <span className="w-4 h-4 text-red-500 text-xs">✗</span>
                    }
                  </div>
                )}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-[oklch(0.75_0.15_85)] to-[oklch(0.65_0.18_75)] text-[oklch(0.15_0.04_260)] font-semibold hover:opacity-90 transition-opacity mt-2"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[oklch(0.75_0.15_85)] hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By creating an account, you agree to our{" "}
          <span className="text-[oklch(0.75_0.15_85)] cursor-pointer hover:underline">Terms of Service</span>
          {" "}and{" "}
          <span className="text-[oklch(0.75_0.15_85)] cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
