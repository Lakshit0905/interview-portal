"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw } from "lucide-react";
import type { VideoFlashcard } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VideoFlashcards({ cards }: { cards: VideoFlashcard[] }) {
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  if (!cards.length) return <p className="text-sm text-muted-foreground">No flashcards generated for this lesson.</p>;

  const card = cards[index];

  function go(delta: number) {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="mb-3 text-center font-mono text-xs text-muted-foreground">{index + 1} / {cards.length} · click the card to flip</p>

      <AnimatePresence mode="wait">
        <motion.button
          key={card.id}
          type="button"
          onClick={() => setFlipped((f) => !f)}
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "flex min-h-[180px] w-full flex-col items-center justify-center gap-2 rounded-xl border p-6 text-center transition-colors",
            flipped ? "border-primary/30 bg-primary/5" : "border-border bg-card hover:border-primary/30",
          )}
        >
          <span className="mono-label text-muted-foreground">{flipped ? "Back" : "Front"}</span>
          <p className="text-balance text-sm leading-relaxed">{flipped ? card.back : card.front}</p>
          <span className="mt-2 inline-flex items-center gap-1 font-mono text-[0.7rem] text-muted-foreground/70">
            <RotateCw className="h-3 w-3" /> click to flip
          </span>
        </motion.button>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => go(-1)}><ChevronLeft className="h-4 w-4" /></Button>
        <Button variant="outline" size="icon" onClick={() => go(1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </div>
  );
}
