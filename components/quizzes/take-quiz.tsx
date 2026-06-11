"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, PartyPopper, ArrowRight, RotateCcw } from "lucide-react";
import type { Quiz } from "@/types";
import { recordQuizAttempt } from "@/lib/actions/quizzes";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const OPTION_LABELS = ["A", "B", "C", "D"];

type Answer = { questionId: string; selectedIndex: number; correct: boolean };

export function TakeQuiz({ quiz }: { quiz: Quiz }) {
  const [index, setIndex] = React.useState(0);
  const [selected, setSelected] = React.useState<number | null>(null);
  const [revealed, setRevealed] = React.useState(false);
  const [answers, setAnswers] = React.useState<Answer[]>([]);
  const [done, setDone] = React.useState(false);
  const [pending, startTransition] = React.useTransition();
  const startedAt = React.useRef(Date.now());

  const question = quiz.questions[index];

  function selectOption(i: number) {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  }

  function next() {
    if (selected === null || !question) return;
    const correct = selected === question.correctIndex;
    const nextAnswers = [...answers, { questionId: question.id, selectedIndex: selected, correct }];
    setAnswers(nextAnswers);
    setSelected(null);
    setRevealed(false);
    if (index + 1 < quiz.questions.length) {
      setIndex(index + 1);
    } else {
      setDone(true);
      const duration = Math.round((Date.now() - startedAt.current) / 1000);
      startTransition(async () => { await recordQuizAttempt(quiz.id, nextAnswers, duration); });
    }
  }

  function restart() {
    setIndex(0); setSelected(null); setRevealed(false); setAnswers([]); setDone(false);
    startedAt.current = Date.now();
  }

  if (quiz.questions.length === 0) {
    return <p className="rounded-xl border border-dashed border-border py-16 text-center text-sm text-muted-foreground">This quiz has no questions yet.</p>;
  }

  if (done) {
    const score = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = total === 0 ? 0 : Math.round((score / total) * 100);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-green/10 ring-1 ring-signal-green/30">
            <PartyPopper className="h-7 w-7 text-signal-green" />
          </span>
          <h2 className="text-xl font-semibold">{score} / {total} correct ({pct}%)</h2>
          <p className="text-sm text-muted-foreground">Review your answers below, then retake the quiz to reinforce weak spots.</p>
          <Button onClick={restart} disabled={pending}><RotateCcw className="h-4 w-4" /> Retake quiz</Button>
        </div>

        <div className="mt-6 space-y-3">
          {quiz.questions.map((q, i) => {
            const a = answers[i];
            return (
              <div key={q.id} className={cn("rounded-xl border p-4", a.correct ? "border-signal-green/30 bg-signal-green/5" : "border-signal-red/30 bg-signal-red/5")}>
                <div className="flex items-start gap-2">
                  {a.correct ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-green" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal-red" />}
                  <div>
                    <p className="text-sm font-medium leading-snug">{q.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Your answer: {q.options[a.selectedIndex]}
                      {!a.correct && <> · Correct: {q.options[q.correctIndex]}</>}
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{q.explanation}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[question.difficulty] ?? "slate"];

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-xs ring-1", accent.bg, accent.text, accent.ring)}>
          {question.topic} · {question.difficulty} · {question.type}
        </span>
        <span className="font-mono text-xs text-muted-foreground">Question {index + 1} of {quiz.questions.length}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="card-glow rounded-2xl border border-border bg-card p-6"
        >
          <p className="text-balance text-lg font-medium leading-relaxed">{question.question}</p>

          <div className="mt-5 grid gap-2">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.correctIndex;
              const isSelected = i === selected;
              return (
                <button
                  key={i}
                  onClick={() => selectOption(i)}
                  disabled={revealed}
                  className={cn(
                    "flex items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                    revealed
                      ? isCorrect
                        ? "border-signal-green/40 bg-signal-green/10"
                        : isSelected
                          ? "border-signal-red/40 bg-signal-red/10"
                          : "border-border/60 text-muted-foreground"
                      : "border-border hover:border-primary/40 hover:bg-muted/30",
                  )}
                >
                  {revealed && isCorrect && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal-green" />}
                  {revealed && isSelected && !isCorrect && <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal-red" />}
                  {(!revealed || (!isCorrect && !isSelected)) && (
                    <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center font-mono text-[0.65rem] text-muted-foreground">{OPTION_LABELS[i] ?? i + 1}</span>
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 rounded-lg bg-muted/30 p-3 text-xs leading-relaxed text-foreground/80">
              <span className="mono-label mr-1.5">Why</span>{question.explanation}
            </motion.p>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex justify-end">
        <Button onClick={next} disabled={selected === null}>
          {index + 1 < quiz.questions.length ? <>Next <ArrowRight className="h-4 w-4" /></> : "Finish quiz"}
        </Button>
      </div>
    </div>
  );
}
