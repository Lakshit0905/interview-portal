"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import type { FlashcardGenerationResult, GeneratedFlashcard } from "@/types";
import { generateFlashcardsFromSource, importGeneratedFlashcards } from "@/lib/actions/flashcard-import";
import { PageHeader } from "@/components/shared/page-header";
import { AiStatus } from "@/components/coding/ai-status";
import { Button } from "@/components/ui/button";

import { UploadZone } from "./upload-zone";
import { GeneratedDeckReview } from "./generated-deck-review";

type Stage = "input" | "review" | "done";

export function GenerateFlashcardsClient() {
  const router = useRouter();
  const [stage, setStage] = React.useState<Stage>("input");
  const [result, setResult] = React.useState<FlashcardGenerationResult | null>(null);
  const [sourceLabel, setSourceLabel] = React.useState("");
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedCount, setSavedCount] = React.useState(0);

  async function handleGenerate(text: string, label: string) {
    setError(null);
    setGenerating(true);
    try {
      const generated = await generateFlashcardsFromSource({ text, sourceLabel: label });
      if (!generated.cards.length) {
        setError("Couldn't detect any flashcard-worthy material in that text — try pasting more context.");
        return;
      }
      setResult(generated);
      setSourceLabel(label);
      setStage("review");
    } catch {
      setError("Generation failed — please try again with a shorter excerpt.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave(cards: GeneratedFlashcard[]) {
    setSaving(true);
    try {
      const { created } = await importGeneratedFlashcards({ sourceLabel, cards });
      setSavedCount(created.length);
      setStage("done");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setResult(null);
    setSourceLabel("");
    setSavedCount(0);
    setError(null);
    setStage("input");
  }

  return (
    <div>
      <Link href="/flashcards" className="mono-label mb-4 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> flashcards
      </Link>

      <PageHeader
        title="AI Flashcard Generator"
        description="Turn raw notes, transcripts, or PDFs into a structured, atomic flashcard deck — grouped by topic and subtopic, with difficulty, tags, and a revision plan."
      />

      <div className="mb-6"><AiStatus enabled={result?.enabled ?? false} /></div>

      {stage === "input" && (
        <div className="mx-auto max-w-2xl">
          <UploadZone onGenerate={handleGenerate} generating={generating} />
          {error && <p className="mt-3 text-center text-sm text-signal-red">{error}</p>}
        </div>
      )}

      {stage === "review" && result && (
        <GeneratedDeckReview result={result} sourceLabel={sourceLabel} onSave={handleSave} onReset={reset} saving={saving} />
      )}

      {stage === "done" && (
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-signal-green/10 text-signal-green">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">
              {savedCount > 0 ? `${savedCount} card${savedCount === 1 ? "" : "s"} added to your deck` : "No new cards added"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {savedCount > 0
                ? "They're scheduled for review starting today — head to the deck to start studying."
                : "Every accepted card matched one already in your deck, so nothing new was saved."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={reset}>Generate another deck</Button>
            <Button onClick={() => router.push("/flashcards")}>Go to flashcards</Button>
          </div>
        </div>
      )}
    </div>
  );
}
