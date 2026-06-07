"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { INTERVIEW_STATUSES } from "@/types";

const schema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  recruiter: z.string().optional(),
  interviewDate: z.string().nullable().optional(),
  round: z.string().default(""),
  status: z.enum(INTERVIEW_STATUSES),
  notes: z.string().default(""),
});

export async function createInterview(input: unknown) {
  const data = schema.parse(input);
  const created = await db.interviews.create(data);
  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  return created;
}
export async function updateInterview(id: string, patch: unknown) {
  const data = schema.partial().parse(patch);
  const updated = await db.interviews.update(id, data);
  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  return updated;
}
export async function setInterviewStatus(id: string, status: typeof INTERVIEW_STATUSES[number]) {
  const updated = await db.interviews.update(id, { status });
  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  return updated;
}
export async function deleteInterview(id: string) {
  const ok = await db.interviews.remove(id);
  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  return ok;
}
