"use client";

import * as React from "react";
import { FileText, Sparkles, UploadCloud, Loader2 } from "lucide-react";
import type { FlashcardTopic } from "@/types";
import { FLASHCARD_TOPICS } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { extractDocumentText } from "@/lib/actions/flashcard-import";

const ACCEPT = ".txt,.md,.pdf,text/plain,text/markdown,application/pdf";

export function UploadZone({ onGenerate, generating, actionLabel = "Generate flashcards" }: {
  onGenerate: (text: string, sourceLabel: string, targetTopic?: FlashcardTopic) => void;
  generating: boolean;
  actionLabel?: string;
}) {
  const [text, setText] = React.useState("");
  const [sourceLabel, setSourceLabel] = React.useState("");
  const [targetTopic, setTargetTopic] = React.useState<FlashcardTopic | "auto" | "custom">("auto");
  const [customTopic, setCustomTopic] = React.useState("");
  const [extracting, setExtracting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError(null);
    setExtracting(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const { text: extracted, fileName, charCount } = await extractDocumentText(fd);
      if (!extracted.trim()) {
        setError(`Couldn't extract any text from "${fileName}" — try pasting the content directly.`);
        return;
      }
      setText(extracted);
      setSourceLabel(fileName);
      void charCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that file — supported types are .txt, .md, and .pdf.");
    } finally {
      setExtracting(false);
    }
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  const charCount = text.trim().length;
  const selectedTopic = targetTopic === "custom" ? customTopic.trim() : targetTopic === "auto" ? undefined : targetTopic;
  const hasTopic = targetTopic !== "custom" || Boolean(selectedTopic);
  const canGenerate = charCount >= 40 && hasTopic && !generating && !extracting;

  return (
    <div className="grid gap-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragOver ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-muted/30",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
        />
        {extracting ? <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /> : <UploadCloud className="h-6 w-6 text-muted-foreground" />}
        <p className="text-sm font-medium">{extracting ? "Extracting text…" : "Drop a .txt, .md, or .pdf file, or click to browse"}</p>
        <p className="text-xs text-muted-foreground">Interview prep notes, transcripts, blog exports — anything text-based works.</p>
      </div>

      {error && <p className="text-xs text-signal-red">{error}</p>}

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="mono-label">or paste text</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <label className="block">
        <span className="mono-label mb-1.5 block">Source label</span>
        <Input
          value={sourceLabel}
          onChange={(e) => setSourceLabel(e.target.value)}
          placeholder="e.g. Playwright + API testing notes"
        />
      </label>

      <label className="block">
        <span className="mono-label mb-1.5 block">Save cards under topic</span>
        <Select value={targetTopic} onValueChange={(value) => setTargetTopic(value as FlashcardTopic | "auto")}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto detect from PDF</SelectItem>
            {FLASHCARD_TOPICS.map((topic) => <SelectItem key={topic} value={topic}>{topic}</SelectItem>)}
            <SelectItem value="custom">Add new topic</SelectItem>
          </SelectContent>
        </Select>
      </label>

      {targetTopic === "custom" && (
        <label className="block">
          <span className="mono-label mb-1.5 block">New topic name</span>
          <Input
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="e.g. Java, Selenium, Kubernetes, Mobile Testing"
          />
        </label>
      )}

      <label className="block">
        <span className="mono-label mb-1.5 flex items-center justify-between">
          <span>Material</span>
          <span className={cn("font-mono text-[0.7rem]", charCount < 40 ? "text-muted-foreground" : "text-signal-green")}>
            {charCount.toLocaleString()} chars
          </span>
        </span>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste raw notes, a transcript, blog content, or interview-prep material…"
          rows={12}
          className="font-mono text-xs leading-relaxed"
        />
      </label>

      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Paste at least a few sentences — more context produces better topic detection.
        </p>
        <Button
          onClick={() => onGenerate(text.trim(), sourceLabel.trim() || "Pasted material", selectedTopic)}
          disabled={!canGenerate}
        >
          {generating
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Sparkles className="h-4 w-4" /> {actionLabel}</>}
        </Button>
      </div>
    </div>
  );
}
