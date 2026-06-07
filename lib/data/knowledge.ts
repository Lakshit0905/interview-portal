import "server-only";
import { promises as fs } from "fs";
import path from "path";
import matter from "gray-matter";
import type { KnowledgeNote } from "@/types";
import { readingTime } from "@/lib/utils";
import { KNOWLEDGE_CATEGORIES } from "@/lib/constants";

const CONTENT_DIR = path.join(process.cwd(), "content");

async function listFiles(category: string): Promise<string[]> {
  const dir = path.join(CONTENT_DIR, category);
  try {
    const files = await fs.readdir(dir);
    return files.filter((f) => f.endsWith(".mdx") || f.endsWith(".md"));
  } catch {
    return [];
  }
}

function parse(category: string, file: string, raw: string): KnowledgeNote {
  const { data, content } = matter(raw);
  const slug = file.replace(/\.mdx?$/, "");
  return {
    category,
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    section: data.section,
    tags: data.tags ?? [],
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    readingTime: readingTime(content),
    content,
  };
}

export async function getNotesByCategory(category: string): Promise<KnowledgeNote[]> {
  const files = await listFiles(category);
  const notes = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(CONTENT_DIR, category, file), "utf-8");
      return parse(category, file, raw);
    }),
  );
  return notes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getNote(category: string, slug: string): Promise<KnowledgeNote | null> {
  for (const ext of ["mdx", "md"]) {
    try {
      const raw = await fs.readFile(path.join(CONTENT_DIR, category, `${slug}.${ext}`), "utf-8");
      return parse(category, `${slug}.${ext}`, raw);
    } catch { /* try next */ }
  }
  return null;
}

export async function getAllNotes(): Promise<KnowledgeNote[]> {
  const all = await Promise.all(
    KNOWLEDGE_CATEGORIES.map((c) => getNotesByCategory(c.slug)),
  );
  return all.flat();
}

export async function getRecentNotes(limit = 5): Promise<KnowledgeNote[]> {
  const all = await getAllNotes();
  return all.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, limit);
}
