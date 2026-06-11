import type { Quiz, QuizAttempt } from "@/types";

export interface QuizStats {
  totalQuizzes: number;
  totalAttempts: number;
  avgScorePct: number;
  bestScoreByQuiz: Record<string, number>; // quizId -> best percentage
  weakestTopics: { topic: string; accuracyPct: number }[];
}

export function buildQuizStats(quizzes: Quiz[], attempts: QuizAttempt[]): QuizStats {
  const totalQuizzes = quizzes.length;
  const totalAttempts = attempts.length;
  const avgScorePct = totalAttempts === 0
    ? 0
    : Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts);

  const bestScoreByQuiz: Record<string, number> = {};
  for (const a of attempts) {
    bestScoreByQuiz[a.quizId] = Math.max(bestScoreByQuiz[a.quizId] ?? 0, a.percentage);
  }

  const questionById = new Map<string, { topic: string }>();
  for (const quiz of quizzes) {
    for (const q of quiz.questions) questionById.set(q.id, { topic: q.topic });
  }

  const topicTally = new Map<string, { correct: number; total: number }>();
  for (const attempt of attempts) {
    for (const ans of attempt.answers) {
      const topic = questionById.get(ans.questionId)?.topic;
      if (!topic) continue;
      const entry = topicTally.get(topic) ?? { correct: 0, total: 0 };
      entry.total += 1;
      if (ans.correct) entry.correct += 1;
      topicTally.set(topic, entry);
    }
  }

  const weakestTopics = [...topicTally.entries()]
    .map(([topic, t]) => ({ topic, accuracyPct: Math.round((t.correct / t.total) * 100) }))
    .sort((a, b) => a.accuracyPct - b.accuracyPct)
    .slice(0, 5);

  return { totalQuizzes, totalAttempts, avgScorePct, bestScoreByQuiz, weakestTopics };
}
