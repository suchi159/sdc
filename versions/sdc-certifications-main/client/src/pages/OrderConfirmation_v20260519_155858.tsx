import { useEffect, useState } from "react";
import { useSearch, Link } from "wouter";
import { CheckCircle, Ticket, BookOpen, ArrowRight, Home, LayoutDashboard, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function OrderConfirmation() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const sessionId = params.get("session_id");
  const { user } = useAuth();

  const verifyMutation = trpc.stripe.verifyPayment.useMutation();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (sessionId && !verified) {
      verifyMutation.mutate({ sessionId }, {
        onSuccess: () => setVerified(true),
        onError: () => setVerified(true),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const data = verifyMutation.data as any;
  const isLoading = verifyMutation.isPending;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16"
      style={{ background: "var(--sdc-page-bg, #0f1117)" }}>
      <div className="w-full max-w-lg rounded-2xl border border-border shadow-2xl overflow-hidden"
        style={{ background: "var(--sdc-card-bg, #1a1d27)" }}>
        <div className="px-8 pt-10 pb-6 text-center border-b border-border">
          {isLoading ? (
            <Loader2 className="mx-auto mb-4 w-14 h-14 animate-spin text-yellow-400" />
          ) : (
            <div className="mx-auto mb-4 w-14 h-14 rounded-full flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          )}
          <h1 className="text-2xl font-bold mb-1" style={{ color: "var(--sdc-heading, #f8fafc)" }}>
            {isLoading ? "Processing your order\u2026" : "Payment Successful!"}
          </h1>
          <p className="text-sm" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
            {isLoading
              ? "Please wait while we confirm your payment."
              : "Your order has been confirmed and your account has been updated."}
          </p>
        </div>

        {!isLoading && (
          <div className="px-8 py-6 space-y-4">
            {data?.vouchersAdded > 0 && (
              <div className="flex items-center gap-4 rounded-xl p-4 border border-border"
                style={{ background: "rgba(200,151,42,0.07)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(200,151,42,0.15)" }}>
                  <Ticket className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading, #f8fafc)" }}>
                    {data.vouchersAdded} Exam Voucher{data.vouchersAdded !== 1 ? "s" : ""} Added
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
                    Available in your Voucher Management panel
                  </p>
                </div>
              </div>
            )}
            {data?.booksGranted > 0 && (
              <div className="flex items-center gap-4 rounded-xl p-4 border border-border"
                style={{ background: "rgba(59,130,246,0.07)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)" }}>
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading, #f8fafc)" }}>
                    {data.booksGranted} Study Material{data.booksGranted !== 1 ? "s" : ""} Unlocked
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
                    Access your books in the Digital Library
                  </p>
                </div>
              </div>
            )}
            {(!data || (!data.vouchersAdded && !data.booksGranted)) && (
              <div className="flex items-center gap-4 rounded-xl p-4 border border-border"
                style={{ background: "rgba(34,197,94,0.07)" }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.15)" }}>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading, #f8fafc)" }}>Order Confirmed</p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
                    Your account has been updated. Check your email for a receipt.
                  </p>
                </div>
              </div>
            )}
            {data?.newBalance !== undefined && (
              <div className="rounded-xl p-4 border border-border text-center"
                style={{ background: "var(--sdc-card-bg, #1a1d27)" }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
                  Current Credit Balance
                </p>
                <p className="text-2xl font-bold" style={{ color: "#c8972a" }}>
                  {parseFloat(String(data.newBalance)).toFixed(2)}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="px-8 pb-8 flex flex-col gap-3">
          {user?.orgId ? (
            <Link href="/org">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "#c8972a" }}>
                <LayoutDashboard className="w-4 h-4" />
                Go to Org Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          ) : (
            <Link href="/candidate">
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: "#c8972a" }}>
                <LayoutDashboard className="w-4 h-4" />
                Go to My Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          )}
          <Link href="/">
            <button className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm border border-border"
              style={{ color: "var(--sdc-muted, #94a3b8)" }}>
              <Home className="w-4 h-4" />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
      {sessionId && (
        <p className="mt-6 text-xs" style={{ color: "var(--sdc-muted, #94a3b8)" }}>
          Order reference: <span className="font-mono">{sessionId}</span>
        </p>
      )}
    </div>
  );
}
