"use client";

import * as React from "react";
import { FileText, Sparkles, UploadCloud, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { extractDocumentText } from "@/lib/actions/flashcard-import";

const ACCEPT = ".txt,.md,.pdf,text/plain,text/markdown,application/pdf";

export function UploadZone({ onGenerate, generating }: {
  onGenerate: (text: string, sourceLabel: string) => void;
  generating: boolean;
}) {
  const [text, setText] = React.useState("");
  const [sourceLabel, setSourceLabel] = React.useState("");
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
    } catch {
      setError("Couldn't read that file — supported types are .txt, .md, and .pdf.");
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
  const canGenerate = charCount >= 40 && !generating && !extracting;

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
        <Button onClick={() => onGenerate(text.trim(), sourceLabel.trim() || "Pasted material")} disabled={!canGenerate}>
          {generating
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Sparkles className="h-4 w-4" /> Generate flashcards</>}
        </Button>
      </div>
    </div>
  );
}
