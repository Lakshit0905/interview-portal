import { CODING_TOPICS, type CodingActivityEntry, type CodingProblem, type CodingTopic, type Difficulty } from "@/types";
import { PATTERN_MASTERY_TARGET } from "@/lib/constants";

const DAY = 86_400_000;

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function todayKey(): string {
  return dateKey(new Date());
}

/** Tiny deterministic hash for picking a "today's problem" without persistence. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface HeatmapDay {
  date: string;
  count: number;
  minutes: number;
}

export interface PatternMasteryEntry {
  topic: CodingTopic;
  solved: number;
  total: number;
  masteryPct: number;
  byDifficulty: Record<Difficulty, number>;
}

export interface RecentActivityEntry {
  id: string;
  name: string;
  topic: CodingTopic;
  difficulty: Difficulty;
  status: CodingProblem["status"];
  label: string;
  updatedAt: string;
}

export interface DailyChallenge {
  problem: CodingProblem | null;
  alreadySolvedToday: boolean;
}

export interface CodingDashboardStats {
  totals: { solved: number; total: number; accuracyPct: number };
  streak: { current: number; longest: number };
  weeklyProgress: { count: number; series: { date: string; count: number }[] };
  timeSpentMinutes: number;
  heatmap: HeatmapDay[];
  patternMastery: PatternMasteryEntry[];
  recentActivity: RecentActivityEntry[];
  dailyChallenge: DailyChallenge;
  progressOverTime: { date: string; total: number }[];
  difficultyDistribution: { difficulty: Difficulty; count: number }[];
  topicDistribution: { topic: CodingTopic; count: number }[];
}

export function buildCodingDashboardStats(
  problems: CodingProblem[],
  activity: CodingActivityEntry[],
): CodingDashboardStats {
  const solved = problems.filter((p) => p.status === "solved");
  const revisit = problems.filter((p) => p.status === "revisit");
  const total = problems.length;

  const accuracyDenom = solved.length + revisit.length;
  const accuracyPct = accuracyDenom ? Math.round((solved.length / accuracyDenom) * 100) : 0;

  const activityByDate = new Map(activity.map((a) => [a.date, a]));

  // ── Streak ────────────────────────────────────────────────────────────────
  let current = 0;
  let cursor = new Date();
  // A streak can include "today" only once activity exists for it; otherwise
  // start counting from yesterday so an idle morning doesn't reset the streak.
  if (!activityByDate.get(todayKey())?.problemsSolved) {
    cursor = new Date(cursor.getTime() - DAY);
  }
  for (;;) {
    const key = dateKey(cursor);
    const entry = activityByDate.get(key);
    if (!entry || entry.problemsSolved <= 0) break;
    current += 1;
    cursor = new Date(cursor.getTime() - DAY);
  }

  let longest = 0;
  let running = 0;
  const sortedDates = [...activityByDate.keys()].sort();
  let prevTime: number | null = null;
  for (const key of sortedDates) {
    const entry = activityByDate.get(key)!;
    if (entry.problemsSolved <= 0) { running = 0; prevTime = null; continue; }
    const time = new Date(`${key}T00:00:00.000Z`).getTime();
    if (prevTime !== null && time - prevTime === DAY) running += 1;
    else running = 1;
    longest = Math.max(longest, running);
    prevTime = time;
  }

  // ── Weekly progress (last 7 days) ───────────────────────────────────────────
  const weeklySeries: { date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const key = dateKey(new Date(Date.now() - i * DAY));
    weeklySeries.push({ date: key, count: activityByDate.get(key)?.problemsSolved ?? 0 });
  }
  const weeklyCount = weeklySeries.reduce((acc, d) => acc + d.count, 0);

  // ── Time spent ───────────────────────────────────────────────────────────────
  const timeSpentMinutes = activity.reduce((acc, a) => acc + a.minutesSpent, 0);

  // ── Heatmap (last ~182 days) ────────────────────────────────────────────────
  const HEATMAP_DAYS = 182;
  const heatmap: HeatmapDay[] = [];
  for (let i = HEATMAP_DAYS - 1; i >= 0; i--) {
    const key = dateKey(new Date(Date.now() - i * DAY));
    const entry = activityByDate.get(key);
    heatmap.push({ date: key, count: entry?.problemsSolved ?? 0, minutes: entry?.minutesSpent ?? 0 });
  }

  // ── Pattern mastery ─────────────────────────────────────────────────────────
  const patternMastery: PatternMasteryEntry[] = CODING_TOPICS.map((topic) => {
    const inTopic = problems.filter((p) => p.topic === topic);
    const solvedInTopic = inTopic.filter((p) => p.status === "solved");
    const byDifficulty: Record<Difficulty, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const p of solvedInTopic) byDifficulty[p.difficulty] += 1;
    return {
      topic,
      solved: solvedInTopic.length,
      total: inTopic.length,
      masteryPct: Math.min(100, Math.round((solvedInTopic.length / PATTERN_MASTERY_TARGET) * 100)),
      byDifficulty,
    };
  });

  // ── Recent activity feed ────────────────────────────────────────────────────
  const STATUS_LABEL: Record<CodingProblem["status"], string> = {
    solved: "Solved",
    revisit: "Marked for revisit",
    todo: "Added",
  };
  const recentActivity: RecentActivityEntry[] = [...problems]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8)
    .map((p) => ({
      id: p.id, name: p.name, topic: p.topic, difficulty: p.difficulty, status: p.status,
      label: STATUS_LABEL[p.status], updatedAt: p.updatedAt,
    }));

  // ── Daily challenge ──────────────────────────────────────────────────────────
  const todaySolvedIds = new Set(activityByDate.get(todayKey())?.problemIds ?? []);
  const candidates = problems.filter(
    (p) => p.status === "todo" || p.status === "revisit" || todaySolvedIds.has(p.id),
  ).sort((a, b) => a.id.localeCompare(b.id));
  let dailyChallenge: DailyChallenge = { problem: null, alreadySolvedToday: false };
  if (candidates.length > 0) {
    const idx = hashString(todayKey()) % candidates.length;
    const problem = candidates[idx];
    dailyChallenge = { problem, alreadySolvedToday: todaySolvedIds.has(problem.id) };
  }

  // ── Progress over time (cumulative, last 30 days) ───────────────────────────
  const PROGRESS_DAYS = 30;
  let cumulative = 0;
  const progressOverTime: { date: string; total: number }[] = [];
  for (let i = PROGRESS_DAYS - 1; i >= 0; i--) {
    const key = dateKey(new Date(Date.now() - i * DAY));
    cumulative += activityByDate.get(key)?.problemsSolved ?? 0;
    progressOverTime.push({ date: key, total: cumulative });
  }

  // ── Difficulty / topic distributions ────────────────────────────────────────
  const difficultyDistribution: { difficulty: Difficulty; count: number }[] = (
    ["Easy", "Medium", "Hard"] as Difficulty[]
  ).map((difficulty) => ({ difficulty, count: solved.filter((p) => p.difficulty === difficulty).length }));

  const topicDistribution = CODING_TOPICS.map((topic) => ({
    topic, count: problems.filter((p) => p.topic === topic).length,
  })).filter((t) => t.count > 0);

  return {
    totals: { solved: solved.length, total, accuracyPct },
    streak: { current, longest },
    weeklyProgress: { count: weeklyCount, series: weeklySeries },
    timeSpentMinutes,
    heatmap,
    patternMastery,
    recentActivity,
    dailyChallenge,
    progressOverTime,
    difficultyDistribution,
    topicDistribution,
  };
}
