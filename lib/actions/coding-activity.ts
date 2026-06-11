"use server";
import { db } from "@/lib/data/db";
import { DIFFICULTY_TIME_MINUTES } from "@/lib/constants";
import type { CodingProblem } from "@/types";

/** Upserts today's activity-log entry to record a problem being solved. */
export async function recordSolve(problem: CodingProblem) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = await db.codingActivity.list();
  const existing = entries.find((e) => e.date === today);
  const minutes = DIFFICULTY_TIME_MINUTES[problem.difficulty];

  if (!existing) {
    await db.codingActivity.create({
      date: today,
      problemsSolved: 1,
      minutesSpent: minutes,
      problemIds: [problem.id],
    });
    return;
  }

  if (existing.problemIds.includes(problem.id)) return;

  await db.codingActivity.update(existing.id, {
    problemsSolved: existing.problemsSolved + 1,
    minutesSpent: existing.minutesSpent + minutes,
    problemIds: [...existing.problemIds, problem.id],
  });
}
