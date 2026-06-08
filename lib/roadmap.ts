import type { LearningPath } from "@/types";

export interface PathProgress {
  total: number;
  done: number;
  percent: number; // 0–100
  hoursRemaining: number;
  status: "not-started" | "in-progress" | "completed";
}

export function pathProgress(path: LearningPath): PathProgress {
  const total = path.topics.length;
  const done = path.topics.filter((t) => t.done).length;
  const hoursRemaining = path.topics.filter((t) => !t.done).reduce((sum, t) => sum + t.estimatedHours, 0);
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);
  const status = done === 0 ? "not-started" : done === total ? "completed" : "in-progress";
  return { total, done, percent, hoursRemaining, status };
}

export interface RoadmapStats {
  totalPaths: number;
  pathsCompleted: number;
  pathsInProgress: number;
  topicsMastered: number;
  totalTopics: number;
  overallPercent: number; // 0–100
  hoursRemaining: number;
}

export function buildRoadmapStats(paths: LearningPath[]): RoadmapStats {
  let pathsCompleted = 0;
  let pathsInProgress = 0;
  let topicsMastered = 0;
  let totalTopics = 0;
  let hoursRemaining = 0;

  for (const path of paths) {
    const p = pathProgress(path);
    if (p.status === "completed") pathsCompleted += 1;
    else if (p.status === "in-progress") pathsInProgress += 1;
    topicsMastered += p.done;
    totalTopics += p.total;
    hoursRemaining += p.hoursRemaining;
  }

  return {
    totalPaths: paths.length,
    pathsCompleted,
    pathsInProgress,
    topicsMastered,
    totalTopics,
    overallPercent: totalTopics === 0 ? 0 : Math.round((topicsMastered / totalTopics) * 100),
    hoursRemaining,
  };
}
