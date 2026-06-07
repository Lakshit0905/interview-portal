"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { CODING_TOPICS } from "@/types";

const schema = z.object({
  name: z.string().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  topic: z.enum(CODING_TOPICS),
  status: z.enum(["todo", "solved", "revisit"]).default("todo"),
  solution: z.string().default(""),
  timeComplexity: z.string().default(""),
  spaceComplexity: z.string().default(""),
  notes: z.string().default(""),
  url: z.string().optional(),
  revisitDate: z.string().nullable().optional(),
});

export async function createCodingProblem(input: unknown) {
  const data = schema.parse(input);
  const created = await db.coding.create(data);
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return created;
}

export async function updateCodingProblem(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.coding.update(id, data);
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return updated;
}

export async function setCodingStatus(id: string, status: "todo" | "solved" | "revisit") {
  const updated = await db.coding.update(id, { status });
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return updated;
}

export async function deleteCodingProblem(id: string) {
  const ok = await db.coding.remove(id);
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return ok;
}
