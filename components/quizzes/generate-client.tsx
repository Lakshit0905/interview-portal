"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { QuizGenerationResult, GeneratedQuizQuestion } from "@/types";
import { generateQuizFromSource, saveGeneratedQuiz } from "@/lib/actions/quiz-import";
import { PageHeader } from "@/components/shared/page-header";
import { AiStatus } from "@/components/coding/ai-status";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadZone } from "@/components/flashcards/upload-zone";

import { GeneratedQuizReview } from "./generated-quiz-review";

type Stage = "input" | "review" | "done";

export function GenerateQuizClient() {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>("input");
  const [result, setResult] = React.useState<QuizGenerationResult | null>(null);
  const [sourceLabel, setSourceLabel] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedQuizId, setSavedQuizId] = React.useState<string | null>(null);

  async function handleGenerate(text: string, label: string) {
    setError(null);
    setGenerating(true);
    try {
      const generated = await generateQuizFromSource({ text, sourceLabel: label });
      if (!generated.questions.length) {
        setError("Couldn't detect any quiz-worthy material in that text — try pasting more context.");
        return;
      }
      setResult(generated);
      setSourceLabel(label);
      setTitle(`${label} Quiz`);
      setStage("review");
    } catch {
      setError("Generation failed — please try again with a shorter excerpt.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(questions: GeneratedQuizQuestion[]) {
    setSaving(true);
    try {
      const quiz = await saveGeneratedQuiz({ title: title.trim() || `${sourceLabel} Quiz`, sourceLabel, questions });
      setSavedQuizId(quiz.id);
      setStage("done");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setResult(null);
    setSourceLabel("");
    setTitle("");
    setSavedQuizId(null);
    setError(null);
    setStage("input");
  }

  return (
    <div>
      <Link href="/quizzes" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> quizzes
      </Link>

      <PageHeader
        title="AI Quiz Generator"
        description="Turn raw notes, transcripts, or PDFs into a multiple-choice, true/false, and scenario-based quiz — grouped by topic, with an explanation for every answer."
      />

      <div className="mb-6"><AiStatus enabled={result?.enabled ?? false} /></div>

      {stage === "input" && (
        <div className="mx-auto max-w-2xl">
          <UploadZone onGenerate={handleGenerate} generating={generating} actionLabel="Generate quiz" />
          {error && <p className="mt-3 text-center text-sm text-signal-red">{error}</p>}
        </div>
      )}

      {stage === "review" && result && (
        <div>
          <div className="mx-auto mb-6 max-w-md">
            <label className="block">
              <span className="mono-label mb-1.5 block">Quiz title</span>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Playwright + API Testing Quiz" />
            </label>
          </div>
          <GeneratedQuizReview result={result} sourceLabel={sourceLabel} onSave={handleSave} onReset={reset} saving={saving} />
        </div>
      )}

      {stage === "done" && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-green/10 text-signal-green">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">Quiz saved</p>
            <p className="mt-1 text-sm text-muted-foreground">Head to your quiz to start a practice session.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset}>Generate another quiz</Button>
            {savedQuizId
              ? <Button onClick={() => router.push(`/quizzes/${savedQuizId}`)}>Take quiz</Button>
              : <Button onClick={() => router.push("/quizzes")}>Go to quizzes</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
