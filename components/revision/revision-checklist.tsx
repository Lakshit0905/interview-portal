"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Layers, Code2, HelpCircle, type LucideIcon } from "lucide-react";
import type { RevisionItem, RevisionItemType } from "@/lib/data/revision";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

const TYPE_META: Record<RevisionItemType, { label: string; icon: LucideIcon }> = {
  flashcard: { label: "Flashcard", icon: Layers },
  coding: { label: "Coding", icon: Code2 },
  question: { label: "Question", icon: HelpCircle },
};

export function RevisionChecklist({ items, date }: { items: RevisionItem[]; date: string }) {
  const [checked, setChecked] = React.useState<Set<string>>(new Set());

  function toggle(id: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const percent = items.length === 0 ? 0 : Math.round((checked.size / items.length) * 100);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Today&apos;s revision sheet</h3>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{checked.size}/{items.length} done</span>
      </div>
      <Progress value={percent} className="mt-3 h-1.5" />

      {items.length === 0 ? (
        <div className="mt-4">
          <EmptyState icon="CalendarCheck" title="Nothing due today"
            description="Your flashcard queue and revisit list are clear — check back tomorrow or get ahead by reviewing early." />
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {items.map((item, i) => {
            const meta = TYPE_META[item.type];
            const done = checked.has(item.id);
            return (
              <motion.li
                key={item.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex items-center gap-3 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    aria-pressed={done}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      done ? "border-signal-green/40 bg-signal-green/15 text-signal-green" : "border-border text-transparent",
                    )}
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <meta.icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={item.href} className={cn("block truncate text-sm font-medium hover:underline", done && "text-muted-foreground line-through")}>
                      {item.title}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">{meta.label} · {item.topic} · {item.meta}</p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
