"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";

export async function toggleCompanyChecklistItem(id: string, itemId: string) {
  const company = await db.companyPrep.get(id);
  if (!company) return null;

  const checklist = company.checklist.map((item) =>
    item.id === itemId ? { ...item, done: !item.done } : item);
  const updated = await db.companyPrep.update(id, { checklist });
  revalidatePath(`/companies/${company.slug}`);
  revalidatePath("/companies");
  return updated;
}

const notesSchema = z.string();

export async function updateCompanyNotes(id: string, field: "notes" | "experiences", value: unknown) {
  const text = notesSchema.parse(value);
  const company = await db.companyPrep.get(id);
  if (!company) return null;

  const updated = await db.companyPrep.update(id, { [field]: text });
  revalidatePath(`/companies/${company.slug}`);
  return updated;
}
