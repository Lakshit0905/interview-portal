"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { VideoQA } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export function VideoQaList({ items }: { items: VideoQA[] }) {
  const [openId, setOpenId] = React.useState<string | null>(items[0]?.id ?? null);

  if (!items.length) {
    return <EmptyState icon="HelpCircle" title="No questions generated" description="Drill questions are generated from the transcript when the lesson is created." />;
  }

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="text-sm font-medium">{item.question}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden border-t border-border"
                >
                  <p className="p-4 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
