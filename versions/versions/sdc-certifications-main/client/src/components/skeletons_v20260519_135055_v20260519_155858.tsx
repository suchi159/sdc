import { Skeleton } from "@/components/ui/skeleton";

// ─── Stat Card Skeleton ────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20" />
      <Skeleton className="h-3 w-36" />
    </div>
  );
}

// ─── Stat Row (4 cards) ────────────────────────────────────────────────────
export function StatRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${count} gap-4`}>
      {Array.from({ length: count }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}

// ─── Table Skeleton ────────────────────────────────────────────────────────
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.03)" }}>
      {/* Header */}
      <div className="flex gap-4 px-5 py-3 border-b border-white/10">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-white/5 last:border-0">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className={`h-4 flex-1 ${j === 0 ? "max-w-[140px]" : ""}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Card Grid Skeleton ────────────────────────────────────────────────────
export function CardGridSkeleton({ count = 6, cols = 3 }: { count?: number; cols?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols} gap-5`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)" }}>
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-10 w-10 rounded-xl ml-3" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 flex-1 rounded-lg" />
            <Skeleton className="h-8 flex-1 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Credential Card Skeleton ──────────────────────────────────────────────
export function CredentialCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl ml-3" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Skeleton className="h-8 flex-1 rounded-lg" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    </div>
  );
}

// ─── List Item Skeleton ────────────────────────────────────────────────────
export function ListItemSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Section Header Skeleton ───────────────────────────────────────────────
export function SectionHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3 w-72" />
      </div>
      <Skeleton className="h-9 w-28 rounded-lg" />
    </div>
  );
}

// ─── Chart Area Skeleton ───────────────────────────────────────────────────
export function ChartSkeleton({ height = 200 }: { height?: number }) {
  return (
    <div className="rounded-xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-end gap-2" style={{ height }}>
        {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50, 95, 40].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// ─── Score Circle Skeleton ─────────────────────────────────────────────────
export function ScoreCircleSkeleton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Skeleton className="h-40 w-40 rounded-full" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-48" />
    </div>
  );
}

// ─── Progress Bar Skeleton ─────────────────────────────────────────────────
export function ProgressBarSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-12" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Sidebar User Skeleton ─────────────────────────────────────────────────
export function SidebarUserSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3">
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1.5">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// ─── Tab Content Skeleton (generic) ───────────────────────────────────────
export function TabContentSkeleton() {
  return (
    <div className="space-y-6">
      <StatRowSkeleton count={4} />
      <SectionHeaderSkeleton />
      <TableSkeleton rows={6} cols={5} />
    </div>
  );
}

// ─── Exam Card Skeleton ────────────────────────────────────────────────────
export function ExamCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.04)" }}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Book Card Skeleton ────────────────────────────────────────────────────
export function BookCardSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-8 flex-1 rounded-lg" />
          <Skeleton className="h-8 flex-1 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── Badge Grid Skeleton ───────────────────────────────────────────────────
export function BadgeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

// ─── Calendar Skeleton ─────────────────────────────────────────────────────
export function CalendarSkeleton() {
  return (
    <div className="rounded-xl border border-white/10 p-5 space-y-4" style={{ background: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={`d-${i}`} className="h-10 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ─── Session Card Skeleton ─────────────────────────────────────────────────
export function SessionCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

// ─── Question List Skeleton (ExamBuilder) ──────────────────────────────────
export function QuestionListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-white/10" style={{ background: "rgba(255,255,255,0.03)" }}>
          <Skeleton className="h-6 w-6 rounded flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ─── Verify Credential Skeleton ────────────────────────────────────────────
export function VerifyCredentialSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border border-white/10 p-8 space-y-6" style={{ background: "rgba(255,255,255,0.04)" }}>
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-6 w-24 rounded-full" />)}
          </div>
        </div>
      </div>
    </div>
  );
}
