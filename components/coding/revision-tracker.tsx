"use client";

import * as React from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import type { CodingProblem } from "@/types";
import { markCodingProblemRevised } from "@/lib/actions/coding";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function RevisionTracker({
  problem,
  onRevised,
}: {
  problem: CodingProblem;
  onRevised: (problem: CodingProblem) => void;
}) {
  const [note, setNote] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  function markRevised() {
    startTransition(async () => {
      const updated = await markCodingProblemRevised(problem.id, note);
      if (updated) onRevised(updated);
      setNote("");
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">Revision</p>
        <Badge variant="outline">{problem.confidence ?? "Medium"} confidence</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Last revised" value={problem.lastRevisedAt ? formatDate(problem.lastRevisedAt) : "Never"} />
        <Stat label="Next revision" value={problem.nextRevisionAt ? formatDate(problem.nextRevisionAt) : "Not scheduled"} />
        <Stat label="Revision count" value={String(problem.revisionCount ?? 0)} />
      </div>
      <label className="mt-4 block">
        <span className="mono-label mb-1.5 block">Notes after revision</span>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What became clearer? What still feels weak?" />
      </label>
      <div className="mt-3 flex justify-end">
        <Button onClick={markRevised} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
          Mark as revised
        </Button>
      </div>
      {(problem.revisionNotes ?? []).length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="mono-label">Revision notes</p>
          {(problem.revisionNotes ?? []).slice(0, 5).map((item, index) => (
            <p key={`${item}-${index}`} className="rounded-md bg-muted px-3 py-2 text-sm text-foreground/90">{item}</p>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="mono-label">{label}</p>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}
