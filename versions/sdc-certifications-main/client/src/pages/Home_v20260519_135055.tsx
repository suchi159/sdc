import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield, Award, CheckCircle, BookOpen, Eye, BarChart3,
  Globe, FileText, Lock, Zap, ArrowRight,
  ChevronRight, Star, Building2, GraduationCap,
  Cpu, Key, Menu, X, ExternalLink, TrendingUp,
  ClipboardCheck, BadgeCheck, Layers, RefreshCw,
  Play, Quote, ChevronDown
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Platform", href: "#platform" },
  { label: "Compliance", href: "#compliance" },
  { label: "Verify", href: "/verify" },
];

const STATS = [
  { value: "500K+", label: "Credentials Issued" },
  { value: "1,200+", label: "Organizations" },
  { value: "99.97%", label: "Uptime SLA" },
  { value: "45", label: "Days to Deploy" },
];

const FEATURES = [
  { icon: Award, title: "Digital Credential Engine", desc: "Issue tamper-proof credentials with unique IDs, cryptographic SHA-256 signatures, and printable PDF certificates.", color: "text-amber-400", glow: "shadow-amber-500/20", gradient: "from-amber-500/15 to-amber-600/5", border: "border-amber-500/25" },
  { icon: Shield, title: "Open Badge 2.0", desc: "IMS Global-compliant digital badges with full metadata, verifiable JSON-LD, and one-click LinkedIn sharing.", color: "text-blue-400", glow: "shadow-blue-500/20", gradient: "from-blue-500/15 to-blue-600/5", border: "border-blue-500/25" },
  { icon: Eye, title: "AI-Powered Proctoring", desc: "Real-time gaze tracking, face detection, audio anomaly detection, and live proctor oversight.", color: "text-purple-400", glow: "shadow-purple-500/20", gradient: "from-purple-500/15 to-purple-600/5", border: "border-purple-500/25" },
  { icon: ClipboardCheck, title: "Psychometric Engine", desc: "Cronbach's Alpha, IRT parameters, p-value analysis, and AI-generated psychometrician reports.", color: "text-emerald-400", glow: "shadow-emerald-500/20", gradient: "from-emerald-500/15 to-emerald-600/5", border: "border-emerald-500/25" },
  { icon: BookOpen, title: "Digital Books Platform", desc: "DRM-protected e-books, AI tutor chat, voucher redemption, and exam cross-selling in one platform.", color: "text-cyan-400", glow: "shadow-cyan-500/20", gradient: "from-cyan-500/15 to-cyan-600/5", border: "border-cyan-500/25" },
  { icon: BarChart3, title: "Analytics & Reporting", desc: "Real-time dashboards, credential analytics, financial ledger, and exportable compliance reports.", color: "text-rose-400", glow: "shadow-rose-500/20", gradient: "from-rose-500/15 to-rose-600/5", border: "border-rose-500/25" },
  { icon: Layers, title: "Multi-Tenant Architecture", desc: "Fully isolated organization workspaces with custom branding, roles, and configurable workflows.", color: "text-violet-400", glow: "shadow-violet-500/20", gradient: "from-violet-500/15 to-violet-600/5", border: "border-violet-500/25" },
  { icon: Key, title: "Developer API", desc: "REST API v1 with OpenAPI 3.1 spec, API key management, webhooks, and rate limiting.", color: "text-orange-400", glow: "shadow-orange-500/20", gradient: "from-orange-500/15 to-orange-600/5", border: "border-orange-500/25" },
  { icon: Globe, title: "Public Verification", desc: "Instant credential verification via public URL — no login required. Embed a verification widget on your site.", color: "text-teal-400", glow: "shadow-teal-500/20", gradient: "from-teal-500/15 to-teal-600/5", border: "border-teal-500/25" },
];

const STEPS = [
  { step: "01", icon: Building2, title: "Onboard Your Organization", desc: "Complete the 5-step guided setup: configure your exam settings, upload branding, assign roles, and connect your payment method in under 45 minutes.", color: "text-amber-400", border: "border-amber-500/30", glow: "from-amber-500/10" },
  { step: "02", icon: GraduationCap, title: "Build & Deliver Exams", desc: "Use the AI-assisted item bank to author questions, assemble blueprints, schedule proctored sessions, and deliver exams to candidates worldwide.", color: "text-blue-400", border: "border-blue-500/30", glow: "from-blue-500/10" },
  { step: "03", icon: BadgeCheck, title: "Issue Verified Credentials", desc: "Automatically issue Open Badge 2.0 credentials upon passing. Candidates share to LinkedIn, employers verify instantly via public URL.", color: "text-emerald-400", border: "border-emerald-500/30", glow: "from-emerald-500/10" },
];

const COMPLIANCE = [
  { label: "ANSI/ANAB Aligned", icon: Shield, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-500/10" },
  { label: "Open Badge 2.0", icon: Award, color: "text-blue-400", border: "border-blue-500/30", bg: "bg-blue-500/10" },
  { label: "ISO 17024 Ready", icon: CheckCircle, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-500/10" },
  { label: "GDPR Compliant", icon: Lock, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-500/10" },
  { label: "SOC 2 Type II", icon: FileText, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
  { label: "AES-256 Encryption", icon: Cpu, color: "text-rose-400", border: "border-rose-500/30", bg: "bg-rose-500/10" },
];

const TESTIMONIALS = [
  { quote: "SDC Certifications transformed how we issue and track professional credentials. Our candidates love the digital wallet and LinkedIn integration.", name: "Dr. Sarah Mitchell", role: "Director of Certification, TechPro Institute", rating: 5, initials: "SM", color: "from-amber-500 to-orange-500" },
  { quote: "The AI proctoring system caught irregularities we never would have spotted manually. The psychometric reports are genuinely world-class.", name: "James Okafor", role: "Head of Assessments, Global Skills Academy", rating: 5, initials: "JO", color: "from-blue-500 to-cyan-500" },
  { quote: "We went live in 38 days. The onboarding wizard is incredibly smooth and the support team is responsive. Highly recommend.", name: "Priya Nair", role: "CEO, CertifyNow Platform", rating: 5, initials: "PN", color: "from-emerald-500 to-teal-500" },
];

const FOOTER_LINKS: Record<string, { label: string; href: string }[]> = {
  Platform: [
    { label: "Credential Engine", href: "#features" },
    { label: "Exam Builder", href: "#features" },
    { label: "AI Proctoring", href: "#features" },
    { label: "Digital Books", href: "#features" },
    { label: "Developer API", href: "#features" },
  ],
  Company: [
    { label: "About SDC", href: "#" },
    { label: "Compliance", href: "#compliance" },
    { label: "Security", href: "#compliance" },
    { label: "Pricing", href: "#" },
    { label: "Contact", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "API Reference", href: "/api-portal" },
    { label: "Verify Credential", href: "/verify" },
    { label: "Status Page", href: "#" },
    { label: "Blog", href: "#" },
  ],
};

function scrollTo(id: string) {
  const el = document.querySelector(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Home() {
  const { user, loading: isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const dashboardPath = user
    ? user.role === "super_admin" ? "/admin"
    : user.role === "org_admin" ? "/org"
    : user.role === "proctor" ? "/proctor"
    : user.role === "psychometrician" || user.role === "exam_developer" ? "/psychometrics"
    : user.role === "instructor" ? "/instructor"
    : "/candidate"
    : null;

  return (
    <div className="min-h-screen bg-[#080e1a] text-white overflow-x-hidden">

      {/* ── FIXED HEADER ── */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#080e1a]/95 backdrop-blur-xl border-b border-white/8 shadow-2xl shadow-black/40" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-shadow">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-bold text-white text-base tracking-tight">SDC Certifications</div>
                <div className="text-[10px] text-amber-400/80 uppercase tracking-widest font-medium">Professional Credentials</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.href.startsWith("#") ? (
                  <button key={link.label} onClick={() => scrollTo(link.href)} className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/6 rounded-lg transition-all duration-200 font-medium">
                    {link.label}
                  </button>
                ) : (
                  <Link key={link.label} href={link.href} className="px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/6 rounded-lg transition-all duration-200 font-medium">
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              {isLoading ? (
                <div className="w-20 h-9 bg-white/5 rounded-lg animate-pulse" />
              ) : user && dashboardPath ? (
                <Link href={dashboardPath}>
                  <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold shadow-lg shadow-amber-500/25 border-0 px-5">
                    Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-white/8 font-medium">Sign In</Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-semibold shadow-lg shadow-amber-500/25 border-0 px-5">
                      Get Started <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </a>
                </>
              )}
            </div>

            <button className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-colors" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="lg:hidden bg-[#0d1526]/98 backdrop-blur-xl border-t border-white/8 px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) =>
              link.href.startsWith("#") ? (
                <button key={link.label} onClick={() => { scrollTo(link.href); setMobileOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/6 rounded-lg transition-colors font-medium">
                  {link.label}
                </button>
              ) : (
                <Link key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-sm text-slate-300 hover:text-white hover:bg-white/6 rounded-lg transition-colors font-medium">
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-white/8 flex flex-col gap-2">
              {user && dashboardPath ? (
                <Link href={dashboardPath} onClick={() => setMobileOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold border-0">Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <a href={getLoginUrl()} className="block"><Button variant="outline" className="w-full border-white/15 text-white hover:bg-white/8">Sign In</Button></a>
                  <a href={getLoginUrl()} className="block"><Button className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold border-0">Get Started Free</Button></a>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#080e1a] to-[#080e1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(245,166,35,0.12),transparent)]" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-medium mb-8 backdrop-blur-sm">
            <Shield className="w-4 h-4" />
            <span>ANSI/ANAB-Aligned · Open Badge 2.0 · ISO 17024 Ready</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
            <span className="text-white">Professional</span>{" "}
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">Certification</span>
            <br />
            <span className="text-white">&amp; Badging</span>{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Platform</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Securely issue, manage, and verify professional credentials with AI-powered proctoring, psychometric analytics, and Open Badge 2.0 compliance — ready to deploy in 45 days.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href={getLoginUrl()}>
              <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-base px-8 py-6 rounded-xl shadow-2xl shadow-amber-500/30 border-0 group">
                Start Free Trial <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <Link href="/verify">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base px-8 py-6 rounded-xl backdrop-blur-sm">
                <ExternalLink className="w-5 h-5 mr-2" /> Verify a Credential
              </Button>
            </Link>
          </div>

          <button onClick={() => scrollTo("#stats")} className="flex flex-col items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors mx-auto animate-bounce">
            <span className="text-xs uppercase tracking-widest">Explore</span>
            <ChevronDown className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section id="stats" className="relative py-16 border-y border-white/6">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/3 to-transparent pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent mb-2">{s.value}</div>
                <div className="text-sm text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/30 mb-4 px-3 py-1">Platform Features</Badge>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Everything you need to run{" "}
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">world-class certifications</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A fully integrated platform covering credentials, exams, proctoring, books, analytics, and billing — no third-party stitching required.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className={`group relative rounded-2xl bg-gradient-to-br ${f.gradient} border ${f.border} p-6 hover:scale-[1.02] transition-all duration-300 hover:shadow-xl ${f.glow} cursor-default`}>
                <div className="w-11 h-11 rounded-xl bg-white/6 flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                  <f.icon className={`w-5 h-5 ${f.color}`} />
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent via-[#0a1628]/50 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 mb-4 px-3 py-1">How It Works</Badge>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              From setup to{" "}
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">issued credentials</span>
              {" "}in 3 steps
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">A guided workflow that gets your certification program live quickly, without the complexity.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className={`rounded-2xl bg-gradient-to-br ${s.glow} to-transparent border ${s.border} p-8 h-full`}>
                <div className="flex items-start gap-4 mb-5">
                  <div className={`text-5xl font-black ${s.color} opacity-20 leading-none select-none`}>{s.step}</div>
                  <div className="w-12 h-12 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                    <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
                </div>
                <h3 className="text-white font-bold text-lg mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLATFORM OVERVIEW ── */}
      <section id="platform" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-violet-500/15 text-violet-400 border-violet-500/30 mb-5 px-3 py-1">Multi-Role Platform</Badge>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                One platform,{" "}
                <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">seven roles</span>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                SDC Certifications provides purpose-built portals for every stakeholder — from the super admin managing the entire platform to the candidate taking their exam.
              </p>
              <div className="space-y-3">
                {[
                  { role: "Super Admin", desc: "Platform-wide management, org provisioning, audit logs", color: "text-amber-400" },
                  { role: "Org Admin", desc: "Organization dashboard, vouchers, bulk credential issuance", color: "text-blue-400" },
                  { role: "Psychometrician", desc: "Item bank, AI analysis, IRT metrics, blueprint assembly", color: "text-purple-400" },
                  { role: "Proctor", desc: "Live session monitoring, incident reporting, earnings", color: "text-emerald-400" },
                  { role: "Candidate", desc: "Exam delivery, credential wallet, digital books, AI tutor", color: "text-cyan-400" },
                ].map((r) => (
                  <div key={r.role} className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/6 hover:bg-white/5 transition-colors">
                    <ChevronRight className={`w-4 h-4 mt-0.5 flex-shrink-0 ${r.color}`} />
                    <div>
                      <span className={`font-semibold text-sm ${r.color}`}>{r.role}</span>
                      <span className="text-slate-400 text-sm"> — {r.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent rounded-3xl blur-2xl pointer-events-none" />
              <div className="relative space-y-3">
                {[
                  { label: "Credentials Issued Today", value: "1,284", trend: "+12%", icon: Award, color: "text-amber-400" },
                  { label: "Active Exam Sessions", value: "47", trend: "Live", icon: Play, color: "text-emerald-400" },
                  { label: "Verification Requests", value: "8,931", trend: "+34%", icon: Globe, color: "text-blue-400" },
                  { label: "Psychometric Reports", value: "156", trend: "+8%", icon: BarChart3, color: "text-purple-400" },
                ].map((card) => (
                  <div key={card.label} className="flex items-center gap-4 p-4 rounded-2xl bg-[#0d1526]/80 border border-white/8 backdrop-blur-sm">
                    <div className="w-10 h-10 rounded-xl bg-white/6 flex items-center justify-center flex-shrink-0">
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 mb-0.5">{card.label}</div>
                      <div className="text-xl font-bold text-white">{card.value}</div>
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full">
                      <TrendingUp className="w-3 h-3" />{card.trend}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPLIANCE ── */}
      <section id="compliance" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent via-[#0a1628]/40 to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 mb-4 px-3 py-1">Compliance & Security</Badge>
          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Built to the{" "}
            <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">highest standards</span>
          </h2>
          <p className="text-slate-400 text-lg mb-14 max-w-xl mx-auto">
            Every credential issued on SDC Certifications is backed by industry-leading security and compliance frameworks.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {COMPLIANCE.map((c) => (
              <div key={c.label} className={`flex items-center gap-3 p-4 rounded-2xl ${c.bg} border ${c.border} text-left`}>
                <c.icon className={`w-5 h-5 ${c.color} flex-shrink-0`} />
                <span className="text-white font-semibold text-sm">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 mb-4 px-3 py-1">Testimonials</Badge>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">
              Trusted by certification{" "}
              <span className="bg-gradient-to-r from-rose-400 to-pink-400 bg-clip-text text-transparent">leaders worldwide</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl bg-[#0d1526]/80 border border-white/8 p-6 flex flex-col gap-4 hover:border-white/15 transition-colors">
                <Quote className="w-8 h-8 text-amber-400/40" />
                <p className="text-slate-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-1 mb-1">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>{t.initials}</div>
                  <div>
                    <div className="text-white font-semibold text-sm">{t.name}</div>
                    <div className="text-slate-500 text-xs">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-blue-600/10" />
            <div className="absolute inset-0 border border-amber-500/20 rounded-3xl" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
            <div className="relative z-10 text-center py-16 px-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-6">
                <Zap className="w-3.5 h-3.5" /> Deploy in 45 days
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-5 tracking-tight">
                Ready to modernize your<br />
                <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">certification program?</span>
              </h2>
              <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
                Join 1,200+ organizations issuing verifiable credentials with SDC Certifications. Start your free trial today — no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href={getLoginUrl()}>
                  <Button size="lg" className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold text-base px-10 py-6 rounded-xl shadow-2xl shadow-amber-500/30 border-0 group">
                    Start Free Trial <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <Link href="/verify">
                  <Button size="lg" variant="outline" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-base px-8 py-6 rounded-xl">
                    Verify a Credential
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/8 bg-[#060c18] py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-12">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white text-base">SDC Certifications</div>
                  <div className="text-[10px] text-amber-400/70 uppercase tracking-widest">Professional Credentials</div>
                </div>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mb-6">
                The next-generation platform for professional certification bodies, training providers, and enterprise learning organizations.
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                {["ANSI/ANAB", "Open Badge 2.0", "ISO 17024"].map((badge) => (
                  <span key={badge} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">{badge}</span>
                ))}
              </div>
            </div>
            {Object.entries(FOOTER_LINKS).map(([section, links]) => (
              <div key={section}>
                <h4 className="text-white font-semibold text-sm mb-4">{section}</h4>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      {link.href.startsWith("/") ? (
                        <Link href={link.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{link.label}</Link>
                      ) : (
                        <button onClick={() => scrollTo(link.href)} className="text-slate-500 hover:text-slate-300 text-sm transition-colors text-left">{link.label}</button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-600 text-sm">© {new Date().getFullYear()} SDC Certifications. All rights reserved.</p>
            <div className="flex items-center gap-6 text-sm text-slate-600">
              <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
