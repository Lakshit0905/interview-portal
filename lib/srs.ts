import { REVIEW_INTERVALS_DAYS } from "@/types";
import type { Flashcard, FlashcardGrade } from "@/types";

const DAY = 86_400_000;

/**
 * Leitner-style schedule over REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30].
 * "good" advances the streak one step (capped at the last interval);
 * "again" resets the streak to the first interval and the card resurfaces tomorrow.
 */
export function nextReview(streak: number, grade: FlashcardGrade, from: Date = new Date()) {
  const nextStreak = grade === "good"
    ? Math.min(streak + 1, REVIEW_INTERVALS_DAYS.length - 1)
    : 0;
  const days = REVIEW_INTERVALS_DAYS[nextStreak];
  const dueAt = new Date(from.getTime() + days * DAY).toISOString();
  return { streak: nextStreak, dueAt, intervalDays: days };
}

export function isDue(card: Pick<Flashcard, "dueAt">, now: Date = new Date()): boolean {
  return new Date(card.dueAt).getTime() <= now.getTime();
}

export interface FlashcardStats {
  total: number;
  dueToday: number;
  reviewedTotal: number;
  byTopic: { topic: string; total: number; due: number }[];
  masteredShare: number; // share of cards at the final interval step (0–1)
}

export function buildFlashcardStats(cards: Flashcard[], now: Date = new Date()): FlashcardStats {
  const dueToday = cards.filter((c) => isDue(c, now)).length;
  const reviewedTotal = cards.reduce((sum, c) => sum + c.reviewCount, 0);
  const mastered = cards.filter((c) => c.streak >= REVIEW_INTERVALS_DAYS.length - 1).length;

  const byTopicMap = new Map<string, { total: number; due: number }>();
  for (const c of cards) {
    const entry = byTopicMap.get(c.topic) ?? { total: 0, due: 0 };
    entry.total += 1;
    if (isDue(c, now)) entry.due += 1;
    byTopicMap.set(c.topic, entry);
  }

  return {
    total: cards.length,
    dueToday,
    reviewedTotal,
    byTopic: [...byTopicMap.entries()]
      .map(([topic, v]) => ({ topic, ...v }))
      .sort((a, b) => b.due - a.due || b.total - a.total),
    masteredShare: cards.length === 0 ? 0 : mastered / cards.length,
  };
}
