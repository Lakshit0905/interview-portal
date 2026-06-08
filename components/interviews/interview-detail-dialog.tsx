"use client";

import * as React from "react";
import { MapPin, Wallet, CalendarClock, User, Briefcase, Gauge, ListChecks } from "lucide-react";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { STATUS_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { cn, formatDate, splitNotes } from "@/lib/utils";
import { CompanyAvatar } from "./company-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function InterviewDetailDialog({ open, onOpenChange, interview, onStatusChange, onAddNote, pending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  interview: Interview | null;
  onStatusChange: (status: InterviewStatus) => void;
  onAddNote: (note: string) => void;
  pending: boolean;
}) {
  const [draftNote, setDraftNote] = React.useState("");

  React.useEffect(() => { if (open) setDraftNote(""); }, [open, interview?.id]);

  if (!interview) return null;
  const accent = ACCENT_CLASS[STATUS_ACCENT[interview.status] ?? "slate"];
  const notes = splitNotes(interview.notes);

  function submitNote() {
    const trimmed = draftNote.trim();
    if (!trimmed) return;
    onAddNote(trimmed);
    setDraftNote("");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3 pr-6">
            <CompanyAvatar name={interview.company} size="lg" />
            <div className="min-w-0">
              <DialogTitle className="truncate">{interview.company}</DialogTitle>
              <p className="truncate text-sm text-muted-foreground">{interview.position}</p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 font-mono text-[0.65rem]", accent.bg, accent.text)}>
              <span className={cn("h-1.5 w-1.5 rounded-full", accent.dot)} /> {interview.status}
            </span>
            {interview.round && <Badge variant="muted">{interview.round}</Badge>}
            {interview.interviewType && <Badge variant="muted">{interview.interviewType}</Badge>}
          </div>

          <div className="grid grid-cols-1 gap-2 font-mono text-xs text-muted-foreground sm:grid-cols-2">
            {interview.location && <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {interview.location}</p>}
            {interview.salaryRange && <p className="flex items-center gap-1.5"><Wallet className="h-3.5 w-3.5" /> {interview.salaryRange}</p>}
            {interview.recruiter && <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {interview.recruiter}</p>}
            {interview.interviewDate && <p className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5" /> {formatDate(interview.interviewDate)}</p>}
            {!!interview.roundsTotal && <p className="flex items-center gap-1.5"><ListChecks className="h-3.5 w-3.5" /> {interview.roundsCompleted ?? 0} of {interview.roundsTotal} rounds done</p>}
            {interview.readinessScore !== undefined && <p className="flex items-center gap-1.5"><Gauge className="h-3.5 w-3.5" /> {interview.readinessScore}% ready</p>}
          </div>

          <Separator />

          <div>
            <span className="mono-label mb-1.5 block">Update status</span>
            <Select value={interview.status} onValueChange={(v) => onStatusChange(v as InterviewStatus)}>
              <SelectTrigger className="max-w-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{INTERVIEW_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <Separator />

          <div>
            <span className="mono-label mb-2 flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" /> Notes ({notes.length})</span>
            {notes.length > 0 ? (
              <div className="scrollbar-thin max-h-48 space-y-2 overflow-y-auto pr-1">
                {notes.map((n, i) => (
                  <p key={i} className="rounded-lg border border-border bg-background/40 p-2.5 text-sm leading-relaxed text-foreground/85">{n}</p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No notes yet.</p>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Textarea value={draftNote} onChange={(e) => setDraftNote(e.target.value)} placeholder="Add a note…" rows={2} className="flex-1" />
              <Button size="sm" onClick={submitNote} disabled={pending || !draftNote.trim()} className="sm:self-end">Add note</Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
