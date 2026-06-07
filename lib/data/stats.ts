import "server-only";
import { db } from "./db";
import { getAllNotes } from "./knowledge";
import { KNOWLEDGE_CATEGORIES } from "@/lib/constants";
import { daysUntil } from "@/lib/utils";
import type { Interview, KnowledgeNote } from "@/types";

export interface DashboardStats {
  totalTopics: number;
  totalNotes: number;
  totalCoding: number;
  solvedCoding: number;
  topicsCompleted: number;
  topicsTotal: number;
  readiness: number;
  readinessBreakdown: { label: string; value: number; weight: number }[];
  recentNotes: KnowledgeNote[];
  upcomingInterviews: Interview[];
  codingByDifficulty: { Easy: number; Medium: number; Hard: number };
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [notes, coding, interviews] = await Promise.all([
    getAllNotes(), db.coding.list(), db.interviews.list(),
  ]);

  const solved = coding.filter((c) => c.status === "solved").length;
  const totalCoding = coding.length;

  // A topic "completed" = a knowledge category with at least 2 notes.
  const notesPerCat = KNOWLEDGE_CATEGORIES.map(
    (c) => notes.filter((n) => n.category === c.slug).length,
  );
  const topicsCompleted = notesPerCat.filter((n) => n >= 2).length;
  const topicsTotal = KNOWLEDGE_CATEGORIES.length;

  // Readiness: weighted blend of coverage signals (0–100).
  const codingPct = totalCoding ? solved / totalCoding : 0;
  const topicPct = topicsTotal ? topicsCompleted / topicsTotal : 0;
  const notePct = Math.min(1, notes.length / (topicsTotal * 3));
  const behavioralCount = (await db.behavioral.list()).length;
  const behavioralPct = Math.min(1, behavioralCount / 6);

  const breakdown = [
    { label: "Coding solved", value: codingPct, weight: 0.3 },
    { label: "Topic coverage", value: topicPct, weight: 0.3 },
    { label: "Notes depth", value: notePct, weight: 0.2 },
    { label: "Behavioral stories", value: behavioralPct, weight: 0.2 },
  ];
  const readiness = Math.round(
    breakdown.reduce((acc, b) => acc + b.value * b.weight, 0) * 100,
  );

  const upcoming = interviews
    .filter((i) => {
      const d = daysUntil(i.interviewDate);
      return d !== null && d >= 0 && !["Rejected"].includes(i.status);
    })
    .sort((a, b) => (a.interviewDate ?? "").localeCompare(b.interviewDate ?? ""))
    .slice(0, 4);

  return {
    totalTopics: topicsTotal,
    totalNotes: notes.length,
    totalCoding,
    solvedCoding: solved,
    topicsCompleted,
    topicsTotal,
    readiness,
    readinessBreakdown: breakdown,
    recentNotes: [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 5),
    upcomingInterviews: upcoming,
    codingByDifficulty: {
      Easy: coding.filter((c) => c.difficulty === "Easy").length,
      Medium: coding.filter((c) => c.difficulty === "Medium").length,
      Hard: coding.filter((c) => c.difficulty === "Hard").length,
    },
  };
}
