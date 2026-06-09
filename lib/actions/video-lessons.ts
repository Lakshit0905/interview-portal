"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { generateVideoLesson } from "@/lib/ai/actions";

const createSchema = z.object({
  url: z.string().trim().min(1, "URL is required"),
  title: z.string().trim().min(1, "Title is required"),
  channel: z.string().trim().min(1, "Channel is required"),
  topic: z.string().trim().min(1, "Topic is required"),
  durationMinutes: z.coerce.number().int().min(1).max(2880),
  transcript: z.string().trim().min(40, "Paste at least a few sentences of transcript"),
});

export interface CreateVideoLessonResult {
  lesson: Awaited<ReturnType<typeof db.videos.get>>;
  aiEnabled: boolean;
}

/**
 * Runs a pasted transcript through the AI study-material pipeline (or its offline
 * fallback) and persists the fully generated lesson — notes, concepts, Q&A,
 * flashcards, revision notes, cheat sheet, and an MCQ quiz, all in one shot.
 */
export async function createVideoLesson(input: unknown): Promise<CreateVideoLessonResult> {
  const data = createSchema.parse(input);
  const generated = await generateVideoLesson(data.title, data.channel, data.topic, data.transcript);

  const lesson = await db.videos.create({
    url: data.url,
    title: data.title,
    channel: data.channel,
    topic: data.topic,
    durationMinutes: data.durationMinutes,
    transcript: data.transcript,
    summary: generated.summary,
    notes: generated.notes,
    concepts: generated.concepts,
    questions: generated.questions,
    flashcards: generated.flashcards,
    revisionNotes: generated.revisionNotes,
    cheatSheet: generated.cheatSheet,
    mcqs: generated.mcqs,
    status: "ready",
    generatedByAi: generated.enabled,
  });

  revalidatePath("/videos");
  return { lesson, aiEnabled: generated.enabled };
}

export async function deleteVideoLesson(id: string) {
  const removed = await db.videos.remove(id);
  if (removed) revalidatePath("/videos");
  return removed;
}
