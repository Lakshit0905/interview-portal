"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { QUESTION_CATEGORIES } from "@/types";

const schema = z.object({
  question: z.string().min(1),
  category: z.enum(QUESTION_CATEGORIES),
  answer: z.string().default(""),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()).default([]),
});

export async function createQuestion(input: unknown) {
  const data = schema.parse(input);
  const created = await db.questions.create(data);
  revalidatePath("/questions");
  return created;
}
export async function updateQuestion(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.questions.update(id, data);
  revalidatePath("/questions");
  return updated;
}
export async function deleteQuestion(id: string) {
  const ok = await db.questions.remove(id);
  revalidatePath("/questions");
  return ok;
}
