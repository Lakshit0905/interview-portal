"use client";

import { motion } from "framer-motion";
import { ListTodo, Hourglass, Layers, Target, type LucideIcon } from "lucide-react";
import type { RevisionSheet } from "@/lib/data/revision";

interface Spec { label: string; value: string; icon: LucideIcon; hex: string }

export function RevisionStatsRow({ sheet }: { sheet: RevisionSheet }) {
  const specs: Spec[] = [
    { label: "Items today", value: String(sheet.items.length), icon: ListTodo, hex: "#3B82F6" },
    { label: "Est. minutes", value: String(sheet.estimatedMinutes), icon: Hourglass, hex: "#F59E0B" },
    { label: "Due flashcards", value: String(sheet.dueFlashcards), icon: Layers, hex: "#8B5CF6" },
    { label: "Focus topic", value: sheet.focusTopic ?? "—", icon: Target, hex: "#EF4444" },
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
          <div className={`relative mt-4 font-bold tracking-tight tabular-nums ${s.label === "Focus topic" ? "text-xl" : "font-mono text-3xl"}`}>{s.value}</div>
          <div className="relative mt-1 text-sm text-muted-foreground">{s.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
