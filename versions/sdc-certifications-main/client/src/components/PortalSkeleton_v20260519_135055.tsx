/**
 * PortalSkeleton — full-page skeleton that mirrors the SDCLayout structure.
 * Used as the Suspense fallback for all lazy-loaded portal pages so that
 * route transitions show a layout-accurate shimmer instead of a tiny spinner.
 *
 * It reads the stored theme from localStorage directly (before React mounts)
 * so the skeleton always matches the active theme on first paint.
 */
import React from "react";
import { ShieldCheck } from "lucide-react";

// Inline shimmer animation via a style tag so this component is self-contained
// and works even before Tailwind's purge has processed the classes.
const shimmerStyle = `
@keyframes sdc-shimmer {
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.sdc-sk {
  border-radius: 6px;
  background: var(--sdc-skeleton-base);
  background-image: linear-gradient(
    90deg,
    var(--sdc-skeleton-base) 0%,
    var(--sdc-skeleton-shine) 50%,
    var(--sdc-skeleton-base) 100%
  );
  background-size: 800px 100%;
  animation: sdc-shimmer 1.4s infinite linear;
}
`;

function SkBox({ w, h, r = 6, style }: { w: number | string; h: number | string; r?: number; style?: React.CSSProperties }) {
  return (
    <div
      className="sdc-sk"
      style={{ width: w, height: h, borderRadius: r, flexShrink: 0, ...style }}
    />
  );
}

// Nav item skeleton row
function NavRow({ wide = false }: { wide?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 12px" }}>
      <SkBox w={16} h={16} r={4} />
      <SkBox w={wide ? 100 : 70} h={11} />
    </div>
  );
}

// Stat card skeleton
function StatCard() {
  return (
    <div style={{
      background: "var(--sdc-card-bg)",
      border: "1px solid var(--sdc-card-border)",
      borderRadius: 16,
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <SkBox w={36} h={36} r={10} />
      <SkBox w={60} h={26} />
      <SkBox w={90} h={11} />
    </div>
  );
}

// Table row skeleton
function TableRow() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "14px 20px",
      borderBottom: "1px solid var(--sdc-card-border)",
    }}>
      <SkBox w={32} h={32} r={8} />
      <SkBox w={120} h={12} />
      <SkBox w={80} h={12} style={{ marginLeft: "auto" }} />
      <SkBox w={60} h={22} r={8} />
      <SkBox w={24} h={24} r={6} />
    </div>
  );
}

export function PortalSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      <div style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "var(--sdc-page-bg)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
        {/* ── Sidebar ── */}
        <aside style={{
          width: 232,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          background: "var(--sdc-sidebar-bg)",
          borderRight: "1px solid var(--sdc-sidebar-border)",
        }}>
          {/* Logo */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "16px 14px",
            borderBottom: "1px solid var(--sdc-sidebar-border)",
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg, #c8972a, #dba93b)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <ShieldCheck size={16} color="#fff" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <SkBox w={90} h={11} />
              <SkBox w={60} h={8} />
            </div>
          </div>

          {/* Role badge */}
          <div style={{ padding: "10px 12px" }}>
            <SkBox w="100%" h={36} r={10} />
          </div>

          {/* Nav items */}
          <div style={{ flex: 1, padding: "8px 0", display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Section label */}
            <div style={{ padding: "6px 16px 2px" }}><SkBox w={50} h={8} /></div>
            <NavRow wide />
            <NavRow />
            <NavRow wide />
            <NavRow />
            <div style={{ padding: "10px 16px 2px" }}><SkBox w={60} h={8} /></div>
            <NavRow />
            <NavRow wide />
            <NavRow />
            <div style={{ padding: "10px 16px 2px" }}><SkBox w={55} h={8} /></div>
            <NavRow />
            <NavRow wide />
          </div>

          {/* User footer */}
          <div style={{
            padding: 12,
            borderTop: "1px solid var(--sdc-footer-border)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: "var(--sdc-user-card-bg)",
              border: "1px solid var(--sdc-user-card-border)",
            }}>
              <SkBox w={30} h={30} r={8} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
                <SkBox w={80} h={11} />
                <SkBox w={110} h={9} />
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Topbar */}
          <header style={{
            height: 56,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "var(--sdc-topbar-bg)",
            borderBottom: "1px solid var(--sdc-topbar-border)",
          }}>
            <SkBox w={160} h={14} />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <SkBox w={32} h={32} r={8} />
              <SkBox w={32} h={32} r={8} />
              <SkBox w={32} h={32} r={20} />
            </div>
          </header>

          {/* Content area */}
          <main style={{ flex: 1, overflow: "hidden", padding: 32, display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Page title */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <SkBox w={220} h={28} />
              <SkBox w={340} h={14} />
            </div>

            {/* Stat cards row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              <StatCard />
              <StatCard />
              <StatCard />
              <StatCard />
            </div>

            {/* Table card */}
            <div style={{
              flex: 1,
              background: "var(--sdc-card-bg)",
              border: "1px solid var(--sdc-card-border)",
              borderRadius: 16,
              overflow: "hidden",
            }}>
              {/* Table header */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: "14px 20px",
                borderBottom: "1px solid var(--sdc-card-border)",
              }}>
                {[120, 80, 60, 90, 50].map((w, i) => (
                  <SkBox key={i} w={w} h={10} />
                ))}
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5, 6].map(i => <TableRow key={i} />)}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default PortalSkeleton;
