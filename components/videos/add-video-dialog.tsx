"use client";

import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AiStatus } from "@/components/coding/ai-status";
import { createVideoLesson } from "@/lib/actions/video-lessons";
import type { VideoLesson } from "@/types";

const TOPIC_PRESETS = ["Playwright", "TypeScript", "API Testing", "SQL", "System Design", "GenAI Testing", "CI/CD"];

const EMPTY_DRAFT = { url: "", title: "", channel: "", topic: "", durationMinutes: "20", transcript: "" };

export function AddVideoDialog({ open, onOpenChange, onCreated }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (lesson: VideoLesson) => void;
}) {
  const [draft, setDraft] = React.useState(EMPTY_DRAFT);
  const [pending, startTransition] = React.useTransition();
  const [error, setError] = React.useState<string | null>(null);
  const [aiEnabled, setAiEnabled] = React.useState<boolean | null>(null);

  function set<K extends keyof typeof EMPTY_DRAFT>(key: K, value: (typeof EMPTY_DRAFT)[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function reset() {
    setDraft(EMPTY_DRAFT);
    setError(null);
    setAiEnabled(null);
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const { lesson, aiEnabled: enabled } = await createVideoLesson(draft);
        if (!lesson) throw new Error("Generation failed — try again.");
        setAiEnabled(enabled);
        onCreated(lesson);
        onOpenChange(false);
        reset();
      } catch (err) {
        if (err instanceof Error) {
          try {
            const issues = JSON.parse(err.message) as { path: string[]; message: string }[];
            if (Array.isArray(issues) && issues.length > 0) {
              setError(issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(" · "));
            } else {
              setError(err.message);
            }
          } catch {
            setError(err.message);
          }
        } else {
          setError("Could not generate study material from this transcript.");
        }
      }
    });
  }

  const valid = draft.url.trim() && draft.title.trim() && draft.channel.trim() && draft.topic.trim() && draft.transcript.trim().length >= 40;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!pending) { onOpenChange(o); if (!o) reset(); } }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>Add a video lesson</DialogTitle></DialogHeader>
        <p className="-mt-2 text-xs text-muted-foreground">
          Paste a YouTube URL and its transcript — the AI pipeline turns it into notes, concepts, Q&amp;A, flashcards,
          revision notes, a cheat sheet, and an MCQ quiz, all saved to this lesson.
        </p>

        <div className="grid gap-4">
          <label className="block">
            <span className="mono-label mb-1.5 block">YouTube URL</span>
            <Input value={draft.url} onChange={(e) => set("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Title</span>
              <Input value={draft.title} onChange={(e) => set("title", e.target.value)} placeholder="Mastering Playwright Fixtures" /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Channel</span>
              <Input value={draft.channel} onChange={(e) => set("channel", e.target.value)} placeholder="Test Automation University" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="mono-label mb-1.5 block">Topic</span>
              <Input value={draft.topic} onChange={(e) => set("topic", e.target.value)} placeholder="Playwright" list="video-topic-presets" />
              <datalist id="video-topic-presets">{TOPIC_PRESETS.map((t) => <option key={t} value={t} />)}</datalist>
            </label>
            <label className="block"><span className="mono-label mb-1.5 block">Duration (minutes)</span>
              <Input type="number" min={1} max={2880} value={draft.durationMinutes}
                onChange={(e) => set("durationMinutes", e.target.value)} /></label>
          </div>
          <label className="block">
            <span className="mono-label mb-1.5 flex items-center justify-between">
              <span>Transcript</span>
              <span className="text-muted-foreground/70">{draft.transcript.trim().length} chars</span>
            </span>
            <Textarea
              value={draft.transcript}
              onChange={(e) => set("transcript", e.target.value)}
              rows={8}
              placeholder="Paste the video transcript here — YouTube provides one via “Show transcript” under any video's description."
            />
          </label>

          {error && <p className="text-xs text-signal-red">{error}</p>}
          {aiEnabled !== null && <AiStatus enabled={aiEnabled} />}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={pending}>Cancel</Button>
          <Button onClick={submit} disabled={pending || !valid} className="gap-1.5">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {pending ? "Generating study material…" : "Generate lesson"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
