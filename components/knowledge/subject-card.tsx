"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Layers, HelpCircle, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ACCENT_CLASS } from "@/lib/constants";
import type { HubSubject } from "@/lib/data/knowledge-hub";

export interface SubjectStats {
  notes: number;
  flashcards: number;
  questions: number;
  topics: number;
  completion: number;   // 0-100
  revisionStatus: "new" | "due" | "ok";
  lastRevised?: string; // ISO or formatted string
  hasWeakAreas: boolean;
}

interface SubjectCardProps {
  subject: HubSubject;
  stats: SubjectStats;
  index?: number;
}

const STATUS_CONFIG = {
  new:  { label: "Not started", color: "text-muted-foreground",      dot: "bg-muted-foreground/50" },
  due:  { label: "Review due",  color: "text-signal-amber",           dot: "bg-signal-amber" },
  ok:   { label: "Up to date",  color: "text-signal-green",           dot: "bg-signal-green" },
};

export function SubjectCard({ subject, stats, index = 0 }: SubjectCardProps) {
  const a = ACCENT_CLASS[subject.accent] ?? ACCENT_CLASS.slate;
  const status = STATUS_CONFIG[stats.revisionStatus];
  const completionColor =
    stats.completion >= 70 ? "bg-signal-green" :
    stats.completion >= 35 ? "bg-signal-amber" :
    "bg-muted-foreground/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04, ease: "easeOut" }}
    >
      <Link
        href={`/knowledge/${subject.slug}`}
        className="card-glow group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card/60 p-5 backdrop-blur transition-all duration-200 hover:border-primary/30 hover:bg-card/80"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-all group-hover:scale-105", a.bg, a.ring)}>
            <Icon name={subject.icon} className={cn("h-5 w-5", a.text)} />
          </div>
          <div className="flex items-center gap-2">
            {stats.hasWeakAreas && (
              <span title="Weak areas detected" className="flex h-6 w-6 items-center justify-center rounded-md bg-signal-amber/10 ring-1 ring-signal-amber/30">
                <AlertTriangle className="h-3.5 w-3.5 text-signal-amber" />
              </span>
            )}
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </div>

        {/* Title & description */}
        <div className="mt-3 flex-1">
          <h3 className="font-semibold leading-tight tracking-tight group-hover:text-primary transition-colors">{subject.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground leading-relaxed">{subject.description}</p>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[0.65rem] text-muted-foreground">Mastery</span>
            <span className={cn("font-mono text-[0.65rem] font-medium", stats.completion > 0 ? a.text : "text-muted-foreground/50")}>
              {stats.completion}%
            </span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className={cn("h-full rounded-full", completionColor)}
              initial={{ width: 0 }}
              animate={{ width: `${stats.completion}%` }}
              transition={{ duration: 0.8, delay: index * 0.04 + 0.2, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-3 gap-1 border-t border-border/60 pt-3">
          <StatChip icon={BookOpen} value={stats.notes} label="notes" />
          <StatChip icon={Layers} value={stats.flashcards} label="cards" />
          <StatChip icon={HelpCircle} value={stats.questions} label="Q&A" />
        </div>

        {/* Footer */}
        <div className="mt-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem]">
            <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
            <span className={status.color}>{status.label}</span>
          </span>
          {stats.lastRevised ? (
            <span className="flex items-center gap-1 font-mono text-[0.6rem] text-muted-foreground/60">
              <Clock className="h-2.5 w-2.5" /> {stats.lastRevised}
            </span>
          ) : (
            <span className="font-mono text-[0.65rem] text-muted-foreground/50">{stats.topics} topics</span>
          )}
        </div>

        {/* Mastered badge */}
        {stats.completion >= 80 && (
          <div className="absolute right-3 top-3">
            <span className="inline-flex items-center gap-1 rounded-md bg-signal-green/10 px-1.5 py-0.5 font-mono text-[0.6rem] text-signal-green ring-1 ring-signal-green/20">
              <CheckCircle2 className="h-2.5 w-2.5" /> Mastered
            </span>
          </div>
        )}
      </Link>
    </motion.div>
  );
}

function StatChip({ icon: IconComp, value, label }: { icon: React.ElementType; value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-xs font-semibold tabular-nums">{value}</span>
      <span className="font-mono text-[0.6rem] text-muted-foreground/70">{label}</span>
    </div>
  );
}
