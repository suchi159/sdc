import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ChevronDown, ChevronUp, CheckCircle, XCircle, AlertCircle,
  Loader2, Settings, Trash2, TestTube, Save, Power, ExternalLink
} from "lucide-react";
import SDCLayout from "@/components/SDCLayout";

// ─── Brand SVG logos ──────────────────────────────────────────────────────────

function PearsonLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#003057"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial">P</text>
    </svg>
  );
}
function PrometricLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#E31837"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">PRO</text>
    </svg>
  );
}
function PSILogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#00A3E0"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold" fontFamily="Arial">PSI</text>
    </svg>
  );
}
function MoodleLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#f98012"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">MDL</text>
    </svg>
  );
}
function CanvasLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#E66000"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">CVS</text>
    </svg>
  );
}
function BlackboardLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#1a1a1a"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold" fontFamily="Arial">BB</text>
    </svg>
  );
}
function ScormLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#4CAF50"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">SCORM</text>
    </svg>
  );
}
function XAPILogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#9C27B0"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">xAPI</text>
    </svg>
  );
}
function CredlyLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#FF6B35"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">CREDLY</text>
    </svg>
  );
}
function ZapierLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#FF4A00"/>
      <path d="M20 8l3.5 8.5H32l-7 5 2.5 8.5L20 25l-7.5 5 2.5-8.5-7-5h8.5L20 8z" fill="white"/>
    </svg>
  );
}
function SAMLLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#0078D4"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">SAML</text>
    </svg>
  );
}
function OIDCLogo() {
  return (
    <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6">
      <rect width="40" height="40" rx="8" fill="#00BCD4"/>
      <text x="20" y="26" textAnchor="middle" fill="white" fontSize="9" fontWeight="bold" fontFamily="Arial">OIDC</text>
    </svg>
  );
}

// ─── Provider metadata ────────────────────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "password" | "url" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
};

type ProviderDef = {
  key: string;
  name: string;
  description: string;
  category: string;
  Logo: React.ComponentType;
  accentColor: string;
  docsUrl: string;
  fields: FieldDef[];
};

const PROVIDERS: ProviderDef[] = [
  {
    key: "pearson_vue",
    name: "Pearson VUE",
    description: "Deliver exams through Pearson VUE's global test center network and OnVUE remote proctoring.",
    category: "Testing Networks",
    Logo: PearsonLogo,
    accentColor: "#003057",
    docsUrl: "https://pearsonvue.com/op/developer",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "pvue_...", required: true },
      { key: "accountId", label: "Account ID", type: "text", placeholder: "Your Pearson VUE account ID", required: true },
      { key: "environment", label: "Environment", type: "select", options: [{ value: "sandbox", label: "Sandbox" }, { value: "production", label: "Production" }], required: true },
    ],
  },
  {
    key: "prometric",
    name: "Prometric",
    description: "Integrate with Prometric's global testing network for in-person and remote exam delivery.",
    category: "Testing Networks",
    Logo: PrometricLogo,
    accentColor: "#E31837",
    docsUrl: "https://prometric.com/technology",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "prm_...", required: true },
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Your Prometric client ID", required: true },
      { key: "baseUrl", label: "Base URL", type: "url", placeholder: "https://api.prometric.com", required: false },
    ],
  },
  {
    key: "psi",
    name: "PSI Exams",
    description: "Connect to PSI's assessment delivery platform for online and test center exams.",
    category: "Testing Networks",
    Logo: PSILogo,
    accentColor: "#00A3E0",
    docsUrl: "https://psiexams.com/",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "psi_...", required: true },
      { key: "accountCode", label: "Account Code", type: "text", placeholder: "Your PSI account code", required: true },
      { key: "baseUrl", label: "Base URL", type: "url", placeholder: "https://api.psiexams.com", required: false },
    ],
  },
  {
    key: "moodle",
    name: "Moodle LMS",
    description: "Sync exam results, credentials, and learner progress with your Moodle instance via REST API.",
    category: "LMS",
    Logo: MoodleLogo,
    accentColor: "#f98012",
    docsUrl: "https://docs.moodle.org/dev/Web_service_API_functions",
    fields: [
      { key: "baseUrl", label: "Moodle Base URL", type: "url", placeholder: "https://moodle.yourorg.com", required: true },
      { key: "wsToken", label: "Web Service Token", type: "password", placeholder: "Your Moodle WS token", required: true },
      { key: "serviceShortName", label: "Service Short Name", type: "text", placeholder: "moodle_mobile_app", required: false },
    ],
  },
  {
    key: "canvas",
    name: "Canvas LMS",
    description: "Push grades, issue badges, and sync learner data with Instructure Canvas.",
    category: "LMS",
    Logo: CanvasLogo,
    accentColor: "#E66000",
    docsUrl: "https://canvas.instructure.com/doc/api/",
    fields: [
      { key: "baseUrl", label: "Canvas Base URL", type: "url", placeholder: "https://canvas.yourschool.edu", required: true },
      { key: "accessToken", label: "Access Token", type: "password", placeholder: "Your Canvas access token", required: true },
      { key: "accountId", label: "Account ID", type: "text", placeholder: "1", required: false },
    ],
  },
  {
    key: "blackboard",
    name: "Blackboard Learn",
    description: "Integrate with Blackboard Learn for grade passback and learner activity sync.",
    category: "LMS",
    Logo: BlackboardLogo,
    accentColor: "#1a1a1a",
    docsUrl: "https://developer.blackboard.com/",
    fields: [
      { key: "baseUrl", label: "Blackboard Base URL", type: "url", placeholder: "https://blackboard.yourorg.com", required: true },
      { key: "applicationKey", label: "Application Key", type: "text", placeholder: "Your application key", required: true },
      { key: "applicationSecret", label: "Application Secret", type: "password", placeholder: "Your application secret", required: true },
    ],
  },
  {
    key: "scorm",
    name: "SCORM Cloud",
    description: "Host and track SCORM 1.2 / SCORM 2004 / AICC content via Rustici SCORM Cloud.",
    category: "Standards",
    Logo: ScormLogo,
    accentColor: "#4CAF50",
    docsUrl: "https://cloud.scorm.com/docs/v2/",
    fields: [
      { key: "appId", label: "App ID", type: "text", placeholder: "Your SCORM Cloud App ID", required: true },
      { key: "secretKey", label: "Secret Key", type: "password", placeholder: "Your SCORM Cloud secret key", required: true },
      { key: "baseUrl", label: "Base URL", type: "url", placeholder: "https://cloud.scorm.com", required: false },
    ],
  },
  {
    key: "xapi",
    name: "xAPI / Tin Can LRS",
    description: "Send xAPI statements to any Learning Record Store (LRS) for granular activity tracking.",
    category: "Standards",
    Logo: XAPILogo,
    accentColor: "#9C27B0",
    docsUrl: "https://xapi.com/overview/",
    fields: [
      { key: "endpoint", label: "LRS Endpoint", type: "url", placeholder: "https://lrs.yourorg.com/xapi", required: true },
      { key: "username", label: "Username / Key", type: "text", placeholder: "LRS username or key", required: true },
      { key: "password", label: "Password / Secret", type: "password", placeholder: "LRS password or secret", required: true },
    ],
  },
  {
    key: "credly",
    name: "Credly",
    description: "Automatically issue and distribute digital badges via Credly's Acclaim platform.",
    category: "Badges",
    Logo: CredlyLogo,
    accentColor: "#FF6B35",
    docsUrl: "https://credly.com/pages/api",
    fields: [
      { key: "apiKey", label: "API Key", type: "password", placeholder: "Your Credly API key", required: true },
      { key: "organizationId", label: "Organization ID", type: "text", placeholder: "Your Credly organization ID", required: true },
    ],
  },
  {
    key: "zapier",
    name: "Zapier",
    description: "Trigger Zaps when credentials are issued, exams are completed, or vouchers are redeemed.",
    category: "Automation",
    Logo: ZapierLogo,
    accentColor: "#FF4A00",
    docsUrl: "https://zapier.com/apps/webhook/integrations",
    fields: [
      { key: "webhookUrl", label: "Zapier Webhook URL", type: "url", placeholder: "https://hooks.zapier.com/hooks/catch/...", required: true },
    ],
  },
  {
    key: "saml",
    name: "SAML SSO",
    description: "Enable SAML 2.0 single sign-on with your identity provider (Okta, Azure AD, ADFS, etc.).",
    category: "SSO",
    Logo: SAMLLogo,
    accentColor: "#0078D4",
    docsUrl: "https://docs.oasis-open.org/security/saml/",
    fields: [
      { key: "idpEntityId", label: "IdP Entity ID", type: "text", placeholder: "https://idp.yourorg.com/saml2/metadata", required: true },
      { key: "idpSsoUrl", label: "IdP SSO URL", type: "url", placeholder: "https://idp.yourorg.com/saml2/sso", required: true },
      { key: "idpCertificate", label: "IdP X.509 Certificate", type: "password", placeholder: "Paste PEM certificate", required: true },
      { key: "spEntityId", label: "SP Entity ID", type: "text", placeholder: "https://sdccertify.com/saml/metadata", required: false },
    ],
  },
  {
    key: "oidc",
    name: "OpenID Connect SSO",
    description: "Configure OIDC-based SSO with any compliant identity provider (Auth0, Keycloak, Google, etc.).",
    category: "SSO",
    Logo: OIDCLogo,
    accentColor: "#00BCD4",
    docsUrl: "https://openid.net/connect/",
    fields: [
      { key: "issuerUrl", label: "Issuer URL", type: "url", placeholder: "https://accounts.google.com", required: true },
      { key: "clientId", label: "Client ID", type: "text", placeholder: "Your OIDC client ID", required: true },
      { key: "clientSecret", label: "Client Secret", type: "password", placeholder: "Your OIDC client secret", required: true },
      { key: "redirectUri", label: "Redirect URI", type: "url", placeholder: "https://sdccertify.com/auth/oidc/callback", required: false },
    ],
  },
];

const CATEGORY_ORDER = ["Testing Networks", "LMS", "Standards", "Badges", "Automation", "SSO"];

// ─── Status badge ─────────────────────────────────────────────────────────────

type IntegrationStatus = "connected" | "error" | "not_configured";

function StatusBadge({ status }: { status: IntegrationStatus }) {
  if (status === "connected") return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
      <CheckCircle className="w-3 h-3" /> Connected
    </span>
  );
  if (status === "error") return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/15 text-red-400 border border-red-500/25">
      <XCircle className="w-3 h-3" /> Disabled
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-500/15 text-slate-400 border border-slate-500/25">
      <AlertCircle className="w-3 h-3" /> Not Configured
    </span>
  );
}

// ─── Provider card ────────────────────────────────────────────────────────────

function ProviderCard({ provider, savedConfig }: { provider: ProviderDef; savedConfig: Record<string, any> | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    provider.fields.forEach(f => { defaults[f.key] = ""; });
    return defaults;
  });
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [testing, setTesting] = useState(false);

  const utils = trpc.useUtils();

  const saveMutation = trpc.integrations.save.useMutation({
    onSuccess: () => {
      toast.success(`${provider.name} configuration saved`);
      utils.integrations.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const testMutation = trpc.integrations.test.useMutation({
    onSuccess: (result) => {
      setTesting(false);
      setTestResult(result);
      if (result.success) toast.success(`${provider.name}: Connection successful`);
      else toast.error(`${provider.name}: ${result.message}`);
    },
    onError: (e) => {
      setTesting(false);
      toast.error(e.message);
    },
  });

  const deleteMutation = trpc.integrations.delete.useMutation({
    onSuccess: () => {
      toast.success(`${provider.name} integration cleared`);
      utils.integrations.getAll.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const isConfigured = !!savedConfig && savedConfig._hasCredentials;
  const isEnabled = savedConfig?.enabled === true;
  const status: IntegrationStatus = isConfigured ? (isEnabled ? "connected" : "error") : "not_configured";

  const handleSave = () => {
    const config: Record<string, string> = {};
    provider.fields.forEach(f => { if (form[f.key]) config[f.key] = form[f.key]; });
    saveMutation.mutate({ provider: provider.key, config, enabled: true });
  };

  const handleTest = () => {
    setTesting(true);
    setTestResult(null);
    const config: Record<string, string> = {};
    provider.fields.forEach(f => { if (form[f.key]) config[f.key] = form[f.key]; });
    testMutation.mutate({ provider: provider.key, config });
  };

  const { Logo } = provider;

  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border shadow-sm">
      {/* Header row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Logo */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden bg-background border border-border">
          <Logo />
        </div>

        {/* Name + description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm text-foreground">{provider.name}</span>
            <StatusBadge status={status} />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{provider.description}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {isConfigured && (
            <button
              className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
              title="Clear credentials"
              onClick={e => { e.stopPropagation(); deleteMutation.mutate({ provider: provider.key }); }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded config form */}
      {expanded && (
        <div className="border-t border-border bg-muted/20 px-4 pb-5 pt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground">{provider.description}</p>
            <a
              href={provider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-amber-500 hover:text-amber-400 transition-colors"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3" /> Docs
            </a>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            {provider.fields.map(field => (
              <div key={field.key}>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
                {field.type === "select" ? (
                  <select
                    className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  >
                    <option value="">Select…</option>
                    {field.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    className="w-full px-3 py-2 rounded-lg text-sm bg-background border border-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder={field.placeholder}
                    value={form[field.key]}
                    onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Saved hint */}
          {isConfigured && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs flex items-center gap-2">
              <Settings className="w-3 h-3 flex-shrink-0" />
              Credentials already saved. Enter new values above to update them.
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div className={`mb-3 px-3 py-2 rounded-lg flex items-start gap-2 text-xs border ${testResult.success ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {testResult.success
                ? <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                : <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />}
              <div>
                <p className="font-semibold">{testResult.success ? "Connection successful" : "Connection failed"}</p>
                <p className="text-muted-foreground mt-0.5">{testResult.message}{testResult.latencyMs > 0 && ` · ${testResult.latencyMs}ms`}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50"
              onClick={handleSave}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Save Configuration
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 border border-indigo-500/25 transition-colors disabled:opacity-50"
              onClick={handleTest}
              disabled={testing || testMutation.isPending}
            >
              {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <TestTube className="w-3 h-3" />}
              Test Connection
            </button>
            {isConfigured && (
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors border ${
                  isEnabled
                    ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/25"
                    : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/25"
                }`}
                onClick={() => saveMutation.mutate({ provider: provider.key, config: {}, enabled: !isEnabled })}
                disabled={saveMutation.isPending}
              >
                <Power className="w-3 h-3" />
                {isEnabled ? "Disable" : "Enable"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Integrations() {
  const { data: savedConfigs = {}, isLoading } = trpc.integrations.getAll.useQuery(undefined, {
    retry: false,
  });

  const categories = CATEGORY_ORDER.filter(cat => PROVIDERS.some(p => p.category === cat));

  const connectedCount = PROVIDERS.filter(p => {
    const c = (savedConfigs as Record<string, any>)[p.key];
    return c && c._hasCredentials && c.enabled;
  }).length;

  return (
    <SDCLayout>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-amber-500/15 border border-amber-500/25">
              <Settings className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Integrations</h1>
              <p className="text-sm text-muted-foreground">
                Connect third-party services to extend platform capabilities.
                {!isLoading && (
                  <span className="ml-2 font-semibold text-amber-500">
                    {connectedCount} of {PROVIDERS.length} connected
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Category stats bar */}
        {!isLoading && (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-8">
            {CATEGORY_ORDER.map(cat => {
              const catProviders = PROVIDERS.filter(p => p.category === cat);
              const catConnected = catProviders.filter(p => {
                const c = (savedConfigs as Record<string, any>)[p.key];
                return c && c._hasCredentials && c.enabled;
              }).length;
              return (
                <div key={cat} className="rounded-lg bg-card border border-border px-3 py-2 text-center">
                  <p className="text-xs font-semibold text-foreground">{catConnected}/{catProviders.length}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{cat}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Provider list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{category}</h2>
                <div className="space-y-2">
                  {PROVIDERS.filter(p => p.category === category).map(provider => (
                    <ProviderCard
                      key={provider.key}
                      provider={provider}
                      savedConfig={(savedConfigs as Record<string, any>)[provider.key]}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SDCLayout>
  );
}
