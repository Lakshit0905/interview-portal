"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, Trash2, Play, Trophy } from "lucide-react";
import type { Quiz, QuizAttempt } from "@/types";
import { deleteQuiz } from "@/lib/actions/quizzes";
import { buildQuizStats } from "@/lib/quiz-stats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

import { QuizStatsRow } from "./quiz-stats";

export function QuizzesClient({ quizzes, attempts }: { quizzes: Quiz[]; attempts: QuizAttempt[] }) {
  const [items, setItems] = React.useState(quizzes);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(quizzes), [quizzes]);

  const stats = React.useMemo(() => buildQuizStats(items, attempts), [items, attempts]);

  function handleDelete(id: string) {
    setItems((qs) => qs.filter((q) => q.id !== id));
    startTransition(async () => { await deleteQuiz(id); });
  }

  return (
    <div>
      <PageHeader
        title="AI Quizzes"
        description="Multiple-choice, true/false, and scenario quizzes generated from your notes — score yourself and track your weakest topics over time."
      >
        <Button asChild><Link href="/quizzes/generate"><Sparkles className="h-4 w-4" /> Generate from notes</Link></Button>
      </PageHeader>

      <div className="mb-6"><QuizStatsRow stats={stats} /></div>

      {items.length === 0 ? (
        <EmptyState icon="CheckSquare" title="No quizzes yet"
          description="Generate a quiz from your notes or PDFs — Claude (or the offline heuristic) will build multiple-choice, true/false, and scenario questions with explanations." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((quiz) => {
            const best = stats.bestScoreByQuiz[quiz.id];
            return (
              <div key={quiz.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{quiz.title}</p>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    disabled={pending}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-signal-red"
                    title="Delete quiz"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {quiz.topics.map((t) => <Badge key={t} variant="muted">{t}</Badge>)}
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-2.5 font-mono text-[0.7rem] text-muted-foreground">
                  <span>{quiz.questions.length} question{quiz.questions.length === 1 ? "" : "s"}</span>
                  {best !== undefined && (
                    <span className="inline-flex items-center gap-1 text-signal-amber">
                      <Trophy className="h-3 w-3" /> Best {best}%
                    </span>
                  )}
                </div>

                <Button asChild size="sm"><Link href={`/quizzes/${quiz.id}`}><Play className="h-3.5 w-3.5" /> Start</Link></Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
