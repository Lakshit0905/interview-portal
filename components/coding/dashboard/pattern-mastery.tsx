import { Progress } from "@/components/ui/progress";
import type { PatternMasteryEntry } from "@/lib/coding-stats";

export function PatternMastery({ patterns }: { patterns: PatternMasteryEntry[] }) {
  return (
    <div className="glass-card h-full p-5">
      <h3 className="mono-label mb-4">Pattern Mastery</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {patterns.map((p) => (
          <div key={p.topic} className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium">{p.topic}</span>
              <span className="shrink-0 font-mono text-xs text-muted-foreground">{p.solved}/{p.total}</span>
            </div>
            <Progress
              value={p.masteryPct}
              className="mt-3 h-1.5 bg-white/5"
              indicatorClassName="bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(270,91%,65%)]"
            />
            <div className="mt-2 flex items-center justify-between">
              <span className="font-mono text-[0.65rem] text-muted-foreground">{p.masteryPct}% mastered</span>
              <div className="flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
                <span className="text-signal-green">{p.byDifficulty.Easy}E</span>
                <span className="text-signal-amber">{p.byDifficulty.Medium}M</span>
                <span className="text-signal-red">{p.byDifficulty.Hard}H</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
