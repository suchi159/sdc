import { useState, useMemo } from "react";
import SDCLayout from "@/components/SDCLayout";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Users,
  TrendingUp,
  CheckCircle2,
  XCircle,
  CalendarDays,
  BarChart3,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDateTime(ts: number) {
  return new Date(ts).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

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

function durationLabel(startMs: number, endMs: number) {
  const mins = Math.round((endMs - startMs) / 60000);
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Convert a local datetime-local input value to UTC timestamp */
function localInputToTs(value: string): number {
  return new Date(value).getTime();
}

/** Convert UTC timestamp to datetime-local input value */
function tsToLocalInput(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function WindowStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    active: { label: "Active", variant: "default" },
    full: { label: "Full", variant: "secondary" },
    cancelled: { label: "Cancelled", variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={variant}>{label}</Badge>;
}

function BookingStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    confirmed: { label: "Confirmed", variant: "default" },
    pending: { label: "Pending", variant: "secondary" },
    cancelled_by_candidate: { label: "Cancelled", variant: "destructive" },
    cancelled_by_proctor: { label: "Cancelled by You", variant: "destructive" },
    completed: { label: "Completed", variant: "outline" },
    no_show: { label: "No Show", variant: "destructive" },
  };
  const { label, variant } = map[status] ?? { label: status, variant: "secondary" };
  return <Badge variant={variant}>{label}</Badge>;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProctorAvailability() {
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [cancelWindowId, setCancelWindowId] = useState<number | null>(null);

  // Form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(17, 0, 0, 0);

  const [formStartsAt, setFormStartsAt] = useState(tsToLocalInput(tomorrow.getTime()));
  const [formEndsAt, setFormEndsAt] = useState(tsToLocalInput(tomorrowEnd.getTime()));
  const [formCapacity, setFormCapacity] = useState(5);
  const [formNotes, setFormNotes] = useState("");

  // Data
  const { data: windows, refetch: refetchWindows } = trpc.scheduling.myWindows.useQuery();
  const { data: bookings, refetch: refetchBookings } = trpc.scheduling.myBookings.useQuery();
  const { data: stats } = trpc.scheduling.proctorStats.useQuery();

  const utils = trpc.useUtils();

  const publishMutation = trpc.scheduling.publishWindow.useMutation({
    onSuccess: () => {
      toast.success("Availability window published!");
      setShowPublishForm(false);
      setFormNotes("");
      refetchWindows();
      utils.scheduling.proctorStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const cancelWindowMutation = trpc.scheduling.cancelWindow.useMutation({
    onSuccess: () => {
      toast.success("Window cancelled. Any pending bookings have been notified.");
      setCancelWindowId(null);
      refetchWindows();
      refetchBookings();
      utils.scheduling.proctorStats.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const confirmBookingMutation = trpc.scheduling.confirmBooking.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed.");
      refetchBookings();
    },
    onError: (err) => toast.error(err.message),
  });

  // Separate upcoming and past bookings
  const now = Date.now();
  const upcomingBookings = useMemo(
    () =>
      (bookings ?? []).filter(
        (b) =>
          b.booking.scheduledAt >= now &&
          !["cancelled_by_candidate", "cancelled_by_proctor"].includes(b.booking.status)
      ),
    [bookings, now]
  );
  const pastBookings = useMemo(
    () =>
      (bookings ?? []).filter(
        (b) =>
          b.booking.scheduledAt < now ||
          ["cancelled_by_candidate", "cancelled_by_proctor", "completed", "no_show"].includes(
            b.booking.status
          )
      ),
    [bookings, now]
  );

  const activeWindows = (windows ?? []).filter((w) => w.status === "active");
  const pastWindows = (windows ?? []).filter((w) => w.status !== "active");

  return (
    <SDCLayout>
      <div className="bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">My Availability</h1>
              <p className="text-sm text-muted-foreground">
                Publish time windows and manage candidate bookings
              </p>
            </div>
          </div>
          <Button onClick={() => setShowPublishForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Availability
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Active Windows</span>
                </div>
                <p className="text-2xl font-bold">{stats.activeWindows}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Upcoming Sessions</span>
                </div>
                <p className="text-2xl font-bold">{stats.upcomingBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Pending</span>
                </div>
                <p className="text-2xl font-bold">{stats.pendingBookings}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-muted-foreground uppercase tracking-wide">Utilisation</span>
                </div>
                <p className="text-2xl font-bold">{stats.utilizationRate}%</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="windows">
          <TabsList className="mb-6">
            <TabsTrigger value="windows">
              <Calendar className="h-4 w-4 mr-2" />
              Availability Windows
              {activeWindows.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">{activeWindows.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Bookings
              {upcomingBookings.length > 0 && (
                <Badge className="ml-2 h-5 px-1.5 text-xs">{upcomingBookings.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history">
              <BarChart3 className="h-4 w-4 mr-2" />
              History
            </TabsTrigger>
          </TabsList>

          {/* ── Availability Windows ── */}
          <TabsContent value="windows" className="space-y-4">
            {/* Active windows */}
            {activeWindows.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No active availability windows</p>
                  <p className="text-sm mt-1">Click "Add Availability" to publish your first window</p>
                </CardContent>
              </Card>
            ) : (
              activeWindows.map((w) => (
                <Card key={w.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {formatDateTime(w.startsAt)} – {formatTime(w.endsAt)}
                          </span>
                          <WindowStatusBadge status={w.status} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Duration: {durationLabel(w.startsAt, w.endsAt)}</span>
                          <span>
                            Capacity: {w.bookedCount}/{w.capacity} booked
                          </span>
                        </div>
                        {w.notes && (
                          <p className="text-sm text-muted-foreground">{w.notes}</p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={() => setCancelWindowId(w.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                    {/* Utilisation bar */}
                    <div className="mt-3">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.round((w.bookedCount / w.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Past/cancelled windows */}
            {pastWindows.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                  Past &amp; Cancelled
                </h3>
                <div className="space-y-2">
                  {pastWindows.map((w) => (
                    <div
                      key={w.id}
                      className="flex items-center justify-between p-3 border border-border rounded-lg opacity-60"
                    >
                      <div className="flex items-center gap-3 text-sm">
                        <span>{formatDate(w.startsAt)}</span>
                        <span className="text-muted-foreground">
                          {formatTime(w.startsAt)} – {formatTime(w.endsAt)}
                        </span>
                      </div>
                      <WindowStatusBadge status={w.status} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Bookings ── */}
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Candidate Sessions</CardTitle>
                <CardDescription>Confirmed and pending bookings for your availability windows</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No upcoming bookings</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map(({ booking, candidate, exam }) => (
                      <div
                        key={booking.id}
                        className="flex items-start justify-between p-4 border border-border rounded-lg"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{candidate?.name ?? "Candidate"}</span>
                            <BookingStatusBadge status={booking.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{exam?.title ?? "Exam"}</span>
                            <span>{formatDateTime(booking.scheduledAt)}</span>
                          </div>
                          {booking.candidateNotes && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Candidate note: {booking.candidateNotes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {booking.status === "pending" && (
                            <Button
                              size="sm"
                              onClick={() =>
                                confirmBookingMutation.mutate({ bookingId: booking.id })
                              }
                              disabled={confirmBookingMutation.isPending}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Confirm
                            </Button>
                          )}
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
                <CardDescription>Past and cancelled sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {pastBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                    <p className="font-medium">No booking history yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pastBookings.map(({ booking, candidate, exam }) => (
                      <div
                        key={booking.id}
                        className="flex items-start justify-between p-4 border border-border rounded-lg opacity-80"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{candidate?.name ?? "Candidate"}</span>
                            <BookingStatusBadge status={booking.status} />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{exam?.title ?? "Exam"}</span>
                            <span>{formatDateTime(booking.scheduledAt)}</span>
                          </div>
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

      {/* ── Publish Availability Dialog ── */}
      <Dialog open={showPublishForm} onOpenChange={setShowPublishForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Availability Window</DialogTitle>
            <DialogDescription>
              Publish a time window when you are available to proctor exams. Candidates will be able to book slots within this window.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="starts-at">Start Time</Label>
                <Input
                  id="starts-at"
                  type="datetime-local"
                  value={formStartsAt}
                  onChange={(e) => setFormStartsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="ends-at">End Time</Label>
                <Input
                  id="ends-at"
                  type="datetime-local"
                  value={formEndsAt}
                  onChange={(e) => setFormEndsAt(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="capacity">Max Concurrent Bookings</Label>
              <Input
                id="capacity"
                type="number"
                min={1}
                max={50}
                value={formCapacity}
                onChange={(e) => setFormCapacity(Number(e.target.value))}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many candidates can book within this window simultaneously
              </p>
            </div>
            <div>
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions for candidates..."
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPublishForm(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                const startsAt = localInputToTs(formStartsAt);
                const endsAt = localInputToTs(formEndsAt);
                publishMutation.mutate({
                  startsAt,
                  endsAt,
                  capacity: formCapacity,
                  notes: formNotes || undefined,
                });
              }}
              disabled={publishMutation.isPending}
            >
              {publishMutation.isPending ? "Publishing..." : "Publish Window"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Cancel Window Confirmation ── */}
      <Dialog open={!!cancelWindowId} onOpenChange={() => setCancelWindowId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Availability Window?</DialogTitle>
            <DialogDescription>
              All pending bookings in this window will be automatically cancelled and candidates will be notified.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelWindowId(null)}>
              Keep Window
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (!cancelWindowId) return;
                cancelWindowMutation.mutate({ windowId: cancelWindowId });
              }}
              disabled={cancelWindowMutation.isPending}
            >
              {cancelWindowMutation.isPending ? "Cancelling..." : "Cancel Window"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </SDCLayout>
  );
}
