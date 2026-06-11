import { Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CODING_GOAL_TOTAL } from "@/lib/constants";
import type { CodingDashboardStats } from "@/lib/coding-stats";
import { OverviewCards } from "./overview-cards";
import { ActivityHeatmap } from "./activity-heatmap";
import { PatternMastery } from "./pattern-mastery";
import { DailyChallengePanel } from "./daily-challenge-panel";
import { RecentActivityFeed } from "./recent-activity-feed";
import { ProgressCharts } from "./progress-charts";

export function CodingDashboard({ stats }: { stats: CodingDashboardStats }) {
  const goalPct = Math.min(100, Math.round((stats.totals.solved / CODING_GOAL_TOTAL) * 100));

  return (
    <div className="space-y-4">
      <div className="glass-card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Flame className="flame-icon h-6 w-6 text-signal-amber" />
          <div>
            <p className="text-lg font-semibold leading-tight">{stats.streak.current}-day streak</p>
            <p className="mono-label">longest: {stats.streak.longest} days</p>
          </div>
        </div>
        <div className="w-full sm:max-w-xs">
          <div className="mb-1.5 flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span>Goal progress</span>
            <span>{stats.totals.solved} / {CODING_GOAL_TOTAL}</span>
          </div>
          <Progress
            value={goalPct}
            className="h-2 bg-white/5"
            indicatorClassName="bg-gradient-to-r from-[hsl(217,91%,60%)] to-[hsl(270,91%,65%)]"
          />
        </div>
      </div>

      <OverviewCards stats={stats} />

      <ActivityHeatmap heatmap={stats.heatmap} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PatternMastery patterns={stats.patternMastery} />
        </div>
        <DailyChallengePanel challenge={stats.dailyChallenge} streak={stats.streak.current} />
      </div>

      <ProgressCharts stats={stats} />

      <RecentActivityFeed items={stats.recentActivity} />
    </div>
  );
}
