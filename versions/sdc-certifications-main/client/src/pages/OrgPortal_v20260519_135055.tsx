import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import VoucherManagement from "./VoucherManagement";
import { toast } from "sonner";
import {
  Award, Users, Coins, CheckCircle, FileCheck, UserPlus, ShoppingCart,
  Search, Download, Plus, ChevronRight, Eye, RefreshCw, Settings,
  Bell, Shield, CreditCard, Key, Globe, Zap, ArrowRight, BarChart3, Trash2, Pencil,
  Building2, Save, Loader2, AlertTriangle, X, Copy, Check, ExternalLink, ToggleLeft, ToggleRight
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

const MONTHLY = [
  { month: "Oct", issued: 24 }, { month: "Nov", issued: 38 },
  { month: "Dec", issued: 31 }, { month: "Jan", issued: 45 },
  { month: "Feb", issued: 52 }, { month: "Mar", issued: 67 },
];
const ChartTip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--sdc-notif-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{payload[0]?.value}</p>
    </div>
  );
};

function DashboardTab() {
  const { user } = useAuth();
  const { data: analytics } = trpc.analytics.overview.useQuery();
  const { data: credsData } = trpc.credentials.list.useQuery(undefined as any);
  const rawCreds = Array.isArray(credsData) ? credsData : [];
  const recentCreds = rawCreds.slice(0, 5).map((row: any) => ({
    id: row.cred?.id || row.id,
    credentialId: row.cred?.credentialId || row.credentialId,
    status: row.cred?.status || row.status || "active",
    issueDate: row.cred?.issueDate || row.issueDate,
    recipientName: row.holder?.name || "Unknown",
    title: row.template?.name || "Credential",
  }));
  const stats = [
    { label: "Total Issued", value: analytics?.totalCredentials ?? 0, icon: Award, color: "#c8972a", bg: "rgba(200,151,42,0.1)", change: "+12%" },
    { label: "Active Credentials", value: analytics?.activeCredentials ?? 0, icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.1)", change: "+8%" },
    { label: "Team Members", value: analytics?.users ?? 0, icon: Users, color: "#3b82f6", bg: "rgba(59,130,246,0.1)", change: "+3%" },
    { label: "Vouchers", value: analytics?.vouchers ?? 0, icon: Coins, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", change: "+5%" },
  ];
  return (
    <div className="p-8 space-y-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--sdc-heading)" }}>Organization Dashboard</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Welcome back, {user?.name?.split(" ")[0] || "Admin"}</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff", boxShadow: "0 4px 14px rgba(200,151,42,0.25)" }}>
          <Plus className="w-4 h-4" /> Issue Credential
        </button>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, bg, change }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{change}</span>
            </div>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)", letterSpacing: "-0.02em" }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {[
          { label: "Issue Credential", desc: "Award a new certification", icon: FileCheck, color: "#c8972a", href: "/org/credentials" },
          { label: "Invite Team Member", desc: "Add to your organization", icon: UserPlus, color: "#3b82f6", href: "/org/team" },
          { label: "Purchase Vouchers", desc: "Buy exam vouchers & books", icon: ShoppingCart, color: "#10b981", href: "/org/buy-vouchers" },
        ].map(({ label, desc, icon: Icon, color, href }) => (
          <Link key={label} href={href}>
            <div className="p-5 rounded-2xl flex items-center gap-4 cursor-pointer transition-all group"
              style={{ background: `${color}08`, border: `1px solid ${color}20` }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${color}12`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${color}08`; }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="flex-1">
                <p className="font-bold" style={{ fontSize: 15, color: "var(--sdc-heading)" }}>{label}</p>
                <p style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </div>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Credentials Issued</h3>
              <p style={{ color: "var(--sdc-text-muted)", fontSize: 12 }}>Last 6 months</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>+14% vs last period</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="orgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8972a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c8972a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="issued" stroke="#c8972a" strokeWidth={2.5} fill="url(#orgGrad)" dot={{ fill: "#c8972a", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Recent Credentials</h3>
            <Link href="/org/credentials"><span className="text-xs font-semibold cursor-pointer" style={{ color: "#c8972a" }}>View all</span></Link>
          </div>
          <div className="space-y-3">
            {recentCreds.length === 0 ? (
              <p style={{ color: "var(--sdc-text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No credentials yet</p>
            ) : recentCreds.map((c: any) => (
              <div key={c.id} className="flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>
                  {(c.recipientName || "C")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs truncate" style={{ color: "var(--sdc-heading)" }}>{c.recipientName || "—"}</p>
                  <p className="text-xs truncate" style={{ color: "var(--sdc-text-muted)" }}>{c.title || "—"}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Active</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function CredentialsTab() {
  const { data: credsData, isLoading } = trpc.credentials.list.useQuery(undefined as any);
  const [search, setSearch] = useState("");
  const rawCreds = Array.isArray(credsData) ? credsData : [];
  const creds = rawCreds.map((row: any) => ({
    id: row.cred?.id || row.id,
    credentialId: row.cred?.credentialId || row.credentialId,
    status: row.cred?.status || row.status || "active",
    issueDate: row.cred?.issueDate || row.issueDate,
    expiryDate: row.cred?.expiryDate || row.expiryDate,
    recipientName: row.holder?.name || "Unknown",
    recipientEmail: row.holder?.email || "",
    title: row.template?.name || "Credential",
  }));
  const filtered = creds.filter((c: any) =>
    (c.recipientName || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.title || "").toLowerCase().includes(search.toLowerCase())
  );
  const STATUS: Record<string, { color: string; bg: string }> = {
    active: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    expired: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    revoked: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  };
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Credentials</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Issue and manage certifications for your candidates.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-text)" }}>
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
            <Plus className="w-4 h-4" /> Issue Credential
          </button>
        </div>
      </div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credentials..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Recipient", "Credential ID", "Certification", "Issued", "Expires", "Status", ""].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-[var(--sdc-skeleton-base)]" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-28 bg-[var(--sdc-skeleton-base)]" />
                          <Skeleton className="h-3 w-36 bg-[var(--sdc-skeleton-base)]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-32 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3.5 w-36 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-7 w-16 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                  </tr>
                ))}
              </>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No credentials found</td></tr>
            ) : filtered.slice(0, 20).map((c: any) => {
              const sc = STATUS[c.status] || STATUS.active;
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>
                        {(c.recipientName || "C")[0]?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{c.recipientName}</p>
                        <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{c.recipientEmail || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="font-mono text-xs" style={{ color: "var(--sdc-subheading)" }}>{c.credentialId}</span></td>
                  <td className="px-5 py-4"><span className="text-sm" style={{ color: "var(--sdc-text)" }}>{c.title}</span></td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{c.issueDate ? new Date(c.issueDate).toLocaleDateString() : "—"}</span></td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}</span></td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-lg" style={{ color: "var(--sdc-text-muted)" }}><Eye className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 rounded-lg" style={{ color: "var(--sdc-text-muted)" }}><RefreshCw className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function VouchersTab() {
  const { data: vouchersData, isLoading: vouchersLoading } = trpc.vouchers.list.useQuery();
  const vouchers = (vouchersData as any) || [];
  const STATUS: Record<string, { color: string; bg: string }> = {
    active: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    used: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    expired: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
  };
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Vouchers</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage exam and book access vouchers.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> Generate Vouchers
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        {[
          { label: "Total Vouchers", value: vouchers.length },
          { label: "Active", value: vouchers.filter((v: any) => v.status === "active").length },
          { label: "Used", value: vouchers.filter((v: any) => v.status === "used").length },
        ].map(({ label, value }) => (
          <div key={label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>{value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Code", "Type", "Value", "Expires", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {vouchersLoading ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                    <td className="px-5 py-4"><Skeleton className="h-4 w-28 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3.5 w-16 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3.5 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                  </tr>
                ))}
              </>
            ) : vouchers.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No vouchers found</td></tr>
            ) : vouchers.slice(0, 20).map((v: any) => {
              const sc = STATUS[v.status] || STATUS.active;
              return (
                <tr key={v.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-4"><span className="font-mono text-sm font-bold" style={{ color: "#c8972a" }}>{v.code}</span></td>
                  <td className="px-5 py-4"><span className="text-sm capitalize" style={{ color: "var(--sdc-text)" }}>{v.type}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{v.discountValue ? `${v.discountValue}%` : v.creditAmount ? `${v.creditAmount} credits` : "—"}</span></td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : "Never"}</span></td>
                  <td className="px-5 py-4"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: sc.bg, color: sc.color }}>{v.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function CandidatesTab() {
  const { data: usersData, refetch, isLoading: candidatesLoading } = trpc.users.list.useQuery();
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [invEmail, setInvEmail] = useState("");
  const [invName, setInvName] = useState("");
  const candidates = ((usersData as any) || []).filter((u: any) => u.role === "candidate");
  const filtered = candidates.filter((c: any) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.email || "").toLowerCase().includes(search.toLowerCase())
  );
  const inviteMutation = trpc.users.invite.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Invitation sent to ${invEmail}`);
      if (data?.tempPassword) toast.info(`Temp password: ${data.tempPassword}`, { duration: 15000 });
      setInvEmail(""); setInvName(""); setShowInvite(false); refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Candidates</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage candidates enrolled in your organization.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
          <UserPlus className="w-4 h-4" /> Invite Candidate
        </button>
      </div>
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-96" style={{ background: "var(--sdc-card-bg)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--sdc-heading)" }}>Invite Candidate</h3>
            <div className="space-y-3 mb-4">
              <input value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="Email address *"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              <input value={invName} onChange={e => setInvName(e.target.value)} placeholder="Full name (optional)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => inviteMutation.mutate({ email: invEmail, name: invName || undefined, role: "candidate" })}
                disabled={!invEmail || inviteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </button>
              <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search candidates..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Candidates", value: candidates.length, color: "#c8972a" },
          { label: "Active", value: candidates.filter((c: any) => c.status === "active" || !c.status).length, color: "#059669" },
          { label: "Invited", value: candidates.filter((c: any) => c.loginMethod === "invite").length, color: "#3b82f6" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>{s.value}</p>
            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)", marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Name", "Email", "Joined", "Credentials", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {candidatesLoading ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-full bg-[var(--sdc-skeleton-base)]" />
                        <Skeleton className="h-3.5 w-28 bg-[var(--sdc-skeleton-base)]" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5"><Skeleton className="h-3.5 w-40 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-3 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-3.5 w-8 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-3.5"><Skeleton className="h-6 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                  </tr>
                ))}
              </>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No candidates found</td></tr>
            ) : filtered.slice(0, 30).map((c: any) => (
              <tr key={c.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>{(c.name || "C")[0]}</div>
                    <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{c.name || "—"}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5"><span style={{ fontSize: 13, color: "var(--sdc-subheading)" }}>{c.email}</span></td>
                <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</span></td>
                <td className="px-5 py-3.5"><span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>—</span></td>
                <td className="px-5 py-3.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>{c.status || "active"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function CertificationsTab() {
  const { data: tpls, refetch } = trpc.credentials.templates.list.useQuery();
  const templates = (tpls as any) || [];
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", validityMonths: "", skills: "" });
  const createMutation = trpc.credentials.templates.create.useMutation({
    onSuccess: () => { toast.success("Certification program created"); setShowCreate(false); setForm({ name: "", description: "", validityMonths: "", skills: "" }); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const deleteMutation = trpc.credentials.templates.delete.useMutation({
    onSuccess: () => { toast.success("Program deleted"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Certification Programs</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage certification programs and requirements.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> New Program
        </button>
      </div>
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-[480px]" style={{ background: "var(--sdc-card-bg)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--sdc-heading)" }}>Create Certification Program</h3>
            <div className="space-y-3 mb-4">
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Program name *"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Description"
                rows={2} className="w-full px-4 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              <input value={form.validityMonths} onChange={e => setForm(f => ({ ...f, validityMonths: e.target.value }))} placeholder="Validity (months, leave blank for lifetime)"
                type="number" className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              <input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} placeholder="Skills (comma-separated)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => createMutation.mutate({ name: form.name, description: form.description || undefined, validityMonths: form.validityMonths ? parseInt(form.validityMonths) : undefined, skills: form.skills ? form.skills.split(",").map(s => s.trim()).filter(Boolean) : undefined })}
                disabled={!form.name || createMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
                {createMutation.isPending ? "Creating..." : "Create Program"}
              </button>
              <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {templates.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Award className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <p className="font-semibold" style={{ color: "var(--sdc-text-muted)" }}>No certification programs yet. Create your first one.</p>
          </div>
        ) : templates.map((t: any) => (
          <div key={t.id} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: "rgba(200,151,42,0.1)" }}>
                <Award className="w-5 h-5" style={{ color: "#c8972a" }} />
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>{t.status || "active"}</span>
                <button onClick={() => { if (confirm(`Delete "${t.name}"?`)) deleteMutation.mutate({ id: t.id }); }}
                  className="p-1.5 rounded-lg hover:bg-red-50" style={{ color: "#dc2626" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <h3 className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>{t.name}</h3>
            <p style={{ fontSize: 12, color: "var(--sdc-subheading)", marginBottom: 12 }}>Validity: {t.validityMonths ? `${t.validityMonths} months` : "Lifetime"}</p>
            <div className="flex flex-wrap gap-1">
              {(t.skills || []).slice(0, 4).map((s: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{s}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamTab() {
  const { data: usersData, refetch } = trpc.users.list.useQuery();
  const inviteMutation = trpc.users.invite.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Invitation sent to ${invEmail}`);
      if (data?.tempPassword) toast.info(`Temp password: ${data.tempPassword}`, { duration: 15000 });
      setInvEmail(""); setInvRole("proctor"); setShowInvite(false); refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const [showInvite, setShowInvite] = useState(false);
  const [invEmail, setInvEmail] = useState("");
  const [invRole, setInvRole] = useState("proctor");
  const members = ((usersData as any) || []).filter((u: any) => u.role !== "candidate");
  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    org_admin: { bg: "rgba(200,151,42,0.1)", color: "#c8972a" },
    proctor: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
    instructor: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    exam_developer: { bg: "rgba(6,182,212,0.1)", color: "#06b6d4" },
    psychometrician: { bg: "rgba(236,72,153,0.1)", color: "#ec4899" },
  };
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Team Management</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Invite and manage your organization's team members.</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
          <UserPlus className="w-4 h-4" /> Invite Member
        </button>
      </div>
      {showInvite && (
        <div className="p-5 rounded-2xl mb-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <p className="font-bold text-sm mb-3" style={{ color: "var(--sdc-heading)" }}>Invite New Team Member</p>
          <div className="flex gap-3">
            <input value={invEmail} onChange={e => setInvEmail(e.target.value)} placeholder="Email address" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
            <select value={invRole} onChange={e => setInvRole(e.target.value)} className="px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
              <option value="candidate">Candidate</option>
              <option value="proctor">Proctor</option>
              <option value="instructor">Instructor</option>
              <option value="exam_developer">Exam Developer</option>
              <option value="org_admin">Org Admin</option>
            </select>
            <button onClick={() => inviteMutation.mutate({ email: invEmail, role: invRole as any })} disabled={!invEmail || inviteMutation.isPending} className="px-5 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
              {inviteMutation.isPending ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Name", "Email", "Role", "Joined", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No team members yet. Invite your first member.</td></tr>
            ) : members.map((m: any) => {
              const rc = ROLE_COLORS[m.role] || { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };
              return (
                <tr key={m.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>{(m.name || "T")[0]}</div>
                      <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{m.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 13, color: "var(--sdc-subheading)" }}>{m.email}</span></td>
                  <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: rc.bg, color: rc.color }}>{(m.role || "").replace("_", " ")}</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}</span></td>
                  <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}>{m.loginMethod === "invite" ? "Invited" : "Active"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function ApiTokensTab() {
  const { data: keysData, refetch: refetchKeys } = trpc.apiKeys.list.useQuery();
  const createKey = trpc.apiKeys.create.useMutation({ onSuccess: () => refetchKeys() });
  const revokeKey = trpc.apiKeys.revoke.useMutation({ onSuccess: () => { refetchKeys(); toast.success("Key revoked"); } });
  const keys = (keysData as any) || [];
  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedNewKey, setCopiedNewKey] = useState(false);
  const [activeGuide, setActiveGuide] = useState<"curl"|"js"|"python">("curl");
  const [testStatus, setTestStatus] = useState<"idle"|"loading"|"ok"|"error">("idle");
  const [testMsg, setTestMsg] = useState("");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://your-domain.manus.space";

  const handleTestConnection = async () => {
    setTestStatus("loading"); setTestMsg("");
    try {
      const r = await fetch(`${baseUrl}/api/v1/openapi.json`);
      const d = await r.json();
      if (d?.info?.title) {
        setTestStatus("ok");
        setTestMsg(`Connected — ${d.info.title} v${d.info.version} · ${Object.keys(d.paths || {}).length} endpoints available`);
      } else {
        setTestStatus("error"); setTestMsg("Unexpected response from API server.");
      }
    } catch {
      setTestStatus("error"); setTestMsg("Could not reach the API server.");
    }
  };

  const handleCreate = async () => {
    if (!keyName.trim()) return;
    const result = await createKey.mutateAsync({ name: keyName.trim() });
    setNewKey((result as any).key);
    setKeyName(""); setShowCreate(false);
    toast.success("API key created — copy it now, it won't be shown again");
  };

  const copyNewKey = () => {
    if (!newKey) return;
    navigator.clipboard.writeText(newKey);
    setCopiedNewKey(true);
    setTimeout(() => setCopiedNewKey(false), 2000);
  };

  const codeExamples: Record<"curl"|"js"|"python", string> = {
    curl: `curl -X GET "${baseUrl}/api/v1/credentials" \\\n  -H "Authorization: Bearer sdc_live_YOUR_KEY_HERE" \\\n  -H "Content-Type: application/json"`,
    js: `const res = await fetch("${baseUrl}/api/v1/credentials", {\n  headers: {\n    "Authorization": "Bearer sdc_live_YOUR_KEY_HERE",\n    "Content-Type": "application/json",\n  },\n});\nconst data = await res.json();`,
    python: `import requests\n\nheaders = {\n    "Authorization": "Bearer sdc_live_YOUR_KEY_HERE",\n}\nresponse = requests.get(\n    "${baseUrl}/api/v1/credentials",\n    headers=headers\n)\ndata = response.json()`,
  };

  const endpoints = [
    { method: "GET",  path: "/api/v1/exams",                     desc: "List published exams for your org" },
    { method: "GET",  path: "/api/v1/exams/:id",                 desc: "Get a single exam" },
    { method: "POST", path: "/api/v1/candidates",                desc: "Register / upsert a candidate" },
    { method: "GET",  path: "/api/v1/candidates/:email",         desc: "Look up a candidate by email" },
    { method: "POST", path: "/api/v1/results",                   desc: "Submit an exam result" },
    { method: "GET",  path: "/api/v1/results",                   desc: "List results (filter by email, examId)" },
    { method: "GET",  path: "/api/v1/results/:id",               desc: "Get a result by attempt ID" },
    { method: "POST", path: "/api/v1/credentials",               desc: "Issue a credential for a passed result" },
    { method: "GET",  path: "/api/v1/credentials/:credentialId", desc: "Get credential + verification URL" },
    { method: "GET",  path: "/api/v1/vouchers/:code",            desc: "Inspect a voucher without consuming it" },
    { method: "POST", path: "/api/v1/vouchers/validate",         desc: "Validate + optionally redeem a voucher" },
    { method: "GET",  path: "/api/v1/openapi.json",              desc: "OpenAPI 3.1 spec (public, no auth)" },
  ];

  const methodColor: Record<string, string> = { GET: "#059669", POST: "#2563eb", PUT: "#d97706", DELETE: "#dc2626" };

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>API Tokens</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage API keys for programmatic access to SDC Certifications data.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
          <Plus className="w-4 h-4" /> Generate Key
        </button>
      </div>

      {/* New key reveal banner */}
      {newKey && (
        <div className="p-5 rounded-2xl mb-6 border-2" style={{ background: "rgba(5,150,105,0.06)", borderColor: "rgba(5,150,105,0.3)" }}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(5,150,105,0.15)" }}>
              <Key className="w-4 h-4" style={{ color: "#059669" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm mb-1" style={{ color: "#059669" }}>API key created — copy it now</p>
              <p className="text-xs mb-3" style={{ color: "var(--sdc-subheading)" }}>This is the only time the full key will be shown. Store it securely in a password manager or environment variable.</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-lg font-mono text-xs break-all" style={{ background: "var(--sdc-card-bg)", color: "var(--sdc-heading)", border: "1px solid var(--sdc-card-border)" }}>{newKey}</code>
                <button onClick={copyNewKey} className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold text-xs" style={{ background: copiedNewKey ? "rgba(5,150,105,0.15)" : "#c8972a", color: copiedNewKey ? "#059669" : "#fff" }}>
                  {copiedNewKey ? <CheckCircle className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                  {copiedNewKey ? "Copied!" : "Copy Key"}
                </button>
                <button onClick={() => setNewKey(null)} className="flex-shrink-0 p-2 rounded-lg" style={{ color: "var(--sdc-text-muted)" }}><X className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="p-5 rounded-2xl mb-6" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <p className="font-bold text-sm mb-3" style={{ color: "var(--sdc-heading)" }}>Create New API Key</p>
          <div className="flex gap-3">
            <input value={keyName} onChange={e => setKeyName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleCreate()} placeholder="Key name (e.g., Production Integration)" className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)", background: "var(--sdc-page-bg)" }} />
            <button onClick={handleCreate} disabled={createKey.isPending || !keyName.trim()} className="px-5 py-2.5 rounded-xl font-bold text-sm disabled:opacity-50" style={{ background: "#c8972a", color: "#fff" }}>{createKey.isPending ? "Creating..." : "Create"}</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2.5 rounded-xl text-sm" style={{ border: "1px solid var(--sdc-card-border)", color: "var(--sdc-subheading)" }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Two-column layout: keys table + usage guide */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Keys table */}
        <div className="xl:col-span-2">
          <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>Your API Keys</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{keys.length} key{keys.length !== 1 ? "s" : ""} — rate limit 1,000 req/min per key</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                    {["Name", "Key Prefix", "Created", "Last Used", "Status", ""].map(h => (
                      <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keys.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                      <Key className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No API keys yet. Generate your first key above.</p>
                    </td></tr>
                  ) : keys.map((k: any) => (
                    <tr key={k.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                      <td className="px-5 py-3.5"><span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{k.name}</span></td>
                      <td className="px-5 py-3.5"><code className="font-mono text-xs px-2 py-0.5 rounded" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>{k.keyPrefix}•••</code></td>
                      <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{k.createdAt ? new Date(k.createdAt).toLocaleDateString() : "—"}</span></td>
                      <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : "Never"}</span></td>
                      <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: k.status !== "revoked" ? "rgba(5,150,105,0.1)" : "rgba(220,38,38,0.1)", color: k.status !== "revoked" ? "#059669" : "#dc2626" }}>{k.status !== "revoked" ? "Active" : "Revoked"}</span></td>
                      <td className="px-5 py-3.5">
                        {k.status !== "revoked" && (
                          <button onClick={() => { if (confirm(`Revoke "${k.name}"? This cannot be undone.`)) revokeKey.mutate({ id: k.id }); }} className="text-xs font-medium hover:underline" style={{ color: "#dc2626" }}>Revoke</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Usage guide sidebar */}
        <div className="space-y-4">
          {/* Authentication */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: "var(--sdc-heading)" }}>
              <Shield className="w-4 h-4" style={{ color: "#c8972a" }} /> Authentication
            </p>
            <p className="text-xs mb-3" style={{ color: "var(--sdc-subheading)", lineHeight: 1.6 }}>
              Include your API key in every request as a Bearer token in the <code className="px-1 py-0.5 rounded" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>Authorization</code> header.
            </p>
            <div className="rounded-lg p-3 font-mono text-xs overflow-x-auto" style={{ background: "rgba(0,0,0,0.35)", color: "#a3e635" }}>
              Authorization: Bearer sdc_live_...
            </div>
          </div>

          {/* Code examples */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p className="font-bold text-sm mb-3" style={{ color: "var(--sdc-heading)" }}>Quick Start</p>
            <div className="flex gap-1 mb-3">
              {(["curl", "js", "python"] as const).map(lang => (
                <button key={lang} onClick={() => setActiveGuide(lang)} className="px-3 py-1 rounded-lg text-xs font-bold transition-all" style={{ background: activeGuide === lang ? "#c8972a" : "rgba(200,151,42,0.1)", color: activeGuide === lang ? "#fff" : "#c8972a" }}>
                  {lang === "js" ? "Node.js" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
            <pre className="rounded-lg p-3 font-mono overflow-x-auto whitespace-pre-wrap" style={{ background: "rgba(0,0,0,0.35)", color: "#e2e8f0", fontSize: 11, lineHeight: 1.7 }}>{codeExamples[activeGuide]}</pre>
          </div>

          {/* Endpoints reference */}
          <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p className="font-bold text-sm mb-3" style={{ color: "var(--sdc-heading)" }}>Available Endpoints</p>
            <div className="space-y-2.5">
              {endpoints.map(ep => (
                <div key={ep.path} className="flex items-start gap-2">
                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-xs font-bold font-mono" style={{ background: `${methodColor[ep.method]}22`, color: methodColor[ep.method], minWidth: 36, textAlign: "center" }}>{ep.method}</span>
                  <div className="min-w-0">
                    <code className="text-xs" style={{ color: "var(--sdc-heading)" }}>{ep.path}</code>
                    <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{ep.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--sdc-card-border)" }}>
              <p className="text-xs" style={{ color: "var(--sdc-subheading)" }}>Base URL: <code className="font-mono" style={{ color: "#c8972a" }}>{baseUrl}/api/v1</code></p>
              <p className="text-xs mt-1" style={{ color: "var(--sdc-subheading)" }}>Rate limit: 1,000 req/min per key</p>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === "loading"}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs disabled:opacity-60 transition-all"
                style={{
                  background: testStatus === "ok" ? "rgba(5,150,105,0.12)" : testStatus === "error" ? "rgba(220,38,38,0.12)" : "rgba(200,151,42,0.12)",
                  color: testStatus === "ok" ? "#059669" : testStatus === "error" ? "#dc2626" : "#c8972a",
                  border: `1px solid ${testStatus === "ok" ? "rgba(5,150,105,0.3)" : testStatus === "error" ? "rgba(220,38,38,0.3)" : "rgba(200,151,42,0.3)"}`
                }}
              >
                {testStatus === "loading" ? "Testing..." : testStatus === "ok" ? "✓ Connected" : testStatus === "error" ? "✗ Failed" : "Test Connection"}
              </button>
              {testMsg && <p className="text-xs mt-2" style={{ color: testStatus === "ok" ? "#059669" : "#dc2626", lineHeight: 1.5 }}>{testMsg}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrgPaymentsTab() {
  const { data: stripeData } = trpc.stripe.history.useQuery();
  const { data: balanceData } = trpc.ledger.balance.useQuery();
  const payments = (stripeData as any) || [];
  const balance = (balanceData as any)?.balance ?? 0;
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Payments & Billing</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>View payment history and manage credits.</p>
        </div>
        <Link href="/org/buy-vouchers">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff" }}>
            <ShoppingCart className="w-4 h-4" /> Purchase Vouchers
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)" }}>Credit Balance</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "#c8972a", marginTop: 4 }}>{balance.toLocaleString()}</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)" }}>Total Spent</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "var(--sdc-heading)", marginTop: 4 }}>${payments.reduce((s: number, p: any) => s + ((p.amount || 0) / 100), 0).toFixed(2)}</p>
        </div>
        <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--sdc-subheading)" }}>Transactions</p>
          <p style={{ fontSize: 32, fontWeight: 800, color: "var(--sdc-heading)", marginTop: 4 }}>{payments.length}</p>
        </div>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Date", "Description", "Amount", "Credits", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No payment history yet.</td></tr>
            ) : payments.map((p: any, i: number) => (
              <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)", fontFamily: "monospace" }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</span></td>
                <td className="px-5 py-3.5"><span className="text-sm" style={{ color: "var(--sdc-text)" }}>{p.description || "Credit Purchase"}</span></td>
                <td className="px-5 py-3.5"><span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>${((p.amount || 0) / 100).toFixed(2)}</span></td>
                <td className="px-5 py-3.5"><span className="font-semibold text-sm" style={{ color: "#c8972a" }}>{p.credits || "—"}</span></td>
                <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: p.status === "succeeded" ? "rgba(5,150,105,0.1)" : "rgba(217,119,6,0.1)", color: p.status === "succeeded" ? "#059669" : "#d97706" }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function OrgAuditTab() {
  const { data: auditData } = trpc.audit.list.useQuery({ limit: 50 });
  const logs = (auditData as any)?.logs || [];
  const ACTION_COLORS: Record<string, string> = {
    issued: "#059669", revoked: "#dc2626", reissued: "#3b82f6",
    accessed: "#6b7280", downloaded: "#c8972a", login: "#8b5cf6",
    updated: "#0891b2", deleted: "#dc2626", invited: "#10b981",
  };
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="mb-6">
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Audit Log</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Track all actions within your organization.</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Time", "Actor", "Action", "Resource", "IP"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No audit records yet.</td></tr>
            ) : logs.slice(0, 25).map((log: any) => {
              const color = ACTION_COLORS[log.action] || "#6b7280";
              return (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)", fontFamily: "monospace" }}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm font-medium" style={{ color: "var(--sdc-text)" }}>{log.actorName || "System"}</span></td>
                  <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: `${color}15`, color }}>{log.action}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm" style={{ color: "var(--sdc-text)" }}>{log.resourceType} #{log.resourceId}</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-text-muted)", fontFamily: "monospace" }}>{log.ipAddress || "—"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}

function OrgNotificationsTab() {
  const { data: notifData } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation();
  const notifs = (notifData as any) || [];
  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Notifications</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Organization alerts and updates.</p>
        </div>
        {notifs.some((n: any) => !n.read) && (
          <button onClick={() => notifs.filter((n: any) => !n.read).forEach((n: any) => markRead.mutate({ id: n.id }))} className="px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>Mark All Read</button>
        )}
      </div>
      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <p className="font-semibold" style={{ color: "var(--sdc-text-muted)" }}>No notifications yet.</p>
          </div>
        ) : notifs.map((n: any) => (
          <div key={n.id} className="p-4 rounded-xl flex items-start gap-4 cursor-pointer transition-colors" style={{ background: n.read ? "var(--sdc-card-bg)" : "rgba(200,151,42,0.08)", border: n.read ? "1px solid var(--sdc-card-border)" : "1px solid rgba(200,151,42,0.25)" }}
            onClick={() => !n.read && markRead.mutate({ id: n.id })}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(200,151,42,0.1)" }}>
              <Bell className="w-5 h-5" style={{ color: "#c8972a" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{n.title}</p>
              <p style={{ fontSize: 13, color: "var(--sdc-subheading)", marginTop: 2 }}>{n.message}</p>
              <p style={{ fontSize: 11, color: "var(--sdc-text-muted)", marginTop: 4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
            </div>
            {!n.read && <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: "#c8972a" }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsTab() {
  const [, navigate] = useLocation();
  // ── Org Profile state ──────────────────────────────────────────────────
  const { data: myOrg, refetch: refetchOrg } = trpc.orgs.myOrg.useQuery();
  const org = myOrg as any;
  const [orgName, setOrgName] = useState("");
  const [orgIndustry, setOrgIndustry] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [orgPrimaryColor, setOrgPrimaryColor] = useState("#c8972a");
  const [orgSubdomain, setOrgSubdomain] = useState("");
  const [profileDirty, setProfileDirty] = useState(false);
  useEffect(() => {
    if (org) {
      setOrgName(org.name || "");
      setOrgIndustry(org.industry || "");
      setOrgSize(org.size || "");
      setOrgWebsite(org.website || "");
      setOrgLogoUrl(org.logoUrl || "");
      setOrgPrimaryColor(org.primaryColor || "#c8972a");
      setOrgSubdomain(org.subdomain || "");
    }
  }, [myOrg]);
  const updateOrgMutation = trpc.orgs.update.useMutation({
    onSuccess: () => { toast.success("Organisation profile saved"); setProfileDirty(false); refetchOrg(); },
    onError: (e: any) => toast.error(e.message || "Failed to save"),
  });
  // ── API Keys state ─────────────────────────────────────────────────────
  const { data: apiKeyData, refetch: refetchKeys } = trpc.apiKeys.list.useQuery();
  const apiKeyList = (apiKeyData as any[]) || [];
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const createKeyMutation = trpc.apiKeys.create.useMutation({
    onSuccess: (data: any) => {
      setCreatedKey(data.key);
      setNewKeyName("");
      refetchKeys();
      toast.success("API key created — copy it now, it won't be shown again");
    },
    onError: (e: any) => toast.error(e.message || "Failed to create key"),
  });
  const revokeKeyMutation = trpc.apiKeys.revoke.useMutation({
    onSuccess: () => { toast.success("Key revoked"); refetchKeys(); },
    onError: (e: any) => toast.error(e.message || "Failed to revoke"),
  });
  // ── Notification preferences state ────────────────────────────────────
  const [notifPrefs, setNotifPrefs] = useState({
    voucherRedeemed: true,
    credentialIssued: true,
    paymentReceived: true,
    examScheduled: false,
    weeklyDigest: true,
  });
  useEffect(() => {
    if (org?.notificationPrefs) {
      const prefs = org.notificationPrefs as any;
      setNotifPrefs({
        voucherRedeemed: prefs.voucherRedeemed ?? true,
        credentialIssued: prefs.credentialIssued ?? true,
        paymentReceived: prefs.paymentReceived ?? true,
        examScheduled: prefs.examScheduled ?? false,
        weeklyDigest: prefs.weeklyDigest ?? true,
      });
    }
  }, [myOrg]);
  const updateNotifPrefsMutation = trpc.orgs.updateNotificationPrefs.useMutation({
    onSuccess: () => toast.success("Notification preferences saved"),
    onError: (e: any) => toast.error(e.message || "Failed to save preferences"),
  });
  const NOTIF_ITEMS = [
    { key: "voucherRedeemed", label: "Voucher redeemed", desc: "When a candidate uses an exam voucher" },
    { key: "credentialIssued", label: "Credential issued", desc: "When a new credential is awarded" },
    { key: "paymentReceived", label: "Payment received", desc: "When a Stripe payment completes" },
    { key: "examScheduled", label: "Exam scheduled", desc: "When a candidate books an exam slot" },
    { key: "weeklyDigest", label: "Weekly digest email", desc: "Summary of activity every Monday" },
  ];
  function SectionHeader({ icon: Icon, color, title, desc }: { icon: any; color: string; title: string; desc: string }) {
    return (
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <p className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>{title}</p>
          <p style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{desc}</p>
        </div>
      </div>
    );
  }
  function SettingField({ label, value, onChange, type = "text", placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>{label}</label>
        <input type={type} value={value} onChange={e => { onChange(e.target.value); setProfileDirty(true); }} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
          onFocus={e => { e.currentTarget.style.borderColor = "#c8972a"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--sdc-card-border)"; }} />
        {hint && <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{hint}</p>}
      </div>
    );
  }
  const INDUSTRIES = ["Technology","Healthcare","Finance","Education","Manufacturing","Retail","Government","Non-profit","Consulting","Energy","Legal","Real Estate","Media","Transportation","Other"];
  const ORG_SIZES = ["1–10","11–50","51–200","201–500","501–1000","1000+"];
  return (
    <div className="p-8 space-y-6" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Organisation Settings</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage your organisation profile, API access, and notification preferences.</p>
      </div>

      {/* ── Section 1: Organisation Profile ── */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <SectionHeader icon={Settings} color="#c8972a" title="Organisation Profile" desc="Name, logo, domain, and branding" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SettingField label="Organisation Name" value={orgName} onChange={setOrgName} placeholder="Acme Corp" />
          <SettingField label="Website" value={orgWebsite} onChange={setOrgWebsite} placeholder="https://acme.com" type="url" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Industry</label>
            <select value={orgIndustry} onChange={e => { setOrgIndustry(e.target.value); setProfileDirty(true); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
              <option value="">Select industry</option>
              {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Organisation Size</label>
            <select value={orgSize} onChange={e => { setOrgSize(e.target.value); setProfileDirty(true); }}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
              <option value="">Select size</option>
              {ORG_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <SettingField label="Logo URL" value={orgLogoUrl} onChange={setOrgLogoUrl} placeholder="https://cdn.example.com/logo.png" hint="PNG or SVG, min 256×256px" />
          <SettingField label="Custom Subdomain" value={orgSubdomain} onChange={setOrgSubdomain} placeholder="acme" hint="acme.sdccertify.com" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Brand Colour</label>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <input type="color" value={orgPrimaryColor} onChange={e => { setOrgPrimaryColor(e.target.value); setProfileDirty(true); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
              <span className="text-sm font-mono" style={{ color: "var(--sdc-heading)" }}>{orgPrimaryColor}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-5 pt-5" style={{ borderTop: "1px solid var(--sdc-card-border)" }}>
          {profileDirty ? (
            <div className="flex items-center gap-2 text-xs" style={{ color: "#c8972a" }}>
              <AlertTriangle className="w-4 h-4" />
              Unsaved changes
            </div>
          ) : <div />}
          <button
            onClick={() => {
              if (!orgName.trim()) { toast.error("Organisation name is required"); return; }
              updateOrgMutation.mutate({ name: orgName.trim(), industry: orgIndustry || undefined, website: orgWebsite || "", size: orgSize || undefined, logoUrl: orgLogoUrl || undefined, primaryColor: orgPrimaryColor, subdomain: orgSubdomain || "" });
            }}
            disabled={updateOrgMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#c8972a", color: "#fff", opacity: updateOrgMutation.isPending ? 0.7 : 1 }}>
            {updateOrgMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Profile
          </button>
        </div>
      </div>

      {/* ── Section 2: Notification Preferences ── */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <SectionHeader icon={Bell} color="#10b981" title="Notification Preferences" desc="Choose which events trigger email alerts" />
        <div className="space-y-3">
          {NOTIF_ITEMS.map(({ key, label, desc }) => {
            const on = notifPrefs[key as keyof typeof notifPrefs];
            return (
              <div key={key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{label}</p>
                  <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{desc}</p>
                </div>
                <button onClick={() => setNotifPrefs(p => ({ ...p, [key]: !on }))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                  style={{ background: on ? "rgba(16,185,129,0.12)" : "rgba(107,114,128,0.1)", color: on ? "#10b981" : "#6b7280", border: `1px solid ${on ? "rgba(16,185,129,0.3)" : "rgba(107,114,128,0.2)"}` }}>
                  {on ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  {on ? "On" : "Off"}
                </button>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => updateNotifPrefsMutation.mutate(notifPrefs)}
            disabled={updateNotifPrefsMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#10b981", color: "#fff", opacity: updateNotifPrefsMutation.isPending ? 0.7 : 1 }}>
            {updateNotifPrefsMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Preferences
          </button>
        </div>
      </div>

      {/* ── Section 3: API Access ── */}
      <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <SectionHeader icon={Key} color="#8b5cf6" title="API Access" desc="Manage API keys for third-party integrations" />
        {/* Create new key */}
        <div className="flex items-center gap-3 mb-5">
          <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key name (e.g. LMS Integration)"
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
            style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#8b5cf6"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "var(--sdc-card-border)"; }}
            onKeyDown={e => { if (e.key === "Enter" && newKeyName.trim()) createKeyMutation.mutate({ name: newKeyName.trim() }); }} />
          <button onClick={() => { if (!newKeyName.trim()) { toast.error("Enter a key name"); return; } createKeyMutation.mutate({ name: newKeyName.trim() }); }}
            disabled={createKeyMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#8b5cf6", color: "#fff", opacity: createKeyMutation.isPending ? 0.7 : 1 }}>
            {createKeyMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Generate Key
          </button>
        </div>
        {/* Newly created key banner */}
        {createdKey && (
          <div className="flex items-center gap-3 p-4 rounded-xl mb-4" style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.3)" }}>
            <Key className="w-4 h-4 shrink-0" style={{ color: "#8b5cf6" }} />
            <code className="flex-1 text-xs font-mono break-all" style={{ color: "var(--sdc-heading)" }}>{createdKey}</code>
            <button onClick={() => { navigator.clipboard.writeText(createdKey); setCopiedKey(true); setTimeout(() => setCopiedKey(false), 2000); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: copiedKey ? "rgba(16,185,129,0.1)" : "rgba(139,92,246,0.15)", color: copiedKey ? "#10b981" : "#8b5cf6" }}>
              {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey ? "Copied!" : "Copy"}
            </button>
            <button onClick={() => setCreatedKey(null)} className="p-1.5 rounded-lg" style={{ color: "var(--sdc-text-muted)" }}><X className="w-4 h-4" /></button>
          </div>
        )}
        {/* Existing keys */}
        {apiKeyList.length === 0 ? (
          <p className="text-sm text-center py-6" style={{ color: "var(--sdc-text-muted)" }}>No API keys yet. Generate one above.</p>
        ) : (
          <div className="space-y-2">
            {apiKeyList.map((k: any) => (
              <div key={k.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(139,92,246,0.1)" }}>
                  <Key className="w-4 h-4" style={{ color: "#8b5cf6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{k.name}</p>
                  <p className="text-xs font-mono" style={{ color: "var(--sdc-text-muted)" }}>{k.keyPrefix}••••••••••••</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: k.status === "active" ? "rgba(16,185,129,0.1)" : "rgba(220,38,38,0.1)", color: k.status === "active" ? "#10b981" : "#ef4444" }}>{k.status}</span>
                {k.status === "active" && (
                  <button onClick={() => { if (confirm(`Revoke key "${k.name}"?`)) revokeKeyMutation.mutate({ id: k.id }); }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold"
                    style={{ background: "rgba(220,38,38,0.08)", color: "#ef4444", border: "1px solid rgba(220,38,38,0.2)" }}>
                    <Trash2 className="w-3.5 h-3.5" /> Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 4: Quick Links ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { title: "Team & Permissions", desc: "Roles, invitations, and access control", icon: Shield, color: "#3b82f6", href: "/org/team" },
          { title: "Billing & Credits", desc: "Subscription, invoices, and top-ups", icon: CreditCard, color: "#f59e0b", href: "/org/billing" },
          { title: "Integrations", desc: "LMS, HRIS, and external systems", icon: Globe, color: "#06b6d4", href: "/org/integrations" },
        ].map(({ title, desc, icon: Icon, color, href }) => (
          <Link key={title} href={href}>
            <div className="p-5 rounded-2xl cursor-pointer transition-all group"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = `${color}40`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--sdc-card-border)"; }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{title}</p>
                  <p style={{ fontSize: 12, color: "var(--sdc-subheading)", marginTop: 1 }}>{desc}</p>
                </div>
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color }} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Edit Profile Tab ───────────────────────────────────────────────────────

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Government", "Non-profit", "Consulting", "Energy",
  "Legal", "Real Estate", "Media", "Transportation", "Other",
];
const ORG_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

function EditProfileTab() {
  const { data: myOrg, refetch } = trpc.orgs.myOrg.useQuery();
  const org = myOrg as any;

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [website, setWebsite] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#c8972a");
  const [subdomain, setSubdomain] = useState("");
  const [dirty, setDirty] = useState(false);

  // Pre-fill from org data
  useEffect(() => {
    if (org) {
      setName(org.name || "");
      setIndustry(org.industry || "");
      setSize(org.size || "");
      setWebsite(org.website || "");
      setLogoUrl(org.logoUrl || "");
      setPrimaryColor(org.primaryColor || "#c8972a");
      setSubdomain(org.subdomain || "");
    }
  }, [myOrg]);

  const updateMutation = trpc.orgs.update.useMutation({
    onSuccess: () => {
      toast.success("Organisation profile updated");
      setDirty(false);
      refetch();
    },
    onError: (e: any) => toast.error(e.message || "Failed to update profile"),
  });

  function handleSave() {
    if (!name.trim()) { toast.error("Organisation name is required"); return; }
    updateMutation.mutate({ name: name.trim(), industry: industry || undefined, website: website || "", size: size || undefined, logoUrl: logoUrl || undefined, primaryColor, subdomain: subdomain || "" });
  }

  function Field({ label, value, onChange, type = "text", placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; hint?: string }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>{label}</label>
        <input type={type} value={value} onChange={e => { onChange(e.target.value); setDirty(true); }} placeholder={placeholder}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
          onFocus={e => { e.currentTarget.style.borderColor = "#c8972a"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "var(--sdc-card-border)"; }} />
        {hint && <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{hint}</p>}
      </div>
    );
  }

  if (!org) {
    return (
      <div className="p-8">
        <div className="flex flex-col gap-4 max-w-2xl">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl bg-[var(--sdc-skeleton-base)]" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" style={{ background: "var(--sdc-page-bg)", minHeight: "100vh" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "var(--sdc-heading)" }}>Edit Organisation Profile</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Update your organisation's public profile and branding.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending || !dirty}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "#c8972a" }}>
          {updateMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: main fields */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Identity */}
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Building2 className="w-4 h-4" style={{ color: "#c8972a" }} />
              <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>Organisation Identity</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Organisation Name *" value={name} onChange={setName} placeholder="Acme Corp" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Industry</label>
                  <select value={industry} onChange={e => { setIndustry(e.target.value); setDirty(true); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Organisation Size</label>
                  <select value={size} onChange={e => { setSize(e.target.value); setDirty(true); }}
                    className="w-full px-4 py-2.5 rounded-xl text-sm outline-none"
                    style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                    <option value="">Select size</option>
                    {ORG_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Website" value={website} onChange={setWebsite} placeholder="https://acmecorp.com" hint="Your public website URL" />
            </div>
          </div>

          {/* Branding */}
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-4 h-4" style={{ color: "#3b82f6" }} />
              <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>Branding & Customisation</span>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Field label="Logo URL" value={logoUrl} onChange={setLogoUrl} placeholder="https://cdn.example.com/logo.png" hint="Direct URL to your organisation logo (PNG/SVG recommended)" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--sdc-text-muted)" }}>Brand Colour</label>
                  <div className="flex items-center gap-3 px-4 py-2 rounded-xl" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                    <input type="color" value={primaryColor} onChange={e => { setPrimaryColor(e.target.value); setDirty(true); }} className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
                    <span className="text-sm font-mono" style={{ color: "var(--sdc-heading)" }}>{primaryColor}</span>
                  </div>
                </div>
                <Field label="Custom Subdomain" value={subdomain} onChange={setSubdomain} placeholder="acme" hint="acme.sdccertify.com" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview card */}
        <div className="flex flex-col gap-5">
          <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-4" style={{ color: "var(--sdc-text-muted)" }}>Profile Preview</p>
            <div className="flex flex-col items-center gap-3 py-4">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-contain" style={{ border: "1px solid var(--sdc-card-border)" }} />
              ) : (
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white" style={{ background: primaryColor }}>
                  {(name || "O")[0].toUpperCase()}
                </div>
              )}
              <div className="text-center">
                <p className="font-bold text-base" style={{ color: "var(--sdc-heading)" }}>{name || "Organisation Name"}</p>
                {industry && <p className="text-xs mt-0.5" style={{ color: "var(--sdc-text-muted)" }}>{industry}</p>}
                {size && <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{size} employees</p>}
                {website && <a href={website} target="_blank" rel="noopener noreferrer" className="text-xs mt-1 flex items-center gap-1 justify-center" style={{ color: primaryColor }}><Globe className="w-3 h-3" />{website.replace(/^https?:\/\//, "")}</a>}
              </div>
            </div>
            <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--sdc-card-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Plan</span>
                <span className="ml-auto text-xs font-bold capitalize" style={{ color: "#c8972a" }}>{org.plan?.replace("_", " ") || "Starter"}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Status</span>
                <span className="ml-auto text-xs font-bold" style={{ color: org.status === "active" ? "#10b981" : "#f59e0b" }}>{org.status || "Trial"}</span>
              </div>
            </div>
          </div>

          {dirty && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "rgba(200,151,42,0.08)", border: "1px solid rgba(200,151,42,0.25)" }}>
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#c8972a" }} />
              <p className="text-xs" style={{ color: "var(--sdc-subheading)" }}>You have unsaved changes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const TAB_MAP: Record<string, string> = {
  "/org": "dashboard", "/org/dashboard": "dashboard",
  "/org/credentials": "credentials", "/org/vouchers": "vouchers",
  "/org/team": "team", "/org/users": "team",
  "/org/candidates": "candidates",
  "/org/certifications": "certifications",
  "/org/tokens": "tokens",
  "/org/billing": "payments", "/org/payments": "payments",
  "/org/audit": "audit",
  "/org/notifications": "notifications",
  "/org/analytics": "analytics", "/org/settings": "settings",
  "/org/profile": "profile",
};
// ─── Onboarding Progress Banner ──────────────────────────────────────────────
function OnboardingBanner({ onDismiss }: { onDismiss: () => void }) {
  const { data: state } = trpc.onboarding.getState.useQuery();
  const s = state as any;
  if (!s || s.completed) return null;
  const step = s.step || 1;
  const total = 5;
  const pct = Math.round(((step - 1) / total) * 100);
  return (
    <div className="mx-8 mt-6 px-5 py-4 rounded-2xl flex items-center gap-4" style={{ background: "rgba(200,151,42,0.08)", border: "1px solid rgba(200,151,42,0.3)" }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(200,151,42,0.15)" }}>
        <AlertTriangle className="w-5 h-5" style={{ color: "#c8972a" }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm mb-1" style={{ color: "var(--sdc-heading)" }}>Complete Your Organisation Setup</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--sdc-card-border)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: "#c8972a" }} />
          </div>
          <span className="text-xs font-semibold flex-shrink-0" style={{ color: "var(--sdc-text-muted)" }}>Step {step} of {total}</span>
        </div>
      </div>
      <a href="/onboarding" className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white flex-shrink-0 transition-opacity hover:opacity-90" style={{ background: "#c8972a" }}>
        Continue Setup <ArrowRight className="w-4 h-4" />
      </a>
      <button onClick={onDismiss} className="flex-shrink-0 p-1 rounded-lg transition-opacity hover:opacity-70" style={{ color: "var(--sdc-text-muted)" }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function OrgPortal() {
  const [location, navigate] = useLocation();
  const { data: myOrg } = trpc.orgs.myOrg.useQuery();
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Redirect to onboarding only if org explicitly has not completed setup AND has no name
  // (guards against redirecting demo/seeded orgs that have data but flag not set)
  useEffect(() => {
    if (myOrg && !(myOrg as any).onboardingCompleted && !(myOrg as any).name) {
      navigate("/onboarding");
    }
  }, [myOrg]);
  const activeTab = Object.entries(TAB_MAP).find(([path]) =>
    path === "/org" ? location === "/org" : location.startsWith(path)
  )?.[1] || "dashboard";
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "credentials": return <CredentialsTab />;
      case "vouchers": return <VoucherManagement />;
      case "candidates": return <CandidatesTab />;
      case "certifications": return <CertificationsTab />;
      case "team": return <TeamTab />;
      case "tokens": return <ApiTokensTab />;
      case "payments": return <OrgPaymentsTab />;
      case "audit": return <OrgAuditTab />;
      case "notifications": return <OrgNotificationsTab />;
      case "settings": return <SettingsTab />;
      case "analytics": return <DashboardTab />;
      case "profile": return <EditProfileTab />;
      default: return <DashboardTab />;
    }
  };
  return (
    <SDCLayout>
      {!bannerDismissed && <OnboardingBanner onDismiss={() => setBannerDismissed(true)} />}
      {renderContent()}
    </SDCLayout>
  );
}
