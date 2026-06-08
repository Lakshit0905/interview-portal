"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import type { Flashcard } from "@/types";
import { createFlashcard, updateFlashcard, deleteFlashcard } from "@/lib/actions/flashcards";
import { buildFlashcardStats, isDue } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";

import { ReviewSession } from "./review-session";
import { FlashcardStatsRow, TopicBreakdown } from "./flashcard-stats";
import { FlashcardDeck } from "./flashcard-deck";
import { FlashcardFormDialog, EMPTY_FLASHCARD_DRAFT, type FlashcardDraft } from "./flashcard-form-dialog";

export function FlashcardsClient({ initial }: { initial: Flashcard[] }) {
  const [cards, setCards] = React.useState(initial);
  const [tab, setTab] = React.useState("review");
  const [pending, startTransition] = React.useTransition();

  const [formOpen, setFormOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FlashcardDraft>(EMPTY_FLASHCARD_DRAFT);

  React.useEffect(() => setCards(initial), [initial]);

  const due = React.useMemo(() => cards.filter((c) => isDue(c)), [cards]);
  const stats = React.useMemo(() => buildFlashcardStats(cards), [cards]);

  function openCreate() { setDraft(EMPTY_FLASHCARD_DRAFT); setFormOpen(true); }
  function openEdit(card: Flashcard) { setDraft(card); setFormOpen(true); }

  function handleReviewed(id: string, patch: Partial<Flashcard>) {
    setCards((cs) => cs.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }

  function handleDelete(card: Flashcard) {
    setCards((cs) => cs.filter((c) => c.id !== card.id));
    startTransition(async () => { await deleteFlashcard(card.id); });
  }

  function save() {
    const payload = {
      front: draft.front?.trim() ?? "",
      back: draft.back?.trim() ?? "",
      topic: draft.topic!,
      difficulty: draft.difficulty!,
      source: draft.source ?? "manual",
      sourceRef: draft.sourceRef,
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateFlashcard(draft.id, payload);
        if (updated) setCards((cs) => cs.map((c) => (c.id === draft.id ? updated : c)));
      } else {
        const created = await createFlashcard(payload);
        setCards((cs) => [created, ...cs]);
      }
      setFormOpen(false);
    });
  }

  return (
    <div>
      <PageHeader
        title="Flashcards"
        description="Spaced-repetition review across every topic — grade each card honestly and the schedule (1 → 3 → 7 → 14 → 30 days) takes care of the rest."
      >
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New flashcard</Button>
      </PageHeader>

      <div className="mb-6"><FlashcardStatsRow stats={stats} /></div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="review">Review {due.length > 0 && `(${due.length})`}</TabsTrigger>
          <TabsTrigger value="deck">Browse deck</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <ReviewSession due={due} onReviewed={handleReviewed} />
            <div className="hidden lg:block"><TopicBreakdown stats={stats} /></div>
          </div>
        </TabsContent>

        <TabsContent value="deck">
          <FlashcardDeck cards={cards} onEdit={openEdit} onDelete={handleDelete} />
        </TabsContent>
      </Tabs>

      <FlashcardFormDialog
        open={formOpen} onOpenChange={setFormOpen}
        draft={draft} onChange={setDraft} onSave={save} pending={pending}
      />
    </div>
  );
}
