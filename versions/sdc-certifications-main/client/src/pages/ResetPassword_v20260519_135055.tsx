import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);

  const resetPassword = trpc.auth.resetPassword.useMutation({
    onSuccess: () => {
      setDone(true);
      setTimeout(() => setLocation("/login"), 3000);
    },
    onError: (err) => toast.error(err.message || "Reset failed. The link may have expired."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    resetPassword.mutate({ token, newPassword });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
        <div className="text-center space-y-4 p-8 rounded-2xl max-w-sm" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          <AlertTriangle className="w-12 h-12 mx-auto" style={{ color: "#f59e0b" }} />
          <h2 className="text-xl font-bold text-white">Invalid Reset Link</h2>
          <p className="text-sm" style={{ color: "#94a3b8" }}>This password reset link is invalid or missing. Please request a new one.</p>
          <button onClick={() => setLocation("/forgot-password")}
            className="w-full py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
            Request New Link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0f172a" }}>
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)" }}>
            <span className="text-white font-black text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SDC Certifications</h1>
        </div>

        <div className="rounded-2xl p-8" style={{ background: "#1e293b", border: "1px solid #334155" }}>
          {done ? (
            <div className="text-center space-y-4">
              <CheckCircle className="w-16 h-16 mx-auto" style={{ color: "#10b981" }} />
              <h2 className="text-xl font-bold text-white">Password Reset!</h2>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                Your password has been updated. Redirecting you to login…
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Set new password</h2>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  Choose a strong password with at least 8 characters.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
                      style={{ background: "#0f172a", border: "1px solid #334155" }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "#64748b" }}>
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input
                      type={showPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none"
                      style={{ background: "#0f172a", border: "1px solid #334155" }}
                    />
                  </div>
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs mt-1" style={{ color: "#f87171" }}>Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={resetPassword.isPending || !newPassword || newPassword !== confirmPassword}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
                  {resetPassword.isPending ? "Resetting…" : "Reset Password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
