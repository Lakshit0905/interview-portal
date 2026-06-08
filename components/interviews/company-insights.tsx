"use client";

import { motion } from "framer-motion";
import { FileText, Gauge, ListChecks } from "lucide-react";
import type { CompanyInsight } from "@/lib/data/interview-insights";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";

export function CompanyInsights({ companies }: { companies: CompanyInsight[] }) {
  if (companies.length === 0) {
    return <EmptyState icon="Building2" title="No companies yet" description="Track applications to build a per-company readiness and progress overview." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {companies.map((c, i) => {
        const accent = ACCENT_CLASS[STATUS_ACCENT[c.status] ?? "slate"];
        const pct = c.roundsTotal > 0 ? Math.round((c.roundsCompleted / c.roundsTotal) * 100) : 0;
        return (
          <motion.div
            key={c.company}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.35, ease: "easeOut" }}
            className="card-glow rounded-xl border border-border bg-card p-4"
          >
            <div className="flex items-start gap-3">
              <CompanyAvatar name={c.company} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium leading-tight">{c.company}</p>
                <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">Applied {formatDate(c.applicationDate)}</p>
              </div>
              <span className={cn("shrink-0 rounded-md px-2 py-0.5 font-mono text-[0.65rem]", accent.bg, accent.text)}>{c.status}</span>
            </div>

            {c.roundsTotal > 0 && (
              <div className="mt-3.5">
                <div className="mb-1 flex items-center justify-between font-mono text-[0.65rem] text-muted-foreground">
                  <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> Rounds completed</span>
                  <span className="tabular-nums">{c.roundsCompleted}/{c.roundsTotal}</span>
                </div>
                <Progress value={pct} className="h-1.5" indicatorClassName={accent.dot} />
              </div>
            )}

            <div className="mt-3.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" /> Readiness
                <span className="font-semibold tabular-nums text-foreground">{c.readinessScore}%</span>
              </span>
              <span className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
                <FileText className="h-3.5 w-3.5" /> {c.notesCount} note{c.notesCount === 1 ? "" : "s"}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
