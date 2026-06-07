"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, ExternalLink, Building2 } from "lucide-react";
import type { Resume } from "@/types";
import { createResume, updateResume, deleteResume } from "@/lib/actions/resumes";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

type Draft = Partial<Resume>;
const EMPTY: Draft = { label: "", version: "v1", targetCompany: "", fileUrl: "", notes: "", content: "" };

export function ResumeBoard({ initial }: { initial: Resume[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(initial), [initial]);

  function openCreate() { setDraft(EMPTY); setOpen(true); }
  function openEdit(r: Resume) { setDraft(r); setOpen(true); }

  function save() {
    const payload = {
      label: draft.label?.trim() || "Untitled resume",
      version: draft.version?.trim() || "v1",
      targetCompany: draft.targetCompany || undefined,
      fileUrl: draft.fileUrl || undefined,
      notes: draft.notes ?? "",
      content: draft.content || undefined,
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateResume(draft.id, payload);
        if (updated) setItems((c) => c.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createResume(payload);
        setItems((c) => [created, ...c]);
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    setItems((c) => c.filter((x) => x.id !== id));
    startTransition(() => { void deleteResume(id); });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add resume</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="FileText" title="No resumes yet" description="Track multiple tailored versions and the companies you target with each." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <div key={r.id} className="card-glow group flex flex-col rounded-xl border border-border bg-card p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="muted">{r.version}</Badge>
              </div>
              <h3 className="mt-3 font-semibold">{r.label}</h3>
              {r.targetCompany && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" /> targeting {r.targetCompany}
                </p>
              )}
              {r.notes && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.notes}</p>}
              <div className="mt-auto pt-4">
                <p className="font-mono text-[0.65rem] text-muted-foreground/60">updated {formatDate(r.updatedAt)}</p>
                <div className="mt-2 flex items-center gap-1.5">
                  {r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm"><ExternalLink className="h-3.5 w-3.5" /> Open</Button>
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 text-signal-red hover:text-signal-red" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit resume" : "Add resume"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Label</span>
                <Input value={draft.label ?? ""} onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))} placeholder="SDET — Platform focus" /></label>
              <label className="block"><span className="mono-label mb-1.5 block">Version</span>
                <Input value={draft.version ?? ""} onChange={(e) => setDraft((d) => ({ ...d, version: e.target.value }))} placeholder="v3.2" /></label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Target company</span>
                <Input value={draft.targetCompany ?? ""} onChange={(e) => setDraft((d) => ({ ...d, targetCompany: e.target.value }))} placeholder="Datadog" /></label>
              <label className="block"><span className="mono-label mb-1.5 block">File URL / link</span>
                <Input value={draft.fileUrl ?? ""} onChange={(e) => setDraft((d) => ({ ...d, fileUrl: e.target.value }))} placeholder="https://… or /resumes/sdet.pdf" /></label>
            </div>
            <label className="block"><span className="mono-label mb-1.5 block">Notes</span>
              <Textarea value={draft.notes ?? ""} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="What's tailored in this version…" /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Plain-text content (used by the Resume Analyzer)</span>
              <Textarea value={draft.content ?? ""} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} className="min-h-[120px] font-mono text-xs" placeholder="Paste the resume text so the AI analyzer can score it against a JD." /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add resume"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
