"use client";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

export function ReadinessGauge({ score, breakdown }: {
  score: number; breakdown: { label: string; value: number; weight: number }[];
}) {
  const R = 52, C = 2 * Math.PI * R;
  const tier = score >= 75 ? "Interview ready" : score >= 50 ? "On track" : "Building up";
  return (
    <div className="card-glow rounded-xl border border-border bg-card p-6">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
        <div className="relative h-36 w-36 shrink-0">
          <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
            <circle cx="64" cy="64" r={R} fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
            <motion.circle
              cx="64" cy="64" r={R} fill="none" stroke="hsl(var(--primary))" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={C}
              initial={{ strokeDashoffset: C }}
              animate={{ strokeDashoffset: C - (C * score) / 100 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-bold tabular-nums">{score}</span>
            <span className="mono-label">/ 100</span>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium">Interview Readiness</span>
            <span className="rounded-md bg-primary/15 px-2 py-0.5 font-mono text-xs text-primary">{tier}</span>
          </div>
          <div className="space-y-3">
            {breakdown.map((b) => (
              <div key={b.label}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{b.label}</span>
                  <span className="font-mono tabular-nums">{Math.round(b.value * 100)}%</span>
                </div>
                <Progress value={Math.round(b.value * 100)} className="h-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
