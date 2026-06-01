import { Link, useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";

// ─── Route → Breadcrumb map ───────────────────────────────────────────────────
// Each entry: { crumbs: [{label, href?}] }
// If href is omitted the crumb is not clickable (current page).
const ROUTE_CRUMBS: Record<string, { label: string; href?: string }[]> = {
  // ── Admin ──────────────────────────────────────────────────────────────────
  "/admin": [{ label: "Admin Portal" }],
  "/admin/organizations": [{ label: "Admin Portal", href: "/admin" }, { label: "Organizations" }],
  "/admin/candidates": [{ label: "Admin Portal", href: "/admin" }, { label: "Candidates" }],
  "/admin/users": [{ label: "Admin Portal", href: "/admin" }, { label: "Users" }],
  "/admin/payments": [{ label: "Admin Portal", href: "/admin" }, { label: "Payments" }],
  "/admin/audit": [{ label: "Admin Portal", href: "/admin" }, { label: "Audit Log" }],
  "/admin/settings": [{ label: "Admin Portal", href: "/admin" }, { label: "Settings" }],

  // ── Org ────────────────────────────────────────────────────────────────────
  "/org": [{ label: "Org Portal" }],
  "/org/credentials": [{ label: "Org Portal", href: "/org" }, { label: "Credentials" }],
  "/org/candidates": [{ label: "Org Portal", href: "/org" }, { label: "Candidates" }],
  "/org/bulk-issue": [{ label: "Org Portal", href: "/org" }, { label: "Bulk Issue" }],
  "/org/certifications": [{ label: "Org Portal", href: "/org" }, { label: "Certifications" }],
  "/org/vouchers": [{ label: "Org Portal", href: "/org" }, { label: "Vouchers" }],
  "/org/team": [{ label: "Org Portal", href: "/org" }, { label: "Team" }],
  "/org/tokens": [{ label: "Org Portal", href: "/org" }, { label: "API Tokens" }],
  "/org/payments": [{ label: "Org Portal", href: "/org" }, { label: "Payments" }],
  "/org/audit": [{ label: "Org Portal", href: "/org" }, { label: "Audit Log" }],
  "/org/notifications": [{ label: "Org Portal", href: "/org" }, { label: "Notifications" }],
  "/org/settings": [{ label: "Org Portal", href: "/org" }, { label: "Settings" }],
  "/org/profile": [{ label: "Org Portal", href: "/org" }, { label: "Edit Profile" }],

  // ── Candidate ──────────────────────────────────────────────────────────────
  "/dashboard": [{ label: "My Credentials" }],
  "/wallet": [{ label: "Credential Wallet" }],
  "/candidate/exams": [{ label: "My Account", href: "/dashboard" }, { label: "My Exams" }],
  "/candidate/schedule": [{ label: "My Account", href: "/dashboard" }, { label: "Schedule Exam" }],
  "/candidate/library": [{ label: "Learning", href: "/dashboard" }, { label: "Digital Library" }],
  "/candidate/live-arena": [{ label: "Learning", href: "/dashboard" }, { label: "Live Arena" }],
  "/candidate/gamification": [{ label: "Learning", href: "/dashboard" }, { label: "Achievements" }],
  "/test-arena": [{ label: "Learning", href: "/dashboard" }, { label: "Test Arena" }],
  "/exam-results": [{ label: "My Exams", href: "/candidate/exams" }, { label: "Exam Results" }],

  // ── Instructor ─────────────────────────────────────────────────────────────
  "/instructor": [{ label: "Instructor Portal" }],
  "/instructor/cohorts": [{ label: "Instructor Portal", href: "/instructor" }, { label: "Cohorts" }],
  "/instructor/progress": [{ label: "Instructor Portal", href: "/instructor" }, { label: "Student Progress" }],
  "/instructor/books": [{ label: "Instructor Portal", href: "/instructor" }, { label: "Course Materials" }],
  "/instructor/live-arena": [{ label: "Instructor Portal", href: "/instructor" }, { label: "Live Arena" }],

  // ── Proctor ────────────────────────────────────────────────────────────────
  "/proctor": [{ label: "Proctor Portal" }],
  "/proctor/sessions": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Sessions" }],
  "/proctor/monitor": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Live Monitor" }],
  "/proctor/anomalies": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Anomaly Detection" }],
  "/proctor/analytics": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Analytics" }],
  "/proctor/availability": [{ label: "Proctor Portal", href: "/proctor" }, { label: "My Availability" }],
  "/proctor/calendar": [{ label: "Proctor Portal", href: "/proctor" }, { label: "My Calendar" }],
  "/proctor/earnings": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Earnings" }],
  "/proctor/settings": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Settings" }],
  "/exam-check": [{ label: "Proctor Portal", href: "/proctor" }, { label: "Pre-Exam Check" }],

  // ── Psychometrician ────────────────────────────────────────────────────────
  "/psychometrics": [{ label: "Psychometrics Portal" }],
  "/psychometrics/item-bank": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank" }],
  "/psychometrics/question/create": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "Create Item" }],
  "/psychometrics/exam-builder": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Exam Builder" }],
  "/psychometrics/test-assembly": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Test Assembly" }],
  "/psychometrics/books": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Reference Library" }],
  "/psychometrics/analytics": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Analysis" }],
  "/psychometrics/analytics/advanced": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Analysis", href: "/psychometrics/analytics" }, { label: "Advanced Analytics" }],
  "/psychometrics/settings": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Settings" }],
  "/item-bank/workflow": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "Review Workflow" }],
  "/item-bank/generate": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "AI Item Generation" }],
  "/item-bank/blueprints": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "Blueprint Builder" }],
  "/item-bank/essay-scoring": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "Essay Scoring" }],
  "/item-bank/report": [{ label: "Psychometrics Portal", href: "/psychometrics" }, { label: "Item Bank", href: "/psychometrics/item-bank" }, { label: "Psychometric Report" }],

  // ── Exam Developer ─────────────────────────────────────────────────────────
  "/exam-builder": [{ label: "Exam Builder" }],
  "/exam-builder/questions": [{ label: "Exam Builder", href: "/exam-builder" }, { label: "Question Bank" }],
  "/exam-builder/create": [{ label: "Exam Builder", href: "/exam-builder" }, { label: "Create Exam" }],
  "/exam-builder/analytics": [{ label: "Exam Builder", href: "/exam-builder" }, { label: "Analytics" }],

  // ── Shared ─────────────────────────────────────────────────────────────────
  "/settings": [{ label: "Settings" }],
  "/digital-books": [{ label: "Digital Library" }],
  "/financial-ledger": [{ label: "Financial Ledger" }],
  "/api-portal": [{ label: "API Portal" }],
};

// ─── Breadcrumb component ─────────────────────────────────────────────────────
export default function Breadcrumb() {
  const [location] = useLocation();

  // Strip trailing slash and query params for matching
  const cleanPath = location.replace(/\/$/, "").split("?")[0];

  // Find the best matching route (longest prefix match)
  const crumbs = (() => {
    // Exact match first
    if (ROUTE_CRUMBS[cleanPath]) return ROUTE_CRUMBS[cleanPath];

    // Prefix match for dynamic segments (e.g. /exam-check/123 → /exam-check)
    const sorted = Object.keys(ROUTE_CRUMBS).sort((a, b) => b.length - a.length);
    for (const route of sorted) {
      if (cleanPath.startsWith(route + "/") || cleanPath === route) {
        return ROUTE_CRUMBS[route];
      }
    }
    return null;
  })();

  // Don't render breadcrumb on root-level single pages or if no match
  if (!crumbs || crumbs.length <= 1) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1 px-5 py-2 text-xs border-b"
      style={{
        background: "var(--sdc-topbar-bg)",
        borderColor: "var(--sdc-topbar-border)",
        color: "var(--sdc-text-muted)",
        transition: "background 0.22s, border-color 0.22s",
      }}
    >
      {/* Home icon always first */}
      <Link href="/" className="flex items-center hover:opacity-80 transition-opacity shrink-0">
        <Home className="w-3 h-3" style={{ color: "var(--sdc-text-muted)" }} />
      </Link>

      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1 min-w-0">
          <ChevronRight className="w-3 h-3 shrink-0 opacity-40" />
          {crumb.href ? (
            <Link
              href={crumb.href}
              className="truncate hover:underline transition-colors"
              style={{ color: "var(--sdc-text-muted)" }}
            >
              {crumb.label}
            </Link>
          ) : (
            <span
              className="truncate font-medium"
              style={{ color: "var(--sdc-topbar-title)" }}
            >
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
