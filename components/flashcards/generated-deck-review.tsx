"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Check, X, Pencil, RotateCcw,
  Lightbulb, AlertTriangle, CalendarClock, Search, Loader2, Save,
} from "lucide-react";
import type { Difficulty, FlashcardGenerationResult, FlashcardTopic, GeneratedFlashcard } from "@/types";
import { FLASHCARD_TOPICS } from "@/types";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReviewCard extends GeneratedFlashcard {
  uid: string;
  included: boolean;
  flipped: boolean;
  editing: boolean;
}

function toReviewCards(cards: GeneratedFlashcard[]): ReviewCard[] {
  return cards.map((c, i) => ({ ...c, uid: `gc-${i}`, included: true, flipped: false, editing: false }));
}

// ── Topic tree (left panel) ─────────────────────────────────────────────────

function TopicTree({ result, cards, activeTopic, activeSubtopic, onSelect }: {
  result: FlashcardGenerationResult;
  cards: ReviewCard[];
  activeTopic: string | null;
  activeSubtopic: string | null;
  onSelect: (topic: string | null, subtopic: string | null) => void;
}) {
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(result.topics.map((t) => t.topic)));

  function toggle(topic: string) {
    setOpen((prev) => { const next = new Set(prev); next.has(topic) ? next.delete(topic) : next.add(topic); return next; });
  }

  const countFor = (topic: string, subtopic?: string) =>
    cards.filter((c) => c.topic === topic && (!subtopic || c.subtopic === subtopic)).length;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <p className="mono-label mb-2 px-1.5">Topic tree</p>
      <button
        onClick={() => onSelect(null, null)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
          activeTopic === null ? "bg-primary/10 text-primary" : "text-foreground/90 hover:bg-muted/50",
        )}
      >
        <span className="font-medium">All topics</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{cards.length}</span>
      </button>

      <div className="mt-1 space-y-0.5">
        {result.topics.map((group) => (
          <div key={group.topic}>
            <div className="flex items-center gap-0.5">
              <button onClick={() => toggle(group.topic)} className="rounded p-1 text-muted-foreground hover:text-foreground">
                {open.has(group.topic) ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => onSelect(group.topic, null)}
                className={cn(
                  "flex flex-1 items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition-colors",
                  activeTopic === group.topic && activeSubtopic === null ? "bg-primary/10 text-primary" : "text-foreground/90 hover:bg-muted/50",
                )}
              >
                <span className="font-medium">{group.topic}</span>
                <span className="font-mono text-xs text-muted-foreground tabular-nums">{countFor(group.topic)}</span>
              </button>
            </div>
            <AnimatePresence initial={false}>
              {open.has(group.topic) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }} className="overflow-hidden pl-7"
                >
                  {group.subtopics.map((sub) => (
                    <button
                      key={sub}
                      onClick={() => onSelect(group.topic, sub)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2 py-1 text-left text-xs transition-colors",
                        activeTopic === group.topic && activeSubtopic === sub ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      <span>{sub}</span>
                      <span className="font-mono tabular-nums">{countFor(group.topic, sub)}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Card tile (main panel) ───────────────────────────────────────────────────

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

function CardTile({ card, onToggleInclude, onFlip, onEdit, onSave, onCancelEdit }: {
  card: ReviewCard;
  onToggleInclude: () => void;
  onFlip: () => void;
  onEdit: () => void;
  onSave: (patch: Partial<GeneratedFlashcard>) => void;
  onCancelEdit: () => void;
}) {
  const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[card.difficulty] ?? "slate"];
  const [draft, setDraft] = React.useState({
    question: card.question,
    answer: card.answer,
    topic: card.topic,
    difficulty: card.difficulty,
  });
  React.useEffect(() => {
    if (card.editing) {
      setDraft({ question: card.question, answer: card.answer, topic: card.topic, difficulty: card.difficulty });
    }
  }, [card.editing, card.question, card.answer, card.topic, card.difficulty]);
  const topicMode = FLASHCARD_TOPICS.includes(draft.topic as (typeof FLASHCARD_TOPICS)[number]) ? draft.topic : "custom";

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-opacity",
        card.included ? "border-border" : "border-border/50 opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn(accent.text, accent.ring)}>{card.difficulty}</Badge>
          <Badge variant="muted">{card.topic}</Badge>
          {card.subtopic && <Badge variant="outline" className="text-muted-foreground">{card.subtopic}</Badge>}
          {card.flashcardType && <Badge variant="outline" className="text-muted-foreground">{card.flashcardType}</Badge>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} title="Edit card">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={onToggleInclude}
            title={card.included ? "Exclude from import" : "Include in import"}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md border transition-colors",
              card.included ? "border-signal-green/40 bg-signal-green/15 text-signal-green" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {card.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {card.editing ? (
        <div className="grid gap-2.5">
          <label className="block"><span className="mono-label mb-1 block">Question</span>
            <Textarea value={draft.question} onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))} rows={2} className="text-sm" /></label>
          <label className="block"><span className="mono-label mb-1 block">Answer</span>
            <Textarea value={draft.answer} onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))} rows={3} className="text-sm" /></label>
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <label className="block"><span className="mono-label mb-1 block">Topic</span>
              <Select value={topicMode} onValueChange={(value) => setDraft((d) => ({ ...d, topic: value === "custom" ? "" : value as FlashcardTopic }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {FLASHCARD_TOPICS.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
                  <SelectItem value="custom">Custom topic</SelectItem>
                </SelectContent>
              </Select>
              {topicMode === "custom" && (
                <Input
                  value={draft.topic}
                  onChange={(e) => setDraft((d) => ({ ...d, topic: e.target.value }))}
                  placeholder="e.g. Selenium, Java, Mobile Testing"
                  className="mt-2"
                />
              )}
            </label>
            <div>
              <span className="mono-label mb-1 block">Difficulty</span>
              <div className="flex items-center gap-1.5">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDraft((draft_) => ({ ...draft_, difficulty: d }))}
                    className={cn(
                      "rounded-md border px-2 py-0.5 font-mono text-[0.7rem] transition-colors",
                      draft.difficulty === d ? `${ACCENT_CLASS[DIFFICULTY_ACCENT[d]].text} ${ACCENT_CLASS[DIFFICULTY_ACCENT[d]].ring} ring-1` : "border-border text-muted-foreground",
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={onCancelEdit}>Cancel</Button>
            <Button size="sm" onClick={() => onSave(draft)} disabled={!draft.topic.trim()}>Save</Button>
          </div>
        </div>
      ) : (
        <button onClick={onFlip} className="min-h-[88px] cursor-pointer rounded-lg bg-muted/30 p-3 text-left transition-colors hover:bg-muted/50">
          <AnimatePresence mode="wait" initial={false}>
            {card.flipped ? (
              <motion.p key="back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="text-sm leading-relaxed text-foreground/90">
                {card.answer}
              </motion.p>
            ) : (
              <motion.p key="front" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                className="text-sm font-medium leading-snug">
                {card.question}
              </motion.p>
            )}
          </AnimatePresence>
          <p className="mt-2 font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            {card.flipped ? "Answer — click to flip back" : "Question — click to reveal answer"}
          </p>
        </button>
      )}

      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {card.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">#{t}</span>)}
        </div>
      )}
      {card.sourceSnippet && (
        <p className="line-clamp-2 border-l-2 border-border pl-2.5 text-xs italic text-muted-foreground">&ldquo;{card.sourceSnippet}&rdquo;</p>
      )}
    </motion.div>
  );
}

// ── AI insights panel (right panel) ──────────────────────────────────────────

function InsightsPanel({ result }: { result: FlashcardGenerationResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mono-label mb-2">Document summary</p>
        <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
      </div>

      <Section icon={Lightbulb} title="Key insights" items={result.insights} accent="blue" />
      <Section icon={AlertTriangle} title="Weak areas detected" items={result.weakAreas} accent="amber" />
      <Section icon={CalendarClock} title="Suggested revision plan" items={result.revisionPlan} accent="violet" />
    </div>
  );
}

function Section({ icon: Icon, title, items, accent }: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items: string[];
  accent: keyof typeof ACCENT_CLASS;
}) {
  if (!items.length) return null;
  const a = ACCENT_CLASS[accent];
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2.5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", a.text)} /> {title}
      </p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
            <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", a.dot)} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export function GeneratedDeckReview({ result, sourceLabel, onSave, onReset, saving }: {
  result: FlashcardGenerationResult;
  sourceLabel: string;
  onSave: (cards: GeneratedFlashcard[]) => void;
  onReset: () => void;
  saving: boolean;
}) {
  const [cards, setCards] = React.useState<ReviewCard[]>(() => toReviewCards(result.cards));
  const [activeTopic, setActiveTopic] = React.useState<string | null>(null);
  const [activeSubtopic, setActiveSubtopic] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  function patch(uid: string, fn: (c: ReviewCard) => ReviewCard) {
    setCards((cs) => cs.map((c) => (c.uid === uid ? fn(c) : c)));
  }

  const visible = cards.filter((c) => {
    if (activeTopic && c.topic !== activeTopic) return false;
    if (activeSubtopic && c.subtopic !== activeSubtopic) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      return c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q) || c.tags?.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  const includedCount = cards.filter((c) => c.included).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Generated from <span className="text-foreground">{sourceLabel}</span></p>
          <p className="text-xs text-muted-foreground">Review, edit, or exclude cards — only the included ones get saved to your deck.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onReset}><RotateCcw className="h-4 w-4" /> Start over</Button>
          <Button onClick={() => onSave(cards.filter((c) => c.included))} disabled={saving || includedCount === 0}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save {includedCount} card{includedCount === 1 ? "" : "s"} to deck</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        <div className="hidden lg:block">
          <TopicTree result={result} cards={cards} activeTopic={activeTopic} activeSubtopic={activeSubtopic}
            onSelect={(t, s) => { setActiveTopic(t); setActiveSubtopic(s); }} />
        </div>

        <div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search generated cards…" className="pl-9" />
          </div>
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No cards match this filter.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {visible.map((card) => (
                  <CardTile
                    key={card.uid}
                    card={card}
                    onToggleInclude={() => patch(card.uid, (c) => ({ ...c, included: !c.included }))}
                    onFlip={() => patch(card.uid, (c) => ({ ...c, flipped: !c.flipped }))}
                    onEdit={() => patch(card.uid, (c) => ({ ...c, editing: true }))}
                    onCancelEdit={() => patch(card.uid, (c) => ({ ...c, editing: false }))}
                    onSave={(p) => patch(card.uid, (c) => ({ ...c, ...p, editing: false }))}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        <div className="hidden lg:block"><InsightsPanel result={result} /></div>
      </div>
    </div>
  );
}
