import { useState, useMemo } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AddToCalendar from "@/components/AddToCalendar";
import { bookingToCalendarEvent } from "@/lib/calendarExport";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CalendarCheck,
  LogIn,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDateTime(ts: number) {
  return `${formatDate(ts)} at ${formatTime(ts)}`;
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function isoDate(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "Confirmed", variant: "default" },
    pending: { label: "Pending", variant: "secondary" },
    cancelled_by_candidate: { label: "Cancelled", variant: "destructive" },
    cancelled_by_proctor: { label: "Cancelled by Proctor", variant: "destructive" },
    completed: { label: "Completed", variant: "outline" },
    no_show: { label: "No Show", variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

type SlotEntry = {
  window: {
    id: number;
    startsAt: number;
    endsAt: number;
    capacity: number;
    bookedCount: number;
    notes: string | null;
    [key: string]: unknown;
  };
  proctor: { id: number; name: string | null; avatarUrl: string | null } | null;
};

type MyBookingEntry = {
  booking: {
    id: number;
    scheduledAt: number;
    status: string;
    durationMinutes: number;
    candidateNotes: string | null;
    cancellationReason: string | null;
  };
  exam: { id: number; title: string } | null;
  proctor: { id: number; name: string | null } | null;
};

interface MonthCalendarProps {
  year: number;
  month: number; // 0-indexed
  slotsByDate: Map<string, SlotEntry[]>;
  myBookingDates: Set<string>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  examDurationMinutes: number;
}

function MonthCalendar({
  year,
  month,
  slotsByDate,
  myBookingDates,
  selectedDate,
  onSelectDate,
  examDurationMinutes,
}: MonthCalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build grid: 6 weeks × 7 days
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ date: Date; key: string } | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    cells.push({ date, key: date.toISOString().slice(0, 10) });
  }
  // Pad to 42
  while (cells.length < 42) cells.push(null);

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="h-20 rounded-lg" />;

          const { date, key } = cell;
          const isPast = date < today;
          const isToday = date.getTime() === today.getTime();
          const isSelected = selectedDate === key;
          const slots = slotsByDate.get(key) ?? [];
          const hasSlots = slots.length > 0;
          const hasMyBooking = myBookingDates.has(key);
          const nearFull = slots.some(
            (s) => s.window.capacity > 0 && s.window.bookedCount / s.window.capacity >= 0.8
          );
          const allFull = hasSlots && slots.every((s) => s.window.bookedCount >= s.window.capacity);

          return (
            <button
              key={key}
              disabled={isPast || (!hasSlots && !hasMyBooking)}
              onClick={() => onSelectDate(key)}
              className={[
                "h-20 rounded-lg p-1.5 text-left flex flex-col transition-all border",
                isPast
                  ? "opacity-40 cursor-not-allowed border-transparent"
                  : !hasSlots && !hasMyBooking
                  ? "border-transparent cursor-default"
                  : isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border hover:border-primary/50 hover:bg-accent/30 cursor-pointer",
              ].join(" ")}
            >
              {/* Day number */}
              <span
                className={[
                  "text-sm font-semibold w-6 h-6 flex items-center justify-center rounded-full",
                  isToday ? "bg-primary text-primary-foreground" : "text-foreground",
                ].join(" ")}
              >
                {date.getDate()}
              </span>

              {/* Slot indicators */}
              <div className="flex flex-wrap gap-0.5 mt-1">
                {hasMyBooking && (
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" title="You have a booking" />
                )}
                {hasSlots && !allFull && (
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${nearFull ? "bg-orange-500" : "bg-blue-500"}`}
                    title={nearFull ? "Near full" : "Slots available"}
                  />
                )}
                {allFull && (
                  <span className="inline-block w-2 h-2 rounded-full bg-muted-foreground/40" title="Fully booked" />
                )}
              </div>

              {/* Slot count label */}
              {hasSlots && !allFull && (
                <span className="text-[10px] text-muted-foreground mt-auto">
                  {slots.filter((s) => s.window.bookedCount < s.window.capacity).length} slot
                  {slots.filter((s) => s.window.bookedCount < s.window.capacity).length !== 1 ? "s" : ""}
                </span>
              )}
              {allFull && (
                <span className="text-[10px] text-muted-foreground mt-auto">Full</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Available
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" /> Near full (≥80%)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" /> My booking
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-muted-foreground/40 inline-block" /> Fully booked
        </span>
      </div>

      {/* Selected day slot list */}
      {selectedDate && (
        <SelectedDaySlots
          date={selectedDate}
          slots={slotsByDate.get(selectedDate) ?? []}
          examDurationMinutes={examDurationMinutes}
          onBook={(slot) => {
            // bubble up via prop
            void slot;
          }}
        />
      )}
    </div>
  );
}

// ─── Selected Day Slot List ───────────────────────────────────────────────────

interface SelectedDaySlotsProps {
  date: string;
  slots: SlotEntry[];
  examDurationMinutes: number;
  onBook: (slot: SlotEntry) => void;
}

function SelectedDaySlots({ date, slots, examDurationMinutes, onBook }: SelectedDaySlotsProps) {
  const available = slots.filter((s) => s.window.bookedCount < s.window.capacity);
  const label = new Date(date + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mt-4 border-t border-border pt-4">
      <h3 className="text-sm font-semibold mb-3">{label}</h3>
      {available.length === 0 ? (
        <p className="text-sm text-muted-foreground">No available slots on this day.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {available.map(({ window: w, proctor }) => {
            const remaining = w.capacity - w.bookedCount;
            const nearFull = w.capacity > 0 && w.bookedCount / w.capacity >= 0.8;
            return (
              <div
                key={w.id}
                className="border border-border rounded-lg p-3 hover:border-primary/60 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-primary" />
                    <span className="text-sm font-medium">
                      {formatTime(w.startsAt)} – {formatTime(w.endsAt)}
                    </span>
                  </div>
                  <Badge
                    variant={nearFull ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {remaining} left
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{proctor?.name ?? "Proctor"}</span>
                </div>
                <div className="flex items-center gap-1.5 mb-3">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Exam: {durationLabel(examDurationMinutes)}</span>
                </div>
                {w.notes && (
                  <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{w.notes}</p>
                )}
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => onBook({ window: w, proctor })}
                >
                  Book This Slot
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CandidateSchedule() {
  const { user, loading: authLoading } = useAuth();
  const isAuthed = !!user;

  const [selectedExamId, setSelectedExamId] = useState<number | null>(null);
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const [bookingSlot, setBookingSlot] = useState<{
    windowId: number;
    proctorName: string;
    startsAt: number;
    endsAt: number;
    durationMinutes: number;
  } | null>(null);
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{
    id: number;
    examTitle: string;
    proctorName: string | null;
    scheduledAt: number;
    durationMinutes: number;
    examId: number;
  } | null>(null);
  const [candidateNotes, setCandidateNotes] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Date range covering the full displayed month (+ buffer for prev/next month days)
  const { fromTs, toTs } = useMemo(() => {
    const start = new Date(calYear, calMonth, 1, 0, 0, 0, 0);
    const end = new Date(calYear, calMonth + 1, 0, 23, 59, 59, 999);
    return { fromTs: start.getTime(), toTs: end.getTime() };
  }, [calYear, calMonth]);

  const { data: examsData } = trpc.exams.list.useQuery();
  const publishedExams = examsData?.filter((e) => e.status === "published") ?? [];

  const { data: slotsData, isLoading: slotsLoading } = trpc.scheduling.listAvailableSlots.useQuery(
    { examId: selectedExamId!, fromTs, toTs },
    { enabled: !!selectedExamId }
  );

  const { data: mySchedule, refetch: refetchSchedule } = trpc.scheduling.mySchedule.useQuery(
    { upcoming: false },
    { enabled: isAuthed }
  );

  const utils = trpc.useUtils();

  const bookMutation = trpc.scheduling.bookSlot.useMutation({
    onSuccess: (data) => {
      if (bookingSlot && selectedExamId) {
        setConfirmedBooking({
          id: data?.bookingId ?? 0,
          examTitle: slotsData?.examTitle ?? "Exam",
          proctorName: bookingSlot.proctorName,
          scheduledAt: bookingSlot.startsAt,
          durationMinutes: bookingSlot.durationMinutes,
          examId: selectedExamId,
        });
      }
      setBookingSlot(null);
      setCandidateNotes("");
      utils.scheduling.listAvailableSlots.invalidate();
      refetchSchedule();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelMutation = trpc.scheduling.cancelBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelled.");
      setCancelBookingId(null);
      setCancelReason("");
      refetchSchedule();
    },
    onError: (err) => toast.error(err.message),
  });

  // Group available slots by date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, SlotEntry[]>();
    for (const slot of slotsData?.slots ?? []) {
      const key = isoDate(slot.window.startsAt);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(slot as SlotEntry);
    }
    return map;
  }, [slotsData]);

  // Dates where the candidate already has a booking
  const myBookingDates = useMemo(() => {
    const set = new Set<string>();
    for (const { booking } of mySchedule ?? []) {
      if (!["cancelled_by_candidate", "cancelled_by_proctor"].includes(booking.status)) {
        set.add(isoDate(booking.scheduledAt));
      }
    }
    return set;
  }, [mySchedule]);

  const upcomingBookings = (mySchedule as MyBookingEntry[] | undefined)?.filter(
    (b) => b.booking.scheduledAt >= Date.now() && !["cancelled_by_candidate", "cancelled_by_proctor"].includes(b.booking.status)
  ) ?? [];

  const pastBookings = (mySchedule as MyBookingEntry[] | undefined)?.filter(
    (b) => b.booking.scheduledAt < Date.now() || ["cancelled_by_candidate", "cancelled_by_proctor", "completed", "no_show"].includes(b.booking.status)
  ) ?? [];

  const monthLabel = new Date(calYear, calMonth).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
    setSelectedDate(null);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
    setSelectedDate(null);
  }

  // ── Auth guard ──────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SDCLayout>
    );
  }

  if (!isAuthed) {
    return (
      <SDCLayout>
        <div className="flex items-center justify-center min-h-[60vh] p-6">
          <div className="max-w-sm w-full text-center space-y-4">
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarCheck className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-muted-foreground">
              You must be signed in to schedule an exam or view your bookings.
            </p>
            <button
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold"
              onClick={() => (window.location.href = getLoginUrl("/candidate/schedule"))}
            >
              <LogIn className="h-4 w-4" />
              Sign In to Continue
            </button>
          </div>
        </div>
      </SDCLayout>
    );
  }

  return (
    <SDCLayout>
      <div className="bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-5">
          <div className="max-w-6xl mx-auto flex items-center gap-3">
            <CalendarCheck className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Schedule Your Exam</h1>
              <p className="text-sm text-muted-foreground">
                Browse available proctor slots on the calendar and book your session
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
          <Tabs defaultValue="book">
            <TabsList className="mb-6">
              <TabsTrigger value="book">
                <Calendar className="h-4 w-4 mr-2" />
                Book a Slot
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                My Schedule
                {upcomingBookings.length > 0 && (
                  <Badge className="ml-2 h-5 px-1.5 text-xs">{upcomingBookings.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">
                <BookOpen className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            {/* ── Book a Slot ── */}
            <TabsContent value="book" className="space-y-6">
              {/* Exam selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">1. Select an Exam</CardTitle>
                  <CardDescription>Choose which exam you want to schedule</CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={selectedExamId?.toString() ?? ""}
                    onValueChange={(v) => {
                      setSelectedExamId(Number(v));
                      setSelectedDate(null);
                    }}
                  >
                    <SelectTrigger className="max-w-md">
                      <SelectValue placeholder="Choose an exam..." />
                    </SelectTrigger>
                    <SelectContent>
                      {publishedExams.map((exam) => (
                        <SelectItem key={exam.id} value={exam.id.toString()}>
                          {exam.title}
                          {exam.timeLimit ? ` (${durationLabel(exam.timeLimit)})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Calendar */}
              {selectedExamId && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">2. Pick a Day &amp; Slot</CardTitle>
                        <CardDescription>
                          {slotsData?.examTitle
                            ? `${slotsData.examTitle} — ${durationLabel(slotsData.examDurationMinutes ?? 60)}`
                            : "Click a highlighted day to see available slots"}
                        </CardDescription>
                      </div>
                      {/* Month navigation */}
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={prevMonth}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm font-semibold min-w-[140px] text-center">
                          {monthLabel}
                        </span>
                        <Button variant="outline" size="sm" onClick={nextMonth}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {slotsLoading ? (
                      <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading available slots…
                      </div>
                    ) : (
                      <>
                        <MonthCalendar
                          year={calYear}
                          month={calMonth}
                          slotsByDate={slotsByDate}
                          myBookingDates={myBookingDates}
                          selectedDate={selectedDate}
                          onSelectDate={setSelectedDate}
                          examDurationMinutes={slotsData?.examDurationMinutes ?? 60}
                        />
                        {/* Render slot list for selected date (outside MonthCalendar to access setBookingSlot) */}
                        {selectedDate && (
                          <div className="mt-4 border-t border-border pt-4">
                            <h3 className="text-sm font-semibold mb-3">
                              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </h3>
                            {(() => {
                              const slots = slotsByDate.get(selectedDate) ?? [];
                              const available = slots.filter(
                                (s) => s.window.bookedCount < s.window.capacity
                              );
                              if (available.length === 0) {
                                return (
                                  <p className="text-sm text-muted-foreground">
                                    No available slots on this day.
                                  </p>
                                );
                              }
                              return (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                  {available.map(({ window: w, proctor }) => {
                                    const remaining = w.capacity - w.bookedCount;
                                    const nearFull =
                                      w.capacity > 0 &&
                                      w.bookedCount / w.capacity >= 0.8;
                                    return (
                                      <div
                                        key={w.id}
                                        className="border border-border rounded-lg p-3 hover:border-primary/60 hover:bg-accent/20 transition-colors"
                                      >
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5 text-primary" />
                                            <span className="text-sm font-medium">
                                              {formatTime(w.startsAt)} – {formatTime(w.endsAt)}
                                            </span>
                                          </div>
                                          <Badge
                                            variant={nearFull ? "destructive" : "secondary"}
                                            className="text-xs"
                                          >
                                            {remaining} left
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <User className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">
                                            {proctor?.name ?? "Proctor"}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-3">
                                          <Clock className="h-3 w-3 text-muted-foreground" />
                                          <span className="text-xs text-muted-foreground">
                                            Exam: {durationLabel(slotsData?.examDurationMinutes ?? 60)}
                                          </span>
                                        </div>
                                        {w.notes && (
                                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                            {w.notes}
                                          </p>
                                        )}
                                        <Button
                                          size="sm"
                                          className="w-full"
                                          onClick={() =>
                                            setBookingSlot({
                                              windowId: w.id,
                                              proctorName: proctor?.name ?? "Proctor",
                                              startsAt: w.startsAt,
                                              endsAt: w.endsAt,
                                              durationMinutes:
                                                slotsData?.examDurationMinutes ?? 60,
                                            })
                                          }
                                        >
                                          Book This Slot
                                        </Button>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* ── My Schedule ── */}
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Upcoming Bookings</CardTitle>
                  <CardDescription>Your confirmed exam sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CalendarCheck className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No upcoming bookings</p>
                      <p className="text-sm mt-1">Book a slot from the "Book a Slot" tab</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingBookings.map(({ booking, exam, proctor }) => (
                        <div
                          key={booking.id}
                          className="flex items-start justify-between p-4 border border-border rounded-lg"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{exam?.title ?? "Exam"}</span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateTime(booking.scheduledAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                {durationLabel(booking.durationMinutes)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {proctor?.name ?? "Proctor"}
                              </span>
                            </div>
                            {booking.candidateNotes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Note: {booking.candidateNotes}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {booking.status === "confirmed" && (
                              <AddToCalendar
                                size="sm"
                                event={bookingToCalendarEvent({
                                  id: booking.id,
                                  examTitle: exam?.title ?? "Exam",
                                  proctorName: proctor?.name ?? null,
                                  scheduledAt: booking.scheduledAt,
                                  durationMinutes: booking.durationMinutes,
                                  examId: exam?.id,
                                })}
                              />
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive border-destructive/50 hover:bg-destructive/10"
                              onClick={() => setCancelBookingId(booking.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── History ── */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Booking History</CardTitle>
                  <CardDescription>Past and cancelled exam sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {pastBookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                      <p className="font-medium">No booking history yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pastBookings.map(({ booking, exam, proctor }) => (
                        <div
                          key={booking.id}
                          className="flex items-start justify-between p-4 border border-border rounded-lg opacity-80"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{exam?.title ?? "Exam"}</span>
                              <StatusBadge status={booking.status} />
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateTime(booking.scheduledAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" />
                                {proctor?.name ?? "Proctor"}
                              </span>
                            </div>
                            {booking.cancellationReason && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <AlertCircle className="h-3 w-3" />
                                {booking.cancellationReason}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Booking Confirmation Dialog ── */}
        <Dialog open={!!bookingSlot} onOpenChange={() => setBookingSlot(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Booking</DialogTitle>
              <DialogDescription>
                Review the details below and confirm your exam slot.
              </DialogDescription>
            </DialogHeader>
            {bookingSlot && (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-accent/40 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam</span>
                    <span className="font-medium">{slotsData?.examTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">{formatDate(bookingSlot.startsAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Time</span>
                    <span className="font-medium">{formatTime(bookingSlot.startsAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{durationLabel(bookingSlot.durationMinutes)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proctor</span>
                    <span className="font-medium">{bookingSlot.proctorName}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">
                    Notes for Proctor (optional)
                  </label>
                  <Textarea
                    placeholder="Any special requirements or notes..."
                    value={candidateNotes}
                    onChange={(e) => setCandidateNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setBookingSlot(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (!bookingSlot || !selectedExamId) return;
                  bookMutation.mutate({
                    windowId: bookingSlot.windowId,
                    examId: selectedExamId,
                    scheduledAt: bookingSlot.startsAt,
                    candidateNotes: candidateNotes || undefined,
                  });
                }}
                disabled={bookMutation.isPending}
              >
                {bookMutation.isPending ? "Booking..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Booking Confirmed Dialog ── */}
        <Dialog open={!!confirmedBooking} onOpenChange={() => setConfirmedBooking(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Booking Confirmed!
              </DialogTitle>
              <DialogDescription>
                Your exam slot has been booked. Add it to your calendar so you don't miss it.
              </DialogDescription>
            </DialogHeader>
            {confirmedBooking && (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-accent/40 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exam</span>
                    <span className="font-medium">{confirmedBooking.examTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date &amp; Time</span>
                    <span className="font-medium">{formatDateTime(confirmedBooking.scheduledAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{durationLabel(confirmedBooking.durationMinutes)}</span>
                  </div>
                  {confirmedBooking.proctorName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Proctor</span>
                      <span className="font-medium">{confirmedBooking.proctorName}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Add to your calendar</p>
                  <AddToCalendar
                    event={bookingToCalendarEvent(confirmedBooking)}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    You'll also receive a 30-minute and 24-hour reminder from your calendar app.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={() => setConfirmedBooking(null)}>Done</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Cancel Booking Dialog ── */}
        <Dialog open={!!cancelBookingId} onOpenChange={() => setCancelBookingId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cancel Booking</DialogTitle>
              <DialogDescription>
                This action cannot be undone. Bookings cannot be cancelled within 1 hour of the
                scheduled time.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <label className="text-sm font-medium mb-1.5 block">
                Reason for cancellation (optional)
              </label>
              <Textarea
                placeholder="Please let us know why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCancelBookingId(null)}>
                Keep Booking
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (!cancelBookingId) return;
                  cancelMutation.mutate({
                    bookingId: cancelBookingId,
                    reason: cancelReason || undefined,
                  });
                }}
                disabled={cancelMutation.isPending}
              >
                {cancelMutation.isPending ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SDCLayout>
  );
}
