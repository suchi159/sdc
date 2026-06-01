import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useSearchParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Search, Award, Shield, ShieldCheck, ShieldX, ChevronLeft, ChevronRight,
  Download, ExternalLink, RotateCcw, Users, CheckCircle2, Clock, XCircle,
  Filter, SortAsc, Grid3X3, List, Copy, Check, Code2
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

// Cert types are loaded dynamically from the DB via trpc.credentials.certTypes
// ─── Status badge ────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }}>
        <CheckCircle2 className="w-3 h-3" />
        ACTIVE
      </span>
    );
  }
  if (status === "expired") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ background: "rgba(107,114,128,0.12)", color: "#9ca3af", border: "1px solid rgba(107,114,128,0.25)" }}>
        <Clock className="w-3 h-3" />
        EXPIRED
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ background: "rgba(239,68,68,0.12)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.25)" }}>
      <XCircle className="w-3 h-3" />
      REVOKED
    </span>
  );
}

// ─── Credential card ──────────────────────────────────────────────────────────
interface RosterItem {
  credentialId: string;
  credentialIdDisplay: string;
  status: string;
  issueDate: Date | null;
  expiryDate: Date | null;
  holderName: string | null;
  templateName: string | null;
  orgName: string | null;
  badgeImageUrl: string | null;
  skills: unknown;
}

function CredentialCard({ item }: { item: RosterItem }) {
  const initials = (item.holderName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const issueYear = item.issueDate ? new Date(item.issueDate).getFullYear() : "—";
  const expiryStr = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "No expiry";

  // Split name into first/last for display
  const nameParts = (item.holderName || "Unknown Holder").split(" ");
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "";

  return (
    <div className="rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 hover:translate-y-[-2px]"
      style={{
        background: "var(--sdc-card-bg)",
        border: "1px solid var(--sdc-border)",
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }}>
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Avatar / badge image */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ background: "linear-gradient(135deg, #c8972a22, #c8972a44)", color: "#c8972a", border: "2px solid rgba(200,151,42,0.3)" }}>
            {initials}
          </div>
          {item.badgeImageUrl && (
            <img src={item.badgeImageUrl} alt="badge"
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2"
              style={{ borderColor: "var(--sdc-card-bg)", objectFit: "cover" }} />
          )}
        </div>

        {/* Name + status */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={item.status} />
          </div>
          <p className="font-bold text-sm mt-1 leading-tight" style={{ color: "var(--sdc-heading)" }}>
            {lastName}{firstName ? `, ${firstName}` : ""}
          </p>
          <p className="text-xs mt-0.5 truncate" style={{ color: "var(--sdc-muted)" }}>
            {item.orgName || "SDC Certifications"}
          </p>
        </div>
      </div>

      {/* Certification name */}
      <div className="rounded-lg px-3 py-2" style={{ background: "rgba(200,151,42,0.06)", border: "1px solid rgba(200,151,42,0.12)" }}>
        <p className="text-xs font-medium leading-snug" style={{ color: "var(--sdc-heading)" }}>
          {item.templateName || "Certification"}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--sdc-muted)" }}>
          Issued {issueYear} · Expires {expiryStr}
        </p>
      </div>

      {/* Credential ID (masked) */}
      <div className="flex items-center justify-between gap-2">
        <code className="text-xs font-mono px-2 py-1 rounded"
          style={{ background: "var(--sdc-page-bg)", color: "var(--sdc-muted)", border: "1px solid var(--sdc-border)" }}>
          {item.credentialIdDisplay}
        </code>
        <Link href={`/verify/${item.credentialId}`}>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs"
            style={{ color: "#c8972a" }}>
            <ExternalLink className="w-3 h-3" />
            Verify
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Table row (list view) ────────────────────────────────────────────────────
function CredentialRow({ item, index }: { item: RosterItem; index: number }) {
  const nameParts = (item.holderName || "Unknown").split(" ");
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0];
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : "—";

  return (
    <tr className={index % 2 === 0 ? "" : ""}
      style={{ borderBottom: "1px solid var(--sdc-border)" }}>
      <td className="py-3 px-4 text-sm font-medium" style={{ color: "var(--sdc-heading)" }}>
        {lastName}
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: "var(--sdc-text)" }}>
        {firstName}
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: "var(--sdc-text)" }}>
        {item.templateName || "—"}
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: "var(--sdc-muted)" }}>
        {item.issueDate ? new Date(item.issueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </td>
      <td className="py-3 px-4 text-sm" style={{ color: "var(--sdc-muted)" }}>
        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "No expiry"}
      </td>
      <td className="py-3 px-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="py-3 px-4">
        <code className="text-xs font-mono" style={{ color: "var(--sdc-muted)" }}>
          {item.credentialIdDisplay}
        </code>
      </td>
      <td className="py-3 px-4">
        <Link href={`/verify/${item.credentialId}`}>
          <Button size="sm" variant="ghost" className="h-7 px-2 gap-1 text-xs" style={{ color: "#c8972a" }}>
            <ExternalLink className="w-3 h-3" />
            Verify
          </Button>
        </Link>
      </td>
    </tr>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CertificateRoster() {
  const { user } = useAuth();
  const isAdmin = user && ["super_admin", "org_admin"].includes(user.role);

  // ── URL search params as single source of truth ──
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current values from URL (with defaults)
  const lastNameSearch = searchParams.get("lastName") ?? "";
  const firstNameSearch = searchParams.get("firstName") ?? "";
  const certTypeFilter = searchParams.get("cert") ?? "All Certifications";
  const certNumberSearch = searchParams.get("certNum") ?? "";
  const statusFilter = (searchParams.get("status") ?? "active") as "active" | "all";
  const page = parseInt(searchParams.get("page") ?? "1", 10) || 1;
  const viewMode = (searchParams.get("view") ?? "grid") as "grid" | "list";

  // Local draft state for the form inputs (only committed on Search click / Enter)
  const [draftLastName, setDraftLastName] = useState(lastNameSearch);
  const [draftFirstName, setDraftFirstName] = useState(firstNameSearch);
  const [draftCertType, setDraftCertType] = useState(certTypeFilter);
  const [draftCertNum, setDraftCertNum] = useState(certNumberSearch);
  const [draftStatus, setDraftStatus] = useState<"active" | "all">(statusFilter);

  // Sync draft when URL changes externally (e.g. browser back/forward)
  useEffect(() => {
    setDraftLastName(searchParams.get("lastName") ?? "");
    setDraftFirstName(searchParams.get("firstName") ?? "");
    setDraftCertType(searchParams.get("cert") ?? "All Certifications");
    setDraftCertNum(searchParams.get("certNum") ?? "");
    setDraftStatus((searchParams.get("status") ?? "active") as "active" | "all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  // Helper: build a new URLSearchParams object from current values
  const buildParams = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const next = new URLSearchParams();
      const apply = (key: string, val: string | undefined, defaultVal?: string) => {
        if (val && val !== defaultVal) next.set(key, val);
      };
      apply("lastName", overrides.lastName ?? draftLastName);
      apply("firstName", overrides.firstName ?? draftFirstName);
      apply("cert", overrides.cert ?? (draftCertType === "All Certifications" ? "" : draftCertType));
      apply("certNum", overrides.certNum ?? draftCertNum);
      apply("status", overrides.status ?? draftStatus, "active");
      apply("page", overrides.page ?? "1", "1");
      apply("view", overrides.view ?? viewMode, "grid");
      return next;
    },
    [draftLastName, draftFirstName, draftCertType, draftCertNum, draftStatus, viewMode]
  );

  const handleSearch = useCallback(() => {
    const next = new URLSearchParams();
    if (draftLastName.trim()) next.set("lastName", draftLastName.trim());
    if (draftFirstName.trim()) next.set("firstName", draftFirstName.trim());
    if (draftCertType && draftCertType !== "All Certifications") next.set("cert", draftCertType);
    if (draftCertNum.trim()) next.set("certNum", draftCertNum.trim());
    if (draftStatus !== "active") next.set("status", draftStatus);
    if (viewMode !== "grid") next.set("view", viewMode);
    // page resets to 1 on new search
    setSearchParams(next);
  }, [draftLastName, draftFirstName, draftCertType, draftCertNum, draftStatus, viewMode, setSearchParams]);

  const handleReset = () => {
    setDraftLastName("");
    setDraftFirstName("");
    setDraftCertType("All Certifications");
    setDraftCertNum("");
    setDraftStatus("active");
    setSearchParams(new URLSearchParams());
  };

  const handlePageChange = (newPage: number) => {
    const next = buildParams({ page: String(newPage) });
    setSearchParams(next);
  };

  const setViewMode = (mode: "grid" | "list") => {
    const next = buildParams({ view: mode });
    setSearchParams(next);
  };

  // Copy Link state
  const [copied, setCopied] = useState(false);

  // Embed widget state
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedCopied, setEmbedCopied] = useState(false);
  const embedUrl = typeof window !== "undefined" ? window.location.href : "/verify/roster";
  const embedSnippet = `<iframe\n  src="${embedUrl}"\n  width="100%"\n  height="700"\n  frameborder="0"\n  style="border-radius:12px;border:1px solid #2a2d3e"\n  title="SDC Certificate Holder Roster"\n  allow="clipboard-write"\n></iframe>`;
  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedSnippet).then(() => {
      setEmbedCopied(true);
      setTimeout(() => setEmbedCopied(false), 2500);
    });
  };
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied!", {
        description: "Share this URL to reproduce the exact search results.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {
      // Fallback for browsers that block clipboard API
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      toast.success("Link copied!", { duration: 3000 });
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Build query params from URL state
  const queryParams = useMemo(() => ({
    lastName: lastNameSearch,
    firstName: firstNameSearch,
    certType: certTypeFilter === "All Certifications" ? "" : certTypeFilter,
    certNumber: certNumberSearch,
    status: statusFilter,
    page,
    pageSize: 24,
  }), [lastNameSearch, firstNameSearch, certTypeFilter, certNumberSearch, statusFilter, page]);

  const { data, isLoading } = trpc.credentials.roster.useQuery(queryParams);

  // Dynamic cert type options from DB
  const { data: certTypesData } = trpc.credentials.certTypes.useQuery();
  const certTypeOptions = ["All Certifications", ...(certTypesData?.types ?? [])];

  // Admin CSV export
  const exportQuery = trpc.credentials.exportCsv.useQuery(
    { status: statusFilter },
    { enabled: false }
  );

  const handleExport = async () => {
    const result = await exportQuery.refetch();
    if (result.data?.csv) {
      const blob = new Blob([result.data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-roster-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Stats
  const activeCount = items.filter(i => i.status === "active").length;
  const expiredCount = items.filter(i => i.status === "expired").length;

  return (
    <div className="min-h-screen" style={{ background: "var(--sdc-page-bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* ── Hero header ── */}
      <div className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f1117 0%, #1a1d2e 50%, #0f1117 100%)", borderBottom: "1px solid var(--sdc-border)" }}>
        {/* Decorative glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
            style={{ background: "radial-gradient(circle, #c8972a, transparent)" }} />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl"
            style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)" }}>
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8972a" }}>
                  Public Directory
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2" style={{ color: "#f8fafc" }}>
                Certificate Holder Roster
              </h1>
              <p className="text-sm max-w-xl" style={{ color: "#94a3b8" }}>
                Verify credentials issued by SDC Certifications. All certificates are cryptographically signed and publicly verifiable.
                Results are sorted alphabetically by last name.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-4 flex-wrap">
              {[
                { icon: Users, label: "Total Results", value: total.toLocaleString(), color: "#c8972a" },
                { icon: CheckCircle2, label: "Active", value: activeCount.toString(), color: "#10b981" },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-xl px-4 py-3 text-center min-w-[90px]"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
                  <p className="text-xl font-bold" style={{ color: "#f8fafc" }}>{value}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ── Search & Filter Panel ── */}
        <div className="rounded-2xl p-5 mb-6"
          style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-border)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4" style={{ color: "#c8972a" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>Search & Filter</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {/* Last Name */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--sdc-muted)" }}>
                Last Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--sdc-muted)" }} />
                <Input
                  value={draftLastName}
                  onChange={e => setDraftLastName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  placeholder="e.g. Thompson"
                  className="pl-8 h-9 text-sm"
                  style={{ background: "var(--sdc-page-bg)", borderColor: "var(--sdc-border)", color: "var(--sdc-text)" }}
                />
              </div>
            </div>

            {/* First Name */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--sdc-muted)" }}>
                First Name
              </label>
              <Input
                value={draftFirstName}
                onChange={e => setDraftFirstName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. Liam"
                className="h-9 text-sm"
                style={{ background: "var(--sdc-page-bg)", borderColor: "var(--sdc-border)", color: "var(--sdc-text)" }}
              />
            </div>

            {/* Certification Type */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--sdc-muted)" }}>
                Certification Type
              </label>
              <Select value={draftCertType} onValueChange={setDraftCertType}>
                <SelectTrigger className="h-9 text-sm" style={{ background: "var(--sdc-page-bg)", borderColor: "var(--sdc-border)", color: "var(--sdc-text)" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {certTypeOptions.map((t: string) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Certificate Number */}
            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: "var(--sdc-muted)" }}>
                Certificate Number
              </label>
              <Input
                value={draftCertNum}
                onChange={e => setDraftCertNum(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
                placeholder="e.g. SDC-2026-XXXXX"
                className="h-9 text-sm font-mono"
                style={{ background: "var(--sdc-page-bg)", borderColor: "var(--sdc-border)", color: "var(--sdc-text)" }}
              />
            </div>
          </div>

          {/* Status + Actions row */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 rounded-lg p-1"
              style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-border)" }}>
              {(["active", "all"] as const).map(s => (
                <button key={s}
                  onClick={() => setDraftStatus(s)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-all"
                  style={{
                    background: draftStatus === s ? "linear-gradient(135deg, #c8972a, #dba93b)" : "transparent",
                    color: draftStatus === s ? "#fff" : "var(--sdc-muted)",
                  }}>
                  {s === "active" ? "Active Only" : "All Status"}
                </button>
              ))}
            </div>

            <Button onClick={handleSearch} size="sm" className="h-9 px-4 gap-2"
              style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff", border: "none" }}>
              <Search className="w-3.5 h-3.5" />
              Search
            </Button>

            <Button onClick={handleReset} size="sm" variant="outline" className="h-9 px-3 gap-2"
              style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>

            <div className="ml-auto flex items-center gap-2">
              {/* View toggle */}
              <div className="flex items-center gap-1 rounded-lg p-1"
                style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-border)" }}>
                <button onClick={() => setViewMode("grid")}
                  className="p-1.5 rounded transition-all"
                  style={{ background: viewMode === "grid" ? "rgba(200,151,42,0.15)" : "transparent", color: viewMode === "grid" ? "#c8972a" : "var(--sdc-muted)" }}>
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode("list")}
                  className="p-1.5 rounded transition-all"
                  style={{ background: viewMode === "list" ? "rgba(200,151,42,0.15)" : "transparent", color: viewMode === "list" ? "#c8972a" : "var(--sdc-muted)" }}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Embed widget */}
              <Button
                onClick={() => setEmbedOpen(true)}
                size="sm"
                variant="outline"
                className="h-9 px-3 gap-2"
                style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
                <Code2 className="w-3.5 h-3.5" />
                Embed
              </Button>

              {/* Copy Link */}
              <Button
                onClick={handleCopyLink}
                size="sm"
                variant="outline"
                className="h-9 px-3 gap-2 transition-all"
                style={{
                  borderColor: copied ? "rgba(16,185,129,0.5)" : "var(--sdc-border)",
                  color: copied ? "#10b981" : "var(--sdc-muted)",
                  background: copied ? "rgba(16,185,129,0.06)" : "transparent",
                }}>
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Link"}
              </Button>

              {/* Admin CSV export */}
              {isAdmin && (
                <Button onClick={handleExport} size="sm" variant="outline" className="h-9 px-3 gap-2"
                  style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
                  <Download className="w-3.5 h-3.5" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Embed Dialog ── */}
        {embedOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.7)" }}
            onClick={() => setEmbedOpen(false)}>
            <div className="rounded-2xl p-6 w-full max-w-lg"
              style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-border)" }}
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4" style={{ color: "#c8972a" }} />
                  <span className="font-semibold text-sm" style={{ color: "var(--sdc-heading)" }}>Embed Roster Widget</span>
                </div>
                <button onClick={() => setEmbedOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-lg"
                  style={{ color: "var(--sdc-muted)", background: "var(--sdc-page-bg)" }}>×</button>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--sdc-muted)" }}>
                Paste this snippet into any webpage to embed a live, filtered view of the certificate holder roster.
                The iframe reflects your current search filters.
              </p>
              <pre className="rounded-xl p-4 text-xs font-mono overflow-x-auto mb-4"
                style={{ background: "var(--sdc-page-bg)", border: "1px solid var(--sdc-border)", color: "#a5f3fc", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{embedSnippet}</pre>
              <div className="flex gap-2">
                <Button onClick={handleCopyEmbed} size="sm" className="gap-2 flex-1"
                  style={{
                    background: embedCopied ? "rgba(16,185,129,0.15)" : "linear-gradient(135deg,#c8972a,#dba93b)",
                    color: embedCopied ? "#10b981" : "#fff",
                    border: embedCopied ? "1px solid rgba(16,185,129,0.4)" : "none",
                  }}>
                  {embedCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {embedCopied ? "Copied!" : "Copy Snippet"}
                </Button>
                <Button onClick={() => setEmbedOpen(false)} size="sm" variant="outline" className="gap-2"
                  style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* ── Results header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4" style={{ color: "var(--sdc-muted)" }} />
            <span className="text-sm" style={{ color: "var(--sdc-muted)" }}>
              {isLoading ? "Loading…" : `${total.toLocaleString()} certificate holder${total !== 1 ? "s" : ""} — sorted A–Z by last name`}
            </span>
          </div>
          {totalPages > 1 && (
            <span className="text-xs" style={{ color: "var(--sdc-muted)" }}>
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {/* ── Loading state ── */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl p-4 animate-pulse"
                style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-border)", height: 180 }} />
            ))}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && items.length === 0 && (
          <div className="rounded-2xl p-16 text-center"
            style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-border)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: "rgba(200,151,42,0.08)", border: "1px solid rgba(200,151,42,0.15)" }}>
              <Award className="w-8 h-8" style={{ color: "#c8972a" }} />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--sdc-heading)" }}>
              No certificate holders found
            </h3>
            <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--sdc-muted)" }}>
              Try adjusting your search filters, or click Reset to browse all active certificate holders.
            </p>
            <Button onClick={handleReset} size="sm" className="mt-4 gap-2"
              style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)", color: "#fff", border: "none" }}>
              <RotateCcw className="w-3.5 h-3.5" />
              Show All
            </Button>
          </div>
        )}

        {/* ── Grid view ── */}
        {!isLoading && items.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map((item) => (
              <CredentialCard key={item.credentialId} item={item as RosterItem} />
            ))}
          </div>
        )}

        {/* ── List / table view ── */}
        {!isLoading && items.length > 0 && viewMode === "list" && (
          <div className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--sdc-border)" }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: "var(--sdc-card-bg)", borderBottom: "2px solid var(--sdc-border)" }}>
                    {["Last Name", "First Name", "Certification", "Issue Date", "Expiry Date", "Status", "Cert #", ""].map(h => (
                      <th key={h} className="py-3 px-4 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: "var(--sdc-muted)" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody style={{ background: "var(--sdc-page-bg)" }}>
                  {items.map((item, i) => (
                    <CredentialRow key={item.credentialId} item={item as RosterItem} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline" size="sm" className="gap-1"
              disabled={page <= 1}
              onClick={() => handlePageChange(page - 1)}
              style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) {
                  pageNum = i + 1;
                } else if (page <= 4) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 3) {
                  pageNum = totalPages - 6 + i;
                } else {
                  pageNum = page - 3 + i;
                }
                return (
                  <button key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: page === pageNum ? "linear-gradient(135deg, #c8972a, #dba93b)" : "transparent",
                      color: page === pageNum ? "#fff" : "var(--sdc-muted)",
                      border: page === pageNum ? "none" : "1px solid var(--sdc-border)",
                    }}>
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <Button
              variant="outline" size="sm" className="gap-1"
              disabled={page >= totalPages}
              onClick={() => handlePageChange(page + 1)}
              style={{ borderColor: "var(--sdc-border)", color: "var(--sdc-muted)" }}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* ── Footer note ── */}
        <div className="mt-10 pt-6 text-center" style={{ borderTop: "1px solid var(--sdc-border)" }}>
          <p className="text-xs" style={{ color: "var(--sdc-muted)" }}>
            All credentials listed are cryptographically signed and independently verifiable.
            Certificate numbers are partially masked in the public directory.
            Click <strong>Verify</strong> on any record to view the full certificate and confirm authenticity.
          </p>
        </div>
      </div>
    </div>
  );
}
