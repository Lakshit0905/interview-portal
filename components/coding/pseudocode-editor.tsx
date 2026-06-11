"use client";

import { Textarea } from "@/components/ui/textarea";

export function PseudocodeEditor({
  value,
  editable = false,
  onChange,
}: {
  value?: string;
  editable?: boolean;
  onChange?: (value: string) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-sm font-semibold">Pseudocode</p>
      {editable ? (
        <Textarea
          value={value ?? ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={"function solve(input):\n  prepare data structure\n  iterate / recurse\n  return result"}
          className="min-h-[180px] font-mono text-xs"
        />
      ) : (
        <pre className="scrollbar-thin min-h-[120px] overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90">
          {value || "No pseudocode saved yet."}
        </pre>
      )}
    </div>
  );
}
