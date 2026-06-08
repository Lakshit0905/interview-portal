import { Lightbulb } from "lucide-react";
import type { VideoConcept } from "@/types";
import { EmptyState } from "@/components/shared/empty-state";

export function VideoConcepts({ concepts }: { concepts: VideoConcept[] }) {
  if (!concepts.length) {
    return <EmptyState icon="Lightbulb" title="No concepts extracted" description="Concepts are pulled from the transcript when the lesson is generated." />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {concepts.map((c) => (
        <div key={c.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-signal-violet/15 text-signal-violet">
              <Lightbulb className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium leading-snug">{c.term}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{c.explanation}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
