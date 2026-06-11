"use client";

import * as React from "react";
import { ArrowDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DEFAULT_FLOW_STEPS = [
  "Start",
  "Read input",
  "Identify pattern",
  "Choose data structure",
  "Loop / recursion",
  "Apply condition",
  "Update result",
  "Return output",
];

export function LogicFlowVisualizer({
  steps,
  editable = false,
  onChange,
}: {
  steps?: string[];
  editable?: boolean;
  onChange?: (steps: string[]) => void;
}) {
  const safeSteps = steps?.length ? steps : DEFAULT_FLOW_STEPS;

  function update(index: number, value: string) {
    onChange?.(safeSteps.map((step, i) => (i === index ? value : step)));
  }

  function remove(index: number) {
    onChange?.(safeSteps.filter((_, i) => i !== index));
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Logic Flow</p>
        {editable && (
          <Button variant="outline" size="sm" onClick={() => onChange?.([...safeSteps, "New step"])}>
            <Plus className="h-3.5 w-3.5" /> Step
          </Button>
        )}
      </div>
      <div className="space-y-2">
        {safeSteps.map((step, index) => (
          <React.Fragment key={`${step}-${index}`}>
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 font-mono text-xs text-primary ring-1 ring-primary/20">
                {index + 1}
              </div>
              {editable ? (
                <>
                  <Input value={step} onChange={(e) => update(index, e.target.value)} />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => remove(index)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </>
              ) : (
                <div className="min-h-9 flex-1 rounded-md border border-border bg-background/60 px-3 py-2 text-sm">{step}</div>
              )}
            </div>
            {index < safeSteps.length - 1 && <ArrowDown className="ml-3.5 h-4 w-4 text-muted-foreground" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
