"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { generateQuizFromContent } from "@/lib/ai/quiz-generator";
import { uid } from "@/lib/utils";
import { FLASHCARD_TOPICS, QUIZ_QUESTION_TYPES } from "@/types";
import type { GeneratedQuizQuestion } from "@/types";

const MAX_CHARS = 60_000;

const generateSchema = z.object({
  text: z.string().trim().min(40, "Paste or upload at least a few sentences of material"),
  sourceLabel: z.string().trim().min(1).default("Pasted material"),
});

/** Runs the AI/offline pipeline and returns a preview — nothing is persisted yet. */
export async function generateQuizFromSource(input: unknown) {
  const { text, sourceLabel } = generateSchema.parse(input);
  return generateQuizFromContent(text.slice(0, MAX_CHARS), sourceLabel);
}

const questionSchema = z.object({
  topic: z.enum(FLASHCARD_TOPICS),
  subtopic: z.string().trim().optional(),
  type: z.enum(QUIZ_QUESTION_TYPES),
  question: z.string().trim().min(1),
  options: z.array(z.string().trim().min(1)).min(2),
  correctIndex: z.number().int().min(0),
  explanation: z.string().trim().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()).default([]),
  sourceSnippet: z.string().trim().optional(),
});

const saveSchema = z.object({
  title: z.string().trim().min(1),
  sourceLabel: z.string().trim().min(1),
  questions: z.array(questionSchema).min(1),
});

/** Persists the user-accepted subset of generated questions as a new quiz. */
export async function saveGeneratedQuiz(input: unknown) {
  const { title, sourceLabel, questions } = saveSchema.parse(input);

  const built = (questions as GeneratedQuizQuestion[]).map((q) => ({
    id: uid(),
    type: q.type,
    topic: q.topic,
    subtopic: q.subtopic,
    question: q.question,
    options: q.options,
    correctIndex: Math.min(q.correctIndex, q.options.length - 1),
    explanation: q.explanation,
    difficulty: q.difficulty,
    tags: q.tags,
    sourceSnippet: q.sourceSnippet,
  }));

  const topics = [...new Set(built.map((q) => q.topic))];

  const quiz = await db.quizzes.create({
    title, sourceLabel, topics, questions: built,
  });

  revalidatePath("/quizzes");
  return quiz;
}
