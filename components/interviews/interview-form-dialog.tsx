"use client";

import * as React from "react";
import type { Interview, InterviewStatus } from "@/types";
import { INTERVIEW_STATUSES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type InterviewDraft = Partial<Interview>;

export const EMPTY_INTERVIEW_DRAFT: InterviewDraft = {
  company: "", position: "", location: "", salaryRange: "", interviewType: "", recruiter: "",
  interviewDate: "", round: "", roundsCompleted: 0, roundsTotal: 5, readinessScore: 50,
  status: "Applied", notes: "",
};

const INTERVIEW_TYPES = ["Phone Screen", "Virtual", "Onsite", "Technical", "Take-home"];

export function InterviewFormDialog({ open, onOpenChange, draft, onChange, onSave, pending }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: InterviewDraft;
  onChange: (next: InterviewDraft) => void;
  onSave: () => void;
  pending: boolean;
}) {
  function set<K extends keyof InterviewDraft>(key: K, value: InterviewDraft[K]) {
    onChange({ ...draft, [key]: value });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{draft.id ? "Edit interview" : "Add interview"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Company</span>
              <Input value={draft.company ?? ""} onChange={(e) => set("company", e.target.value)} placeholder="Stripe" /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Position</span>
              <Input value={draft.position ?? ""} onChange={(e) => set("position", e.target.value)} placeholder="Senior SDET" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Location</span>
              <Input value={draft.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="Remote · US" /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Salary range</span>
              <Input value={draft.salaryRange ?? ""} onChange={(e) => set("salaryRange", e.target.value)} placeholder="$160k – $190k" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Recruiter</span>
              <Input value={draft.recruiter ?? ""} onChange={(e) => set("recruiter", e.target.value)} placeholder="Jordan P." /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Current round</span>
              <Input value={draft.round ?? ""} onChange={(e) => set("round", e.target.value)} placeholder="Technical · System Design" /></label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Interview date</span>
              <Input type="date" value={draft.interviewDate ?? ""} onChange={(e) => set("interviewDate", e.target.value)} /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Interview type</span>
              <Select value={draft.interviewType || undefined} onValueChange={(v) => set("interviewType", v)}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>{INTERVIEW_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select></label>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Status</span>
              <Select value={draft.status} onValueChange={(v) => set("status", v as InterviewStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{INTERVIEW_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select></label>
            <label className="block"><span className="mono-label mb-1.5 block">Rounds completed</span>
              <Input type="number" min={0} value={draft.roundsCompleted ?? 0}
                onChange={(e) => set("roundsCompleted", Number(e.target.value))} /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Rounds total</span>
              <Input type="number" min={0} value={draft.roundsTotal ?? 0}
                onChange={(e) => set("roundsTotal", Number(e.target.value))} /></label>
          </div>
          <label className="block">
            <span className="mono-label mb-1.5 flex items-center justify-between">
              <span>Readiness score</span>
              <span className="font-mono text-xs text-foreground">{draft.readinessScore ?? 0}%</span>
            </span>
            <input type="range" min={0} max={100} value={draft.readinessScore ?? 0}
              onChange={(e) => set("readinessScore", Number(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary" />
          </label>
          <label className="block"><span className="mono-label mb-1.5 block">Notes</span>
            <Textarea value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value)}
              placeholder="Prep focus, interviewer names, follow-ups… (separate entries with a blank line)" rows={4} /></label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add interview"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
