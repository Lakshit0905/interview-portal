"use client";

import { motion } from "framer-motion";
import { PlusCircle, ArrowRightLeft, Award, FileEdit } from "lucide-react";
import type { ActivityItem, ActivityType } from "@/lib/data/interview-insights";
import { cn, relativeTime } from "@/lib/utils";
import { EmptyState } from "@/components/shared/empty-state";

const TYPE_STYLE: Record<ActivityType, { icon: typeof PlusCircle; className: string }> = {
  added:  { icon: PlusCircle,    className: "bg-signal-blue/10 text-signal-blue ring-signal-blue/30" },
  status: { icon: ArrowRightLeft, className: "bg-signal-violet/10 text-signal-violet ring-signal-violet/30" },
  offer:  { icon: Award,         className: "bg-signal-green/10 text-signal-green ring-signal-green/30" },
  resume: { icon: FileEdit,      className: "bg-signal-amber/10 text-signal-amber ring-signal-amber/30" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return <EmptyState icon="Activity" title="No recent activity" description="Updates to your pipeline and resumes will be summarized here." />;
  }

  return (
    <div className="relative space-y-1 pl-2">
      <div aria-hidden className="absolute bottom-2 left-[27px] top-2 w-px bg-border" />
      {items.map((item, i) => {
        const t = TYPE_STYLE[item.type];
        const Icon = t.icon;
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
            className="relative flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-card"
          >
            <span className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-4 ring-background", t.className)}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <p className="truncate text-sm font-medium leading-tight">{item.title}</p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.description}</p>
            </div>
            <span className="shrink-0 whitespace-nowrap pt-1 font-mono text-[0.65rem] text-muted-foreground/70">{relativeTime(item.timestamp)}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
