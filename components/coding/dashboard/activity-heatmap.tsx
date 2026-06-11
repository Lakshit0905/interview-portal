import type { HeatmapDay } from "@/lib/coding-stats";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function cellClass(count: number): string {
  if (count <= 0) return "bg-white/5";
  if (count <= 1) return "bg-[hsl(217,91%,60%,0.35)]";
  if (count <= 2) return "bg-[hsl(217,91%,60%,0.65)]";
  if (count <= 4) return "bg-[hsl(270,91%,65%,0.8)]";
  return "bg-[hsl(270,91%,65%,1)]";
}

export function ActivityHeatmap({ heatmap }: { heatmap: HeatmapDay[] }) {
  if (heatmap.length === 0) return null;

  const firstDow = new Date(`${heatmap[0].date}T00:00:00.000Z`).getUTCDay();
  const weeks: (HeatmapDay | null)[][] = [];
  let week: (HeatmapDay | null)[] = new Array(firstDow).fill(null);

  for (const day of heatmap) {
    week.push(day);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    weeks.push(week);
  }

  // Month labels: mark the first week column whose first non-null day falls in a new month.
  let lastMonth = -1;
  const monthLabels = weeks.map((w) => {
    const day = w.find((d) => d !== null);
    if (!day) return "";
    const month = new Date(`${day.date}T00:00:00.000Z`).getUTCMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      return MONTH_LABELS[month];
    }
    return "";
  });

  const totalSolved = heatmap.reduce((acc, d) => acc + d.count, 0);
  const activeDays = heatmap.filter((d) => d.count > 0).length;

  return (
    <div className="glass-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="mono-label">Coding Activity</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {totalSolved} solved across {activeDays} active days
        </span>
      </div>
      <div className="scrollbar-thin overflow-x-auto pb-2">
        <div className="inline-flex gap-1">
          {weeks.map((w, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              <span className="block h-3 font-mono text-[0.6rem] leading-3 text-muted-foreground">
                {monthLabels[wi]}
              </span>
              {w.map((d, di) => (
                <div
                  key={di}
                  title={d ? `${formatDate(d.date)}: ${d.count} solved · ${d.minutes}m` : undefined}
                  className={cn("heatmap-cell h-3 w-3", d ? cellClass(d.count) : "bg-transparent")}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
        <span>Less</span>
        <div className="heatmap-cell h-3 w-3 bg-white/5" />
        <div className="heatmap-cell h-3 w-3 bg-[hsl(217,91%,60%,0.35)]" />
        <div className="heatmap-cell h-3 w-3 bg-[hsl(217,91%,60%,0.65)]" />
        <div className="heatmap-cell h-3 w-3 bg-[hsl(270,91%,65%,0.8)]" />
        <div className="heatmap-cell h-3 w-3 bg-[hsl(270,91%,65%,1)]" />
        <span>More</span>
      </div>
    </div>
  );
}
