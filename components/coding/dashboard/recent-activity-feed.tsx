import { Icon } from "@/components/shared/icon";
import { ACCENT_CLASS, DIFFICULTY_ACCENT } from "@/lib/constants";
import { cn, relativeTime } from "@/lib/utils";
import type { CodingProblem } from "@/types";
import type { RecentActivityEntry } from "@/lib/coding-stats";

const STATUS_ICON: Record<CodingProblem["status"], string> = {
  solved: "CheckCircle2",
  revisit: "RotateCcw",
  todo: "Circle",
};

export function RecentActivityFeed({ items }: { items: RecentActivityEntry[] }) {
  return (
    <div className="glass-card h-full p-5">
      <h3 className="mono-label mb-4">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet — add or solve a problem to get started.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => {
            const accent = ACCENT_CLASS[DIFFICULTY_ACCENT[item.difficulty]];
            return (
              <li key={item.id} className="flex items-start gap-3">
                <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1", accent.bg, accent.ring)}>
                  <Icon name={STATUS_ICON[item.status]} className={cn("h-3.5 w-3.5", accent.text)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">
                    <span className="font-medium">{item.label}</span> &ldquo;{item.name}&rdquo;
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
                    <span>{item.topic}</span>
                    <span>·</span>
                    <span>{item.difficulty}</span>
                    <span>·</span>
                    <span>{relativeTime(item.updatedAt)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
