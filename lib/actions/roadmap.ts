"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/data/db";

export async function toggleRoadmapTopic(pathId: string, topicId: string) {
  const path = await db.roadmap.get(pathId);
  if (!path) return null;

  const topics = path.topics.map((t) => (t.id === topicId ? { ...t, done: !t.done } : t));
  const updated = await db.roadmap.update(pathId, { topics });
  revalidatePath("/roadmap");
  revalidatePath("/dashboard");
  return updated;
}
