import "server-only";
import { db } from "./db";
import { isDue } from "@/lib/srs";
import { REVIEW_INTERVALS_DAYS } from "@/types";
import type { Flashcard, CodingProblem, InterviewQuestion } from "@/types";

const DAY = 86_400_000;
const MAX_STREAK = REVIEW_INTERVALS_DAYS.length - 1;

export interface WeakArea {
  topic: string;
  masteryPercent: number; // 0–100, lower = weaker
  cardCount: number;
  reason: string;
}

export type RevisionItemType = "flashcard" | "coding" | "question";

export interface RevisionItem {
  id: string;
  type: RevisionItemType;
  title: string;
  topic: string;
  meta: string;
  href: string;
}

export interface RevisionSheet {
  date: string; // e.g. "Sunday, June 7"
  focusTopic: string | null;
  weakAreas: WeakArea[];
  dueFlashcards: number;
  items: RevisionItem[];
  estimatedMinutes: number;
}

/** Per-topic mastery derived from flashcard streak depth — lower share of "deep" reviews = weaker. */
function rankWeakAreas(cards: Flashcard[]): WeakArea[] {
  const byTopic = new Map<string, Flashcard[]>();
  for (const c of cards) byTopic.set(c.topic, [...(byTopic.get(c.topic) ?? []), c]);

  const areas: WeakArea[] = [];
  for (const [topic, topicCards] of byTopic) {
    const avgStreak = topicCards.reduce((sum, c) => sum + c.streak, 0) / topicCards.length;
    const masteryPercent = Math.round((avgStreak / MAX_STREAK) * 100);
    const stuck = topicCards.filter((c) => c.streak === 0 && c.reviewCount > 0).length;
    const reason = stuck > 0
      ? `${stuck} card${stuck === 1 ? "" : "s"} reset to streak zero after a miss`
      : `Average streak is only ${avgStreak.toFixed(1)} of ${MAX_STREAK} review steps`;
    areas.push({ topic, masteryPercent, cardCount: topicCards.length, reason });
  }

  return areas.sort((a, b) => a.masteryPercent - b.masteryPercent || b.cardCount - a.cardCount);
}

function flashcardItem(card: Flashcard): RevisionItem {
  return {
    id: card.id, type: "flashcard", title: card.front, topic: card.topic,
    meta: card.streak === 0 ? "Reset — needs a fresh look" : `Streak ${card.streak}/${MAX_STREAK}`,
    href: "/flashcards",
  };
}

function codingItem(problem: CodingProblem): RevisionItem {
  return {
    id: problem.id, type: "coding", title: problem.name, topic: problem.topic,
    meta: `${problem.difficulty} · flagged for revisit`,
    href: "/coding",
  };
}

function questionItem(question: InterviewQuestion): RevisionItem {
  return {
    id: question.id, type: "question", title: question.question, topic: question.category,
    meta: `${question.difficulty} · talk through the answer out loud`,
    href: "/questions",
  };
}

const ESTIMATE_MINUTES: Record<RevisionItemType, number> = { flashcard: 2, coding: 12, question: 5 };

export async function buildRevisionSheet(now: Date = new Date()): Promise<RevisionSheet> {
  const [flashcards, coding, questions] = await Promise.all([
    db.flashcards.list(), db.coding.list(), db.questions.list(),
  ]);

  const weakAreas = rankWeakAreas(flashcards).slice(0, 4);
  const focusTopic = weakAreas[0]?.topic ?? null;

  const dueCards = flashcards.filter((c) => isDue(c, now));
  const dueFlashcards = dueCards
    .sort((a, b) => {
      const aWeak = a.topic === focusTopic ? -1 : 0;
      const bWeak = b.topic === focusTopic ? -1 : 0;
      return aWeak - bWeak || a.streak - b.streak;
    })
    .slice(0, 8);

  const revisitCoding = coding
    .filter((p) => p.status === "revisit")
    .filter((p) => !p.revisitDate || new Date(p.revisitDate).getTime() <= now.getTime() + DAY)
    .slice(0, 4);

  const focusQuestions = focusTopic
    ? questions.filter((q) => q.category === focusTopic).slice(0, 3)
    : [];

  const items: RevisionItem[] = [
    ...dueFlashcards.map(flashcardItem),
    ...revisitCoding.map(codingItem),
    ...focusQuestions.map(questionItem),
  ];

  const estimatedMinutes = items.reduce((sum, i) => sum + ESTIMATE_MINUTES[i.type], 0);

  return {
    date: now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
    focusTopic,
    weakAreas,
    dueFlashcards: dueCards.length,
    items,
    estimatedMinutes,
  };
}
