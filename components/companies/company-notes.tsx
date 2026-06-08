"use client";

import * as React from "react";
import type { CompanyPrep } from "@/types";
import { updateCompanyNotes } from "@/lib/actions/company-prep";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function NoteField({ companyId, field, label, hint, initial }: {
  companyId: string;
  field: "notes" | "experiences";
  label: string;
  hint: string;
  initial: string;
}) {
  const [value, setValue] = React.useState(initial);
  const [pending, startTransition] = React.useTransition();
  const [savedAt, setSavedAt] = React.useState<number | null>(null);
  const dirty = value !== initial;

  function save() {
    startTransition(async () => {
      await updateCompanyNotes(companyId, field, value);
      setSavedAt(Date.now());
    });
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">{label}</h3>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={save} disabled={!dirty || pending}>
          {pending ? "Saving…" : dirty ? "Save" : savedAt ? "Saved" : "Save"}
        </Button>
      </div>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        className="mt-3 resize-y"
        placeholder={`Write your ${label.toLowerCase()} here…`}
      />
    </div>
  );
}

export function CompanyNotes({ company }: { company: CompanyPrep }) {
  return (
    <div className="space-y-4">
      <NoteField
        companyId={company.id} field="notes" label="Notes"
        hint="Prep reminders, things to review, what to emphasize."
        initial={company.notes}
      />
      <NoteField
        companyId={company.id} field="experiences" label="Experiences"
        hint="What actually happened in your interviews — keep this updated round by round."
        initial={company.experiences}
      />
    </div>
  );
}
