"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Clock } from "lucide-react";
import type { Flashcard, FlashcardTopic } from "@/types";
import { FLASHCARD_TOPICS } from "@/types";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate, relativeTime } from "@/lib/utils";
import { isDue } from "@/lib/srs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopicFilterBar({ active, onChange, topics = [...FLASHCARD_TOPICS] }: {
  active: FlashcardTopic | null;
  onChange: (t: FlashcardTopic | null) => void;
  topics?: FlashcardTopic[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onChange(null)}
        className={cn(
          "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
          active === null ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
        )}
      >
        All topics
      </button>
      {topics.map((t) => (
        <button
          key={t}
          onClick={() => onChange(active === t ? null : t)}
          className={cn(
            "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
            active === t ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function DeckCard({ card, onEdit, onDelete }: {
  card: Flashcard;
  onEdit: (c: Flashcard) => void;
  onDelete: (c: Flashcard) => void;
}) {
  const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[card.difficulty] ?? "slate"];
  const due = isDue(card);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group relative flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn(accent.text, accent.ring)}>{card.difficulty}</Badge>
          <Badge variant="muted">{card.topic}</Badge>
          {card.subtopic && <Badge variant="outline" className="text-muted-foreground">{card.subtopic}</Badge>}
          {card.flashcardType && <Badge variant="outline" className="text-muted-foreground">{card.flashcardType}</Badge>}
          {due && <Badge className="bg-signal-amber/15 text-signal-amber ring-1 ring-signal-amber/30">Due</Badge>}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(card)}><Pencil className="h-3.5 w-3.5" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(card)} className="text-signal-red focus:text-signal-red">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div>
        <p className="text-sm font-medium leading-snug">{card.front}</p>
        <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{card.back}</p>
        {card.tags && card.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {card.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">#{t}</span>)}
          </div>
        )}
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-[0.7rem] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {due ? "Due now" : `Due ${formatDate(card.dueAt)}`}
        </span>
        <span>{card.reviewCount} review{card.reviewCount === 1 ? "" : "s"} · {card.lastReviewedAt ? relativeTime(card.lastReviewedAt) : "never reviewed"}</span>
      </div>
    </motion.div>
  );
}

export function FlashcardDeck({ cards, onEdit, onDelete, topic }: {
  cards: Flashcard[];
  onEdit: (c: Flashcard) => void;
  onDelete: (c: Flashcard) => void;
  topic: FlashcardTopic | null;
}) {
  const filtered = React.useMemo(
    () => (topic ? cards.filter((c) => c.topic === topic) : cards),
    [cards, topic],
  );

  return (
    <div>
      {filtered.length === 0 ? (
        <EmptyState icon="Layers" title="No flashcards yet"
          description="Add cards manually, or generate them from notes, videos, and questions as you study." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => <DeckCard key={c.id} card={c} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      )}
    </div>
  );
}
