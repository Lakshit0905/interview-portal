"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import type { Flashcard, FlashcardTopic } from "@/types";
import { FLASHCARD_TOPICS } from "@/types";
import { createFlashcard, updateFlashcard, deleteFlashcard } from "@/lib/actions/flashcards";
import { buildFlashcardStats, isDue } from "@/lib/srs";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/shared/page-header";

import { ReviewSession } from "./review-session";
import { FlashcardStatsRow, TopicBreakdown } from "./flashcard-stats";
import { FlashcardDeck, TopicFilterBar } from "./flashcard-deck";
import { FlashcardFormDialog, EMPTY_FLASHCARD_DRAFT, type FlashcardDraft } from "./flashcard-form-dialog";

function parseTopic(value: string | null): FlashcardTopic | null {
  return value?.trim() || null;
}

export function FlashcardsClient({ initial }: { initial: Flashcard[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [cards, setCards] = React.useState(initial);
  const [tab, setTab] = React.useState(searchParams.get("tab") ?? "review");
  const [topic, setTopic] = React.useState<FlashcardTopic | null>(() => parseTopic(searchParams.get("topic")));
  const [pending, startTransition] = React.useTransition();

  const [formOpen, setFormOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<FlashcardDraft>(EMPTY_FLASHCARD_DRAFT);

  React.useEffect(() => setCards(initial), [initial]);
  React.useEffect(() => setTopic(parseTopic(searchParams.get("topic"))), [searchParams]);

  const topicCards = React.useMemo(
    () => (topic ? cards.filter((c) => c.topic === topic) : cards),
    [cards, topic],
  );
  const topicOptions = React.useMemo(
    () => [...new Set([...FLASHCARD_TOPICS, ...cards.map((card) => card.topic)].filter(Boolean))],
    [cards],
  );
  const due = React.useMemo(() => topicCards.filter((c) => isDue(c)), [topicCards]);
  const stats = React.useMemo(() => buildFlashcardStats(topicCards), [topicCards]);
  const allStats = React.useMemo(() => buildFlashcardStats(cards), [cards]);

  function openCreate() { setDraft(topic ? { ...EMPTY_FLASHCARD_DRAFT, topic } : EMPTY_FLASHCARD_DRAFT); setFormOpen(true); }
  function openEdit(card: Flashcard) { setDraft(card); setFormOpen(true); }
  function changeTopic(nextTopic: FlashcardTopic | null) {
    setTopic(nextTopic);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTopic) params.set("topic", nextTopic);
    else params.delete("topic");
    if (tab !== "review") params.set("tab", tab);
    else params.delete("tab");
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }
  function changeTab(nextTab: string) {
    setTab(nextTab);
    const params = new URLSearchParams(searchParams.toString());
    if (nextTab === "review") params.delete("tab");
    else params.set("tab", nextTab);
    router.replace(`${pathname}${params.toString() ? `?${params.toString()}` : ""}`, { scroll: false });
  }

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
      topic: draft.topic?.trim() ?? "",
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
        <Button variant="ghost" asChild><Link href="/flashcards/generate"><Sparkles className="h-4 w-4" /> Generate from notes</Link></Button>
        <Button onClick={openCreate}><Plus className="h-4 w-4" /> New flashcard</Button>
      </PageHeader>

      <div className="mb-4">
        <TopicFilterBar active={topic} onChange={changeTopic} topics={topicOptions} />
      </div>

      <div className="mb-6"><FlashcardStatsRow stats={stats} /></div>

      <Tabs value={tab} onValueChange={changeTab}>
        <TabsList>
          <TabsTrigger value="review">Review {due.length > 0 && `(${due.length})`}</TabsTrigger>
          <TabsTrigger value="deck">Browse deck {topic && `(${topicCards.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <ReviewSession due={due} onReviewed={handleReviewed} />
            <div className="hidden lg:block"><TopicBreakdown stats={topic ? allStats : stats} /></div>
          </div>
        </TabsContent>

        <TabsContent value="deck">
          <FlashcardDeck cards={cards} onEdit={openEdit} onDelete={handleDelete} topic={topic} />
        </TabsContent>
      </Tabs>

      <FlashcardFormDialog
        open={formOpen} onOpenChange={setFormOpen}
        draft={draft} onChange={setDraft} onSave={save} pending={pending}
      />
    </div>
  );
}
