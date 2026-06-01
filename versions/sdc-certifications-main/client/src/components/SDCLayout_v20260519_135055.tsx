import { useState } from "react";
import { useLocation, Link } from "wouter";
import Breadcrumb from "./Breadcrumb";
import {
  ShieldCheck, LayoutDashboard, Award, Users, Building2, CreditCard,
  FileText, Settings, LogOut, Bell, Menu, X, ChevronDown, Coins,
  BookOpen, Brain, Video, BarChart3, TrendingUp, Database, PenTool,
  FileQuestion, Layers, FlaskConical, Sparkles, Globe, Key,
  DollarSign, Star, Wallet, GraduationCap, Zap, Shield,
  Play, UserCheck, ClipboardList, Activity, Sun, Moon, Monitor, AlertTriangle, CalendarDays, Upload, ShoppingCart, List
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";

// ─── Nav definitions per role ─────────────────────────────────────────────────

const ADMIN_NAV = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Overview" },
  { path: "/admin/organizations", label: "Organizations", icon: Building2, group: "Management" },
  { path: "/admin/candidates", label: "Candidates", icon: Users, group: "Management" },
  { path: "/admin/credentials", label: "Credential Rules", icon: Award, group: "Management" },
  { path: "/admin/payments", label: "Payments", icon: CreditCard, group: "Finance" },
  { path: "/admin/integrations", label: "Integrations", icon: Globe, group: "System" },
  { path: "/admin/notifications", label: "Notifications", icon: Bell, group: "System" },
  { path: "/admin/audit", label: "Audit Log", icon: FileText, group: "System" },
  { path: "/admin/settings", label: "Settings", icon: Settings, group: "System" },
  { path: "/verify/roster", label: "Certificate Roster", icon: List, group: "Public" },
];

const ORG_NAV = [
  { path: "/org", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Overview" },
  { path: "/org/candidates", label: "Candidates", icon: Users, group: "Management" },
  { path: "/org/credentials", label: "Credentials", icon: Award, group: "Management" },
  { path: "/org/bulk-issue", label: "Bulk Issue", icon: Upload, group: "Management" },
  { path: "/org/certifications", label: "Certifications", icon: ShieldCheck, group: "Management" },
  { path: "/org/vouchers", label: "Vouchers", icon: Coins, group: "Management" },
  { path: "/org/team", label: "Team", icon: UserCheck, group: "Management" },
  { path: "/org/tokens", label: "API Tokens", icon: Key, group: "Developer" },
  { path: "/org/payments", label: "Payments", icon: CreditCard, group: "Finance" },
  { path: "/org/buy-vouchers", label: "Purchase Vouchers", icon: ShoppingCart, group: "Finance" },
  { path: "/org/audit", label: "Audit Log", icon: FileText, group: "Compliance" },
  { path: "/org/notifications", label: "Notifications", icon: Bell, group: "Compliance" },
  { path: "/org/settings", label: "Settings", icon: Settings, group: "Compliance" },
  { path: "/org/profile", label: "Edit Profile", icon: Building2, group: "Compliance" },
  { path: "/verify/roster", label: "Certificate Roster", icon: List, group: "Public" },
];

const PSYCHOMETRICIAN_NAV = [
  { path: "/psychometrics", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Overview" },
  { path: "/psychometrics/item-bank", label: "Item Bank", icon: Database, group: "Content" },
  { path: "/item-bank/workflow", label: "Review Workflow", icon: Layers, group: "Item Bank" },
  { path: "/item-bank/generate", label: "AI Item Generation", icon: Zap, group: "Item Bank" },
  { path: "/item-bank/blueprints", label: "Blueprint Builder", icon: FileQuestion, group: "Item Bank" },
  { path: "/item-bank/essay-scoring", label: "Essay Scoring", icon: Brain, group: "Item Bank" },
  { path: "/item-bank/report", label: "Psychometric Report", icon: BarChart3, group: "Item Bank" },
  { path: "/psychometrics/question/create", label: "Create Item", icon: PenTool, group: "Content" },
  { path: "/psychometrics/exam-builder", label: "Exam Builder", icon: FileQuestion, group: "Test Development" },
  { path: "/psychometrics/test-assembly", label: "Test Assembly", icon: Layers, group: "Test Development" },
  { path: "/psychometrics/books", label: "Reference Library", icon: BookOpen, group: "Resources" },
  { path: "/psychometrics/analytics", label: "Item Analysis", icon: TrendingUp, group: "Analytics" },
  { path: "/psychometrics/analytics/advanced", label: "Psychometric Analytics", icon: BarChart3, group: "Analytics" },
  { path: "/psychometrics/settings", label: "Test Settings", icon: Settings, group: "Administration" },
];

const PROCTOR_NAV = [
  { path: "/proctor", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Overview" },
  { path: "/proctor/sessions", label: "Sessions", icon: Video, group: "Proctoring" },
  { path: "/proctor/monitor", label: "Live Monitor", icon: Monitor, group: "Proctoring" },
  { path: "/exam-check", label: "Pre-Exam Check", icon: Shield, group: "Proctoring" },
  { path: "/proctor/anomalies", label: "Anomaly Detection", icon: AlertTriangle, group: "Proctoring" },
  { path: "/proctor/analytics", label: "Analytics", icon: BarChart3, group: "Proctoring" },
  { path: "/proctor/calendar", label: "My Calendar", icon: CalendarDays, group: "Scheduling" },
  { path: "/proctor/earnings", label: "Earnings", icon: DollarSign, group: "Finance" },
  { path: "/proctor/settings", label: "Settings", icon: Settings, group: "Account" },
];

const CANDIDATE_NAV = [
  { path: "/dashboard", label: "My Credentials", icon: Award, exact: true, group: "My Account" },
  { path: "/candidate/exams", label: "My Exams", icon: ClipboardList, group: "My Account" },
  { path: "/candidate/schedule", label: "Schedule Exam", icon: CalendarDays, group: "My Account" },
  { path: "/candidate/library", label: "Digital Library", icon: BookOpen, group: "Learning" },
  { path: "/test-arena", label: "Test Arena", icon: Zap, group: "Learning" },
  { path: "/candidate/live-arena", label: "Live Arena", icon: Play, group: "Learning" },
  { path: "/candidate/gamification", label: "Achievements", icon: Star, group: "Learning" },
  { path: "/settings", label: "Settings", icon: Settings, group: "Account" },
];

const INSTRUCTOR_NAV = [
  { path: "/instructor", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Overview" },
  { path: "/instructor/cohorts", label: "Cohorts", icon: Users, group: "Teaching" },
  { path: "/instructor/progress", label: "Student Progress", icon: TrendingUp, group: "Teaching" },
  { path: "/instructor/books", label: "Course Materials", icon: BookOpen, group: "Content" },
  { path: "/instructor/live-arena", label: "Live Arena", icon: Play, group: "Content" },
];

const EXAM_DEV_NAV = [
  { path: "/exam-builder", label: "Exam Builder", icon: FileQuestion, exact: true, group: "Development" },
  { path: "/exam-builder/questions", label: "Question Bank", icon: Database, group: "Development" },
  { path: "/exam-builder/create", label: "Create Exam", icon: PenTool, group: "Development" },
  { path: "/exam-builder/analytics", label: "Analytics", icon: BarChart3, group: "Analytics" },
];

// ─── Role config ──────────────────────────────────────────────────────────────

type NavEntry = { path: string; label: string; icon: React.ElementType; exact?: boolean; group: string };

const ROLE_CONFIG: Record<string, {
  nav: NavEntry[];
  label: string;
  sublabel: string;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  icon: React.ElementType;
}> = {
  super_admin: {
    nav: ADMIN_NAV,
    label: "Super Admin",
    sublabel: "Platform Administration",
    accentColor: "#c8972a",
    badgeBg: "rgba(200,151,42,0.12)",
    badgeBorder: "rgba(200,151,42,0.25)",
    badgeText: "#dba93b",
    icon: ShieldCheck,
  },
  org_admin: {
    nav: ORG_NAV,
    label: "Organization",
    sublabel: "Org Administration",
    accentColor: "#3b82f6",
    badgeBg: "rgba(59,130,246,0.12)",
    badgeBorder: "rgba(59,130,246,0.25)",
    badgeText: "#60a5fa",
    icon: Building2,
  },
  psychometrician: {
    nav: PSYCHOMETRICIAN_NAV,
    label: "Psychometrician",
    sublabel: "Test Development Expert",
    accentColor: "#8b5cf6",
    badgeBg: "rgba(139,92,246,0.12)",
    badgeBorder: "rgba(139,92,246,0.25)",
    badgeText: "#a78bfa",
    icon: FlaskConical,
  },
  exam_developer: {
    nav: EXAM_DEV_NAV,
    label: "Exam Developer",
    sublabel: "Question & Exam Design",
    accentColor: "#06b6d4",
    badgeBg: "rgba(6,182,212,0.12)",
    badgeBorder: "rgba(6,182,212,0.25)",
    badgeText: "#22d3ee",
    icon: FileQuestion,
  },
  proctor: {
    nav: PROCTOR_NAV,
    label: "Proctor",
    sublabel: "Exam Monitoring",
    accentColor: "#10b981",
    badgeBg: "rgba(16,185,129,0.12)",
    badgeBorder: "rgba(16,185,129,0.25)",
    badgeText: "#34d399",
    icon: Video,
  },
  instructor: {
    nav: INSTRUCTOR_NAV,
    label: "Instructor",
    sublabel: "Course Management",
    accentColor: "#f59e0b",
    badgeBg: "rgba(245,158,11,0.12)",
    badgeBorder: "rgba(245,158,11,0.25)",
    badgeText: "#fbbf24",
    icon: GraduationCap,
  },
  candidate: {
    nav: CANDIDATE_NAV,
    label: "Candidate",
    sublabel: "My Credentials & Learning",
    accentColor: "#c8972a",
    badgeBg: "rgba(200,151,42,0.12)",
    badgeBorder: "rgba(200,151,42,0.25)",
    badgeText: "#dba93b",
    icon: Award,
  },
};

// ─── SDCLayout ────────────────────────────────────────────────────────────────

interface SDCLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function SDCLayout({ children, title }: SDCLayoutProps) {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); window.location.href = "/login"; },
  });

  const { data: notifData } = trpc.notifications.list.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });
  const markReadMutation = trpc.notifications.markRead.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--sdc-sidebar-bg)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)" }}>
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="w-6 h-6 border-2 rounded-full animate-spin"
            style={{ borderColor: "#c8972a", borderTopColor: "transparent" }} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/login";
    return null;
  }

  const role = (user as any)?.role || "candidate";
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.candidate;
  const { nav, label, sublabel, accentColor, badgeBg, badgeBorder, badgeText, icon: RoleIcon } = config;

  const notifications = (notifData as any) || [];
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n: any) => !n.read).length
    : (notifications?.notifications || []).filter((n: any) => !n.read).length;
  const notifList = Array.isArray(notifications) ? notifications : (notifications?.notifications || []);

  const initials = ((user as any)?.name || (user as any)?.email || "U")
    .split(" ")
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const groups = Array.from(new Set(nav.map(n => n.group)));

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3"
        style={{ borderBottom: "1px solid var(--sdc-sidebar-border)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #c8972a, #dba93b)" }}>
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <span className="font-bold tracking-tight block" style={{ fontSize: 14, lineHeight: 1.2, color: "var(--sdc-logo-text)" }}>
            SDC Certifications
          </span>
          <span className="uppercase tracking-[0.18em] flex items-center gap-1"
            style={{ fontSize: 8.5, color: "var(--sdc-logo-sublabel)", fontWeight: 700, marginTop: 1 }}>
            <RoleIcon className="w-2.5 h-2.5" />
            {sublabel}
          </span>
        </div>
      </div>

      {/* Role badge */}
      <div className="px-4 py-3">
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-2.5"
          style={{ background: badgeBg, border: `1px solid ${badgeBorder}` }}>
          <Sparkles className="w-3.5 h-3.5 shrink-0" style={{ color: badgeText }} />
          <div>
            <p style={{ color: badgeText, fontSize: 11.5, fontWeight: 700, lineHeight: 1.2 }}>{label}</p>
            <p style={{ color: `${badgeText}99`, fontSize: 9.5, lineHeight: 1.3 }}>{sublabel}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {groups.map((group) => (
          <div key={group} className="mb-4">
            <p className="px-3 mb-1.5 uppercase tracking-[0.12em]"
              style={{ fontSize: 9.5, color: "var(--sdc-sidebar-section-label)", fontWeight: 700 }}>
              {group}
            </p>
            <div className="space-y-0.5">
              {nav.filter(n => n.group === group).map(({ path, label: navLabel, icon: Icon, exact }) => {
                const isActive = exact ? location === path : location.startsWith(path);
                return (
                  <Link
                    key={path}
                    href={path}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      padding: "0.625rem 0.75rem",
                      borderRadius: "0.75rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      transition: "all 0.15s",
                      position: "relative",
                      textDecoration: "none",
                      color: isActive ? "var(--sdc-nav-text-active)" : "var(--sdc-nav-text)",
                      background: isActive ? "var(--sdc-nav-bg-active)" : "transparent",
                    }}
                    onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "var(--sdc-nav-text-hover)";
                        (e.currentTarget as HTMLElement).style.background = "var(--sdc-nav-bg-hover)";
                      }
                    }}
                    onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "var(--sdc-nav-text)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
                        style={{ background: accentColor }} />
                    )}
                    <Icon className="w-4 h-4 shrink-0" />
                    {navLabel}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4" style={{ borderTop: "1px solid var(--sdc-footer-border)" }}>
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
            style={{ background: "var(--sdc-user-card-bg)", border: "1px solid var(--sdc-user-card-border)" }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sdc-user-card-bg-hover)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "var(--sdc-user-card-bg)"}
          >
            {!(user as any)?.name && !(user as any)?.email ? (
              <>
                <div className="w-9 h-9 rounded-lg shrink-0 animate-pulse" style={{ background: "var(--sdc-card-border)" }} />
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="h-2.5 rounded-full w-24 animate-pulse" style={{ background: "var(--sdc-card-border)" }} />
                  <div className="h-2 rounded-full w-32 animate-pulse" style={{ background: "var(--sdc-card-border)" }} />
                </div>
              </>
            ) : (
              <>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, fontSize: 12 }}>
                  {initials}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-semibold truncate" style={{ fontSize: 12, color: "var(--sdc-user-name)" }}>
                    {(user as any)?.name || (user as any)?.email}
                  </p>
                  <p className="truncate" style={{ fontSize: 10.5, color: "var(--sdc-user-email)" }}>
                    {(user as any)?.email}
                  </p>
                </div>
              </>
            )}
            <ChevronDown className="w-3.5 h-3.5 shrink-0" style={{ color: "var(--sdc-chevron)" }} />
          </button>
          {profileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl py-1 z-50"
                style={{ background: "var(--sdc-profile-popup-bg)", border: "1px solid var(--sdc-profile-popup-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}>
                <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--sdc-profile-popup-divider)" }}>
                  <p className="text-sm font-semibold" style={{ color: "var(--sdc-user-name)" }}>{(user as any)?.name}</p>
                  <p className="text-xs truncate" style={{ color: "var(--sdc-user-email)" }}>{(user as any)?.email}</p>
                </div>
                <button
                  onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-all"
                  style={{ color: "var(--sdc-profile-menu-text)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "var(--sdc-profile-menu-text-hover)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "var(--sdc-profile-menu-text)"}
                >
                  <Settings className="w-3.5 h-3.5" /> Settings
                </button>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-all"
                  style={{ color: "rgba(248,113,113,0.8)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#f87171"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "rgba(248,113,113,0.8)"}
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col shrink-0 h-full"
        style={{ background: "var(--sdc-sidebar-bg)", borderRight: "1px solid var(--sdc-sidebar-border)", width: 232, transition: "background 0.3s" }}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 h-full z-10"
            style={{ background: "var(--sdc-sidebar-bg)" }}>
            <button className="absolute top-4 right-4 transition-colors"
              style={{ color: "var(--sdc-nav-text)" }}
              onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "var(--sdc-page-bg)", transition: "background 0.3s" }}>
        {/* Top bar */}
        <header className="flex items-center justify-between px-5 h-14 shrink-0"
          style={{ background: "var(--sdc-topbar-bg)", borderBottom: "1px solid var(--sdc-topbar-border)", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", transition: "background 0.3s, border-color 0.3s" }}>
          <button className="md:hidden transition-colors"
            style={{ color: "var(--sdc-topbar-icon)" }}
            onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden md:block">
            {title && <h1 className="text-sm font-bold" style={{ color: "var(--sdc-topbar-title)" }}>{title}</h1>}
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              style={{ color: "var(--sdc-topbar-icon)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--sdc-topbar-icon-hover-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--sdc-topbar-icon-hover)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--sdc-topbar-icon)"; }}>
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all relative"
                style={{ color: "var(--sdc-topbar-icon)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "var(--sdc-topbar-icon-hover-bg)"; (e.currentTarget as HTMLElement).style.color = "var(--sdc-topbar-icon-hover)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--sdc-topbar-icon)"; }}>
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full"
                    style={{ background: "#c8972a" }} />
                )}
              </button>
              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl z-50 overflow-hidden"
                    style={{ background: "var(--sdc-notif-bg)", border: "1px solid var(--sdc-notif-border)", boxShadow: "0 16px 48px rgba(0,0,0,0.18)" }}>
                    <div className="flex items-center justify-between px-4 py-3"
                      style={{ borderBottom: "1px solid var(--sdc-notif-divider)" }}>
                      <span className="font-bold text-sm" style={{ color: "var(--sdc-notif-title)" }}>
                        Notifications {unreadCount > 0 && <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: "#c8972a", color: "#fff" }}>{unreadCount}</span>}
                      </span>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markReadMutation.mutate({ all: true } as any)}
                          className="text-xs font-semibold"
                          style={{ color: "#c8972a" }}>
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifList.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <Bell className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--sdc-text-muted)" }} />
                          <p className="text-sm" style={{ color: "var(--sdc-notif-text)" }}>No notifications</p>
                        </div>
                      ) : (
                        notifList.slice(0, 8).map((n: any) => {
                          const typeIcon: Record<string, string> = {
                            booking_confirmed: "✅",
                            booking_new: "📅",
                            booking_cancelled: "❌",
                            exam_scheduled: "🗓️",
                            exam_result: "📊",
                            credential_issued: "🏅",
                            proctoring_incident: "⚠️",
                            billing_alert: "💳",
                          };
                          const icon = typeIcon[n.type] ?? "🔔";
                          return (
                          <div key={n.id}
                            className="px-4 py-3 cursor-pointer transition-all"
                            style={{
                              background: n.read ? "transparent" : "var(--sdc-notif-unread-bg)",
                              borderBottom: "1px solid var(--sdc-notif-divider)",
                            }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sdc-notif-hover-bg)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = n.read ? "transparent" : "var(--sdc-notif-unread-bg)"}
                            onClick={() => {
                              markReadMutation.mutate({ id: n.id } as any);
                              setNotifOpen(false);
                              if (n.actionUrl) navigate(n.actionUrl);
                            }}>
                            <div className="flex items-start gap-3">
                              <span className="text-base shrink-0 mt-0.5">{icon}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <p className="text-sm font-semibold truncate" style={{ color: "var(--sdc-notif-title)" }}>{n.title}</p>
                                  {!n.read && (
                                    <div className="w-2 h-2 rounded-full shrink-0"
                                      style={{ background: "#c8972a" }} />
                                  )}
                                </div>
                                <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--sdc-notif-text)" }}>{n.message}</p>
                              </div>
                            </div>
                          </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sdc-topbar-icon-hover-bg)"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, fontSize: 11 }}>
                  {initials}
                </div>
                <span className="text-sm font-semibold hidden sm:block" style={{ color: "var(--sdc-topbar-title)" }}>
                  {((user as any)?.name || "").split(" ")[0] || (user as any)?.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: "var(--sdc-topbar-icon)" }} />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-44 rounded-xl py-1 z-50"
                    style={{ background: "var(--sdc-notif-bg)", border: "1px solid var(--sdc-notif-border)", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" }}>
                    <button
                      onClick={() => { navigate("/settings"); setProfileOpen(false); }}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-all"
                      style={{ color: "var(--sdc-text)" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "var(--sdc-notif-hover-bg)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <Settings className="w-3.5 h-3.5" /> Settings
                    </button>
                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-all"
                      style={{ color: "#ef4444" }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.08)"}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <Breadcrumb />
        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
