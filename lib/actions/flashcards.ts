"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { nowISO } from "@/lib/utils";
import { nextReview } from "@/lib/srs";
import type { FlashcardGrade } from "@/types";

const schema = z.object({
  front: z.string().min(1),
  back: z.string().min(1),
  topic: z.string().trim().min(1).max(80),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  source: z.enum(["manual", "note", "video", "question", "import"]).default("manual"),
  sourceRef: z.string().optional(),
});

export async function createFlashcard(input: unknown) {
  const data = schema.parse(input);
  const now = nowISO();
  const created = await db.flashcards.create({
    ...data, streak: 0, reviewCount: 0, lastReviewedAt: null, dueAt: now,
  });
  revalidatePath("/flashcards");
  revalidatePath("/dashboard");
  return created;
}

export async function updateFlashcard(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.flashcards.update(id, data);
  revalidatePath("/flashcards");
  return updated;
}

export async function deleteFlashcard(id: string) {
  const ok = await db.flashcards.remove(id);
  revalidatePath("/flashcards");
  revalidatePath("/dashboard");
  return ok;
}

const gradeSchema = z.enum(["again", "good"]);

/** Records a review outcome and reschedules the card per the spaced-repetition ladder. */
export async function reviewFlashcard(id: string, grade: unknown) {
  const g = gradeSchema.parse(grade) as FlashcardGrade;
  const card = await db.flashcards.get(id);
  if (!card) return null;

  const { streak, dueAt } = nextReview(card.streak, g);
  const updated = await db.flashcards.update(id, {
    streak, dueAt, reviewCount: card.reviewCount + 1, lastReviewedAt: nowISO(),
  });
  revalidatePath("/flashcards");
  revalidatePath("/dashboard");
  return updated;
}
