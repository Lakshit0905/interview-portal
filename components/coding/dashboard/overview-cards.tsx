"use client";

import { motion } from "framer-motion";
import { Icon } from "@/components/shared/icon";
import { AnimatedNumber } from "./animated-number";
import type { CodingDashboardStats } from "@/lib/coding-stats";

export function OverviewCards({ stats }: { stats: CodingDashboardStats }) {
  const hours = stats.timeSpentMinutes / 60;

  const cards: { label: string; value: number; decimals?: number; suffix?: string; sub: string; icon: string }[] = [
    {
      label: "Problems Solved", value: stats.totals.solved, icon: "CheckCircle2",
      sub: `of ${stats.totals.total} tracked`,
    },
    {
      label: "Accuracy Rate", value: stats.totals.accuracyPct, suffix: "%", icon: "Target",
      sub: "solved vs. needs revisit",
    },
    {
      label: "This Week", value: stats.weeklyProgress.count, icon: "TrendingUp",
      sub: "problems solved",
    },
    {
      label: "Time Coding", value: hours, decimals: 1, suffix: "h", icon: "Clock",
      sub: "total logged",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c, i) => (
        <motion.div
          key={c.label}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
          className="glass-card neon-ring p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5 ring-1 ring-white/10">
              <Icon name={c.icon} className="h-5 w-5 text-[hsl(var(--neon-blue))]" />
            </div>
            <span className="mono-label">{c.sub}</span>
          </div>
          <div className="mt-4">
            <div className="neon-text font-mono text-3xl font-bold tracking-tight tabular-nums">
              <AnimatedNumber value={c.value} decimals={c.decimals ?? 0} suffix={c.suffix ?? ""} />
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{c.label}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
