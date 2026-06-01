/**
 * NotificationBell.tsx
 * In-app notification bell for both candidate and proctor portals.
 * Shows unread count badge; clicking opens a dropdown with recent notifications.
 * Marks individual or all notifications as read on interaction.
 */

import { useState, useRef, useEffect } from "react";
import { Bell, BellRing, CheckCheck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean | null;
  actionUrl: string | null;
  createdAt: Date;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [, navigate] = useLocation();

  const utils = trpc.useUtils();

  const { data: notifs = [], isLoading } = trpc.notifications.list.useQuery(undefined, {
    refetchInterval: 30_000, // poll every 30 s
  });

  const { data: unreadData } = trpc.notifications.unreadCount.useQuery(undefined, {
    refetchInterval: 30_000,
  });

  const markRead = trpc.notifications.markRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
  });

  const unreadCount = unreadData?.count ?? 0;

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleOpen() {
    setOpen((v) => !v);
  }

  function handleNotifClick(notif: Notification) {
    if (!notif.read) {
      markRead.mutate({ id: notif.id });
    }
    setOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl as string);
    }
  }

  function handleMarkAllRead() {
    markRead.mutate({ all: true });
  }

  function getTypeIcon(type: string) {
    switch (type) {
      case "booking_confirmed": return "✅";
      case "booking_new":       return "📅";
      case "booking_cancelled": return "❌";
      case "exam_scheduled":    return "🗓️";
      case "exam_result":       return "📊";
      case "credential_issued": return "🏅";
      case "proctoring_incident": return "⚠️";
      case "billing_alert":     return "💳";
      default:                  return "🔔";
    }
  }

  function formatRelative(date: Date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-full transition-colors",
          "hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-yellow-400/50",
          open && "bg-white/10"
        )}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-yellow-400" />
        ) : (
          <Bell className="w-5 h-5 text-slate-300" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-11 w-80 max-h-[480px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
            <span className="text-sm font-semibold text-white">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-yellow-400 hover:text-yellow-300 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Loading…</div>
            ) : notifs.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No notifications yet</p>
              </div>
            ) : (
              (notifs as Notification[]).map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotifClick(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 border-b border-slate-800 last:border-0 transition-colors",
                    "hover:bg-slate-800",
                    !n.read && "bg-slate-800/60"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg shrink-0 mt-0.5">{getTypeIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn("text-sm font-medium truncate", n.read ? "text-slate-300" : "text-white")}>
                          {n.title}
                        </p>
                        {!n.read && (
                          <span className="shrink-0 w-2 h-2 rounded-full bg-yellow-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-xs text-slate-500 mt-1">{formatRelative(n.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
