import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const forgotPassword = trpc.auth.forgotPassword.useMutation({
    onSuccess: () => setSent(true),
    onError: (err) => toast.error(err.message || "Something went wrong"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPassword.mutate({ email, origin: window.location.origin });
  };

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
          {sent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16" style={{ color: "#10b981" }} />
              </div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-sm" style={{ color: "#94a3b8" }}>
                If an account exists for <strong className="text-white">{email}</strong>, we've sent a password reset link. It expires in 1 hour.
              </p>
              <p className="text-xs" style={{ color: "#64748b" }}>
                Didn't receive it? Check your spam folder, or{" "}
                <button onClick={() => setSent(false)} className="underline" style={{ color: "#d4a017" }}>
                  try again
                </button>.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Reset your password</h2>
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  Enter your email address and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#cbd5e1" }}>
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#64748b" }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2"
                      style={{ background: "#0f172a", border: "1px solid #334155" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotPassword.isPending || !email}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{ background: "linear-gradient(135deg,#b8860b,#d4a017)", color: "#fff" }}>
                  {forgotPassword.isPending ? "Sending…" : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link href="/login">
              <button className="inline-flex items-center gap-1.5 text-sm" style={{ color: "#94a3b8" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Back to login
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
