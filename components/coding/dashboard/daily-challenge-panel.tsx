import Link from "next/link";
import { Flame, ArrowRight, CheckCircle2 } from "lucide-react";
import { ACCENT_CLASS, DIFFICULTY_ACCENT } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DailyChallenge } from "@/lib/coding-stats";

export function DailyChallengePanel({ challenge, streak }: { challenge: DailyChallenge; streak: number }) {
  const { problem, alreadySolvedToday } = challenge;
  const accent = problem ? ACCENT_CLASS[DIFFICULTY_ACCENT[problem.difficulty]] : null;

  return (
    <div className="glass-card neon-ring flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="mono-label">Today&apos;s Challenge</h3>
        <div className="flex items-center gap-1.5 font-mono text-xs text-signal-amber">
          <Flame className="flame-icon h-4 w-4" />
          {streak} day{streak === 1 ? "" : "s"}
        </div>
      </div>

      {!problem ? (
        <div className="mt-6 flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <CheckCircle2 className="h-8 w-8 text-signal-green" />
          <p className="text-sm text-muted-foreground">All caught up — add more problems to keep the streak alive.</p>
        </div>
      ) : (
        <div className="mt-4 flex flex-1 flex-col">
          <p className="text-lg font-semibold leading-snug">{problem.name}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs ring-1", accent!.bg, accent!.text, accent!.ring)}>
              {problem.difficulty}
            </span>
            <span className="mono-label">{problem.topic}</span>
          </div>
          <div className="mt-auto pt-4">
            {alreadySolvedToday ? (
              <div className="flex items-center gap-2 rounded-lg bg-signal-green/10 px-3 py-2.5 text-sm text-signal-green ring-1 ring-signal-green/30">
                <CheckCircle2 className="h-4 w-4" /> Solved today — streak reward unlocked!
              </div>
            ) : (
              <Link
                href={`/coding?focus=${problem.id}`}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(270,91%,65%)] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                Solve now <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
