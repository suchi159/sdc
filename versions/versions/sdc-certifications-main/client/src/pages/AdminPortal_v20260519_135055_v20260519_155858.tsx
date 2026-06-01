import { useState, useEffect } from "react";
import React from "react";
import OrganizationsPage from "./Organizations";
import { useLocation, Link } from "wouter";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Award, CheckCircle, Clock, XCircle, TrendingUp, DollarSign,
  Coins, Building2, Users, Search, Eye, RefreshCw, Download,
  Plus, ChevronRight, BarChart3, Activity, Shield, Globe, Bell,
  Settings, FileText, Key, CreditCard, Zap, UserX, UserCheck, Ban,
  Mail, Copy, Link2, X, Loader2
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Mock chart data ──────────────────────────────────────────────────────────
const MONTHLY_CREDS = [
  { month: "Oct", issued: 142 }, { month: "Nov", issued: 189 },
  { month: "Dec", issued: 167 }, { month: "Jan", issued: 221 },
  { month: "Feb", issued: 198 }, { month: "Mar", issued: 256 },
];
const PLAN_DIST = [
  { name: "Enterprise", value: 8, color: "#8b5cf6" },
  { name: "Professional", value: 22, color: "#c8972a" },
  { name: "Starter", value: 31, color: "#3b82f6" },
  { name: "Free", value: 15, color: "#6b7280" },
];
const RECENT_ACTIVITY = [
  { id: 1, org: "TechCorp Inc.", action: "issued", credential: "AWS Solutions Architect", time: "2 min ago", color: "#059669" },
  { id: 2, org: "MedGroup", action: "revoked", credential: "CPHS Certification", time: "18 min ago", color: "#dc2626" },
  { id: 3, org: "StartupHub", action: "reissued", credential: "Data Analytics Pro", time: "1 hr ago", color: "#3b82f6" },
  { id: 4, org: "EduLearn", action: "issued", credential: "Project Management", time: "2 hr ago", color: "#059669" },
  { id: 5, org: "FinanceFirst", action: "issued", credential: "CFA Level I", time: "3 hr ago", color: "#059669" },
];

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "var(--sdc-notif-bg)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 12px" }}>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>{label}</p>
      <p style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{payload[0]?.value?.toLocaleString()}</p>
    </div>
  );
};

// ─── Tab components ───────────────────────────────────────────────────────────

function DashboardTab() {
  const { data: analytics } = trpc.analytics.overview.useQuery();

  const credStats = [
    { label: "Total Issued", value: analytics?.totalCredentials ?? 1247, icon: Award, color: "#c8972a", bg: "rgba(200,151,42,0.1)", trend: null },
    { label: "Active Credentials", value: analytics?.activeCredentials ?? 1089, icon: CheckCircle, color: "#059669", bg: "rgba(5,150,105,0.1)", trend: "+12%" },
    { label: "Expiring in 60 Days", value: analytics?.expiringCredentials ?? 43, icon: Clock, color: "#d97706", bg: "rgba(217,119,6,0.1)", trend: null },
    { label: "Revoked", value: analytics?.revokedCredentials ?? 115, icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,0.1)", trend: null },
  ];
  const revenueStats = [
    { label: "Total Revenue", value: "$138,400", icon: DollarSign, color: "#c8972a", bg: "rgba(200,151,42,0.1)", sub: "All-time gross", trend: null },
    { label: "Monthly Recurring", value: "$28,900", icon: TrendingUp, color: "#059669", bg: "rgba(5,150,105,0.1)", sub: "Active subscriptions", trend: "+14%" },
    { label: "Tokens Sold", value: "8,420", icon: Coins, color: "#8b5cf6", bg: "rgba(139,92,246,0.1)", sub: "This month", trend: "+8%" },
    { label: "Pending Payments", value: "3", icon: Clock, color: "#d97706", bg: "rgba(217,119,6,0.1)", sub: "Awaiting settlement", trend: null },
  ];

  const StatCard = ({ s }: { s: { label: string; value: string | number; icon: any; color: string; bg: string; trend: string | null; sub?: string } }) => {
    const Icon = s.icon;
    return (
      <div className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: s.bg, border: `1px solid ${s.color}30` }}>
            <Icon className="w-5 h-5" style={{ color: s.color }} />
          </div>
          {s.trend && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>{s.trend}</span>
          )}
        </div>
        <p className="font-extrabold" style={{ fontSize: 28, color: "var(--sdc-heading)", lineHeight: 1.1 }}>
          {typeof s.value === "number" ? s.value.toLocaleString() : s.value}
        </p>
        <p className="mt-1 font-semibold" style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{s.label}</p>
      </div>
    );
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="font-extrabold tracking-tight" style={{ fontSize: 32, color: "var(--sdc-heading)", letterSpacing: "-0.02em" }}>Platform Overview</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 15, marginTop: 4 }}>Real-time metrics across all organizations and credentials.</p>
      </div>

      <div>
        <p className="font-bold mb-4" style={{ color: "var(--sdc-heading)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>Credential Metrics</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {credStats.map(s => <StatCard key={s.label} s={s} />)}
        </div>
      </div>

      <div>
        <p className="font-bold mb-4" style={{ color: "var(--sdc-heading)", fontSize: 13, textTransform: "uppercase", letterSpacing: "0.08em" }}>Revenue & Billing</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {revenueStats.map(s => <StatCard key={s.label} s={s} />)}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Credentials Issued</h3>
              <p style={{ color: "var(--sdc-subheading)", fontSize: 12, marginTop: 2 }}>Last 6 months</p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>+14% vs last period</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY_CREDS}>
              <defs>
                <linearGradient id="credGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8972a" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#c8972a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="issued" stroke="#c8972a" strokeWidth={2.5} fill="url(#credGrad)" dot={{ fill: "#c8972a", r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <h3 className="font-bold mb-4" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Plan Distribution</h3>
          <div className="flex justify-center mb-4">
            <PieChart width={160} height={160}>
              <Pie data={PLAN_DIST} cx={75} cy={75} innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {PLAN_DIST.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
            </PieChart>
          </div>
          <div className="space-y-2">
            {PLAN_DIST.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span style={{ fontSize: 12, color: "var(--sdc-text)", fontWeight: 600 }}>{p.name}</span>
                </div>
                <span style={{ fontSize: 12, color: "var(--sdc-heading)", fontWeight: 700 }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold" style={{ color: "var(--sdc-heading)", fontSize: 15 }}>Recent Activity</h3>
          <Link href="/admin/audit">
            <span className="text-xs font-semibold flex items-center gap-1 cursor-pointer" style={{ color: "#c8972a" }}>
              View all <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </Link>
        </div>
        <div className="space-y-3">
          {RECENT_ACTIVITY.map(a => (
            <div key={a.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: "var(--sdc-card-border)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}>
                <Award className="w-4 h-4" style={{ color: a.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: "var(--sdc-heading)" }}>
                  <span style={{ color: "var(--sdc-subheading)" }}>{a.org}</span> {a.action} <span className="font-bold">{a.credential}</span>
                </p>
              </div>
              <span style={{ fontSize: 11, color: "var(--sdc-text-muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{a.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrganizationsTab() {
  // Delegated to OrganizationsPage — this stub exists only for the TAB_MAP switch
  return <OrganizationsPage />;
}
function _OrganizationsTabLegacy() {
  const { data: orgsData, refetch, isLoading: orgsLoading } = trpc.orgs.list.useQuery({});
  const { data: invitesData, refetch: refetchInvites } = trpc.orgInvites.list.useQuery();
  const [search, setSearch] = useState("");
  const [planModal, setPlanModal] = useState<{ orgId: number; current: string } | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showInvitesPanel, setShowInvitesPanel] = useState(false);
  const [inviteForm, setInviteForm] = useState({ orgName: "", orgEmail: "", orgIndustry: "", plan: "starter" as const, notes: "", expiryDays: 7 });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const invites = (invitesData as any[]) || [];

  const createInviteMutation = trpc.orgInvites.create.useMutation({
    onSuccess: (data) => {
      const link = `${window.location.origin}/org/onboard?token=${data.token}`;
      setGeneratedLink(link);
      refetchInvites();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const cancelInviteMutation = trpc.orgInvites.cancel.useMutation({
    onSuccess: () => { toast.success("Invite cancelled"); refetchInvites(); },
    onError: (e: any) => toast.error(e.message),
  });
  const orgs = (orgsData as any) || [];
  const filtered = orgs.filter((o: any) =>
    o.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.domain?.toLowerCase().includes(search.toLowerCase())
  );
  const PLAN_COLORS: Record<string, { bg: string; border: string; text: string }> = {
    free: { bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.3)", text: "#6b7280" },
    starter: { bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)", text: "#3b82f6" },
    professional: { bg: "rgba(200,151,42,0.12)", border: "rgba(200,151,42,0.3)", text: "#c8972a" },
    enterprise: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#8b5cf6" },
    api_saas: { bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)", text: "#8b5cf6" },
  };
  const suspendMutation = trpc.orgs.suspend.useMutation({
    onSuccess: () => { toast.success("Organization suspended"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const activateMutation = trpc.orgs.activate.useMutation({
    onSuccess: () => { toast.success("Organization activated"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const updatePlanMutation = trpc.orgs.updatePlan.useMutation({
    onSuccess: () => { toast.success("Plan updated"); refetch(); setPlanModal(null); },
    onError: (e: any) => toast.error(e.message),
  });
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Organizations</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Manage all registered organizations on the platform.</p>
        </div>
         <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
            style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}
            onClick={() => setShowInvitesPanel(v => !v)}>
            <Link2 className="w-4 h-4" /> {showInvitesPanel ? "Hide Invites" : "View Invites"}
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#c8972a", color: "#ffffff" }}
            onClick={() => { setGeneratedLink(null); setInviteForm({ orgName: "", orgEmail: "", orgIndustry: "", plan: "starter", notes: "", expiryDays: 7 }); setShowInviteModal(true); }}>
            <Mail className="w-4 h-4" /> Invite Organisation
          </button>
        </div>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search organizations..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
      </div>
      {/* ── Invite modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: "rgba(0,0,0,0.55)" }}>
          <div className="w-full max-w-lg rounded-2xl p-7" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: "var(--sdc-heading)" }}>Invite Organisation</h3>
              <button onClick={() => setShowInviteModal(false)} style={{ color: "var(--sdc-text-muted)" }}><X className="w-5 h-5" /></button>
            </div>
            {!generatedLink ? (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--sdc-text-muted)" }}>Org Name (optional)</label>
                    <input value={inviteForm.orgName} onChange={e => setInviteForm(f => ({ ...f, orgName: e.target.value }))} placeholder="Acme Corp" className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--sdc-text-muted)" }}>Contact Email (optional)</label>
                    <input value={inviteForm.orgEmail} onChange={e => setInviteForm(f => ({ ...f, orgEmail: e.target.value }))} placeholder="admin@acme.com" type="email" className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--sdc-text-muted)" }}>Plan</label>
                    <select value={inviteForm.plan} onChange={e => setInviteForm(f => ({ ...f, plan: e.target.value as any }))} className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}>
                      {["starter","professional","enterprise","api_saas"].map(p => <option key={p} value={p}>{p.replace("_"," ")}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold" style={{ color: "var(--sdc-text-muted)" }}>Expires in (days)</label>
                    <input type="number" min={1} max={30} value={inviteForm.expiryDays} onChange={e => setInviteForm(f => ({ ...f, expiryDays: Number(e.target.value) }))} className="px-3 py-2 rounded-xl text-sm outline-none" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold" style={{ color: "var(--sdc-text-muted)" }}>Notes (visible to admin only)</label>
                  <textarea value={inviteForm.notes} onChange={e => setInviteForm(f => ({ ...f, notes: e.target.value }))} rows={2} placeholder="e.g. Enterprise pilot, 3-month trial" className="px-3 py-2 rounded-xl text-sm outline-none resize-none" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setShowInviteModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}>Cancel</button>
                  <button
                    onClick={() => createInviteMutation.mutate({ orgName: inviteForm.orgName || undefined, orgEmail: inviteForm.orgEmail || undefined, plan: inviteForm.plan, notes: inviteForm.notes || undefined, expiryDays: inviteForm.expiryDays })}
                    disabled={createInviteMutation.isPending}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: "#c8972a" }}>
                    {createInviteMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Mail className="w-4 h-4" /> Generate Invite Link</>}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(200,151,42,0.12)" }}>
                    <CheckCircle className="w-7 h-7" style={{ color: "#c8972a" }} />
                  </div>
                  <p className="font-bold text-lg" style={{ color: "var(--sdc-heading)" }}>Invite Link Generated</p>
                  <p className="text-sm text-center" style={{ color: "var(--sdc-text-muted)" }}>Share this link with the organisation. It expires in {inviteForm.expiryDays} day{inviteForm.expiryDays !== 1 ? "s" : ""}.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                  <p className="flex-1 text-xs font-mono truncate" style={{ color: "var(--sdc-subheading)" }}>{generatedLink}</p>
                  <button onClick={() => { navigator.clipboard.writeText(generatedLink!); toast.success("Copied!"); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "#c8972a", color: "#fff" }}>
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>
                <button onClick={() => setShowInviteModal(false)} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Invites panel ── */}
      {showInvitesPanel && (
        <div className="mb-6 rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
            <div className="flex items-center gap-2">
              <Link2 className="w-4 h-4" style={{ color: "#c8972a" }} />
              <span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>Organisation Invites</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(200,151,42,0.12)", color: "#c8972a" }}>{invites.length} total</span>
          </div>
          {invites.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm" style={{ color: "var(--sdc-text-muted)" }}>No invites yet. Generate one above.</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  {["Organisation","Plan","Status","Expires","Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invites.map((inv: any) => {
                  const isPending = inv.status === "pending";
                  const isExpired = inv.status === "expired" || new Date() > new Date(inv.expiresAt);
                  const statusColor = inv.status === "accepted" ? "#10b981" : isExpired ? "#6b7280" : inv.status === "cancelled" ? "#dc2626" : "#c8972a";
                  return (
                    <tr key={inv.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{inv.orgName || "—"}</p>
                        <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{inv.orgEmail || "No email"}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-bold capitalize" style={{ color: "var(--sdc-subheading)" }}>{inv.plan?.replace("_"," ")}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize" style={{ background: `${statusColor}18`, color: statusColor }}>{isExpired && isPending ? "expired" : inv.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{new Date(inv.expiresAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          {isPending && !isExpired && (
                            <button onClick={() => { const link = `${window.location.origin}/org/onboard?token=${inv.token}`; navigator.clipboard.writeText(link); toast.success("Link copied!"); }} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a" }}>
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                          {isPending && (
                            <button onClick={() => { if (confirm("Cancel this invite?")) cancelInviteMutation.mutate({ id: inv.id }); }} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Plan change modal */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-80" style={{ background: "var(--sdc-card-bg)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--sdc-heading)" }}>Change Plan</h3>
            <div className="space-y-2 mb-4">
              {(["starter", "professional", "enterprise", "api_saas"] as const).map(p => (
                <button key={p} onClick={() => updatePlanMutation.mutate({ orgId: planModal.orgId, plan: p })}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-bold capitalize text-left"
                  style={{ background: p === planModal.current ? "#c8972a" : "var(--sdc-page-bg)", color: p === planModal.current ? "#fff" : "var(--sdc-heading)", border: "1px solid var(--sdc-card-border)" }}>
                  {p.replace("_", " ")}
                </button>
              ))}
            </div>
            <button onClick={() => setPlanModal(null)} className="w-full px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}>Cancel</button>
          </div>
        </div>
      )}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Organization", "Plan", "Credits", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orgsLoading ? (
              <>
                {[1,2,3,4,5].map(i => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-3.5 w-32 bg-[var(--sdc-skeleton-base)]" />
                          <Skeleton className="h-3 w-24 bg-[var(--sdc-skeleton-base)]" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3.5 w-12 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-16 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <Skeleton className="h-7 w-16 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                        <Skeleton className="h-7 w-20 rounded-lg bg-[var(--sdc-skeleton-base)]" />
                      </div>
                    </td>
                  </tr>
                ))}
              </>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                No organizations found
              </td></tr>
            ) : filtered.map((org: any) => {
              const plan = org.plan || "starter";
              const pc = PLAN_COLORS[plan] || PLAN_COLORS.starter;
              const isSuspended = org.status === "suspended";
              return (
                <tr key={org.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: "#c8972a", fontSize: 13 }}>
                        {(org.name || "O")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{org.name}</p>
                        <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{org.domain || org.slug || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setPlanModal({ orgId: org.id, current: plan })}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize hover:opacity-80 transition-opacity"
                      style={{ background: pc.bg, border: `1px solid ${pc.border}`, color: pc.text }}>{plan.replace("_", " ")}</button>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{org.creditBalance ?? 0}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold"
                      style={{ background: isSuspended ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)", color: isSuspended ? "#dc2626" : "#10b981" }}>
                      {isSuspended ? "Suspended" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {isSuspended ? (
                        <button onClick={() => activateMutation.mutate({ orgId: org.id })}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                          Activate
                        </button>
                      ) : (
                        <button onClick={() => { if (confirm(`Suspend ${org.name}?`)) suspendMutation.mutate({ orgId: org.id }); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
                          Suspend
                        </button>
                      )}
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

function CandidatesTab() {
  const { data: credsData, isLoading } = trpc.credentials.list.useQuery(undefined as any);
  const [search, setSearch] = useState("");
  const rawCreds = Array.isArray(credsData) ? credsData : [];
  // Normalize the joined result: each row has { cred, template, holder }
  const creds = rawCreds.map((row: any) => ({
    id: row.cred?.id || row.id,
    credentialId: row.cred?.credentialId || row.credentialId,
    status: row.cred?.status || row.status || "active",
    issueDate: row.cred?.issueDate || row.issueDate,
    expiryDate: row.cred?.expiryDate || row.expiryDate,
    recipientName: row.holder?.name || row.recipientName || "Unknown",
    recipientEmail: row.holder?.email || row.recipientEmail || "—",
    title: row.template?.name || row.title || "—",
  }));
  const filtered = creds.filter((c: any) =>
    c.recipientName?.toLowerCase().includes(search.toLowerCase()) ||
    c.recipientEmail?.toLowerCase().includes(search.toLowerCase()) ||
    c.credentialId?.toLowerCase().includes(search.toLowerCase())
  );
  const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
    active: { color: "#16a34a", bg: "rgba(22,163,74,0.1)" },
    expired: { color: "#6b7280", bg: "rgba(107,114,128,0.1)" },
    revoked: { color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
    suspended: { color: "#d97706", bg: "rgba(217,119,6,0.1)" },
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Candidates</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>All credential holders across the platform.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-text)" }}>
          <Download className="w-4 h-4" /> Export
        </button>
      </div>
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, or credential ID..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Candidate", "Credential ID", "Certification", "Issued", "Expires", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                {isLoading ? "Loading credentials..." : creds.length === 0 ? "No credentials issued yet" : "No candidates found"}
              </td></tr>
            ) : filtered.slice(0, 20).map((c: any) => {
              const sc = STATUS_CONFIG[c.status] || STATUS_CONFIG.active;
              return (
                <tr key={c.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold" style={{ background: "var(--sdc-sidebar-bg)", fontSize: 11 }}>
                        {(c.recipientName || "C")[0]?.toUpperCase() || "C"}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{c.recipientName}</p>
                        <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{c.recipientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="font-mono text-xs" style={{ color: "var(--sdc-subheading)" }}>{c.credentialId}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-medium" style={{ color: "var(--sdc-text)" }}>{c.title}</span></td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{c.issueDate ? new Date(c.issueDate).toLocaleDateString() : "—"}</span></td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : "Never"}</span></td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: sc.bg, color: sc.color }}>{c.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
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
  );
}

function AuditTab() {
  const { data: auditData } = trpc.audit.list.useQuery({ limit: 50 });
  const logs = (auditData as any)?.logs || [];
  const ACTION_COLORS: Record<string, string> = {
    issued: "#059669", revoked: "#dc2626", reissued: "#3b82f6",
    accessed: "#6b7280", downloaded: "#c8972a", login: "#8b5cf6",
    updated: "#0891b2", deleted: "#dc2626",
  };
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Audit Log</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Immutable record of all platform actions.</p>
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Time", "Actor", "Action", "Resource", "IP"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>Loading audit logs...</td></tr>
            ) : logs.slice(0, 25).map((log: any) => {
              const color = ACTION_COLORS[log.action] || "#6b7280";
              return (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)", fontFamily: "monospace" }}>{log.createdAt ? new Date(log.createdAt).toLocaleString() : "—"}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm font-medium" style={{ color: "var(--sdc-text)" }}>{log.actorName || "System"}</span></td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: `${color}15`, color }}>{log.action}</span>
                  </td>
                  <td className="px-5 py-3.5"><span className="text-sm" style={{ color: "var(--sdc-text)" }}>{log.resourceType} #{log.resourceId}</span></td>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-text-muted)", fontFamily: "monospace" }}>{log.ipAddress || "—"}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentsTab() {
  const { data: stripeData } = trpc.stripe.history.useQuery();
  const payments = (stripeData as any) || [];
  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    succeeded: { bg: "rgba(5,150,105,0.1)", color: "#059669" },
    pending: { bg: "rgba(217,119,6,0.1)", color: "#d97706" },
    failed: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
    refunded: { bg: "rgba(107,114,128,0.1)", color: "#6b7280" },
  };
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Platform Payments</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>All Stripe transactions across the platform.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Revenue", value: `$${payments.reduce((s: number, p: any) => s + (p.amount || 0), 0).toLocaleString()}`, icon: DollarSign, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
          { label: "Transactions", value: payments.length, icon: CreditCard, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "Successful", value: payments.filter((p: any) => p.status === "succeeded").length, icon: CheckCircle, color: "#059669", bg: "rgba(5,150,105,0.1)" },
          { label: "Failed", value: payments.filter((p: any) => p.status === "failed").length, icon: XCircle, color: "#dc2626", bg: "rgba(220,38,38,0.1)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="font-extrabold" style={{ fontSize: 24, color: "var(--sdc-heading)" }}>{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
            <p style={{ fontSize: 12, color: "var(--sdc-subheading)", fontWeight: 600, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Date", "Organization", "Amount", "Type", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No payment records found.</td></tr>
            ) : payments.map((p: any, i: number) => {
              const sc = STATUS_COLORS[p.status] || STATUS_COLORS.pending;
              return (
                <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)", fontFamily: "monospace" }}>{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm font-medium" style={{ color: "var(--sdc-text)" }}>{p.orgName || p.customerEmail || "—"}</span></td>
                  <td className="px-5 py-3.5"><span className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>${((p.amount || 0) / 100).toFixed(2)}</span></td>
                  <td className="px-5 py-3.5"><span className="text-xs font-semibold capitalize" style={{ color: "var(--sdc-subheading)" }}>{p.type || "payment"}</span></td>
                  <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: sc.bg, color: sc.color }}>{p.status}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IntegrationsTab() {
  const integrations = [
    { name: "Stripe", desc: "Payment processing and billing", status: "connected", icon: CreditCard, color: "#6772e5" },
    { name: "SendGrid", desc: "Transactional email delivery", status: "not_configured", icon: Bell, color: "#1A82E2" },
    { name: "Pearson VUE", desc: "Test center network integration", status: "available", icon: Globe, color: "#003057" },
    { name: "Prometric", desc: "Global testing network", status: "available", icon: Globe, color: "#E31837" },
    { name: "PSI Services", desc: "Assessment delivery partner", status: "available", icon: Globe, color: "#00A3E0" },
    { name: "Credly", desc: "Digital badge distribution", status: "available", icon: Award, color: "#FF6B35" },
  ];
  const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
    connected: { bg: "rgba(5,150,105,0.1)", color: "#059669", label: "Connected" },
    not_configured: { bg: "rgba(217,119,6,0.1)", color: "#d97706", label: "Not Configured" },
    available: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", label: "Available" },
  };
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Integrations</h1>
        <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Connect third-party services to extend platform capabilities.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {integrations.map(({ name, desc, status, icon: Icon, color }) => {
          const badge = STATUS_BADGE[status] || STATUS_BADGE.available;
          return (
            <div key={name} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{name}</p>
                    <span className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: badge.bg, color: badge.color }}>{badge.label}</span>
                  </div>
                  <p style={{ fontSize: 12, color: "var(--sdc-subheading)", marginTop: 2 }}>{desc}</p>
                </div>
                <button className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: status === "connected" ? "rgba(5,150,105,0.1)" : "#c8972a", color: status === "connected" ? "#059669" : "#fff" }}>
                  {status === "connected" ? "Manage" : "Configure"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AdminNotificationsTab() {
  const { data: notifData } = trpc.notifications.list.useQuery();
  const markRead = trpc.notifications.markRead.useMutation();
  const notifs = (notifData as any) || [];
  const TYPE_ICONS: Record<string, { icon: any; color: string }> = {
    credential_issued: { icon: Award, color: "#059669" },
    credential_revoked: { icon: XCircle, color: "#dc2626" },
    booking_new: { icon: Clock, color: "#3b82f6" },
    booking_confirmed: { icon: CheckCircle, color: "#059669" },
    booking_cancelled: { icon: XCircle, color: "#dc2626" },
    system: { icon: Bell, color: "#c8972a" },
    payment: { icon: CreditCard, color: "#8b5cf6" },
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Notifications</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Platform-wide alerts and system notifications.</p>
        </div>
        {notifs.some((n: any) => !n.read) && (
          <button onClick={() => notifs.filter((n: any) => !n.read).forEach((n: any) => markRead.mutate({ id: n.id }))} className="px-4 py-2 rounded-xl text-xs font-bold" style={{ background: "#c8972a", color: "#fff" }}>Mark All Read</button>
        )}
      </div>
      <div className="space-y-3">
        {notifs.length === 0 ? (
          <div className="p-12 rounded-2xl text-center" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <Bell className="w-12 h-12 mx-auto mb-4" style={{ color: "#d1d5db" }} />
            <p className="font-semibold" style={{ color: "var(--sdc-text-muted)" }}>No notifications yet.</p>
          </div>
        ) : notifs.map((n: any) => {
          const ti = TYPE_ICONS[n.type] || TYPE_ICONS.system;
          const Icon = ti.icon;
          return (
            <div key={n.id} className="p-4 rounded-xl flex items-start gap-4 cursor-pointer transition-all" style={{ background: n.read ? "#fff" : "#fefce8", border: "1px solid var(--sdc-card-border)" }}
              onClick={() => !n.read && markRead.mutate({ id: n.id })}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ti.color}15` }}>
                <Icon className="w-5 h-5" style={{ color: ti.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{n.title}</p>
                <p style={{ fontSize: 13, color: "var(--sdc-subheading)", marginTop: 2 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: "var(--sdc-text-muted)", marginTop: 4 }}>{n.createdAt ? new Date(n.createdAt).toLocaleString() : ""}</p>
              </div>
              {!n.read && <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{ background: "#c8972a" }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CredentialRulesTab() {
  const { data: templates } = trpc.credentials.templates.list.useQuery();
  const tpls = (templates as any) || [];
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Credential Rules</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Platform-wide credential templates, policies, and compliance rules.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {[
          { label: "Total Templates", value: tpls.length, icon: FileText, color: "#c8972a", bg: "rgba(200,151,42,0.1)" },
          { label: "ANSI-Aligned", value: tpls.filter((t: any) => t.ansiAligned).length, icon: Shield, color: "#059669", bg: "rgba(5,150,105,0.1)" },
          { label: "Active", value: tpls.filter((t: any) => t.status === "active").length, icon: CheckCircle, color: "#3b82f6", bg: "rgba(59,130,246,0.1)" },
          { label: "Expired Templates", value: tpls.filter((t: any) => t.status === "expired").length, icon: Clock, color: "#d97706", bg: "rgba(217,119,6,0.1)" },
        ].map(s => (
          <div key={s.label} className="p-5 rounded-2xl" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: s.bg }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <p className="font-extrabold" style={{ fontSize: 24, color: "var(--sdc-heading)" }}>{s.value}</p>
            <p style={{ fontSize: 12, color: "var(--sdc-subheading)", fontWeight: 600, marginTop: 2 }}>{s.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["Template Name", "Skills", "Validity", "ANSI", "Status"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tpls.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>No credential templates found.</td></tr>
            ) : tpls.map((t: any) => (
              <tr key={t.id} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                <td className="px-5 py-3.5"><span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{t.name}</span></td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1">
                    {(t.skills || []).slice(0, 3).map((s: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: "rgba(59,130,246,0.1)", color: "#3b82f6" }}>{s}</span>
                    ))}
                    {(t.skills || []).length > 3 && <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>+{t.skills.length - 3}</span>}
                  </div>
                </td>
                <td className="px-5 py-3.5"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{t.validityMonths ? `${t.validityMonths} months` : "Lifetime"}</span></td>
                <td className="px-5 py-3.5">{t.ansiAligned ? <CheckCircle className="w-4 h-4" style={{ color: "#059669" }} /> : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                <td className="px-5 py-3.5"><span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: t.status === "active" ? "rgba(5,150,105,0.1)" : "rgba(107,114,128,0.1)", color: t.status === "active" ? "#059669" : "#6b7280" }}>{t.status || "active"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const [activeSection, setActiveSection] = React.useState<string | null>(null);

  // Load all settings sections
  const { data: allSettings, refetch } = trpc.platformSettings.get.useQuery({ section: undefined });
  const saveMutation = trpc.platformSettings.save.useMutation({
    onSuccess: (d) => { toast.success(`${d.section} settings saved`); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });

  // ── General Settings form state
  const [general, setGeneral] = React.useState({ platformName: "SDC Certifications", supportEmail: "support@sdccertify.com", logoUrl: "", primaryColor: "#c8972a", timezone: "UTC", defaultLanguage: "en", maintenanceMode: false });
  // ── Security form state
  const [security, setSecurity] = React.useState({ require2FA: false, sessionTimeoutMinutes: 60, maxLoginAttempts: 5, ipAllowlist: "", passwordMinLength: 8, enforcePasswordExpiry: false, passwordExpiryDays: 90 });
  // ── Email form state
  const [email, setEmail] = React.useState({ smtpHost: "", smtpPort: "587", smtpUser: "", smtpPassword: "", fromName: "SDC Certifications", fromEmail: "noreply@sdccertify.com", enableEmailNotifications: true, notifyOnCredentialIssue: true, notifyOnExamComplete: true });
  // ── API & Webhooks form state
  const [apiWebhooks, setApiWebhooks] = React.useState({ globalRateLimit: 1000, rateLimitWindow: "1h", allowPublicApiDocs: true, webhookTimeout: 10, webhookMaxRetries: 3, requireApiKeyExpiry: false });
  // ── Integrations form state
  const [integrations, setIntegrations] = React.useState({ pearsonVueEnabled: false, pearsonVueApiKey: "", prometricEnabled: false, prometricApiKey: "", psiEnabled: false, psiApiKey: "", lmsWebhookUrl: "", scormEnabled: false, xapiEnabled: false });
  // ── Billing form state
  const [billing, setBilling] = React.useState({ starterMonthlyPrice: 99, professionalMonthlyPrice: 299, enterpriseMonthlyPrice: 999, apiSaasMonthlyPrice: 499, trialDays: 14, creditsPerDollar: 10, minTopUpAmount: 50 });

  // Populate forms from DB when data loads
  React.useEffect(() => {
    if (!allSettings) return;
    const s = allSettings as Record<string, any>;
    if (s.general) setGeneral(prev => ({ ...prev, ...s.general }));
    if (s.security) setSecurity(prev => ({ ...prev, ...s.security }));
    if (s.email) setEmail(prev => ({ ...prev, ...s.email }));
    if (s.api_webhooks) setApiWebhooks(prev => ({ ...prev, ...s.api_webhooks }));
    if (s.integrations) setIntegrations(prev => ({ ...prev, ...s.integrations }));
    if (s.billing) setBilling(prev => ({ ...prev, ...s.billing }));
  }, [allSettings]);

  const sections = [
    { key: "general", title: "General Settings", desc: "Platform name, logo, and branding", icon: Settings, color: "#c8972a" },
    { key: "security", title: "Security & Auth", desc: "2FA, session policies, IP allowlist", icon: Shield, color: "#3b82f6" },
    { key: "email", title: "Email & Notifications", desc: "SMTP, templates, and alert rules", icon: Bell, color: "#10b981" },
    { key: "api_webhooks", title: "API & Webhooks", desc: "Rate limits, timeouts, and webhook config", icon: Key, color: "#8b5cf6" },
    { key: "integrations", title: "Integrations", desc: "Pearson VUE, Prometric, PSI, LMS", icon: Globe, color: "#06b6d4" },
    { key: "billing", title: "Billing & Plans", desc: "Subscription tiers and pricing rules", icon: CreditCard, color: "#f59e0b" },
  ];

  const inp = (label: string, value: string | number, onChange: (v: string) => void, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
    </div>
  );
  const tog = (label: string, checked: boolean, onChange: (v: boolean) => void, desc?: string) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{label}</p>
        {desc && <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{desc}</p>}
      </div>
      <button onClick={() => onChange(!checked)}
        className="relative w-11 h-6 rounded-full transition-colors"
        style={{ background: checked ? "#c8972a" : "var(--sdc-card-border)" }}>
        <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: checked ? "calc(100% - 20px)" : "4px" }} />
      </button>
    </div>
  );

  const saveSection = (section: typeof sections[number]["key"], data: Record<string, unknown>) => {
    saveMutation.mutate({ section: section as any, data });
  };

  if (!activeSection) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Platform Settings</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>Configure global platform settings and integrations.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sections.map(({ key, title, desc, icon: Icon, color }) => {
            const saved = allSettings && (allSettings as Record<string, any>)[key];
            return (
              <button key={key} onClick={() => setActiveSection(key)}
                className="p-5 rounded-2xl text-left transition-all hover:scale-[1.01]"
                style={{ background: "var(--sdc-card-bg)", border: `1px solid ${saved ? color + "40" : "var(--sdc-card-border)"}` }}>
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm" style={{ color: "var(--sdc-heading)" }}>{title}</p>
                    <p style={{ fontSize: 12, color: "var(--sdc-subheading)", marginTop: 2 }}>{desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: color + "20", color }}>Saved</span>}
                    <ChevronRight className="w-4 h-4" style={{ color: "#d1d5db" }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const section = sections.find(s => s.key === activeSection)!;
  const Icon = section.icon;

  return (
    <div className="p-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => setActiveSection(null)} className="p-2 rounded-xl hover:bg-white/5 transition-colors">
          <ChevronRight className="w-4 h-4 rotate-180" style={{ color: "var(--sdc-subheading)" }} />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${section.color}15`, border: `1px solid ${section.color}30` }}>
          <Icon className="w-5 h-5" style={{ color: section.color }} />
        </div>
        <div>
          <h1 className="font-extrabold" style={{ fontSize: 22, color: "var(--sdc-heading)" }}>{section.title}</h1>
          <p style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{section.desc}</p>
        </div>
      </div>

      <div className="rounded-2xl p-6 space-y-5" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
        {/* ── GENERAL ── */}
        {activeSection === "general" && (
          <>
            {inp("Platform Name", general.platformName, v => setGeneral(p => ({ ...p, platformName: v })))}
            {inp("Support Email", general.supportEmail, v => setGeneral(p => ({ ...p, supportEmail: v })), "email")}
            {inp("Logo URL", general.logoUrl, v => setGeneral(p => ({ ...p, logoUrl: v })), "url", "https://cdn.example.com/logo.png")}
            {inp("Primary Brand Color", general.primaryColor, v => setGeneral(p => ({ ...p, primaryColor: v })), "color")}
            {inp("Default Timezone", general.timezone, v => setGeneral(p => ({ ...p, timezone: v })), "text", "UTC")}
            {inp("Default Language", general.defaultLanguage, v => setGeneral(p => ({ ...p, defaultLanguage: v })), "text", "en")}
            {tog("Maintenance Mode", general.maintenanceMode, v => setGeneral(p => ({ ...p, maintenanceMode: v })), "Show maintenance page to all non-admin users")}
            <button onClick={() => saveSection("general", general as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm mt-2" style={{ background: "#c8972a", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save General Settings"}
            </button>
          </>
        )}

        {/* ── SECURITY ── */}
        {activeSection === "security" && (
          <>
            {tog("Require 2FA for all users", security.require2FA, v => setSecurity(p => ({ ...p, require2FA: v })))}
            {inp("Session Timeout (minutes)", security.sessionTimeoutMinutes, v => setSecurity(p => ({ ...p, sessionTimeoutMinutes: +v })), "number")}
            {inp("Max Login Attempts", security.maxLoginAttempts, v => setSecurity(p => ({ ...p, maxLoginAttempts: +v })), "number")}
            {inp("Minimum Password Length", security.passwordMinLength, v => setSecurity(p => ({ ...p, passwordMinLength: +v })), "number")}
            {tog("Enforce Password Expiry", security.enforcePasswordExpiry, v => setSecurity(p => ({ ...p, enforcePasswordExpiry: v })))}
            {security.enforcePasswordExpiry && inp("Password Expiry (days)", security.passwordExpiryDays, v => setSecurity(p => ({ ...p, passwordExpiryDays: +v })), "number")}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>IP Allowlist (one per line, leave empty to allow all)</label>
              <textarea value={security.ipAllowlist} onChange={e => setSecurity(p => ({ ...p, ipAllowlist: e.target.value }))}
                rows={3} placeholder="192.168.1.0/24&#10;10.0.0.1"
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
            </div>
            <button onClick={() => saveSection("security", security as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: "#3b82f6", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save Security Settings"}
            </button>
          </>
        )}

        {/* ── EMAIL ── */}
        {activeSection === "email" && (
          <>
            {inp("SMTP Host", email.smtpHost, v => setEmail(p => ({ ...p, smtpHost: v })), "text", "smtp.resend.com")}
            {inp("SMTP Port", email.smtpPort, v => setEmail(p => ({ ...p, smtpPort: v })), "number")}
            {inp("SMTP Username", email.smtpUser, v => setEmail(p => ({ ...p, smtpUser: v })))}
            {inp("SMTP Password", email.smtpPassword, v => setEmail(p => ({ ...p, smtpPassword: v })), "password")}
            {inp("From Name", email.fromName, v => setEmail(p => ({ ...p, fromName: v })))}
            {inp("From Email", email.fromEmail, v => setEmail(p => ({ ...p, fromEmail: v })), "email")}
            {tog("Enable Email Notifications", email.enableEmailNotifications, v => setEmail(p => ({ ...p, enableEmailNotifications: v })))}
            {tog("Notify on Credential Issue", email.notifyOnCredentialIssue, v => setEmail(p => ({ ...p, notifyOnCredentialIssue: v })))}
            {tog("Notify on Exam Completion", email.notifyOnExamComplete, v => setEmail(p => ({ ...p, notifyOnExamComplete: v })))}
            <button onClick={() => saveSection("email", email as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: "#10b981", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save Email Settings"}
            </button>
          </>
        )}

        {/* ── API & WEBHOOKS ── */}
        {activeSection === "api_webhooks" && (
          <>
            {inp("Global Rate Limit (requests/window)", apiWebhooks.globalRateLimit, v => setApiWebhooks(p => ({ ...p, globalRateLimit: +v })), "number")}
            {inp("Rate Limit Window", apiWebhooks.rateLimitWindow, v => setApiWebhooks(p => ({ ...p, rateLimitWindow: v })), "text", "1h, 15m, 1d")}
            {inp("Webhook Timeout (seconds)", apiWebhooks.webhookTimeout, v => setApiWebhooks(p => ({ ...p, webhookTimeout: +v })), "number")}
            {inp("Webhook Max Retries", apiWebhooks.webhookMaxRetries, v => setApiWebhooks(p => ({ ...p, webhookMaxRetries: +v })), "number")}
            {tog("Allow Public API Docs", apiWebhooks.allowPublicApiDocs, v => setApiWebhooks(p => ({ ...p, allowPublicApiDocs: v })), "Make /api/v1/openapi.json accessible without authentication")}
            {tog("Require API Key Expiry", apiWebhooks.requireApiKeyExpiry, v => setApiWebhooks(p => ({ ...p, requireApiKeyExpiry: v })), "Force all API keys to have an expiry date")}
            <button onClick={() => saveSection("api_webhooks", apiWebhooks as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: "#8b5cf6", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save API & Webhook Settings"}
            </button>
          </>
        )}

        {/* ── INTEGRATIONS ── */}
        {activeSection === "integrations" && (
          <>
            <div className="pb-2 border-b" style={{ borderColor: "var(--sdc-card-border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--sdc-text-muted)" }}>Testing Providers</p>
              {tog("Pearson VUE", integrations.pearsonVueEnabled, v => setIntegrations(p => ({ ...p, pearsonVueEnabled: v })))}
              {integrations.pearsonVueEnabled && inp("Pearson VUE API Key", integrations.pearsonVueApiKey, v => setIntegrations(p => ({ ...p, pearsonVueApiKey: v })), "password")}
              {tog("Prometric", integrations.prometricEnabled, v => setIntegrations(p => ({ ...p, prometricEnabled: v })))}
              {integrations.prometricEnabled && inp("Prometric API Key", integrations.prometricApiKey, v => setIntegrations(p => ({ ...p, prometricApiKey: v })), "password")}
              {tog("PSI Exams", integrations.psiEnabled, v => setIntegrations(p => ({ ...p, psiEnabled: v })))}
              {integrations.psiEnabled && inp("PSI API Key", integrations.psiApiKey, v => setIntegrations(p => ({ ...p, psiApiKey: v })), "password")}
            </div>
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--sdc-text-muted)" }}>LMS & Standards</p>
              {inp("LMS Webhook URL", integrations.lmsWebhookUrl, v => setIntegrations(p => ({ ...p, lmsWebhookUrl: v })), "url", "https://lms.example.com/webhook")}
              {tog("SCORM 2004", integrations.scormEnabled, v => setIntegrations(p => ({ ...p, scormEnabled: v })))}
              {tog("xAPI / Tin Can", integrations.xapiEnabled, v => setIntegrations(p => ({ ...p, xapiEnabled: v })))}
            </div>
            <button onClick={() => saveSection("integrations", integrations as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: "#06b6d4", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save Integration Settings"}
            </button>
          </>
        )}

        {/* ── BILLING ── */}
        {activeSection === "billing" && (
          <>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--sdc-text-muted)" }}>Monthly Plan Prices (USD)</p>
            {inp("Starter", billing.starterMonthlyPrice, v => setBilling(p => ({ ...p, starterMonthlyPrice: +v })), "number")}
            {inp("Professional", billing.professionalMonthlyPrice, v => setBilling(p => ({ ...p, professionalMonthlyPrice: +v })), "number")}
            {inp("Enterprise", billing.enterpriseMonthlyPrice, v => setBilling(p => ({ ...p, enterpriseMonthlyPrice: +v })), "number")}
            {inp("API SaaS", billing.apiSaasMonthlyPrice, v => setBilling(p => ({ ...p, apiSaasMonthlyPrice: +v })), "number")}
            <div className="border-t pt-4" style={{ borderColor: "var(--sdc-card-border)" }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "var(--sdc-text-muted)" }}>Credits & Trial</p>
              {inp("Trial Period (days)", billing.trialDays, v => setBilling(p => ({ ...p, trialDays: +v })), "number")}
              {inp("Credits per Dollar", billing.creditsPerDollar, v => setBilling(p => ({ ...p, creditsPerDollar: +v })), "number")}
              {inp("Minimum Top-Up Amount (USD)", billing.minTopUpAmount, v => setBilling(p => ({ ...p, minTopUpAmount: +v })), "number")}
            </div>
            <button onClick={() => saveSection("billing", billing as any)} disabled={saveMutation.isPending}
              className="w-full py-2.5 rounded-xl font-bold text-sm" style={{ background: "#f59e0b", color: "#fff" }}>
              {saveMutation.isPending ? "Saving..." : "Save Billing Settings"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: usersData, refetch, isLoading: usersLoading, error: usersError } = trpc.users.list.useQuery(undefined, { retry: false });
  const [search, setSearch] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const users = (usersData as any) || [];
  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );
  const deactivateMutation = trpc.users.deactivate.useMutation({
    onSuccess: () => { toast.success("User deactivated"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const reactivateMutation = trpc.users.reactivate.useMutation({
    onSuccess: () => { toast.success("User reactivated"); refetch(); },
    onError: (e: any) => toast.error(e.message),
  });
  const inviteMutation = trpc.users.invite.useMutation({
    onSuccess: (data: any) => {
      toast.success(`Invitation sent to ${inviteEmail}`);
      if (data?.tempPassword) toast.info(`Temp password: ${data.tempPassword}`, { duration: 15000 });
      setShowInvite(false); setInviteEmail(""); setInviteName(""); refetch();
    },
    onError: (e: any) => toast.error(e.message),
  });
  const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
    super_admin: { bg: "rgba(139,92,246,0.1)", color: "#8b5cf6" },
    org_admin: { bg: "rgba(200,151,42,0.1)", color: "#c8972a" },
    candidate: { bg: "rgba(59,130,246,0.1)", color: "#3b82f6" },
    proctor: { bg: "rgba(16,185,129,0.1)", color: "#10b981" },
    instructor: { bg: "rgba(6,182,212,0.1)", color: "#06b6d4" },
    psychometrician: { bg: "rgba(239,68,68,0.1)", color: "#ef4444" },
    exam_developer: { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" },
  };
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Users</h1>
          <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>All platform users across all organizations.</p>
        </div>
        <button onClick={() => setShowInvite(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
          style={{ background: "#c8972a", color: "#ffffff" }}>
          <Plus className="w-4 h-4" /> Invite User
        </button>
      </div>
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="p-6 rounded-2xl w-96" style={{ background: "var(--sdc-card-bg)" }}>
            <h3 className="font-bold text-lg mb-4" style={{ color: "var(--sdc-heading)" }}>Invite User</h3>
            <div className="space-y-3 mb-4">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Email address *"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
              <input value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="Full name (optional)"
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none" style={{ border: "1px solid #e2e8f0", color: "var(--sdc-heading)" }} />
            </div>
            <div className="flex gap-3">
              <button onClick={() => inviteMutation.mutate({ email: inviteEmail, name: inviteName || undefined, role: "candidate" })}
                disabled={!inviteEmail || inviteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm" style={{ background: "#c8972a", color: "#fff" }}>
                {inviteMutation.isPending ? "Sending..." : "Send Invite"}
              </button>
              <button onClick={() => setShowInvite(false)} className="px-4 py-2.5 rounded-xl font-semibold text-sm" style={{ background: "#f1f5f9", color: "var(--sdc-subheading)" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
      </div>
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
              {["User", "Role", "Joined", "Status", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-left" style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usersError ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "#ef4444" }}>
                Access denied. Super admin privileges required.
              </td></tr>
            ) : usersLoading ? (
              <>
                {[1,2,3,4,5,6,7,8].map(i => (
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
                    <td className="px-5 py-4"><Skeleton className="h-6 w-20 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-3.5 w-20 bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-6 w-14 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                    <td className="px-5 py-4"><Skeleton className="h-7 w-24 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>
                  </tr>
                ))}
              </>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-12 text-center" style={{ color: "var(--sdc-text-muted)" }}>
                No users found
              </td></tr>
            ) : filtered.slice(0, 30).map((u: any) => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.candidate;
              const isInactive = u.status === "inactive";
              return (
                <tr key={u.id} style={{ borderBottom: "1px solid var(--sdc-card-border)", opacity: isInactive ? 0.6 : 1 }}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs" style={{ background: "var(--sdc-sidebar-bg)" }}>
                        {(u.name || u.email || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{u.name || "—"}</p>
                        <p style={{ fontSize: 11, color: "var(--sdc-text-muted)" }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold capitalize" style={{ background: rc.bg, color: rc.color }}>
                      {u.role?.replace("_", " ") || "user"}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span style={{ fontSize: 12, color: "var(--sdc-subheading)" }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</span></td>
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: isInactive ? "rgba(220,38,38,0.1)" : "rgba(16,185,129,0.1)", color: isInactive ? "#dc2626" : "#10b981" }}>
                      {isInactive ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {isInactive ? (
                      <button onClick={() => reactivateMutation.mutate({ userId: u.id })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                        <UserCheck className="w-3.5 h-3.5" /> Reactivate
                      </button>
                    ) : (
                      <button onClick={() => { if (confirm(`Deactivate ${u.name || u.email}?`)) deactivateMutation.mutate({ userId: u.id }); }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
                        <UserX className="w-3.5 h-3.5" /> Deactivate
                      </button>
                    )}
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

// ─── Route → tab mapping ──────────────────────────────────────────────────────
const TAB_MAP: Record<string, string> = {
  "/admin": "dashboard",
  "/admin/organizations": "organizations",
  "/admin/orgs": "organizations",
  "/admin/candidates": "candidates",
  "/admin/credentials": "credentials",
  "/admin/payments": "payments",
  "/admin/integrations": "integrations",
  "/admin/notifications": "notifications",
  "/admin/audit": "audit",
  "/admin/settings": "settings",
  "/admin/users": "users",
  "/admin/analytics": "dashboard",
};

export default function AdminPortal() {
  const [location] = useLocation();
  const activeTab = Object.entries(TAB_MAP).find(([path]) =>
    path === "/admin" ? location === "/admin" : location.startsWith(path)
  )?.[1] || "dashboard";

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardTab />;
      case "organizations": return <OrganizationsPage />;
      case "candidates": return <CandidatesTab />;
      case "audit": return <AuditTab />;
      case "payments": return <PaymentsTab />;
      case "integrations": return <IntegrationsTab />;
      case "notifications": return <AdminNotificationsTab />;
      case "credentials": return <CredentialRulesTab />;
      case "settings": return <SettingsTab />;
      case "users": return <UsersTab />;
      default: return <DashboardTab />;
    }
  };

  return <SDCLayout>{renderContent()}</SDCLayout>;
}
