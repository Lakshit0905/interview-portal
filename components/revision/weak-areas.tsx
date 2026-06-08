import type { WeakArea } from "@/lib/data/revision";
import { cn } from "@/lib/utils";

function masteryAccent(percent: number) {
  if (percent < 35) return "bg-signal-red";
  if (percent < 65) return "bg-signal-amber";
  return "bg-signal-green";
}

export function WeakAreas({ areas }: { areas: WeakArea[] }) {
  if (areas.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-1 text-sm font-semibold tracking-tight">Weak areas</h3>
        <p className="text-sm text-muted-foreground">
          Review a few flashcards to start surfacing topics that need more attention.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-sm font-semibold tracking-tight">Weak areas</h3>
      <p className="mb-4 text-xs text-muted-foreground">Ranked by flashcard mastery — lowest first.</p>
      <div className="space-y-4">
        {areas.map((a) => (
          <div key={a.topic}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{a.topic}</span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">{a.masteryPercent}% mastery</span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
              <div className={cn("h-full rounded-full transition-all", masteryAccent(a.masteryPercent))} style={{ width: `${a.masteryPercent}%` }} />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{a.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
