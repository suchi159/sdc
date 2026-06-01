/**
 * OrgOnboarding.tsx
 * Multi-step wizard for organisations accepting a super-admin invite.
 * Route: /org/onboard?token=<invite_token>
 *
 * Steps:
 *  1. Verify invite (auto)
 *  2. Organisation profile (name, slug, industry, size, website)
 *  3. Admin account (name, email, password, confirm password)
 *  4. Review & submit
 *  5. Success
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Building2, User, CheckCircle2, ChevronRight, ChevronLeft, Loader2, AlertCircle, Shield, Globe, Users } from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

const INDUSTRIES = [
  "Technology", "Healthcare", "Finance", "Education", "Manufacturing",
  "Retail", "Government", "Non-profit", "Consulting", "Energy",
  "Legal", "Real Estate", "Media", "Transportation", "Other",
];

const ORG_SIZES = ["1–10", "11–50", "51–200", "201–500", "501–1000", "1000+"];

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { label: "Organisation", icon: Building2 },
  { label: "Admin Account", icon: User },
  { label: "Review", icon: Shield },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? "#c8972a" : active ? "rgba(200,151,42,0.15)" : "var(--sdc-card-border)",
                  border: active ? "2px solid #c8972a" : done ? "2px solid #c8972a" : "2px solid var(--sdc-card-border)",
                }}
              >
                {done ? (
                  <CheckCircle2 className="w-5 h-5 text-white" />
                ) : (
                  <Icon className="w-5 h-5" style={{ color: active ? "#c8972a" : "var(--sdc-text-muted)" }} />
                )}
              </div>
              <span className="text-xs font-medium" style={{ color: active ? "#c8972a" : "var(--sdc-text-muted)" }}>
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="w-16 h-0.5 mx-2 mb-5 transition-all duration-300"
                style={{ background: done ? "#c8972a" : "var(--sdc-card-border)" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Input component ──────────────────────────────────────────────────────────

function Field({
  label, value, onChange, type = "text", placeholder, hint, error, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; hint?: string; error?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "var(--sdc-card-bg)",
          border: `1px solid ${error ? "#dc2626" : "var(--sdc-card-border)"}`,
          color: "var(--sdc-heading)",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "#c8972a"; }}
        onBlur={e => { e.currentTarget.style.borderColor = error ? "#dc2626" : "var(--sdc-card-border)"; }}
      />
      {hint && !error && <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{hint}</p>}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label, value, onChange, options, placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: string[]; placeholder?: string; required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
        style={{
          background: "var(--sdc-card-bg)",
          border: "1px solid var(--sdc-card-border)",
          color: value ? "var(--sdc-heading)" : "var(--sdc-text-muted)",
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OrgOnboarding() {
  const [, navigate] = useLocation();

  // Parse token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") || "";

  // Invite data
  const { data: invite, isLoading: inviteLoading, error: inviteError } = trpc.orgInvites.getByToken.useQuery(
    { token },
    { enabled: !!token, retry: false }
  );

  // Step state
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Step 1: Org profile
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [industry, setIndustry] = useState("");
  const [size, setSize] = useState("");
  const [website, setWebsite] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  // Step 2: Admin account
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from invite
  useEffect(() => {
    if (invite) {
      if (invite.orgName) setOrgName(invite.orgName);
      if (invite.orgEmail) setAdminEmail(invite.orgEmail);
      if (invite.orgIndustry) setIndustry(invite.orgIndustry);
    }
  }, [invite]);

  // Auto-generate slug from org name
  useEffect(() => {
    if (!slugEdited && orgName) {
      setOrgSlug(slugify(orgName));
    }
  }, [orgName, slugEdited]);

  const acceptMutation = trpc.orgInvites.accept.useMutation({
    onSuccess: () => {
      setSubmitted(true);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create organisation");
    },
  });

  // ── Validation ────────────────────────────────────────────────────────────

  function validateStep0(): boolean {
    const e: Record<string, string> = {};
    if (!orgName.trim()) e.orgName = "Organisation name is required";
    if (!orgSlug.trim()) e.orgSlug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(orgSlug)) e.orgSlug = "Only lowercase letters, numbers, and hyphens";
    if (!industry) e.industry = "Please select an industry";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (!adminName.trim()) e.adminName = "Full name is required";
    if (!adminEmail.trim()) e.adminEmail = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) e.adminEmail = "Enter a valid email";
    if (!adminPassword) e.adminPassword = "Password is required";
    else if (adminPassword.length < 8) e.adminPassword = "Minimum 8 characters";
    if (adminPassword !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (step === 0 && !validateStep0()) return;
    if (step === 1 && !validateStep1()) return;
    setStep(s => s + 1);
  }

  function handleSubmit() {
    acceptMutation.mutate({
      token,
      orgName: orgName.trim(),
      orgSlug: orgSlug.trim(),
      industry: industry || undefined,
      website: website || undefined,
      size: size || undefined,
      adminName: adminName.trim(),
      adminEmail: adminEmail.trim(),
      adminPassword,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sdc-bg)" }}>
        <div className="text-center p-8 rounded-2xl max-w-md" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--sdc-heading)" }}>Invalid Invite Link</h2>
          <p className="text-sm mb-6" style={{ color: "var(--sdc-text-muted)" }}>This invite link is missing a token. Please use the link provided by your administrator.</p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#c8972a" }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (inviteLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sdc-bg)" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin" style={{ color: "#c8972a" }} />
          <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>Verifying invite…</p>
        </div>
      </div>
    );
  }

  if (inviteError || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--sdc-bg)" }}>
        <div className="text-center p-8 rounded-2xl max-w-md" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2" style={{ color: "var(--sdc-heading)" }}>Invite Not Valid</h2>
          <p className="text-sm mb-6" style={{ color: "var(--sdc-text-muted)" }}>
            {(inviteError as any)?.message || "This invite link is invalid or has expired."}
          </p>
          <button onClick={() => navigate("/")} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: "#c8972a" }}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--sdc-bg)" }}>
        <div className="text-center p-10 rounded-2xl max-w-lg w-full" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)" }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(200,151,42,0.12)" }}>
            <CheckCircle2 className="w-10 h-10" style={{ color: "#c8972a" }} />
          </div>
          <h2 className="text-2xl font-bold mb-3" style={{ color: "var(--sdc-heading)" }}>Organisation Created!</h2>
          <p className="text-sm mb-2" style={{ color: "var(--sdc-text-muted)" }}>
            <strong style={{ color: "var(--sdc-heading)" }}>{orgName}</strong> has been successfully onboarded to SDC Certifications.
          </p>
          <p className="text-sm mb-8" style={{ color: "var(--sdc-text-muted)" }}>
            Your admin account (<strong>{adminEmail}</strong>) is ready. Sign in to access your organisation portal.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => navigate("/login")}
              className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#c8972a" }}
            >
              Sign In to Your Portal
            </button>
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const PLAN_LABELS: Record<string, string> = {
    starter: "Starter", professional: "Professional", enterprise: "Enterprise", api_saas: "API / SaaS",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "var(--sdc-bg)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#c8972a" }}>
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "#c8972a" }}>SDC Certifications</p>
          <p className="text-sm font-bold" style={{ color: "var(--sdc-heading)" }}>Organisation Onboarding</p>
        </div>
      </div>

      {/* Invite banner */}
      <div className="w-full max-w-xl mb-6 px-4 py-3 rounded-xl flex items-center gap-3" style={{ background: "rgba(200,151,42,0.08)", border: "1px solid rgba(200,151,42,0.25)" }}>
        <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#c8972a" }} />
        <p className="text-sm" style={{ color: "var(--sdc-subheading)" }}>
          You have been invited to join on the <strong style={{ color: "#c8972a" }}>{PLAN_LABELS[invite.plan] || invite.plan}</strong> plan.
          {invite.notes && <span> Note: {invite.notes}</span>}
        </p>
      </div>

      {/* Wizard card */}
      <div className="w-full max-w-xl rounded-2xl p-8" style={{ background: "var(--sdc-card-bg)", border: "1px solid var(--sdc-card-border)", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <StepIndicator current={step} />

        {/* ── Step 0: Org Profile ── */}
        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--sdc-heading)" }}>Organisation Profile</h3>
              <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>Tell us about your organisation.</p>
            </div>
            <Field label="Organisation Name" value={orgName} onChange={setOrgName} placeholder="Acme Corp" required error={errors.orgName} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>
                URL Slug <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${errors.orgSlug ? "#dc2626" : "var(--sdc-card-border)"}` }}>
                <span className="px-3 py-2.5 text-sm border-r" style={{ background: "var(--sdc-card-border)", color: "var(--sdc-text-muted)", borderColor: "var(--sdc-card-border)" }}>
                  sdccertify.com/
                </span>
                <input
                  value={orgSlug}
                  onChange={e => { setOrgSlug(e.target.value); setSlugEdited(true); }}
                  placeholder="acme-corp"
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  style={{ background: "var(--sdc-card-bg)", color: "var(--sdc-heading)" }}
                />
              </div>
              {errors.orgSlug && <p className="text-xs text-red-500">{errors.orgSlug}</p>}
              <p className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>Lowercase letters, numbers, and hyphens only.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Industry" value={industry} onChange={setIndustry} options={INDUSTRIES} placeholder="Select industry" required />
              <SelectField label="Organisation Size" value={size} onChange={setSize} options={ORG_SIZES} placeholder="Select size" />
            </div>
            <Field label="Website" value={website} onChange={setWebsite} placeholder="https://acmecorp.com" hint="Optional — your public website URL" />
          </div>
        )}

        {/* ── Step 1: Admin Account ── */}
        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--sdc-heading)" }}>Admin Account</h3>
              <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>Create the primary administrator account for your organisation.</p>
            </div>
            <Field label="Full Name" value={adminName} onChange={setAdminName} placeholder="Jane Smith" required error={errors.adminName} />
            <Field label="Work Email" value={adminEmail} onChange={setAdminEmail} type="email" placeholder="jane@acmecorp.com" required error={errors.adminEmail} />
            <Field label="Password" value={adminPassword} onChange={setAdminPassword} type="password" placeholder="Minimum 8 characters" required error={errors.adminPassword} />
            <Field label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword} type="password" placeholder="Re-enter password" required error={errors.confirmPassword} />
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: "rgba(200,151,42,0.06)", border: "1px solid rgba(200,151,42,0.2)" }}>
              <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#c8972a" }} />
              <p className="text-xs" style={{ color: "var(--sdc-subheading)" }}>
                This account will have full admin access to your organisation portal. You can add additional team members after onboarding.
              </p>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ── */}
        {step === 2 && (
          <div className="flex flex-col gap-5">
            <div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "var(--sdc-heading)" }}>Review & Confirm</h3>
              <p className="text-sm" style={{ color: "var(--sdc-text-muted)" }}>Please review your details before creating the organisation.</p>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--sdc-card-border)" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(200,151,42,0.06)", borderBottom: "1px solid var(--sdc-card-border)" }}>
                <Building2 className="w-4 h-4" style={{ color: "#c8972a" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>Organisation</span>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-3">
                {[
                  { label: "Name", value: orgName },
                  { label: "Slug", value: orgSlug },
                  { label: "Industry", value: industry || "—" },
                  { label: "Size", value: size || "—" },
                  { label: "Website", value: website || "—" },
                  { label: "Plan", value: PLAN_LABELS[invite.plan] || invite.plan },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium mb-0.5" style={{ color: "var(--sdc-text-muted)" }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid var(--sdc-card-border)" }}>
              <div className="px-4 py-3 flex items-center gap-2" style={{ background: "rgba(200,151,42,0.06)", borderBottom: "1px solid var(--sdc-card-border)" }}>
                <User className="w-4 h-4" style={{ color: "#c8972a" }} />
                <span className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>Admin Account</span>
              </div>
              <div className="px-4 py-3 grid grid-cols-2 gap-3">
                {[
                  { label: "Name", value: adminName },
                  { label: "Email", value: adminEmail },
                  { label: "Role", value: "Organisation Admin" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs font-medium mb-0.5" style={{ color: "var(--sdc-text-muted)" }}>{label}</p>
                    <p className="text-sm font-semibold" style={{ color: "var(--sdc-heading)" }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="flex items-center justify-between mt-8">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : navigate("/")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ background: "var(--sdc-card-border)", color: "var(--sdc-subheading)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            {step === 0 ? "Cancel" : "Back"}
          </button>

          {step < 2 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: "#c8972a" }}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={acceptMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ background: "#c8972a" }}
            >
              {acceptMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
              ) : (
                <><CheckCircle2 className="w-4 h-4" /> Create Organisation</>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 mt-8">
        {[
          { icon: Shield, text: "ISO 27001 Aligned" },
          { icon: Globe, text: "ANSI/ANAB Compliant" },
          { icon: Users, text: "Multi-tenant Architecture" },
        ].map(({ icon: Icon, text }) => (
          <div key={text} className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5" style={{ color: "var(--sdc-text-muted)" }} />
            <span className="text-xs" style={{ color: "var(--sdc-text-muted)" }}>{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
