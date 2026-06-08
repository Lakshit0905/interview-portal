"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, X, RefreshCw, Trophy } from "lucide-react";
import type { VideoMCQ } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function VideoMcqQuiz({ mcqs }: { mcqs: VideoMCQ[] }) {
  const [answers, setAnswers] = React.useState<Record<string, number>>({});

  if (!mcqs.length) return <p className="text-sm text-muted-foreground">No quiz questions generated for this lesson.</p>;

  const answeredCount = Object.keys(answers).length;
  const correctCount = mcqs.filter((q) => answers[q.id] === q.correctIndex).length;
  const done = answeredCount === mcqs.length;

  function choose(qId: string, optIndex: number) {
    if (qId in answers) return;
    setAnswers((a) => ({ ...a, [qId]: optIndex }));
  }

  function reset() {
    setAnswers({});
  }

  return (
    <div>
      {done ? (
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-5 flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium">
            <Trophy className="h-4 w-4 text-signal-amber" /> Score: {correctCount}/{mcqs.length} correct
          </span>
          <Button variant="outline" size="sm" onClick={reset} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Retake
          </Button>
        </motion.div>
      ) : (
        <p className="mb-5 font-mono text-xs text-muted-foreground">{answeredCount}/{mcqs.length} answered</p>
      )}

      <div className="grid gap-4">
        {mcqs.map((q, qi) => {
          const chosen = answers[q.id];
          const answered = chosen !== undefined;
          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: qi * 0.05, duration: 0.3 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <p className="text-sm font-medium leading-snug">{qi + 1}. {q.question}</p>
              <div className="mt-3 grid gap-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correctIndex;
                  const isChosen = oi === chosen;
                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => choose(q.id, oi)}
                      disabled={answered}
                      className={cn(
                        "flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                        !answered && "border-border hover:border-primary/40 hover:bg-primary/5",
                        answered && isCorrect && "border-signal-green/40 bg-signal-green/10 text-signal-green",
                        answered && isChosen && !isCorrect && "border-signal-red/40 bg-signal-red/10 text-signal-red",
                        answered && !isCorrect && !isChosen && "border-border/60 text-muted-foreground",
                      )}
                    >
                      <span>{opt}</span>
                      {answered && isCorrect && <Check className="h-4 w-4 shrink-0" />}
                      {answered && isChosen && !isCorrect && <X className="h-4 w-4 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                  className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground"
                >
                  {q.explanation}
                </motion.p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
