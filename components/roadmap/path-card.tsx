"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Clock } from "lucide-react";
import type { LearningPath } from "@/types";
import { pathProgress } from "@/lib/roadmap";
import { ACCENT_CLASS } from "@/lib/constants";
import { Icon } from "@/components/shared/icon";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  "not-started": "Not started",
  "in-progress": "In progress",
  completed: "Completed",
};

export function PathCard({ path, index, onToggleTopic, pending }: {
  path: LearningPath;
  index: number;
  onToggleTopic: (pathId: string, topicId: string) => void;
  pending: boolean;
}) {
  const [open, setOpen] = React.useState(false);
  const progress = pathProgress(path);
  const accent = ACCENT_CLASS[path.accent] ?? ACCENT_CLASS.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      className="card-glow rounded-xl border border-border bg-card overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-4 p-5 text-left"
      >
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ring-1", accent.bg, accent.ring)}>
          <Icon name={path.icon} className={cn("h-5 w-5", accent.text)} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold tracking-tight">{path.title}</h3>
            <Badge variant="outline" className={cn("shrink-0", accent.text, accent.ring)}>
              {STATUS_LABEL[progress.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{path.description}</p>

          <div className="mt-3 flex items-center gap-3">
            <Progress value={progress.percent} className="h-1.5 flex-1" indicatorClassName={accent.dot} />
            <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
              {progress.done}/{progress.total} · {progress.percent}%
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2 pl-1">
          <span className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" /> {progress.hoursRemaining}h left
          </span>
          <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden border-t border-border"
          >
            <ul className="divide-y divide-border/70">
              {path.topics.map((topic) => (
                <li key={topic.id}>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => onToggleTopic(path.id, topic.id)}
                    className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-muted/40 disabled:opacity-60"
                  >
                    <span className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                      topic.done ? cn(accent.bg, accent.ring, accent.text) : "border-border text-transparent",
                    )}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className={cn("flex-1 text-sm", topic.done && "text-muted-foreground line-through")}>
                      {topic.title}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{topic.estimatedHours}h</span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
