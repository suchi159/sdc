import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2, Users, BookOpen, Award, Plus, Search, Filter,
  MoreVertical, Eye, Edit2, Trash2, Power, RefreshCw, Key,
  ChevronLeft, ChevronRight, X, Save, Loader2, Globe,
  CheckCircle, AlertCircle, Clock, TrendingUp, Download,
  Shield, Zap, Star
} from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  starter:      { label: "Starter",      color: "#64748b", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.25)", icon: Star },
  professional: { label: "Professional", color: "#6366f1", bg: "rgba(99,102,241,0.12)",  border: "rgba(99,102,241,0.25)",  icon: Zap },
  enterprise:   { label: "Enterprise",   color: "#c8972a", bg: "rgba(200,151,42,0.12)",  border: "rgba(200,151,42,0.25)",  icon: Shield },
  api_saas:     { label: "API / SaaS",   color: "#06b6d4", bg: "rgba(6,182,212,0.12)",   border: "rgba(6,182,212,0.25)",   icon: Globe },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active:    { label: "Active",    color: "#10b981", bg: "rgba(16,185,129,0.1)",  icon: CheckCircle },
  trial:     { label: "Trial",     color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Clock },
  suspended: { label: "Suspended", color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: AlertCircle },
};

const INDUSTRY_OPTIONS = [
  "Technology", "Finance", "Healthcare", "Education", "Government",
  "Legal", "Manufacturing", "Retail", "Consulting", "Non-profit", "Other",
];

const SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function OrgAvatar({ name, logoUrl, size = 10 }: { name: string; logoUrl?: string | null; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (logoUrl) return <img src={logoUrl} alt={name} className={`w-${size} h-${size} rounded-xl object-cover flex-shrink-0`} />;
  return (
    <div className={`w-${size} h-${size} rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ background: "linear-gradient(135deg, #c8972a 0%, #a07020 100%)", fontSize: size * 1.2 }}>
      {initials}
    </div>
  );
}

function PlanBadge({ plan }: { plan: string }) {
  const cfg = PLAN_CONFIG[plan] || PLAN_CONFIG.starter;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.active;
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold"
      style={{ background: cfg.bg, color: cfg.color }}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────

function StatsBar() {
  const { data: stats } = trpc.orgs.stats.useQuery();
  const items = [
    { label: "Total Orgs",  value: stats?.total     ?? "—", icon: Building2,  color: "#c8972a" },
    { label: "Active",      value: stats?.active    ?? "—", icon: CheckCircle, color: "#10b981" },
    { label: "Trial",       value: stats?.trial     ?? "—", icon: Clock,       color: "#f59e0b" },
    { label: "Suspended",   value: stats?.suspended ?? "—", icon: AlertCircle, color: "#ef4444" },
  ];
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {items.map(item => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="rounded-2xl p-4 flex items-center gap-3"
            style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${item.color}18` }}>
              <Icon className="w-4 h-4" style={{ color: item.color }} />
            </div>
            <div>
              <p className="font-extrabold text-xl leading-none" style={{ color: "var(--sdc-heading)" }}>{item.value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

type OrgFormData = {
  name: string; slug: string; industry: string; website: string;
  size: string; logoUrl: string; plan: string; subdomain: string;
  monthlyBudget: string; webhookUrl: string;
};

function OrgModal({ org, onClose, onSaved }: {
  org?: any;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!org;
  const [form, setForm] = useState<OrgFormData>({
    name: org?.name || "",
    slug: org?.slug || "",
    industry: org?.industry || "",
    website: org?.website || "",
    size: org?.size || "",
    logoUrl: org?.logoUrl || "",
    plan: org?.plan || "starter",
    subdomain: org?.subdomain || "",
    monthlyBudget: org?.monthlyBudget?.toString() || "",
    webhookUrl: org?.webhookUrl || "",
  });

  const createMutation = trpc.orgs.create.useMutation({
    onSuccess: () => { toast.success("Organization created"); onSaved(); },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.orgs.adminUpdate.useMutation({
    onSuccess: () => { toast.success("Organization updated"); onSaved(); },
    onError: (e) => toast.error(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      updateMutation.mutate({
        orgId: org.id,
        name: form.name || undefined,
        slug: form.slug || undefined,
        industry: form.industry || undefined,
        website: form.website || undefined,
        size: form.size || undefined,
        logoUrl: form.logoUrl || undefined,
        subdomain: form.subdomain || undefined,
        monthlyBudget: form.monthlyBudget ? parseInt(form.monthlyBudget) : undefined,
        webhookUrl: form.webhookUrl || undefined,
      });
    } else {
      createMutation.mutate({
        name: form.name,
        slug: form.slug,
        industry: form.industry || undefined,
        plan: form.plan as any,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const field = (key: keyof OrgFormData, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>{label}</label>
      <input type={type} className="w-full px-3 py-2 rounded-xl text-sm outline-none"
        style={{ background: "var(--sdc-input-bg, rgba(255,255,255,0.05))", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
        placeholder={placeholder} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="w-full max-w-lg rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--sdc-card-border)" }}>
          <h2 className="font-bold text-base" style={{ color: "var(--sdc-heading)" }}>
            {isEdit ? "Edit Organization" : "Create Organization"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--sdc-subheading)" }}><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {field("name", "Organization Name *", "text", "Acme Corp")}
            {field("slug", "Slug *", "text", "acme-corp")}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>Industry</label>
              <select className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--sdc-input-bg, rgba(255,255,255,0.05))", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
                value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                <option value="">Select…</option>
                {INDUSTRY_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>Company Size</label>
              <select className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: "var(--sdc-input-bg, rgba(255,255,255,0.05))", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }}
                value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}>
                <option value="">Select…</option>
                {SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {!isEdit && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: "var(--sdc-subheading)" }}>Plan</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PLAN_CONFIG).map(([key, cfg]) => {
                  const Icon = cfg.icon;
                  return (
                    <button key={key} type="button" onClick={() => setForm(p => ({ ...p, plan: key }))}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all"
                      style={{ background: form.plan === key ? cfg.bg : "transparent", color: form.plan === key ? cfg.color : "var(--sdc-subheading)", border: `1px solid ${form.plan === key ? cfg.border : "var(--sdc-card-border)"}` }}>
                      <Icon className="w-3.5 h-3.5" />{cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {field("website", "Website", "url", "https://acme.com")}
          {field("logoUrl", "Logo URL", "url", "https://cdn.acme.com/logo.png")}
          {isEdit && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {field("subdomain", "Subdomain", "text", "acme")}
                {field("monthlyBudget", "Monthly Budget (credits)", "number", "1000")}
              </div>
              {field("webhookUrl", "Webhook URL", "url", "https://acme.com/webhooks/sdc")}
            </>
          )}
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "#c8972a", color: "#fff" }}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEdit ? "Save Changes" : "Create Organization"}
            </button>
            <button type="button" onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-bold text-sm"
              style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)", border: "1px solid var(--sdc-card-border)" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function OrgDetailDrawer({ orgId, onClose, onEdit }: { orgId: number; onClose: () => void; onEdit: (org: any) => void }) {
  const { data, isLoading } = trpc.orgs.getDetail.useQuery({ orgId });
  const utils = trpc.useUtils();

  const suspendMutation = trpc.orgs.suspend.useMutation({
    onSuccess: () => { toast.success("Organization suspended"); utils.orgs.list.invalidate(); utils.orgs.getDetail.invalidate({ orgId }); },
    onError: (e) => toast.error(e.message),
  });
  const activateMutation = trpc.orgs.activate.useMutation({
    onSuccess: () => { toast.success("Organization activated"); utils.orgs.list.invalidate(); utils.orgs.getDetail.invalidate({ orgId }); },
    onError: (e) => toast.error(e.message),
  });
  const regenKeyMutation = trpc.orgs.regenerateApiKey.useMutation({
    onSuccess: (r) => { toast.success(`New API key: ${r.apiKey}`); utils.orgs.getDetail.invalidate({ orgId }); },
    onError: (e) => toast.error(e.message),
  });

  const org = data?.org;
  const isSuspended = org?.status === "suspended";

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1" />
      <div className="w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{ background: "var(--sdc-card-bg)", borderLeft: "1px solid var(--sdc-card-border)" }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 z-10"
          style={{ borderColor: "var(--sdc-card-border)", background: "var(--sdc-card-bg)" }}>
          <h2 className="font-bold text-base" style={{ color: "var(--sdc-heading)" }}>Organization Detail</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ color: "var(--sdc-subheading)" }}><X className="w-4 h-4" /></button>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl bg-[var(--sdc-skeleton-base)]" />)}
          </div>
        ) : !org ? (
          <div className="p-6 text-center" style={{ color: "var(--sdc-subheading)" }}>Organization not found</div>
        ) : (
          <div className="p-6 space-y-6 flex-1">
            {/* Profile */}
            <div className="flex items-start gap-4">
              <OrgAvatar name={org.name} logoUrl={org.logoUrl} size={14} />
              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-lg leading-tight" style={{ color: "var(--sdc-heading)" }}>{org.name}</h3>
                <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{org.slug}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PlanBadge plan={org.plan} />
                  <StatusBadge status={org.status} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Members",     value: data?.memberCount,     icon: Users,    color: "#6366f1" },
                { label: "Exams",       value: data?.examCount,       icon: BookOpen, color: "#c8972a" },
                { label: "Credentials", value: data?.credentialCount, icon: Award,    color: "#10b981" },
              ].map(s => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="rounded-xl p-3 text-center"
                    style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                    <Icon className="w-4 h-4 mx-auto mb-1" style={{ color: s.color }} />
                    <p className="font-extrabold text-lg leading-none" style={{ color: "var(--sdc-heading)" }}>{s.value ?? 0}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--sdc-subheading)" }}>{s.label}</p>
                  </div>
                );
              })}
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              {[
                { label: "Industry",   value: org.industry },
                { label: "Website",    value: org.website },
                { label: "Size",       value: org.size },
                { label: "Subdomain",  value: org.subdomain },
                { label: "Created",    value: org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "—" },
              ].filter(i => i.value).map(i => (
                <div key={i.label} className="flex items-center justify-between py-1.5 border-b" style={{ borderColor: "var(--sdc-card-border)" }}>
                  <span style={{ color: "var(--sdc-subheading)" }}>{i.label}</span>
                  <span className="font-medium" style={{ color: "var(--sdc-heading)" }}>{i.value}</span>
                </div>
              ))}
            </div>

            {/* API Key */}
            {org.apiKey && (
              <div className="rounded-xl p-3" style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-card-border)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: "var(--sdc-subheading)" }}>API Key</span>
                  <button onClick={() => regenKeyMutation.mutate({ orgId })}
                    className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                    style={{ color: "#c8972a", background: "rgba(200,151,42,0.1)" }}>
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
                <p className="font-mono text-xs truncate" style={{ color: "var(--sdc-heading)" }}>{org.apiKey}</p>
              </div>
            )}

            {/* Members */}
            {data?.members && data.members.length > 0 && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--sdc-subheading)" }}>Members</h4>
                <div className="space-y-2">
                  {data.members.slice(0, 8).map((m: any) => (
                    <div key={m.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                        style={{ background: "var(--sdc-sidebar-bg)", fontSize: 10 }}>
                        {(m.name || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: "var(--sdc-heading)" }}>{m.name || "—"}</p>
                        <p className="text-xs truncate" style={{ color: "var(--sdc-subheading)" }}>{m.email || "—"}</p>
                      </div>
                      <span className="text-xs px-1.5 py-0.5 rounded capitalize"
                        style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-subheading)", border: "1px solid var(--sdc-card-border)" }}>
                        {m.role?.replace("_", " ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button onClick={() => onEdit(org)}
                className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
                style={{ background: "rgba(200,151,42,0.1)", color: "#c8972a", border: "1px solid rgba(200,151,42,0.2)" }}>
                <Edit2 className="w-4 h-4" /> Edit Organization
              </button>
              {isSuspended ? (
                <button onClick={() => activateMutation.mutate({ orgId })}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                  <Power className="w-4 h-4" /> Activate Organization
                </button>
              ) : (
                <button onClick={() => { if (confirm(`Suspend ${org.name}?`)) suspendMutation.mutate({ orgId }); }}
                  className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
                  style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                  <Power className="w-4 h-4" /> Suspend Organization
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Row Action Menu ──────────────────────────────────────────────────────────

function ActionMenu({ org, onView, onEdit, onRefetch }: {
  org: any; onView: () => void; onEdit: () => void; onRefetch: () => void;
}) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const suspendMutation = trpc.orgs.suspend.useMutation({
    onSuccess: () => { toast.success("Suspended"); onRefetch(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const activateMutation = trpc.orgs.activate.useMutation({
    onSuccess: () => { toast.success("Activated"); onRefetch(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = trpc.orgs.delete.useMutation({
    onSuccess: () => { toast.success("Organization removed"); onRefetch(); setOpen(false); },
    onError: (e) => toast.error(e.message),
  });
  const updatePlanMutation = trpc.orgs.updatePlan.useMutation({
    onSuccess: () => { toast.success("Plan updated"); onRefetch(); },
    onError: (e) => toast.error(e.message),
  });

  const isSuspended = org.status === "suspended";

  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)}
        className="p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        style={{ color: "var(--sdc-subheading)" }}>
        <MoreVertical className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-8 z-40 w-52 rounded-xl overflow-hidden shadow-2xl"
            style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
            <button onClick={() => { onView(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: "var(--sdc-heading)" }}>
              <Eye className="w-4 h-4" /> View Details
            </button>
            <button onClick={() => { onEdit(); setOpen(false); }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
              style={{ color: "var(--sdc-heading)" }}>
              <Edit2 className="w-4 h-4" /> Edit Profile
            </button>
            <div className="border-t my-1" style={{ borderColor: "var(--sdc-card-border)" }} />
            {/* Plan submenu */}
            <div className="px-4 py-1.5">
              <p className="text-xs font-semibold mb-1.5" style={{ color: "var(--sdc-subheading)" }}>Change Plan</p>
              <div className="grid grid-cols-2 gap-1">
                {Object.entries(PLAN_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => { updatePlanMutation.mutate({ orgId: org.id, plan: key as any }); setOpen(false); }}
                    className="px-2 py-1 rounded-lg text-xs font-bold"
                    style={{ background: org.plan === key ? cfg.bg : "transparent", color: org.plan === key ? cfg.color : "var(--sdc-subheading)", border: `1px solid ${org.plan === key ? cfg.border : "transparent"}` }}>
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="border-t my-1" style={{ borderColor: "var(--sdc-card-border)" }} />
            {isSuspended ? (
              <button onClick={() => { activateMutation.mutate({ orgId: org.id }); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: "#10b981" }}>
                <Power className="w-4 h-4" /> Activate
              </button>
            ) : (
              <button onClick={() => { if (confirm(`Suspend ${org.name}?`)) { suspendMutation.mutate({ orgId: org.id }); setOpen(false); } }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-white/5 transition-colors text-left"
                style={{ color: "#f59e0b" }}>
                <Power className="w-4 h-4" /> Suspend
              </button>
            )}
            <button onClick={() => { if (confirm(`Delete ${org.name}? This will suspend and clear their API key.`)) { deleteMutation.mutate({ orgId: org.id }); setOpen(false); } }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-500/10 transition-colors text-left"
              style={{ color: "#ef4444" }}>
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Organizations() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "suspended" | "trial">("all");
  const [planFilter, setPlanFilter] = useState<"all" | "starter" | "professional" | "enterprise" | "api_saas">("all");
  const [page, setPage] = useState(1);
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);
  const [editOrg, setEditOrg] = useState<any | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const PAGE_SIZE = 20;

  const { data, isLoading, refetch } = trpc.orgs.list.useQuery({
    search: search || undefined,
    status: statusFilter,
    plan: planFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const utils = trpc.useUtils();

  const orgs = data?.orgs ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const suspendSelectedMutation = trpc.orgs.suspend.useMutation({
    onSuccess: () => { toast.success("Selected orgs suspended"); setSelectedIds(new Set()); refetch(); },
    onError: (e) => toast.error(e.message),
  });
  const activateSelectedMutation = trpc.orgs.activate.useMutation({
    onSuccess: () => { toast.success("Selected orgs activated"); setSelectedIds(new Set()); refetch(); },
    onError: (e) => toast.error(e.message),
  });

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === orgs.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(orgs.map((o: any) => o.id)));
  };

  return (
    <>
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-extrabold tracking-tight" style={{ fontSize: 28, color: "var(--sdc-heading)" }}>Organizations</h1>
            <p style={{ color: "var(--sdc-subheading)", fontSize: 14, marginTop: 2 }}>
              Manage all registered organizations on the platform.
            </p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm"
            style={{ background: "#c8972a", color: "#fff" }}>
            <Plus className="w-4 h-4" /> New Organization
          </button>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--sdc-text-muted)" }} />
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or slug…"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", color: "var(--sdc-heading)" }} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "active", "trial", "suspended"] as const).map(s => (
              <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={{
                  background: statusFilter === s ? (s === "active" ? "rgba(16,185,129,0.15)" : s === "suspended" ? "rgba(239,68,68,0.15)" : s === "trial" ? "rgba(245,158,11,0.15)" : "rgba(200,151,42,0.15)") : "var(--sdc-card-bg)",
                  color: statusFilter === s ? (s === "active" ? "#10b981" : s === "suspended" ? "#ef4444" : s === "trial" ? "#f59e0b" : "#c8972a") : "var(--sdc-subheading)",
                  border: `1px solid var(--sdc-card-border)`,
                }}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "starter", "professional", "enterprise", "api_saas"] as const).map(p => (
              <button key={p} onClick={() => { setPlanFilter(p); setPage(1); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all"
                style={{
                  background: planFilter === p ? (PLAN_CONFIG[p]?.bg || "rgba(200,151,42,0.15)") : "var(--sdc-card-bg)",
                  color: planFilter === p ? (PLAN_CONFIG[p]?.color || "#c8972a") : "var(--sdc-subheading)",
                  border: `1px solid var(--sdc-card-border)`,
                }}>
                {p === "api_saas" ? "API/SaaS" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 mb-4 px-4 py-3 rounded-xl"
            style={{ background: "rgba(200,151,42,0.08)", border: "1px solid rgba(200,151,42,0.2)" }}>
            <span className="text-sm font-semibold" style={{ color: "#c8972a" }}>{selectedIds.size} selected</span>
            <button onClick={() => { if (confirm("Suspend all selected?")) Array.from(selectedIds).forEach(id => suspendSelectedMutation.mutate({ orgId: id })); }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444" }}>
              Suspend All
            </button>
            <button onClick={() => { Array.from(selectedIds).forEach(id => activateSelectedMutation.mutate({ orgId: id })); }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold"
              style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>
              Activate All
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="ml-auto p-1" style={{ color: "var(--sdc-subheading)" }}><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Table */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                  <th className="px-4 py-3.5 w-10">
                    <input type="checkbox" checked={selectedIds.size === orgs.length && orgs.length > 0}
                      onChange={toggleAll} className="rounded" />
                  </th>
                  {["Organization", "Plan", "Status", "Members", "Exams", "Credentials", "Created", ""].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left"
                      style={{ fontSize: 11, fontWeight: 700, color: "var(--sdc-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--sdc-card-border)" }}>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-4 bg-[var(--sdc-skeleton-base)]" /></td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-xl bg-[var(--sdc-skeleton-base)]" />
                          <div className="space-y-1.5"><Skeleton className="h-3.5 w-32 bg-[var(--sdc-skeleton-base)]" /><Skeleton className="h-3 w-24 bg-[var(--sdc-skeleton-base)]" /></div>
                        </div>
                      </td>
                      {[...Array(6)].map((_, j) => <td key={j} className="px-4 py-4"><Skeleton className="h-5 w-16 rounded-lg bg-[var(--sdc-skeleton-base)]" /></td>)}
                    </tr>
                  ))
                ) : orgs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" style={{ color: "var(--sdc-subheading)" }} />
                      <p className="font-semibold" style={{ color: "var(--sdc-subheading)" }}>No organizations found</p>
                      <p className="text-xs mt-1" style={{ color: "var(--sdc-text-muted)" }}>Try adjusting your filters or create a new one</p>
                    </td>
                  </tr>
                ) : orgs.map((org: any) => (
                  <tr key={org.id}
                    className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                    style={{ borderBottom: "1px solid var(--sdc-card-border)" }}
                    onClick={() => setSelectedOrg(org.id)}>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={selectedIds.has(org.id)} onChange={() => toggleSelect(org.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <OrgAvatar name={org.name} logoUrl={org.logoUrl} size={10} />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>{org.name}</p>
                          <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{org.slug}{org.industry ? ` · ${org.industry}` : ""}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4"><PlanBadge plan={org.plan} /></td>
                    <td className="px-4 py-4"><StatusBadge status={org.status} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" style={{ color: "var(--sdc-text-muted)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{org.memberCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" style={{ color: "var(--sdc-text-muted)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{org.examCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" style={{ color: "var(--sdc-text-muted)" }} />
                        <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{org.credentialCount ?? 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-xs" style={{ color: "var(--sdc-subheading)" }}>
                        {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </td>
                    <td className="px-4 py-4" onClick={e => e.stopPropagation()}>
                      <ActionMenu
                        org={org}
                        onView={() => setSelectedOrg(org.id)}
                        onEdit={() => setEditOrg(org)}
                        onRefetch={() => { refetch(); utils.orgs.stats.invalidate(); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: "var(--sdc-card-border)" }}>
              <p className="text-xs" style={{ color: "var(--sdc-subheading)" }}>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, total)}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ color: "var(--sdc-subheading)" }}>
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-semibold" style={{ color: "var(--sdc-heading)" }}>Page {page} of {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg disabled:opacity-40" style={{ color: "var(--sdc-subheading)" }}>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals & Drawers */}
      {selectedOrg && (
        <OrgDetailDrawer
          orgId={selectedOrg}
          onClose={() => setSelectedOrg(null)}
          onEdit={(org) => { setSelectedOrg(null); setEditOrg(org); }}
        />
      )}
      {(showCreate || editOrg) && (
        <OrgModal
          org={editOrg}
          onClose={() => { setShowCreate(false); setEditOrg(null); }}
          onSaved={() => { setShowCreate(false); setEditOrg(null); refetch(); utils.orgs.stats.invalidate(); }}
        />
      )}
    </>
  );
}
