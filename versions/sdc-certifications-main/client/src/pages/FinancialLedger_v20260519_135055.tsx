import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { CreditCard, TrendingUp, Lock, Hash, Plus, Gift, ArrowUpRight, ArrowDownLeft, DollarSign, Receipt, Ticket } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";

const TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; sign: string }> = {
  credit_purchase: { label: "Credit Purchase", color: "#10b981", bg: "rgba(16,185,129,0.1)", sign: "+" },
  exam_fee: { label: "Exam Fee", color: "#3b82f6", bg: "rgba(59,130,246,0.1)", sign: "-" },
  voucher_redemption: { label: "Voucher Redemption", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", sign: "-" },
  book_purchase: { label: "Book Purchase", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", sign: "-" },
  credential_issuance: { label: "Credential Issuance", color: "#c8972a", bg: "rgba(200,151,42,0.1)", sign: "-" },
  refund: { label: "Refund", color: "#10b981", bg: "rgba(16,185,129,0.1)", sign: "+" },
  adjustment: { label: "Adjustment", color: "#6b7280", bg: "rgba(107,114,128,0.1)", sign: "±" },
};

export default function FinancialLedger() {
  const [activeTab, setActiveTab] = useState<"ledger" | "vouchers" | "credits">("ledger");
  const [showAddCredits, setShowAddCredits] = useState(false);
  const [showGenerateVouchers, setShowGenerateVouchers] = useState(false);

  const { data: entries, refetch: refetchEntries } = trpc.ledger.entries.useQuery();
  const { data: balance, refetch: refetchBalance } = trpc.ledger.balance.useQuery();
  const { data: vouchers, refetch: refetchVouchers } = trpc.vouchers.list.useQuery();

  const addCreditsMutation = trpc.ledger.addCredits.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Credits added! New balance: $${data.newBalance.toFixed(2)}`);
      refetchEntries(); refetchBalance(); setShowAddCredits(false);
    },
    onError: (e: any) => toast.error(e.message),
  });
  const generateVouchersMutation = trpc.vouchers.generate.useMutation({
    onSuccess: (data: any) => {
      toast.success(`${data.count} vouchers generated!`);
      refetchVouchers(); setShowGenerateVouchers(false);
    },
    onError: (e: any) => toast.error(e.message),
  });

  const { register: regCredits, handleSubmit: handleCreditsSubmit, reset: resetCredits } = useForm<any>();
  const { register: regVoucher, handleSubmit: handleVoucherSubmit, reset: resetVoucher } = useForm<any>();

  const entryList = (entries as any) || [];
  const voucherList = (vouchers as any) || [];
  const bal = (balance as any)?.balance || 0;
  const totalSpend = entryList.filter((e: any) => e.amount < 0).reduce((a: number, e: any) => a + Math.abs(e.amount), 0);
  const totalTopUp = entryList.filter((e: any) => e.amount > 0).reduce((a: number, e: any) => a + e.amount, 0);

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "#f5f7fc", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "#1e293b" }}>Financial Ledger</h1>
            <p style={{ color: "#64748b", fontSize: 15, marginTop: 4 }}>Immutable, SHA-256 hash-chained transaction ledger.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Lock className="w-4 h-4" style={{ color: "#10b981" }} />
            <span className="text-sm font-bold" style={{ color: "#10b981" }}>Immutable Ledger</span>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[
            { label: "Current Balance", value: `$${bal.toFixed(2)}`, icon: DollarSign, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
            { label: "Total Top-ups", value: `$${totalTopUp.toFixed(2)}`, icon: ArrowUpRight, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
            { label: "Total Spend", value: `$${totalSpend.toFixed(2)}`, icon: ArrowDownLeft, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "#0f172a" }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
            {[{ key: "ledger", label: "Transactions" }, { key: "vouchers", label: "Vouchers" }, { key: "credits", label: "Add Credits" }].map(({ key, label }) => (
              <button key={key} onClick={() => setActiveTab(key as any)}
                className="px-4 py-2 rounded-lg text-sm font-bold transition-all"
                style={{ background: activeTab === key ? "#c8972a" : "transparent", color: activeTab === key ? "#fff" : "#64748b" }}>
                {label}
              </button>
            ))}
          </div>
          {activeTab === "vouchers" && (
            <button onClick={() => setShowGenerateVouchers(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #c8972a, #e6b84a)", color: "#fff" }}>
              <Plus className="w-4 h-4" /> Generate Vouchers
            </button>
          )}
          {activeTab === "credits" && (
            <button onClick={() => setShowAddCredits(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
              style={{ background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff" }}>
              <Plus className="w-4 h-4" /> Add Credits
            </button>
          )}
        </div>

        {/* Ledger Tab */}
        {activeTab === "ledger" && (
          <div className="rounded-2xl overflow-hidden" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
            <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  {["#", "Type", "Amount", "Description", "Hash", "Date"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entryList.length === 0 ? (
                  <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ color: "#94a3b8" }}>No transactions yet</td></tr>
                ) : entryList.map((e: any, i: number) => {
                  const tc = TYPE_CONFIG[e.type] || { label: e.type, color: "#6b7280", bg: "rgba(107,114,128,0.1)", sign: "" };
                  return (
                    <tr key={e.id} style={{ borderBottom: "1px solid #f8fafc" }}>
                      <td className="px-5 py-4"><span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{i + 1}</span></td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: tc.bg, color: tc.color }}>{tc.label}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-sm" style={{ color: e.amount >= 0 ? "#10b981" : "#dc2626" }}>
                          {e.amount >= 0 ? "+" : ""}{e.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-5 py-4"><span className="text-sm" style={{ color: "#374151" }}>{e.description || "—"}</span></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1">
                          <Hash className="w-3 h-3" style={{ color: "#94a3b8" }} />
                          <span className="font-mono text-xs" style={{ color: "#94a3b8" }}>{(e.hash || "").slice(0, 12)}...</span>
                        </div>
                      </td>
                      <td className="px-5 py-4"><span className="text-xs" style={{ color: "#94a3b8" }}>{new Date(e.createdAt).toLocaleDateString()}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}

        {/* Vouchers Tab */}
        {activeTab === "vouchers" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {voucherList.length === 0 ? (
              <div className="col-span-3 py-20 text-center rounded-2xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
                <Ticket className="w-14 h-14 mx-auto mb-4" style={{ color: "#d1d5db" }} />
                <p style={{ color: "#94a3b8", fontSize: 14 }}>No vouchers generated yet.</p>
              </div>
            ) : voucherList.map((v: any) => (
              <div key={v.id} className="p-5 rounded-2xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                    <Gift className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize"
                    style={{ background: v.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)", color: v.status === "active" ? "#10b981" : "#6b7280" }}>
                    {v.status}
                  </span>
                </div>
                <p className="font-mono font-bold text-lg mb-1" style={{ color: "#1e293b" }}>{v.code}</p>
                <p className="text-xs mb-3" style={{ color: "#94a3b8" }}>{v.type} · {v.discount ? `${v.discount}% off` : "Full access"}</p>
                <div className="flex items-center justify-between text-xs" style={{ color: "#94a3b8" }}>
                  <span>Expires: {v.expiryDate ? new Date(v.expiryDate).toLocaleDateString() : "Never"}</span>
                  <button onClick={() => { navigator.clipboard.writeText(v.code); toast.success("Code copied!"); }}
                    className="font-bold" style={{ color: "#c8972a" }}>Copy</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Credits Tab */}
        {activeTab === "credits" && (
          <div className="max-w-md p-6 rounded-2xl" style={{ background: "#fff", border: "1px solid #eef1f7" }}>
            <h3 className="font-bold mb-5" style={{ color: "#1e293b", fontSize: 16 }}>Add Credits to Balance</h3>
            <form onSubmit={handleCreditsSubmit((data) => { addCreditsMutation.mutate({ amount: parseFloat(data.amount), description: data.description }); resetCredits(); })} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#64748b" }}>Amount ($)</label>
                <input {...regCredits("amount", { required: true, min: 1 })} type="number" step="0.01" placeholder="100.00"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid #eef1f7", color: "#1e293b" }} />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#64748b" }}>Description</label>
                <input {...regCredits("description")} placeholder="e.g. Monthly top-up"
                  className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: "#f8fafc", border: "1px solid #eef1f7", color: "#1e293b" }} />
              </div>
              <button type="submit" disabled={addCreditsMutation.isPending}
                className="w-full py-3 rounded-xl font-bold text-sm"
                style={{ background: "linear-gradient(135deg, #10b981, #34d399)", color: "#fff" }}>
                {addCreditsMutation.isPending ? "Processing..." : "Add Credits"}
              </button>
            </form>
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
