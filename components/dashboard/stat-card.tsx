"use client";
import { motion } from "framer-motion";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ACCENT_CLASS } from "@/lib/constants";

export function StatCard({ label, value, sub, icon, accent = "green", index = 0 }: {
  label: string; value: string | number; sub?: string; icon: string; accent?: string; index?: number;
}) {
  const a = ACCENT_CLASS[accent] ?? ACCENT_CLASS.green;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      className="card-glow group relative overflow-hidden rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg ring-1", a.bg, a.ring)}>
          <Icon name={icon} className={cn("h-5 w-5", a.text)} />
        </div>
        {sub && <span className="mono-label">{sub}</span>}
      </div>
      <div className="mt-4">
        <div className="font-mono text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}
