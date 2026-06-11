"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { CODING_TOPICS } from "@/types";
import { recordSolve } from "./coding-activity";

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
  understanding: z.string().default(""),
  input: z.string().default(""),
  output: z.string().default(""),
  constraints: z.string().default(""),
  edgeCases: z.string().default(""),
  pattern: z.string().default(""),
  approach: z.string().default(""),
  pseudocode: z.string().default(""),
  code: z.string().default(""),
  language: z.string().default(""),
  flowSteps: z.array(z.string()).default([]),
  architectureBlocks: z.object({
    inputLayer: z.string().optional(),
    processingLayer: z.string().optional(),
    dataStructureLayer: z.string().optional(),
    decisionLayer: z.string().optional(),
    outputLayer: z.string().optional(),
  }).default({}),
  memoryNotes: z.object({
    patternName: z.string().optional(),
    whenToUse: z.string().optional(),
    keyIdea: z.string().optional(),
    visualHook: z.string().optional(),
    commonMistake: z.string().optional(),
    similarProblems: z.string().optional(),
    revisionShortcut: z.string().optional(),
  }).default({}),
  tags: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  confidence: z.enum(["Low", "Medium", "High"]).optional(),
  lastRevisedAt: z.string().optional(),
  nextRevisionAt: z.string().optional(),
  revisionCount: z.number().int().nonnegative().default(0),
  revisionNotes: z.array(z.string()).default([]),
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
  const before = await db.coding.get(id);
  const updated = await db.coding.update(id, { status });
  if (updated && status === "solved" && before?.status !== "solved") {
    await recordSolve(updated);
  }
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return updated;
}

export async function markCodingProblemRevised(id: string, note?: string) {
  const problem = await db.coding.get(id);
  if (!problem) return null;

  const now = new Date();
  const next = new Date(now);
  const confidence = problem.confidence ?? "Medium";
  next.setDate(now.getDate() + (confidence === "High" ? 14 : confidence === "Medium" ? 7 : 3));

  const updated = await db.coding.update(id, {
    lastRevisedAt: now.toISOString().slice(0, 10),
    nextRevisionAt: next.toISOString().slice(0, 10),
    revisionCount: (problem.revisionCount ?? 0) + 1,
    revisionNotes: note?.trim() ? [note.trim(), ...(problem.revisionNotes ?? [])] : problem.revisionNotes ?? [],
  });
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  revalidatePath("/revision");
  return updated;
}

export async function deleteCodingProblem(id: string) {
  const ok = await db.coding.remove(id);
  revalidatePath("/coding");
  revalidatePath("/dashboard");
  return ok;
}
