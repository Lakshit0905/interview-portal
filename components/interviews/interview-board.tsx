"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, CalendarClock, User, ArrowRight } from "lucide-react";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { createInterview, updateInterview, setInterviewStatus, deleteInterview } from "@/lib/actions/interviews";
import { cn, formatDate, daysUntil } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Draft = Partial<Interview>;
const EMPTY: Draft = { company: "", position: "", recruiter: "", interviewDate: "", round: "", status: "Applied", notes: "" };

export function InterviewBoard({ initial }: { initial: Interview[] }) {
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(initial), [initial]);

  function openCreate() { setDraft(EMPTY); setOpen(true); }
  function openEdit(i: Interview) { setDraft(i); setOpen(true); }

  function save() {
    const payload = {
      company: draft.company?.trim() || "Unknown",
      position: draft.position?.trim() || "SDET",
      recruiter: draft.recruiter || undefined,
      interviewDate: draft.interviewDate || null,
      round: draft.round ?? "",
      status: draft.status as InterviewStatus,
      notes: draft.notes ?? "",
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateInterview(draft.id, payload);
        if (updated) setItems((c) => c.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createInterview(payload);
        setItems((c) => [created, ...c]);
      }
      setOpen(false);
      router.refresh();
    });
  }

  function move(i: Interview, status: InterviewStatus) {
    setItems((c) => c.map((x) => (x.id === i.id ? { ...x, status } : x)));
    startTransition(() => { void setInterviewStatus(i.id, status); });
  }

  function remove(id: string) {
    setItems((c) => c.filter((x) => x.id !== id));
    startTransition(() => { void deleteInterview(id); });
  }

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add interview</Button>
      </div>

      {items.length === 0 ? (
        <EmptyState icon="CalendarClock" title="No interviews tracked" description="Log your pipeline from application through offer." />
      ) : (
        <div className="scrollbar-thin grid grid-flow-col grid-rows-1 gap-4 overflow-x-auto pb-3 lg:grid lg:grid-flow-row lg:grid-cols-3 xl:grid-cols-6 lg:overflow-visible">
          {INTERVIEW_STATUSES.map((status) => {
            const col = items.filter((i) => i.status === status);
            const a = ACCENT_CLASS[STATUS_ACCENT[status]];
            return (
              <div key={status} className="min-w-[240px] lg:min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", a.dot)} />
                  <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{status}</h2>
                  <span className="ml-auto font-mono text-xs text-muted-foreground/60">{col.length}</span>
                </div>
                <div className="space-y-2">
                  {col.map((i) => {
                    const d = daysUntil(i.interviewDate);
                    return (
                      <motion.div key={i.id} layout
                        className="group rounded-xl border border-border bg-card p-3.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-medium">{i.company}</p>
                            <p className="truncate text-xs text-muted-foreground">{i.position}</p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0"><ArrowRight className="h-3.5 w-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {INTERVIEW_STATUSES.filter((s) => s !== status).map((s) => (
                                <DropdownMenuItem key={s} onClick={() => move(i, s)}>Move to {s}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        {i.round && <p className="mt-2 font-mono text-[0.65rem] text-muted-foreground">{i.round}</p>}
                        <div className="mt-2 space-y-1 font-mono text-[0.65rem] text-muted-foreground">
                          {i.interviewDate && (
                            <p className="flex items-center gap-1.5">
                              <CalendarClock className="h-3 w-3" /> {formatDate(i.interviewDate)}
                              {d !== null && d >= 0 && <span className={cn(d <= 3 ? "text-signal-amber" : "text-muted-foreground")}>· in {d}d</span>}
                            </p>
                          )}
                          {i.recruiter && <p className="flex items-center gap-1.5"><User className="h-3 w-3" /> {i.recruiter}</p>}
                        </div>
                        {i.notes && <p className="mt-2 line-clamp-2 text-xs text-foreground/80">{i.notes}</p>}
                        <div className="mt-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openEdit(i)}><Pencil className="h-3 w-3" /> Edit</Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-signal-red hover:text-signal-red" onClick={() => remove(i.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit interview" : "Add interview"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Company</span>
                <Input value={draft.company ?? ""} onChange={(e) => setDraft((d) => ({ ...d, company: e.target.value }))} placeholder="Stripe" /></label>
              <label className="block"><span className="mono-label mb-1.5 block">Position</span>
                <Input value={draft.position ?? ""} onChange={(e) => setDraft((d) => ({ ...d, position: e.target.value }))} placeholder="Senior SDET" /></label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Recruiter</span>
                <Input value={draft.recruiter ?? ""} onChange={(e) => setDraft((d) => ({ ...d, recruiter: e.target.value }))} placeholder="Jordan P." /></label>
              <label className="block"><span className="mono-label mb-1.5 block">Round</span>
                <Input value={draft.round ?? ""} onChange={(e) => setDraft((d) => ({ ...d, round: e.target.value }))} placeholder="Technical · System Design" /></label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Interview date</span>
                <Input type="date" value={draft.interviewDate ?? ""} onChange={(e) => setDraft((d) => ({ ...d, interviewDate: e.target.value }))} /></label>
              <label className="block"><span className="mono-label mb-1.5 block">Status</span>
                <select value={draft.status} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value as InterviewStatus }))}
                  className="flex h-9 w-full rounded-md border border-input bg-background/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {INTERVIEW_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select></label>
            </div>
            <label className="block"><span className="mono-label mb-1.5 block">Notes</span>
              <Textarea value={draft.notes ?? ""} onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))} placeholder="Prep focus, interviewer names, follow-ups…" /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add interview"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
