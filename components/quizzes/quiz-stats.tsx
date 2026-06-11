"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ListChecks, Repeat, Percent, AlertTriangle, type LucideIcon } from "lucide-react";
import type { QuizStats } from "@/lib/quiz-stats";

interface Spec { label: string; value: string; icon: LucideIcon; hex: string }

export function QuizStatsRow({ stats }: { stats: QuizStats }) {
  const specs: Spec[] = [
    { label: "Quizzes", value: String(stats.totalQuizzes), icon: ListChecks, hex: "#3B82F6" },
    { label: "Attempts", value: String(stats.totalAttempts), icon: Repeat, hex: "#8B5CF6" },
    { label: "Avg score", value: `${stats.avgScorePct}%`, icon: Percent, hex: "#10B981" },
    { label: "Weakest topic", value: stats.weakestTopics[0]?.topic ?? "—", icon: AlertTriangle, hex: "#F59E0B" },
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
