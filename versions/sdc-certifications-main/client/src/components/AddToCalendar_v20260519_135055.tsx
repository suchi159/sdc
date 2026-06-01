/**
 * AddToCalendar Component
 *
 * Renders a dropdown button with two export options:
 * - "Google Calendar" — opens a new tab with the Google Calendar add-event deep-link
 * - "Apple Calendar / iCal" — downloads an .ics file the user can open in Apple Calendar,
 *   Outlook, Thunderbird, or any RFC 5545-compatible client
 */

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  downloadICS,
  buildGoogleCalendarUrl,
  type CalendarEvent,
} from "@/lib/calendarExport";
import { toast } from "sonner";

interface AddToCalendarProps {
  event: CalendarEvent;
  /** Optional size variant — defaults to "default" */
  size?: "sm" | "default" | "lg";
  /** Optional extra className for the trigger button */
  className?: string;
}

export default function AddToCalendar({
  event,
  size = "default",
  className = "",
}: AddToCalendarProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function handleGoogle() {
    const url = buildGoogleCalendarUrl(event);
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
    toast.success("Opening Google Calendar…");
  }

  function handleICS() {
    try {
      downloadICS(event);
      setOpen(false);
      toast.success("Calendar file downloaded — open it to add to Apple Calendar or Outlook.");
    } catch {
      toast.error("Failed to generate calendar file. Please try again.");
    }
  }

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger button */}
      <Button
        variant="outline"
        size={size}
        onClick={() => setOpen((v) => !v)}
        className="gap-2 border-border/60 hover:border-border"
      >
        <Calendar className="w-4 h-4" />
        Add to Calendar
        <ChevronDown
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </Button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute z-50 mt-1 w-56 rounded-xl border border-border/60 bg-card shadow-xl overflow-hidden"
          style={{ top: "100%", left: 0 }}
        >
          {/* Google Calendar option */}
          <button
            onClick={handleGoogle}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-accent/60 transition-colors group"
          >
            {/* Google Calendar coloured icon */}
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-white shadow-sm flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                <path fill="#4285F4" d="M21.5 12.5c0-.56-.05-1.1-.14-1.63H12v3.08h5.32a4.55 4.55 0 0 1-1.97 2.99v2.48h3.19c1.87-1.72 2.96-4.26 2.96-6.92z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.61-2.43l-3.19-2.48c-.89.6-2.03.95-3.42.95-2.63 0-4.86-1.78-5.66-4.17H3.06v2.56A9.99 9.99 0 0 0 12 22z" />
                <path fill="#FBBC05" d="M6.34 13.87A6.01 6.01 0 0 1 6.03 12c0-.65.11-1.28.31-1.87V7.57H3.06A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.06 4.43l3.28-2.56z" />
                <path fill="#EA4335" d="M12 5.96c1.48 0 2.81.51 3.86 1.51l2.89-2.89C16.95 2.99 14.69 2 12 2A9.99 9.99 0 0 0 3.06 7.57l3.28 2.56C7.14 7.74 9.37 5.96 12 5.96z" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Google Calendar</p>
              <p className="text-xs text-muted-foreground">Opens in a new tab</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </button>

          <div className="h-px bg-border/40 mx-3" />

          {/* Apple Calendar / iCal option */}
          <button
            onClick={handleICS}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left hover:bg-accent/60 transition-colors group"
          >
            {/* Apple Calendar icon */}
            <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-500 to-red-600 shadow-sm flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" aria-hidden="true">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5C3.9 4 3 4.9 3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">Apple Calendar</p>
              <p className="text-xs text-muted-foreground">Downloads .ics file</p>
            </div>
            <Download className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </button>

          {/* Outlook hint */}
          <div className="px-4 py-2 bg-muted/30 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              The .ics file also works with Outlook, Thunderbird, and other calendar apps.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
