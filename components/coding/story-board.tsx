"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { BehavioralStory } from "@/types";
import { createStory, updateStory, deleteStory } from "@/lib/actions/behavioral";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const THEMES = [
  "Flaky Test Reduction", "CI/CD Optimization", "Production Defect",
  "Framework Design", "Conflict Resolution", "Leadership Story",
];

const STAR_FIELDS: { key: keyof BehavioralStory; label: string; accent: string }[] = [
  { key: "situation", label: "Situation", accent: "blue" },
  { key: "task", label: "Task", accent: "violet" },
  { key: "action", label: "Action", accent: "amber" },
  { key: "result", label: "Result", accent: "green" },
];

const ACCENT_BAR: Record<string, string> = {
  blue: "bg-signal-blue", violet: "bg-signal-violet", amber: "bg-signal-amber", green: "bg-signal-green",
};

type Draft = Partial<BehavioralStory>;
const EMPTY: Draft = { title: "", theme: THEMES[0], situation: "", task: "", action: "", result: "", tags: [] };

export function StoryBoard({ initial }: { initial: BehavioralStory[] }) {
  const router = useRouter();
  const focusId = useSearchParams().get("focus");

  const [items, setItems] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [tagInput, setTagInput] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(initial), [initial]);
  React.useEffect(() => {
    if (focusId) document.getElementById(`story-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId]);

  function openCreate() { setDraft(EMPTY); setTagInput(""); setOpen(true); }
  function openEdit(s: BehavioralStory) { setDraft(s); setTagInput(s.tags.join(", ")); setOpen(true); }

  function save() {
    const payload = {
      title: draft.title?.trim() || "Untitled story",
      theme: draft.theme || THEMES[0],
      situation: draft.situation ?? "", task: draft.task ?? "",
      action: draft.action ?? "", result: draft.result ?? "",
      tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateStory(draft.id, payload);
        if (updated) setItems((c) => c.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createStory(payload);
        setItems((c) => [created, ...c]);
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    setItems((c) => c.filter((x) => x.id !== id));
    startTransition(() => { void deleteStory(id); });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add story</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="MessagesSquare" title="No stories yet" description="Capture your best STAR-format stories so they're ready when behavioral rounds come." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((s) => (
            <div key={s.id} id={`story-${s.id}`} className={cn("card-glow rounded-xl border bg-card p-5", focusId === s.id ? "border-primary/40" : "border-border")}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Badge variant="muted">{s.theme}</Badge>
                  <h3 className="mt-2 font-semibold">{s.title}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(s)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-signal-red hover:text-signal-red" onClick={() => remove(s.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
              <div className="mt-4 space-y-3">
                {STAR_FIELDS.map((f) => (
                  <div key={f.key} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={cn("flex h-6 w-6 items-center justify-center rounded-md font-mono text-[0.65rem] font-bold text-background", ACCENT_BAR[f.accent])}>{f.label[0]}</span>
                      <span className={cn("mt-1 w-px flex-1", ACCENT_BAR[f.accent], "opacity-20")} />
                    </div>
                    <div className="flex-1 pb-1">
                      <p className="mono-label">{f.label}</p>
                      <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground/90">{(s[f.key] as string) || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
              {s.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{s.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}</div>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit story" : "Add STAR story"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Title</span>
                <Input value={draft.title ?? ""} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Cut E2E flakiness 60%" /></label>
              <label className="block"><span className="mono-label mb-1.5 block">Theme</span>
                <select value={draft.theme} onChange={(e) => setDraft((d) => ({ ...d, theme: e.target.value }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {THEMES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select></label>
            </div>
            {STAR_FIELDS.map((f) => (
              <label key={f.key} className="block"><span className="mono-label mb-1.5 block">{f.label}</span>
                <Textarea value={(draft[f.key] as string) ?? ""} onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))} /></label>
            ))}
            <label className="block"><span className="mono-label mb-1.5 block">Tags (comma separated)</span>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="ownership, metrics, mentoring" /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add story"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
