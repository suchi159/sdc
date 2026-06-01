import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Award, Download, Share2, ExternalLink, Search, Shield, CheckCircle, XCircle, Clock, Linkedin, QrCode, Filter } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  active: { label: "Active", color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  expired: { label: "Expired", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
  revoked: { label: "Revoked", color: "#dc2626", bg: "rgba(220,38,38,0.1)", icon: XCircle },
  suspended: { label: "Suspended", color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
};

export default function CredentialWallet() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [generatingPdf, setGeneratingPdf] = useState<number | null>(null);
  const { data: credentials, isLoading } = trpc.credentials.list.useQuery(undefined as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const generatePdf = (trpc.credentials as any).generatePdf.useMutation({
    onSuccess: (url: string) => {
      window.open(url, "_blank");
      toast.success("Certificate PDF opened in new tab");
      setGeneratingPdf(null);
    },
    onError: () => {
      toast.error("Failed to generate PDF. Please try again.");
      setGeneratingPdf(null);
    },
  });

  const allCreds = Array.isArray(credentials) ? credentials : [];
  const filtered = allCreds.filter((row: any) => {
    const cred = row.cred || row;
    const name = row.template?.name || cred.title || "";
    const id = cred.credentialId || "";
    const matchSearch = name.toLowerCase().includes(search.toLowerCase()) || id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || cred.status === filter;
    return matchSearch && matchFilter;
  });

  const activeCount = allCreds.filter((r: any) => (r.cred || r).status === "active").length;
  const expiredCount = allCreds.filter((r: any) => (r.cred || r).status === "expired").length;

  const handleShare = (credentialId: string) => {
    const url = `${window.location.origin}/verify/${credentialId}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification URL copied to clipboard!");
  };

  const handleLinkedIn = (row: any) => {
    const cred = row.cred || row;
    const name = row.template?.name || cred.title || "SDC Certification";
    const url = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(name)}&issueYear=${new Date(cred.issueDate || cred.createdAt).getFullYear()}&issueMonth=${new Date(cred.issueDate || cred.createdAt).getMonth() + 1}&certUrl=${encodeURIComponent(`${window.location.origin}/verify/${cred.credentialId}`)}&certId=${cred.credentialId}`;
    window.open(url, "_blank");
  };

  return (
    <SDCLayout>
      <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Credential Wallet</h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>
              {allCreds.length} credential{allCreds.length !== 1 ? "s" : ""} · All cryptographically signed with Open Badge 2.0
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <Shield className="w-4 h-4" style={{ color: "#10b981" }} />
            <span className="text-sm font-bold" style={{ color: "#10b981" }}>Blockchain Verified</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { label: "Total Credentials", value: allCreds.length, color: "#c8972a", bg: "rgba(200,151,42,0.1)", icon: Award },
            { label: "Active", value: activeCount, color: "#10b981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
            { label: "Expired", value: expiredCount, color: "#f59e0b", bg: "rgba(245,158,11,0.1)", icon: Clock },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: "var(--sdc-heading)" }}>{value}</p>
              <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credentials by name or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
          </div>
          <div className="flex items-center gap-2">
            {["all", "active", "expired", "revoked"].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-3 py-2 rounded-xl text-xs font-bold capitalize transition-all"
                style={{
                  background: filter === f ? "#c8972a" : "#fff",
                  color: filter === f ? "#fff" : "#64748b",
                  border: `1px solid ${filter === f ? "#c8972a" : "#eef1f7"}`
                }}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
                {/* Dark header skeleton */}
                <div className="p-5" style={{ background: "var(--sdc-notif-bg)" }}>
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton className="h-12 w-12 rounded-xl" style={{ background: "rgba(255,255,255,0.1)" }} />
                    <Skeleton className="h-6 w-16 rounded-lg" style={{ background: "rgba(255,255,255,0.1)" }} />
                  </div>
                  <Skeleton className="h-4 w-3/4 mb-2" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <Skeleton className="h-3 w-1/2" style={{ background: "rgba(255,255,255,0.07)" }} />
                </div>
                {/* Body skeleton */}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12 bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-14 bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-3 w-16 bg-[var(--sdc-skeleton-base)]" />
                  </div>
                  <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                    <Skeleton className="h-8 flex-1 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-8 flex-1 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-8 w-8 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                    <Skeleton className="h-8 w-8 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Award className="w-14 h-14 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <h3 className="font-bold text-lg mb-2" style={{ color: "var(--sdc-text)" }}>No credentials found</h3>
            <p style={{ color: "var(--sdc-text-muted)", fontSize: 14 }}>
              {search ? "Try a different search term." : "Complete an exam to earn your first credential!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((row: any) => {
              const cred = row.cred || row;
              const sc = STATUS_CONFIG[cred.status] || STATUS_CONFIG.active;
              const StatusIcon = sc.icon;
              return (
                <div key={cred.id} className="rounded-2xl overflow-hidden transition-all"
                  style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {/* Card Header */}
                  <div className="p-5" style={{ background: "linear-gradient(135deg, #03071e 0%, #0a1628 100%)" }}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.2)", border: "1px solid rgba(200,151,42,0.4)" }}>
                        <Award className="w-6 h-6" style={{ color: "#c8972a" }} />
                      </div>
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
                        style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.color}40` }}>
                        <StatusIcon className="w-3 h-3" /> {sc.label}
                      </span>
                    </div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "#fff" }}>
                      {row.template?.name || cred.title || "SDC Certification"}
                    </h3>
                    <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>{cred.credentialId}</p>
                  </div>
                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: "var(--sdc-text-muted)" }}>Issued</span>
                      <span className="font-semibold" style={{ color: "var(--sdc-text)" }}>{new Date(cred.issueDate || cred.createdAt).toLocaleDateString()}</span>
                    </div>
                    {cred.expiryDate && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: "var(--sdc-text-muted)" }}>Expires</span>
                        <span className="font-semibold" style={{ color: "var(--sdc-text)" }}>{new Date(cred.expiryDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cred.score && (
                      <div className="flex items-center justify-between text-xs">
                        <span style={{ color: "var(--sdc-text-muted)" }}>Score</span>
                        <span className="font-bold" style={{ color: "#c8972a" }}>{cred.score}%</span>
                      </div>
                    )}
                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid #f1f5f9" }}>
                      <button onClick={() => handleShare(cred.credentialId)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: "rgba(59,130,246,0.08)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.2)" }}>
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button onClick={() => handleLinkedIn(row)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{ background: "rgba(10,102,194,0.08)", color: "#0a66c2", border: "1px solid rgba(10,102,194,0.2)" }}>
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                      </button>
                      <button
                        onClick={() => { setGeneratingPdf(cred.id); generatePdf.mutate({ credentialId: cred.id }); }}
                        disabled={generatingPdf === cred.id}
                        className="flex items-center justify-center p-2 rounded-xl transition-all"
                        style={{ background: "rgba(16,185,129,0.08)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}
                        title="Download PDF Certificate">
                        {generatingPdf === cred.id
                          ? <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          : <Download className="w-3.5 h-3.5" />}
                      </button>
                      <a href={`/verify/${cred.credentialId}`} target="_blank" rel="noreferrer"
                        className="flex items-center justify-center p-2 rounded-xl transition-all"
                        style={{ background: "rgba(107,114,128,0.08)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.2)" }}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
