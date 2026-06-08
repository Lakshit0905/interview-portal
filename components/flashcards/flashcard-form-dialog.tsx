"use client";

import * as React from "react";
import type { Difficulty, Flashcard, FlashcardTopic } from "@/types";
import { FLASHCARD_TOPICS } from "@/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type FlashcardDraft = Partial<Flashcard>;

export const EMPTY_FLASHCARD_DRAFT: FlashcardDraft = {
  front: "", back: "", topic: "Playwright", difficulty: "Medium", source: "manual",
};

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function FlashcardFormDialog({ open, onOpenChange, draft, onChange, onSave, pending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: FlashcardDraft;
  onChange: (next: FlashcardDraft) => void;
  onSave: () => void;
  pending: boolean;
}) {
  function set<K extends keyof FlashcardDraft>(key: K, value: FlashcardDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>{draft.id ? "Edit flashcard" : "New flashcard"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <label className="block"><span className="mono-label mb-1.5 block">Front (question / prompt)</span>
            <Textarea value={draft.front ?? ""} onChange={(e) => set("front", e.target.value)}
              placeholder="What is Playwright's auto-waiting?" rows={2} /></label>
          <label className="block"><span className="mono-label mb-1.5 block">Back (answer)</span>
            <Textarea value={draft.back ?? ""} onChange={(e) => set("back", e.target.value)}
              placeholder="Concise, interview-ready answer…" rows={4} /></label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Topic</span>
              <Select value={draft.topic} onValueChange={(v) => set("topic", v as FlashcardTopic)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FLASHCARD_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select></label>
            <label className="block"><span className="mono-label mb-1.5 block">Difficulty</span>
              <Select value={draft.difficulty} onValueChange={(v) => set("difficulty", v as Difficulty)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select></label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={pending || !draft.front?.trim() || !draft.back?.trim()}>
            {pending ? "Saving…" : draft.id ? "Save changes" : "Add flashcard"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
