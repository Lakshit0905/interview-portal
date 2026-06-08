"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { CompanyFAQ } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

export function CompanyFAQs({ faqs }: { faqs: CompanyFAQ[] }) {
  const [openId, setOpenId] = React.useState<string | null>(faqs[0]?.id ?? null);

  if (faqs.length === 0) {
    return <EmptyState icon="HelpCircle" title="No FAQs yet" description="Add common questions and your prepared answers as you research this company." />;
  }

  return (
    <div className="space-y-2">
      {faqs.map((f) => {
        const open = openId === f.id;
        return (
          <div key={f.id} className="overflow-hidden rounded-xl border border-border bg-card">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : f.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left"
            >
              <span className="text-sm font-medium">{f.question}</span>
              <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden border-t border-border"
                >
                  <p className="p-4 text-sm leading-relaxed text-muted-foreground">{f.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
