"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";

const schema = z.object({
  label: z.string().min(1),
  version: z.string().min(1),
  targetCompany: z.string().optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
  notes: z.string().default(""),
  content: z.string().optional(),
});

export async function createResume(input: unknown) {
  const data = schema.parse(input);
  const created = await db.resumes.create(data);
  revalidatePath("/resumes");
  return created;
}
export async function updateResume(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.resumes.update(id, data);
  revalidatePath("/resumes");
  return updated;
}
export async function deleteResume(id: string) {
  const ok = await db.resumes.remove(id);
  revalidatePath("/resumes");
  return ok;
}
