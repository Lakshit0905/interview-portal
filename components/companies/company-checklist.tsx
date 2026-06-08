"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CompanyChecklistItem } from "@/types";
import { toggleCompanyChecklistItem } from "@/lib/actions/company-prep";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function CompanyChecklist({ companyId, items }: { companyId: string; items: CompanyChecklistItem[] }) {
  const [checklist, setChecklist] = React.useState(items);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setChecklist(items), [items]);

  const done = checklist.filter((c) => c.done).length;
  const percent = checklist.length === 0 ? 0 : Math.round((done / checklist.length) * 100);

  function toggle(itemId: string) {
    setChecklist((cs) => cs.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)));
    startTransition(async () => { await toggleCompanyChecklistItem(companyId, itemId); });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight">Prep checklist</h3>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{done}/{checklist.length} done</span>
      </div>
      <Progress value={percent} className="mt-3 h-1.5" />

      <ul className="mt-4 divide-y divide-border/70">
        {checklist.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3, ease: "easeOut" }}
          >
            <button
              type="button"
              disabled={pending}
              onClick={() => toggle(item.id)}
              aria-pressed={item.done}
              className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
            >
              <span className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                item.done ? "border-signal-green/40 bg-signal-green/15 text-signal-green" : "border-border text-transparent",
              )}>
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className={cn("text-sm", item.done && "text-muted-foreground line-through")}>{item.label}</span>
            </button>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
