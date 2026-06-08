"use server";

import { promises as fs } from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CONTENT_DIR = path.join(process.cwd(), "content");

const noteSchema = z.object({
  subjectSlug: z.string().min(1),
  topicSlug: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(400).default(""),
  content: z.string().min(1),
  tags: z.array(z.string()).default([]),
  section: z.string().optional(),
});

export type NotePayload = z.infer<typeof noteSchema>;

function buildMdx(data: NotePayload): string {
  const now = new Date().toISOString();
  const tagsYaml = data.tags.length
    ? `\ntags: [${data.tags.map((t) => `"${t}"`).join(", ")}]`
    : "";
  const sectionYaml = data.section ? `\nsection: "${data.section}"` : "";

  return `---
title: "${data.title.replace(/"/g, '\\"')}"
description: "${data.description.replace(/"/g, '\\"')}"${sectionYaml}${tagsYaml}
updatedAt: "${now}"
---

${data.content.trim()}
`;
}

export async function saveTopicNote(payload: NotePayload) {
  const data = noteSchema.parse(payload);

  // Ensure the content directory for this subject exists
  const dir = path.join(CONTENT_DIR, data.subjectSlug);
  await fs.mkdir(dir, { recursive: true });

  const filePath = path.join(dir, `${data.topicSlug}.mdx`);
  await fs.writeFile(filePath, buildMdx(data), "utf-8");

  revalidatePath(`/knowledge/${data.subjectSlug}`);
  revalidatePath(`/knowledge/${data.subjectSlug}/${data.topicSlug}`);
  revalidatePath("/knowledge");

  return { ok: true };
}

export async function deleteTopicNote(subjectSlug: string, topicSlug: string) {
  for (const ext of ["mdx", "md"]) {
    const filePath = path.join(CONTENT_DIR, subjectSlug, `${topicSlug}.${ext}`);
    try {
      await fs.unlink(filePath);
      revalidatePath(`/knowledge/${subjectSlug}`);
      revalidatePath(`/knowledge/${subjectSlug}/${topicSlug}`);
      revalidatePath("/knowledge");
      return { ok: true };
    } catch { /* try next ext */ }
  }
  return { ok: false, error: "Note not found" };
}

export async function getTopicNoteRaw(
  subjectSlug: string,
  topicSlug: string,
): Promise<{ title: string; description: string; section: string; tags: string[]; content: string } | null> {
  for (const ext of ["mdx", "md"]) {
    const filePath = path.join(CONTENT_DIR, subjectSlug, `${topicSlug}.${ext}`);
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      // Strip frontmatter to get editable content
      const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      if (!fmMatch) return { title: topicSlug, description: "", section: "", tags: [], content: raw };

      const fm = fmMatch[1];
      const body = fmMatch[2].trim();

      const titleMatch    = fm.match(/^title:\s*"?(.+?)"?\s*$/m);
      const descMatch     = fm.match(/^description:\s*"?(.+?)"?\s*$/m);
      const sectionMatch  = fm.match(/^section:\s*"?(.+?)"?\s*$/m);
      const tagsMatch     = fm.match(/^tags:\s*\[(.+?)\]/m);

      return {
        title:       titleMatch?.[1]?.replace(/\\"/g, '"') ?? topicSlug,
        description: descMatch?.[1]?.replace(/\\"/g, '"') ?? "",
        section:     sectionMatch?.[1] ?? "",
        tags:        tagsMatch?.[1]
          ? tagsMatch[1].split(",").map((t) => t.trim().replace(/^["']|["']$/g, ""))
          : [],
        content: body,
      };
    } catch { /* try next */ }
  }
  return null;
}
