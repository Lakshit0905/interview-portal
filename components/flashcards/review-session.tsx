"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCw, ThumbsDown, ThumbsUp, PartyPopper } from "lucide-react";
import type { Flashcard } from "@/types";
import { REVIEW_INTERVALS_DAYS } from "@/types";
import { reviewFlashcard } from "@/lib/actions/flashcards";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

function intervalLabel(days: number): string {
  return days === 1 ? "1 day" : `${days} days`;
}

export function ReviewSession({ due, onReviewed }: {
  due: Flashcard[];
  onReviewed: (id: string, patch: Partial<Flashcard>) => void;
}) {
  const [queue, setQueue] = React.useState(due);
  const [flipped, setFlipped] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const [sessionDone, setSessionDone] = React.useState(0);

  React.useEffect(() => { setQueue(due); setSessionDone(0); setFlipped(false); }, [due]);

  const card = queue[0] ?? null;

  function grade(g: "again" | "good") {
    if (!card || pending) return;
    startTransition(async () => {
      const updated = await reviewFlashcard(card.id, g);
      if (updated) onReviewed(card.id, updated);
      setQueue((q) => (g === "again" ? [...q.slice(1), card] : q.slice(1)));
      setSessionDone((n) => (g === "good" ? n + 1 : n));
      setFlipped(false);
    });
  }

  if (!card) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-green/10 ring-1 ring-signal-green/30">
          <PartyPopper className="h-7 w-7 text-signal-green" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">All caught up</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {sessionDone > 0
            ? `Nice work — you cleared ${sessionDone} card${sessionDone === 1 ? "" : "s"} this session. Check back tomorrow for the next batch.`
            : "Nothing is due for review right now. New cards will surface here as they come due."}
        </p>
      </div>
    );
  }

  const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[card.difficulty] ?? "slate"];
  const goodInterval = REVIEW_INTERVALS_DAYS[Math.min(card.streak + 1, REVIEW_INTERVALS_DAYS.length - 1)];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs ring-1", accent.bg, accent.text, accent.ring)}>
            {card.topic} · {card.difficulty}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {queue.length} card{queue.length === 1 ? "" : "s"} left · {sessionDone} reviewed
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.button
          key={card.id + (flipped ? "-back" : "-front")}
          type="button"
          onClick={() => setFlipped((f) => !f)}
          initial={{ opacity: 0, rotateX: flipped ? -12 : 12 }}
          animate={{ opacity: 1, rotateX: 0 }}
          exit={{ opacity: 0, rotateX: flipped ? 12 : -12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="card-glow relative flex min-h-[260px] w-full flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center"
          style={{ perspective: 1000 }}
        >
          <span className="mono-label absolute left-5 top-5">{flipped ? "Answer" : "Question"}</span>
          <p className="max-w-lg text-balance text-lg font-medium leading-relaxed">
            {flipped ? card.back : card.front}
          </p>
          <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCw className="h-3.5 w-3.5" /> Tap card to {flipped ? "see question" : "reveal answer"}
          </span>
        </motion.button>
      </AnimatePresence>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          disabled={!flipped || pending}
          onClick={() => grade("again")}
          className="h-12 border-signal-red/30 text-signal-red hover:bg-signal-red/10 hover:text-signal-red"
        >
          <ThumbsDown className="h-4 w-4" />
          Again <span className="font-mono text-xs opacity-70">→ tomorrow</span>
        </Button>
        <Button
          disabled={!flipped || pending}
          onClick={() => grade("good")}
          className="h-12 bg-signal-green/15 text-signal-green ring-1 ring-signal-green/30 hover:bg-signal-green/25"
        >
          <ThumbsUp className="h-4 w-4" />
          Good <span className="font-mono text-xs opacity-70">→ in {intervalLabel(goodInterval)}</span>
        </Button>
      </div>
      {!flipped && (
        <p className="mt-3 text-center text-xs text-muted-foreground">Reveal the answer first, then grade how well you knew it.</p>
      )}
    </div>
  );
}
