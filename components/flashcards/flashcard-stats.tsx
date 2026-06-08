"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Layers, Clock, Repeat, Trophy, type LucideIcon } from "lucide-react";
import type { FlashcardStats } from "@/lib/srs";

interface Spec { label: string; value: string; icon: LucideIcon; hex: string }

export function FlashcardStatsRow({ stats }: { stats: FlashcardStats }) {
  const specs: Spec[] = [
    { label: "Total cards", value: String(stats.total), icon: Layers, hex: "#3B82F6" },
    { label: "Due today", value: String(stats.dueToday), icon: Clock, hex: "#F59E0B" },
    { label: "Reviews logged", value: String(stats.reviewedTotal), icon: Repeat, hex: "#8B5CF6" },
    { label: "Mastered", value: `${Math.round(stats.masteredShare * 100)}%`, icon: Trophy, hex: "#10B981" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {specs.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06, duration: 0.4, ease: "easeOut" }}
          className="card-glow relative overflow-hidden rounded-xl border border-border bg-card p-5"
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ background: `radial-gradient(120px circle at 85% -10%, ${s.hex}, transparent 70%)` }} />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg ring-1"
            style={{ backgroundColor: `${s.hex}1A`, boxShadow: `inset 0 0 0 1px ${s.hex}33` }}>
            <s.icon className="h-5 w-5" style={{ color: s.hex }} />
          </div>
          <div className="relative mt-4 font-mono text-3xl font-bold tracking-tight tabular-nums">{s.value}</div>
          <div className="relative mt-1 text-sm text-muted-foreground">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}

export function TopicBreakdown({ stats }: { stats: FlashcardStats }) {
  if (stats.byTopic.length === 0) return null;
  const max = Math.max(...stats.byTopic.map((t) => t.total), 1);
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold tracking-tight">Cards by topic</h3>
      <div className="space-y-2.5">
        {stats.byTopic.map((t) => (
          <div key={t.topic} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-sm text-muted-foreground">{t.topic}</span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary/40" style={{ width: `${(t.total / max) * 100}%` }} />
              {t.due > 0 && (
                <div className="absolute inset-y-0 left-0 rounded-full bg-signal-amber" style={{ width: `${(t.due / max) * 100}%` }} />
              )}
            </div>
            <span className="w-20 shrink-0 text-right font-mono text-xs text-muted-foreground">
              {t.due > 0 ? `${t.due} due · ` : ""}{t.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
