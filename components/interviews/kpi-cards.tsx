"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { Send, Users, Flag, Award, Target, ArrowUpRight, ArrowDownRight, Minus, type LucideIcon } from "lucide-react";
import type { InterviewInsights } from "@/lib/data/interview-insights";
import { cn } from "@/lib/utils";

interface KpiSpec {
  key: keyof InterviewInsights["kpis"];
  label: string;
  icon: LucideIcon;
  hex: string;
}

const SPECS: KpiSpec[] = [
  { key: "totalApplications", label: "Total applications", icon: Send, hex: "#3B82F6" },
  { key: "activeInterviews", label: "Active interviews", icon: Users, hex: "#8B5CF6" },
  { key: "finalRounds", label: "Final rounds", icon: Flag, hex: "#F59E0B" },
  { key: "offers", label: "Offers received", icon: Award, hex: "#10B981" },
];

function TrendBadge({ trend }: { trend: number }) {
  const Icon = trend > 0 ? ArrowUpRight : trend < 0 ? ArrowDownRight : Minus;
  const tone = trend > 0 ? "text-signal-green" : trend < 0 ? "text-signal-red" : "text-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-0.5 font-mono text-xs", tone)}>
      <Icon className="h-3 w-3" /> {trend > 0 ? "+" : ""}{trend}%
    </span>
  );
}

function Sparkline({ data, hex }: { data: number[]; hex: string }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={`spark-${hex.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hex} stopOpacity={0.45} />
              <stop offset="100%" stopColor={hex} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="v" stroke={hex} strokeWidth={1.75}
            fill={`url(#spark-${hex.replace("#", "")})`} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function GradientCard({ index, hex, icon: IconCmp, label, value, trend, spark }: {
  index: number; hex: string; icon: LucideIcon;
  label: string; value: number; trend: number; spark: number[];
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="card-glow group relative overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{ background: `radial-gradient(120px circle at 85% -10%, ${hex}, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg ring-1"
          style={{ backgroundColor: `${hex}1A`, boxShadow: `inset 0 0 0 1px ${hex}33` }}>
          <IconCmp className="h-5 w-5" style={{ color: hex }} />
        </div>
        <TrendBadge trend={trend} />
      </div>
      <div className="relative mt-4">
        <div className="font-mono text-3xl font-bold tracking-tight tabular-nums">{value}</div>
        <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      </div>
      <div className="relative mt-3 -mb-1">
        <Sparkline data={spark} hex={hex} />
      </div>
    </motion.div>
  );
}

function SuccessRateCard({ value, trend }: { value: number; trend: number }) {
  const R = 30, C = 2 * Math.PI * R;
  const hex = "#10B981";
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 4 * 0.06, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -2 }}
      className="card-glow group relative overflow-hidden rounded-xl border border-border bg-card p-5"
    >
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] transition-opacity duration-300 group-hover:opacity-[0.14]"
        style={{ background: `radial-gradient(120px circle at 85% -10%, ${hex}, transparent 70%)` }} />
      <div className="relative flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg ring-1"
          style={{ backgroundColor: `${hex}1A`, boxShadow: `inset 0 0 0 1px ${hex}33` }}>
          <Target className="h-5 w-5" style={{ color: hex }} />
        </div>
        <TrendBadge trend={trend} />
      </div>
      <div className="relative mt-4 flex items-center gap-4">
        <div className="relative h-[72px] w-[72px] shrink-0">
          <svg viewBox="0 0 72 72" className="h-full w-full -rotate-90">
            <circle cx="36" cy="36" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
            <motion.circle
              cx="36" cy="36" r={R} fill="none" stroke={hex} strokeWidth="7" strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (C * value) / 100 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold tabular-nums">{value}%</div>
        </div>
        <div>
          <div className="font-mono text-3xl font-bold tracking-tight tabular-nums">{value}%</div>
          <div className="mt-1 text-sm text-muted-foreground">Success rate</div>
        </div>
      </div>
    </motion.div>
  );
}

export function KpiCards({ kpis }: { kpis: InterviewInsights["kpis"] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SPECS.map((spec, i) => {
        const m = kpis[spec.key] as { value: number; trend: number; spark: number[] };
        return (
          <GradientCard key={spec.key} index={i} hex={spec.hex} icon={spec.icon}
            label={spec.label} value={m.value} trend={m.trend} spark={m.spark} />
        );
      })}
      <SuccessRateCard value={kpis.successRate.value} trend={kpis.successRate.trend} />
    </div>
  );
}
