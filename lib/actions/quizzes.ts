"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { nowISO } from "@/lib/utils";

export async function deleteQuiz(id: string) {
  const ok = await db.quizzes.remove(id);
  revalidatePath("/quizzes");
  return ok;
}

const answerSchema = z.array(z.object({
  questionId: z.string(),
  selectedIndex: z.number().int().min(0),
}));

/** Scores the submitted answers against the quiz's correctIndex values and persists the attempt. */
export async function recordQuizAttempt(quizId: string, answers: unknown, durationSeconds = 0) {
  const submitted = answerSchema.parse(answers);
  const quiz = await db.quizzes.get(quizId);
  if (!quiz) return null;

  const scored = submitted.map((a) => {
    const question = quiz.questions.find((q) => q.id === a.questionId);
    return { ...a, correct: question ? question.correctIndex === a.selectedIndex : false };
  });

  const score = scored.filter((a) => a.correct).length;
  const total = quiz.questions.length;

  const attempt = await db.quizAttempts.create({
    quizId,
    quizTitle: quiz.title,
    answers: scored,
    score,
    total,
    percentage: total === 0 ? 0 : Math.round((score / total) * 100),
    durationSeconds,
    completedAt: nowISO(),
  });

  revalidatePath("/quizzes");
  revalidatePath("/dashboard");
  return attempt;
}
