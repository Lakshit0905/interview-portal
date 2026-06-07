"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";

const schema = z.object({
  title: z.string().min(1),
  theme: z.string().min(1),
  situation: z.string().default(""),
  task: z.string().default(""),
  action: z.string().default(""),
  result: z.string().default(""),
  tags: z.array(z.string()).default([]),
});

export async function createStory(input: unknown) {
  const data = schema.parse(input);
  const created = await db.behavioral.create(data);
  revalidatePath("/behavioral");
  revalidatePath("/dashboard");
  return created;
}
export async function updateStory(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.behavioral.update(id, data);
  revalidatePath("/behavioral");
  return updated;
}
export async function deleteStory(id: string) {
  const ok = await db.behavioral.remove(id);
  revalidatePath("/behavioral");
  return ok;
}
