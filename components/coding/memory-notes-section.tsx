"use client";

import type { CodingProblem } from "@/types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type MemoryNotes = NonNullable<CodingProblem["memoryNotes"]>;

const FIELDS: { key: keyof MemoryNotes; label: string; multiline?: boolean; placeholder: string }[] = [
  { key: "patternName", label: "Pattern name", placeholder: "HashMap lookup" },
  { key: "whenToUse", label: "When to use", multiline: true, placeholder: "Use when you need fast complement / lookup checks." },
  { key: "keyIdea", label: "Key idea in one line", placeholder: "Store what you have seen so future checks are O(1)." },
  { key: "visualHook", label: "Visual memory hook", placeholder: "Current number asks the map: have you seen my missing pair?" },
  { key: "commonMistake", label: "Common mistake", multiline: true, placeholder: "Adding after the lookup avoids using the same element twice." },
  { key: "similarProblems", label: "Similar problems", multiline: true, placeholder: "Two Sum, Contains Duplicate, Subarray Sum Equals K" },
  { key: "revisionShortcut", label: "Revision shortcut", placeholder: "Complement first, then store current." },
];

export function MemoryNotesSection({
  notes,
  editable = false,
  onChange,
}: {
  notes?: MemoryNotes;
  editable?: boolean;
  onChange?: (notes: MemoryNotes) => void;
}) {
  const current = notes ?? {};

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">Memory Notes</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <label key={field.key} className={field.multiline ? "block sm:col-span-2" : "block"}>
            <span className="mono-label mb-1.5 block">{field.label}</span>
            {editable ? (
              field.multiline ? (
                <Textarea
                  value={current[field.key] ?? ""}
                  onChange={(e) => onChange?.({ ...current, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  rows={2}
                />
              ) : (
                <Input
                  value={current[field.key] ?? ""}
                  onChange={(e) => onChange?.({ ...current, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                />
              )
            ) : (
              <p className="min-h-9 whitespace-pre-wrap rounded-md border border-border bg-background/60 px-3 py-2 text-sm text-foreground/90">
                {current[field.key] || "Not saved yet"}
              </p>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}
