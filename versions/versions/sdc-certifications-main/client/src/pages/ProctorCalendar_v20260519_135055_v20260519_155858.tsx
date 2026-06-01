import { useState, useMemo, useId } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  BookOpen,
  Plus,
  Trash2,
  CalendarDays,
  Repeat,
} from "lucide-react";

type ViewMode = "month" | "week";

interface BookingDetail {
  id: number;
  candidateName: string | null;
  candidateEmail: string | null;
  examTitle: string | null;
  scheduledAt: number;
  durationMinutes: number;
  status: string;
  notes: string | null;
}

interface AvailWindow {
  id: number;
  startTime: number;
  endTime: number;
  capacity: number;
  bookedCount: number;
  status?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  confirmed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  no_show: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Generate hourly slots from 06:00 to 22:00
const HOUR_SLOTS = Array.from({ length: 17 }, (_, i) => {
  const h = i + 6;
  const label = `${h.toString().padStart(2, "0")}:00 – ${(h + 1).toString().padStart(2, "0")}:00`;
  return { hour: h, label };
});

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function pad(n: number) { return n.toString().padStart(2, "0"); }

/** Build a UTC timestamp for a given local Date at a specific hour */
function dateAtHour(date: Date, hour: number): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, 0, 0, 0).getTime();
}

// ── Add Availability Dialog ────────────────────────────────────────────────────
function AddAvailabilityDialog({
  date,
  existingWindows,
  onClose,
  onSuccess,
}: {
  date: Date;
  existingWindows: AvailWindow[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  // Pre-select slots that already have a window on this day
  const existingHours = new Set(
    existingWindows.map((w) => new Date(w.startTime).getHours())
  );
  const [selectedHours, setSelectedHours] = useState<Set<number>>(new Set(existingHours));
  const [capacity, setCapacity] = useState(5);
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [repeatWeeks, setRepeatWeeks] = useState(4);
  const recurringId = useId();

  const utils = trpc.useUtils();
  const publishMutation = trpc.scheduling.publishWindow.useMutation({
    onSuccess: () => {
      utils.scheduling.proctorSchedule.invalidate();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  function toggleHour(hour: number) {
    setSelectedHours((prev) => {
      const next = new Set(prev);
      if (next.has(hour)) next.delete(hour);
      else next.add(hour);
      return next;
    });
  }

  async function handleSave() {
    // Only publish newly selected hours (skip existing ones to avoid duplicates)
    const newHours = Array.from(selectedHours).filter((h) => !existingHours.has(h));
    if (newHours.length === 0) {
      toast.info("No new slots selected.");
      onClose();
      return;
    }
    // Build list of dates: base date + N-1 weekly repeats when recurring
    const weeks = recurring ? Math.max(1, repeatWeeks) : 1;
    const datesToPublish: Date[] = [];
    for (let w = 0; w < weeks; w++) {
      const d = new Date(date);
      d.setDate(d.getDate() + w * 7);
      datesToPublish.push(d);
    }
    let published = 0;
    for (const targetDate of datesToPublish) {
      for (const hour of newHours) {
        await publishMutation.mutateAsync({
          startsAt: dateAtHour(targetDate, hour),
          endsAt: dateAtHour(targetDate, hour + 1),
          capacity,
          notes: notes || undefined,
        });
        published++;
      }
    }
    const weekLabel = weeks > 1 ? ` across ${weeks} weeks` : ` for ${formatDate(date.getTime())}`;
    toast.success(`${published} availability slot${published > 1 ? "s" : ""} added${weekLabel}`);
  }

  const dateLabel = date.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-card border-border text-card-foreground max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <CalendarDays className="w-5 h-5 text-amber-400" />
            Add Availability
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {dateLabel} — click time slots to mark yourself available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Time slot grid */}
          <div>
            <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide">Select time slots</p>
            <div className="grid grid-cols-3 gap-2">
              {HOUR_SLOTS.map(({ hour, label }) => {
                const isExisting = existingHours.has(hour);
                const isSelected = selectedHours.has(hour);
                return (
                  <button
                    key={hour}
                    onClick={() => !isExisting && toggleHour(hour)}
                    className={`
                      text-xs rounded-lg px-2 py-2.5 border font-medium transition-all text-left
                      ${isExisting
                        ? "bg-blue-500/20 text-blue-300 border-blue-500/30 cursor-default"
                        : isSelected
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-500/40"
                          : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-gray-200"
                      }
                    `}
                    title={isExisting ? "Already published" : undefined}
                  >
                    {label}
                    {isExisting && <span className="ml-1 text-[9px] opacity-70">(set)</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-500/30 mr-1 align-middle" />
              Already published &nbsp;
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-500/30 mr-1 align-middle" />
              New selection
            </p>
          </div>

          {/* Capacity & notes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Max candidates per slot</Label>
              <Input
                type="number"
                min={1}
                max={50}
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="bg-muted border-border text-foreground"
              />
            </div>
            <div>
              <Label className="text-sm text-muted-foreground mb-1 block">Notes (optional)</Label>
              <Input
                placeholder="e.g. Remote only"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-muted border-border text-foreground"
              />
            </div>
          </div>

          {/* Recurring option */}
          <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
            <div className="flex items-center gap-3">
              <Checkbox
                id={recurringId}
                checked={recurring}
                onCheckedChange={(v) => setRecurring(!!v)}
                className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
              />
              <label htmlFor={recurringId} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                <Repeat className="w-4 h-4 text-amber-400" />
                Repeat weekly
              </label>
            </div>
            {recurring && (
              <div className="flex items-center gap-3 pl-7">
                <Label className="text-xs text-muted-foreground whitespace-nowrap">Repeat for</Label>
                <Input
                  type="number"
                  min={2}
                  max={12}
                  value={repeatWeeks}
                  onChange={(e) => setRepeatWeeks(Math.min(12, Math.max(2, Number(e.target.value))))}
                  className="bg-muted border-border text-foreground w-20 h-8 text-sm"
                />
                <span className="text-xs text-muted-foreground">weeks (including this week)</span>
              </div>
            )}
            {recurring && (
              <p className="text-[11px] text-amber-400/80 pl-7">
                Will publish {Array.from(selectedHours).filter(h => !existingHours.has(h)).length * repeatWeeks} total slots, ending {new Date(date.getTime() + (repeatWeeks - 1) * 7 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 mt-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            onClick={handleSave}
            disabled={publishMutation.isPending}
          >
            {publishMutation.isPending ? "Saving…" : `Save ${Array.from(selectedHours).filter(h => !existingHours.has(h)).length || ""} Slot${(Array.from(selectedHours).filter(h => !existingHours.has(h)).length) !== 1 ? "s" : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ProctorCalendar() {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedBooking, setSelectedBooking] = useState<BookingDetail | null>(null);
  const [confirmNotes, setConfirmNotes] = useState("");
  const [actionDialog, setActionDialog] = useState<{ type: "confirm" | "reject"; booking: BookingDetail } | null>(null);
  const [addAvailDate, setAddAvailDate] = useState<Date | null>(null);

  const utils = trpc.useUtils();

  const { data: schedule, isLoading } = trpc.scheduling.proctorSchedule.useQuery();

  const confirmMutation = trpc.scheduling.confirmBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed — candidate has been notified.");
      utils.scheduling.proctorSchedule.invalidate();
      setActionDialog(null);
      setSelectedBooking(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelMutation = trpc.scheduling.cancelBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled — candidate has been notified.");
      utils.scheduling.proctorSchedule.invalidate();
      setActionDialog(null);
      setSelectedBooking(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const cancelWindowMutation = trpc.scheduling.cancelWindow.useMutation({
    onSuccess: () => {
      toast.success("Availability window removed.");
      utils.scheduling.proctorSchedule.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  // Build calendar grid
  const { calendarDays, weekDays } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    if (viewMode === "month") {
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const days: (Date | null)[] = [];
      for (let i = 0; i < firstDay; i++) days.push(null);
      for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
      return { calendarDays: days, weekDays: [] };
    } else {
      const dayOfWeek = currentDate.getDay();
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - ((dayOfWeek + 6) % 7));
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
      }
      return { calendarDays: [], weekDays: days };
    }
  }, [currentDate, viewMode]);

  // Group bookings by date string
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingDetail[]> = {};
    if (!schedule?.bookings) return map;
    for (const b of (schedule.bookings as BookingDetail[])) {
      const d = new Date(b.scheduledAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(b as BookingDetail);
    }
    return map;
  }, [schedule]);

  // Group availability windows by date
  const windowsByDate = useMemo(() => {
    const map: Record<string, AvailWindow[]> = {};
    if (!schedule?.windows) return map;
    for (const w of (schedule.windows as AvailWindow[])) {
      const d = new Date(w.startTime);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(w);
    }
    return map;
  }, [schedule]);

  function getDateKey(date: Date) {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  function navigate(dir: -1 | 1) {
    const d = new Date(currentDate);
    if (viewMode === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCurrentDate(d);
  }

  function isToday(date: Date) {
    const t = new Date();
    return date.getDate() === t.getDate() && date.getMonth() === t.getMonth() && date.getFullYear() === t.getFullYear();
  }

  function isPast(date: Date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  const pendingCount = schedule?.bookings?.filter((b: any) => b.status === "pending").length ?? 0;

  return (
    <SDCLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Calendar</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Click any future day to add availability · Click a booking to manage it
            </p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                {pendingCount} pending {pendingCount === 1 ? "request" : "requests"}
              </Badge>
            )}
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => setViewMode("month")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "month" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode("week")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "week" ? "bg-amber-500 text-black" : "bg-white/5 text-gray-300 hover:bg-white/10"}`}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Active Windows", value: (schedule?.windows as AvailWindow[] | undefined)?.filter((w) => w.status === "active").length ?? 0, color: "text-emerald-400" },
            { label: "Confirmed Bookings", value: (schedule?.bookings as BookingDetail[] | undefined)?.filter((b) => b.status === "confirmed").length ?? 0, color: "text-blue-400" },
            { label: "Pending Requests", value: pendingCount, color: "text-amber-400" },
            { label: "Upcoming (7 days)", value: (schedule?.bookings as BookingDetail[] | undefined)?.filter((b) => {
              const diff = b.scheduledAt - Date.now();
              return diff > 0 && diff < 7 * 24 * 3600 * 1000 && b.status === "confirmed";
            }).length ?? 0, color: "text-purple-400" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="bg-white/5 border-white/10">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-500/30 border border-blue-500/30" />
            Availability window
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500/30" />
            Confirmed booking
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-500/30" />
            Pending request
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500/80" />
            Near full (≥80% booked)
          </span>
          <span className="flex items-center gap-1.5">
            <Plus className="w-3 h-3 text-gray-400" />
            Click a future day to add availability
          </span>
        </div>

        {/* Calendar */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h2 className="text-lg font-semibold text-foreground">
                {viewMode === "month"
                  ? `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
                  : `Week of ${weekDays[0]?.toLocaleDateString([], { month: "short", day: "numeric" })} – ${weekDays[6]?.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}`
                }
              </h2>
              <Button variant="ghost" size="icon" onClick={() => navigate(1)} className="text-gray-400 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center text-gray-400">Loading calendar…</div>
            ) : viewMode === "month" ? (
              <MonthView
                days={calendarDays}
                bookingsByDate={bookingsByDate}
                windowsByDate={windowsByDate}
                isToday={isToday}
                isPast={isPast}
                getDateKey={getDateKey}
                onSelectBooking={setSelectedBooking}
                onAddAvailability={(date) => setAddAvailDate(date)}
                onCancelWindow={(id) => cancelWindowMutation.mutate({ windowId: id })}
              />
            ) : (
              <WeekView
                days={weekDays}
                bookingsByDate={bookingsByDate}
                windowsByDate={windowsByDate}
                isToday={isToday}
                isPast={isPast}
                getDateKey={getDateKey}
                onSelectBooking={setSelectedBooking}
                onAddAvailability={(date) => setAddAvailDate(date)}
                onCancelWindow={(id) => cancelWindowMutation.mutate({ windowId: id })}
              />
            )}
          </CardContent>
        </Card>

        {/* Pending Requests Panel */}
        {pendingCount > 0 && (
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardHeader>
              <CardTitle className="text-amber-400 text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Pending Booking Requests ({pendingCount})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(schedule?.bookings as BookingDetail[] | undefined)?.filter((b) => b.status === "pending").map((b) => (
                <div key={b.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium text-white">{b.candidateName ?? "Unknown Candidate"}</p>
                    <p className="text-xs text-muted-foreground">{b.examTitle ?? "Exam"} · {formatDate(b.scheduledAt)} at {formatTime(b.scheduledAt)}</p>
                    <p className="text-xs text-gray-500">{b.candidateEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                      onClick={() => setActionDialog({ type: "confirm", booking: b })}
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Confirm
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs"
                      onClick={() => setActionDialog({ type: "reject", booking: b })}
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Add Availability Dialog */}
        {addAvailDate && (
          <AddAvailabilityDialog
            date={addAvailDate}
            existingWindows={windowsByDate[getDateKey(addAvailDate)] ?? []}
            onClose={() => setAddAvailDate(null)}
            onSuccess={() => setAddAvailDate(null)}
          />
        )}

        {/* Booking Detail Dialog */}
        {selectedBooking && (
          <Dialog open onOpenChange={() => setSelectedBooking(null)}>
            <DialogContent className="bg-card border-border text-card-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">Booking Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Candidate</p>
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {selectedBooking.candidateName ?? "Unknown"}
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">{selectedBooking.candidateEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Exam</p>
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                      {selectedBooking.examTitle ?? "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Scheduled</p>
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {formatDate(selectedBooking.scheduledAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Time / Duration</p>
                    <p className="text-foreground font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {formatTime(selectedBooking.scheduledAt)} · {selectedBooking.durationMinutes}m
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-xs mb-1">Status</p>
                  <Badge className={`${STATUS_COLORS[selectedBooking.status] ?? ""} border text-xs`}>
                    {selectedBooking.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
                {selectedBooking.notes && (
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Notes</p>
                    <p className="text-sm text-gray-300 bg-white/5 rounded p-2">{selectedBooking.notes}</p>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                {selectedBooking.status === "pending" && (
                  <>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => { setActionDialog({ type: "confirm", booking: selectedBooking }); setSelectedBooking(null); }}
                    >
                      <CheckCircle className="w-4 h-4 mr-1.5" /> Confirm
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                      onClick={() => { setActionDialog({ type: "reject", booking: selectedBooking }); setSelectedBooking(null); }}
                    >
                      <XCircle className="w-4 h-4 mr-1.5" /> Decline
                    </Button>
                  </>
                )}
                {selectedBooking.status === "confirmed" && (
                  <Button
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                    onClick={() => cancelMutation.mutate({ bookingId: selectedBooking.id })}
                    disabled={cancelMutation.isPending}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Cancel Booking
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setSelectedBooking(null)}>Close</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Confirm/Reject Action Dialog */}
        {actionDialog && (
          <Dialog open onOpenChange={() => setActionDialog(null)}>
            <DialogContent className="bg-card border-border text-card-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-foreground">
                  {actionDialog.type === "confirm" ? "Confirm Booking" : "Decline Booking"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-300">
                  {actionDialog.type === "confirm"
                    ? `Confirm the booking for ${actionDialog.booking.candidateName ?? "this candidate"}? They will receive an email confirmation.`
                    : `Decline the booking for ${actionDialog.booking.candidateName ?? "this candidate"}? They will be notified by email.`
                  }
                </p>
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">Notes (optional)</Label>
                  <Textarea
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    placeholder={actionDialog.type === "confirm" ? "Any instructions for the candidate…" : "Reason for declining…"}
                    className="bg-muted border-border text-foreground placeholder:text-gray-500 resize-none"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                {actionDialog.type === "confirm" ? (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => confirmMutation.mutate({ bookingId: actionDialog.booking.id, notes: confirmNotes || undefined })}
                    disabled={confirmMutation.isPending}
                  >
                    {confirmMutation.isPending ? "Confirming…" : "Confirm Booking"}
                  </Button>
                ) : (
                  <Button
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => cancelMutation.mutate({ bookingId: actionDialog.booking.id })}
                    disabled={cancelMutation.isPending}
                  >
                    {cancelMutation.isPending ? "Declining…" : "Decline Booking"}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setActionDialog(null)}>Cancel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SDCLayout>
  );
}

// ── Month View ─────────────────────────────────────────────────────────────────
function MonthView({
  days,
  bookingsByDate,
  windowsByDate,
  isToday,
  isPast,
  getDateKey,
  onSelectBooking,
  onAddAvailability,
  onCancelWindow,
}: {
  days: (Date | null)[];
  bookingsByDate: Record<string, BookingDetail[]>;
  windowsByDate: Record<string, AvailWindow[]>;
  isToday: (d: Date) => boolean;
  isPast: (d: Date) => boolean;
  getDateKey: (d: Date) => string;
  onSelectBooking: (b: BookingDetail) => void;
  onAddAvailability: (d: Date) => void;
  onCancelWindow: (id: number) => void;
}) {
  return (
    <div>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-500 py-2">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="h-28 rounded-lg" />;
          const key = getDateKey(date);
          const bookings = bookingsByDate[key] ?? [];
          const windows = windowsByDate[key] ?? [];
          const today = isToday(date);
          const past = isPast(date);
          // Near-full: any window on this day has bookedCount/capacity >= 0.8
          const hasNearFullSlot = windows.some(
            (w) => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8
          );
          return (
            <div
              key={key}
              onClick={() => !past && onAddAvailability(date)}
              className={`
                h-28 rounded-lg p-1.5 border transition-all group relative
                ${today ? "border-amber-500/50 bg-amber-500/5" : past ? "border-white/5 bg-white/2 opacity-50" : "border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/20 cursor-pointer"}
              `}
            >
              <div className="flex items-center justify-between">
                <p className={`text-xs font-medium ${today ? "text-amber-400" : past ? "text-gray-600" : "text-gray-400"}`}>
                  {date.getDate()}
                </p>
                <div className="flex items-center gap-1">
                  {hasNearFullSlot && (
                    <span
                      title={`Near full: ${windows.filter(w => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8).reduce((s, w) => s + w.bookedCount, 0)}/${windows.filter(w => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8).reduce((s, w) => s + w.capacity, 0)} slots filled`}
                      className="w-2 h-2 rounded-full bg-orange-500 ring-1 ring-orange-400/50 flex-shrink-0"
                    />
                  )}
                  {!past && (
                    <Plus className="w-3 h-3 text-gray-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100" />
                  )}
                </div>
              </div>
              <div className="space-y-0.5 overflow-hidden mt-1">
                {windows.slice(0, 1).map((w) => (
                  <div
                    key={w.id}
                    className="text-[10px] bg-blue-500/20 text-blue-300 rounded px-1 truncate flex items-center justify-between group/win"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span>{new Date(w.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} avail</span>
                  </div>
                ))}
                {windows.length > 1 && (
                  <p className="text-[10px] text-blue-400/70">+{windows.length - 1} more slots</p>
                )}
                {bookings.slice(0, 2).map((b) => (
                  <button
                    key={b.id}
                    onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }}
                    className={`w-full text-left text-[10px] rounded px-1 truncate border ${
                      b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
                      b.status === "pending" ? "bg-amber-500/20 text-amber-300 border-amber-500/20" :
                      "bg-gray-500/20 text-gray-400 border-gray-500/20"
                    }`}
                  >
                    {new Date(b.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {b.candidateName?.split(" ")[0] ?? "?"}
                  </button>
                ))}
                {bookings.length > 2 && (
                  <p className="text-[10px] text-gray-500">+{bookings.length - 2} more</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Week View ──────────────────────────────────────────────────────────────────
function WeekView({
  days,
  bookingsByDate,
  windowsByDate,
  isToday,
  isPast,
  getDateKey,
  onSelectBooking,
  onAddAvailability,
  onCancelWindow,
}: {
  days: Date[];
  bookingsByDate: Record<string, BookingDetail[]>;
  windowsByDate: Record<string, AvailWindow[]>;
  isToday: (d: Date) => boolean;
  isPast: (d: Date) => boolean;
  getDateKey: (d: Date) => string;
  onSelectBooking: (b: BookingDetail) => void;
  onAddAvailability: (d: Date) => void;
  onCancelWindow: (id: number) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((date) => {
        const key = getDateKey(date);
        const bookings = bookingsByDate[key] ?? [];
        const windows = windowsByDate[key] ?? [];
        const today = isToday(date);
        const past = isPast(date);
        const hasNearFullSlot = windows.some(
          (w) => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8
        );
        return (
          <div
            key={key}
            onClick={() => !past && onAddAvailability(date)}
            className={`
              min-h-[160px] rounded-lg p-2 border transition-all group cursor-pointer
              ${today ? "border-amber-500/50 bg-amber-500/5" : past ? "border-white/5 bg-white/2 opacity-50 cursor-default" : "border-white/5 bg-white/3 hover:bg-white/8 hover:border-white/20"}
            `}
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className={`text-xs font-medium ${today ? "text-amber-400" : past ? "text-gray-600" : "text-gray-300"}`}>
                  {DAYS[date.getDay()]}
                </p>
                <p className={`text-lg font-bold ${today ? "text-amber-400" : past ? "text-gray-600" : "text-foreground"}`}>
                  {date.getDate()}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {hasNearFullSlot && (
                  <span
                    title={`Near full: ${windows.filter(w => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8).reduce((s, w) => s + w.bookedCount, 0)}/${windows.filter(w => w.capacity > 0 && w.bookedCount / w.capacity >= 0.8).reduce((s, w) => s + w.capacity, 0)} slots filled`}
                    className="w-2.5 h-2.5 rounded-full bg-orange-500 ring-1 ring-orange-400/50 flex-shrink-0"
                  />
                )}
                {!past && (
                  <Plus className="w-4 h-4 text-gray-600 group-hover:text-amber-400 transition-colors opacity-0 group-hover:opacity-100" />
                )}
              </div>
            </div>
            <div className="space-y-1">
              {windows.map((w) => (
                <div
                  key={w.id}
                  className="text-[11px] bg-blue-500/20 text-blue-300 rounded px-1.5 py-1 flex items-center justify-between group/win"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="truncate">
                    {new Date(w.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(w.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {w.status === "active" && w.bookedCount === 0 && (
                    <button
                      className="ml-1 opacity-0 group-hover/win:opacity-100 text-red-400 hover:text-red-300 transition-opacity"
                      title="Remove slot"
                      onClick={(e) => { e.stopPropagation(); onCancelWindow(w.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
              {bookings.map((b) => (
                <button
                  key={b.id}
                  onClick={(e) => { e.stopPropagation(); onSelectBooking(b); }}
                  className={`w-full text-left text-[11px] rounded px-1.5 py-1 truncate border ${
                    b.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/20" :
                    b.status === "pending" ? "bg-amber-500/20 text-amber-300 border-amber-500/20" :
                    "bg-gray-500/20 text-gray-400 border-gray-500/20"
                  }`}
                >
                  {new Date(b.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {b.candidateName?.split(" ")[0] ?? "?"}
                </button>
              ))}
              {windows.length === 0 && bookings.length === 0 && !past && (
                <p className="text-[10px] text-gray-600 text-center mt-4">Click to add</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
