"use client";

import { motion } from "framer-motion";
import { Clock, Video, MapPin } from "lucide-react";
import type { UpcomingInterview, Urgency } from "@/lib/data/interview-insights";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";
import { EmptyState } from "@/components/shared/empty-state";

const URGENCY_STYLE: Record<Urgency, { label: string; badge: string; dot: string }> = {
  today:    { label: "Today",      badge: "bg-signal-red/10 text-signal-red ring-1 ring-signal-red/30",       dot: "bg-signal-red" },
  tomorrow: { label: "Tomorrow",   badge: "bg-signal-amber/10 text-signal-amber ring-1 ring-signal-amber/30", dot: "bg-signal-amber" },
  week:     { label: "This week",  badge: "bg-yellow-400/10 text-yellow-500 ring-1 ring-yellow-400/30",       dot: "bg-yellow-400" },
  future:   { label: "Upcoming",   badge: "bg-signal-green/10 text-signal-green ring-1 ring-signal-green/30", dot: "bg-signal-green" },
};

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function daysLabel(urgency: Urgency, daysAway: number): string {
  if (urgency === "today") return "Today";
  if (urgency === "tomorrow") return "Tomorrow";
  return `In ${daysAway}d`;
}

export function UpcomingTimeline({ items, onView }: { items: UpcomingInterview[]; onView?: (iv: UpcomingInterview) => void }) {
  if (items.length === 0) {
    return <EmptyState icon="CalendarClock" title="Nothing on the calendar" description="Scheduled interviews with a date will show up here, soonest first." />;
  }

  return (
    <div className="relative space-y-1 pl-2">
      <div aria-hidden className="absolute bottom-2 left-[27px] top-2 w-px bg-border" />
      {items.map((iv, i) => {
        const u = URGENCY_STYLE[iv.urgency];
        const accent = ACCENT_CLASS[STATUS_ACCENT[iv.status] ?? "slate"];
        return (
          <motion.button
            key={iv.id}
            type="button"
            onClick={() => onView?.(iv)}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
            className="card-glow group relative flex w-full items-start gap-4 rounded-xl border border-transparent p-3 text-left transition-colors hover:border-border hover:bg-card"
          >
            <span className={cn("relative z-10 mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background", u.dot)} />
            <CompanyAvatar name={iv.company} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <p className="truncate font-medium leading-tight">{iv.company}</p>
                <span className={cn("rounded-md px-2 py-0.5 font-mono text-[0.65rem]", accent.bg, accent.text)}>{iv.round || iv.status}</span>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{iv.position}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[0.65rem] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(iv.interviewDate)} · {formatTime(iv.interviewDate!)}</span>
                {iv.interviewType && (
                  <span className="flex items-center gap-1">
                    {iv.interviewType.toLowerCase().includes("virtual") || iv.interviewType.toLowerCase().includes("phone")
                      ? <Video className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
                    {iv.interviewType}
                  </span>
                )}
              </div>
            </div>
            <span className={cn("shrink-0 self-center whitespace-nowrap rounded-md px-2.5 py-1 font-mono text-[0.65rem] font-medium", u.badge)}>
              {daysLabel(iv.urgency, iv.daysAway)}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
