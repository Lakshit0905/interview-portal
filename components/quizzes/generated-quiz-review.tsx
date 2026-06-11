"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronRight, Check, X, Lightbulb, Search, Loader2, Save, RotateCcw, CheckCircle2,
} from "lucide-react";
import type { Difficulty, QuizGenerationResult, GeneratedQuizQuestion } from "@/types";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ReviewQuestion extends GeneratedQuizQuestion {
  uid: string;
  included: boolean;
}

function toReviewQuestions(questions: GeneratedQuizQuestion[]): ReviewQuestion[] {
  return questions.map((q, i) => ({ ...q, uid: `gq-${i}`, included: true }));
}

// ── Topic tree (left panel) ─────────────────────────────────────────────────

function TopicTree({ result, questions, activeTopic, activeSubtopic, onSelect }: {
  result: QuizGenerationResult;
  questions: ReviewQuestion[];
  activeTopic: string | null;
  activeSubtopic: string | null;
  onSelect: (topic: string | null, subtopic: string | null) => void;
}) {
  const [open, setOpen] = React.useState<Set<string>>(() => new Set(result.topics.map((t) => t.topic)));

  function toggle(topic: string) {
    setOpen((prev) => { const next = new Set(prev); next.has(topic) ? next.delete(topic) : next.add(topic); return next; });
  }

  const countFor = (topic: string, subtopic?: string) =>
    questions.filter((q) => q.topic === topic && (!subtopic || q.subtopic === subtopic)).length;

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
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{questions.length}</span>
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

// ── Question tile (main panel) ───────────────────────────────────────────────

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const OPTION_LABELS = ["A", "B", "C", "D"];

function QuestionTile({ question, onToggleInclude, onSetDifficulty }: {
  question: ReviewQuestion;
  onToggleInclude: () => void;
  onSetDifficulty: (d: Difficulty) => void;
}) {
  const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[question.difficulty] ?? "slate"];

  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col gap-3 rounded-xl border bg-card p-4 transition-opacity",
        question.included ? "border-border" : "border-border/50 opacity-50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="outline" className={cn(accent.text, accent.ring)}>{question.difficulty}</Badge>
          <Badge variant="muted">{question.topic}</Badge>
          {question.subtopic && <Badge variant="outline" className="text-muted-foreground">{question.subtopic}</Badge>}
          <Badge variant="outline" className="text-muted-foreground">{question.type}</Badge>
        </div>
        <button
          onClick={onToggleInclude}
          title={question.included ? "Exclude from quiz" : "Include in quiz"}
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors",
            question.included ? "border-signal-green/40 bg-signal-green/15 text-signal-green" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {question.included ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
        </button>
      </div>

      <p className="text-sm font-medium leading-snug">{question.question}</p>

      <div className="grid gap-1.5">
        {question.options.map((opt, i) => (
          <div
            key={i}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-2.5 py-1.5 text-xs leading-relaxed",
              i === question.correctIndex
                ? "border-signal-green/30 bg-signal-green/10 text-foreground"
                : "border-border/60 text-muted-foreground",
            )}
          >
            {i === question.correctIndex
              ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal-green" />
              : <span className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center font-mono text-[0.65rem]">{OPTION_LABELS[i] ?? i + 1}</span>}
            <span>{opt}</span>
          </div>
        ))}
      </div>

      <p className="rounded-lg bg-muted/30 p-2.5 text-xs leading-relaxed text-foreground/80">
        <span className="mono-label mr-1.5">Why</span>{question.explanation}
      </p>

      <div className="flex items-center gap-1.5">
        {DIFFICULTIES.map((d) => (
          <button
            key={d}
            onClick={() => onSetDifficulty(d)}
            className={cn(
              "rounded-md border px-2 py-0.5 font-mono text-[0.7rem] transition-colors",
              question.difficulty === d ? `${ACCENT_CLASS[DIFFICULTY_ACCENT[d]].text} ${ACCENT_CLASS[DIFFICULTY_ACCENT[d]].ring} ring-1` : "border-border text-muted-foreground",
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {question.tags.map((t) => <span key={t} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.65rem] text-muted-foreground">#{t}</span>)}
        </div>
      )}
      {question.sourceSnippet && (
        <p className="line-clamp-2 border-l-2 border-border pl-2.5 text-xs italic text-muted-foreground">&ldquo;{question.sourceSnippet}&rdquo;</p>
      )}
    </motion.div>
  );
}

// ── AI insights panel (right panel) ──────────────────────────────────────────

function InsightsPanel({ result }: { result: QuizGenerationResult }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="mono-label mb-2">Document summary</p>
        <p className="text-sm leading-relaxed text-foreground/90">{result.summary}</p>
      </div>

      {result.insights.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="mb-2.5 inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <Lightbulb className={cn("h-3.5 w-3.5", ACCENT_CLASS.blue.text)} /> Key insights
          </p>
          <ul className="space-y-1.5">
            {result.insights.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-foreground/90">
                <span className={cn("mt-1.5 h-1 w-1 shrink-0 rounded-full", ACCENT_CLASS.blue.dot)} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────────────

export function GeneratedQuizReview({ result, sourceLabel, onSave, onReset, saving }: {
  result: QuizGenerationResult;
  sourceLabel: string;
  onSave: (questions: GeneratedQuizQuestion[]) => void;
  onReset: () => void;
  saving: boolean;
}) {
  const [questions, setQuestions] = React.useState<ReviewQuestion[]>(() => toReviewQuestions(result.questions));
  const [activeTopic, setActiveTopic] = React.useState<string | null>(null);
  const [activeSubtopic, setActiveSubtopic] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");

  function patch(uid: string, fn: (q: ReviewQuestion) => ReviewQuestion) {
    setQuestions((qs) => qs.map((q) => (q.uid === uid ? fn(q) : q)));
  }

  const visible = questions.filter((q) => {
    if (activeTopic && q.topic !== activeTopic) return false;
    if (activeSubtopic && q.subtopic !== activeSubtopic) return false;
    if (query.trim()) {
      const needle = query.toLowerCase();
      return q.question.toLowerCase().includes(needle) || q.tags?.some((t) => t.toLowerCase().includes(needle));
    }
    return true;
  });

  const includedCount = questions.filter((q) => q.included).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Generated from <span className="text-foreground">{sourceLabel}</span></p>
          <p className="text-xs text-muted-foreground">Review or exclude questions — only the included ones get saved to your quiz.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onReset}><RotateCcw className="h-4 w-4" /> Start over</Button>
          <Button onClick={() => onSave(questions.filter((q) => q.included))} disabled={saving || includedCount === 0}>
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Save className="h-4 w-4" /> Save {includedCount} question{includedCount === 1 ? "" : "s"} as quiz</>}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[220px_1fr_280px]">
        <div className="hidden lg:block">
          <TopicTree result={result} questions={questions} activeTopic={activeTopic} activeSubtopic={activeSubtopic}
            onSelect={(t, s) => { setActiveTopic(t); setActiveSubtopic(s); }} />
        </div>

        <div>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search generated questions…" className="pl-9" />
          </div>
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">No questions match this filter.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <AnimatePresence initial={false}>
                {visible.map((q) => (
                  <QuestionTile
                    key={q.uid}
                    question={q}
                    onToggleInclude={() => patch(q.uid, (c) => ({ ...c, included: !c.included }))}
                    onSetDifficulty={(d) => patch(q.uid, (c) => ({ ...c, difficulty: d }))}
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
