"use client";

import { ArrowDown } from "lucide-react";
import type { CodingProblem } from "@/types";
import { Textarea } from "@/components/ui/textarea";

type Blocks = NonNullable<CodingProblem["architectureBlocks"]>;

const LAYERS: { key: keyof Blocks; label: string; fallback: string }[] = [
  { key: "inputLayer", label: "Input Layer", fallback: "Input array + target" },
  { key: "processingLayer", label: "Processing Layer", fallback: "Loop through numbers" },
  { key: "dataStructureLayer", label: "Data Structure Layer", fallback: "HashMap storage" },
  { key: "decisionLayer", label: "Decision Layer", fallback: "Check target - current" },
  { key: "outputLayer", label: "Output Layer", fallback: "Return indexes" },
];

export function AlgorithmArchitectureView({
  blocks,
  editable = false,
  onChange,
}: {
  blocks?: Blocks;
  editable?: boolean;
  onChange?: (blocks: Blocks) => void;
}) {
  const current = blocks ?? {};

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="mb-3 text-sm font-semibold">Algorithm Architecture</p>
      <div className="space-y-2">
        {LAYERS.map((layer, index) => (
          <div key={layer.key}>
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="mono-label mb-1">{layer.label}</p>
              {editable ? (
                <Textarea
                  value={current[layer.key] ?? ""}
                  onChange={(e) => onChange?.({ ...current, [layer.key]: e.target.value })}
                  placeholder={layer.fallback}
                  rows={2}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm text-foreground/90">{current[layer.key] || layer.fallback}</p>
              )}
            </div>
            {index < LAYERS.length - 1 && <ArrowDown className="mx-auto my-1 h-4 w-4 text-muted-foreground" />}
          </div>
        ))}
      </div>
    </div>
  );
}
