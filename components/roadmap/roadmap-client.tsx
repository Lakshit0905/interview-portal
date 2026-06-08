"use client";

import * as React from "react";
import type { LearningPath } from "@/types";
import { toggleRoadmapTopic } from "@/lib/actions/roadmap";
import { buildRoadmapStats, pathProgress, type PathProgress } from "@/lib/roadmap";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { cn } from "@/lib/utils";

import { RoadmapStatsRow } from "./roadmap-stats";
import { PathCard } from "./path-card";

const FILTERS: { value: PathProgress["status"] | "all"; label: string }[] = [
  { value: "all", label: "All paths" },
  { value: "in-progress", label: "In progress" },
  { value: "not-started", label: "Not started" },
  { value: "completed", label: "Completed" },
];

export function RoadmapClient({ initial }: { initial: LearningPath[] }) {
  const [paths, setPaths] = React.useState(initial);
  const [filter, setFilter] = React.useState<typeof FILTERS[number]["value"]>("all");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setPaths(initial), [initial]);

  const stats = React.useMemo(() => buildRoadmapStats(paths), [paths]);
  const filtered = React.useMemo(
    () => (filter === "all" ? paths : paths.filter((p) => pathProgress(p).status === filter)),
    [paths, filter],
  );

  function handleToggleTopic(pathId: string, topicId: string) {
    setPaths((ps) => ps.map((p) => (
      p.id === pathId
        ? { ...p, topics: p.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t)) }
        : p
    )));
    startTransition(async () => { await toggleRoadmapTopic(pathId, topicId); });
  }

  return (
    <div>
      <PageHeader
        title="Learning Roadmap"
        description="Fourteen structured paths from core SDET fundamentals to GenAI testing — check off topics as you master them and the schedule tracks itself."
      />

      <div className="mb-6"><RoadmapStatsRow stats={stats} /></div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-md border px-2.5 py-1 font-mono text-xs transition-colors",
              filter === f.value ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="Map" title="No paths in this view"
          description="Switch filters to see paths at a different stage of completion." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((path, i) => (
            <PathCard key={path.id} path={path} index={i} onToggleTopic={handleToggleTopic} pending={pending} />
          ))}
        </div>
      )}
    </div>
  );
}
