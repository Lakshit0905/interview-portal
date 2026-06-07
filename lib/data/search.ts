import "server-only";
import type { SearchResult } from "@/types";
import { db } from "./db";
import { getAllNotes } from "./knowledge";

function score(haystack: string, q: string): boolean {
  return haystack.toLowerCase().includes(q.toLowerCase());
}

function snippet(text: string, q: string, len = 140): string {
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return text.slice(0, len) + (text.length > len ? "…" : "");
  const start = Math.max(0, i - 40);
  return (start > 0 ? "…" : "") + text.slice(start, start + len) + "…";
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (!q) return [];
  const results: SearchResult[] = [];

  const notes = await getAllNotes();
  for (const n of notes) {
    const blob = `${n.title} ${n.description} ${n.tags.join(" ")} ${n.content}`;
    if (score(blob, q)) {
      results.push({
        type: "note", id: `${n.category}/${n.slug}`, title: n.title,
        snippet: snippet(n.description || n.content, q),
        href: `/knowledge/${n.category}/${n.slug}`,
        meta: n.category,
      });
    }
  }

  for (const p of await db.coding.list()) {
    if (score(`${p.name} ${p.topic} ${p.notes} ${p.solution}`, q)) {
      results.push({
        type: "coding", id: p.id, title: p.name,
        snippet: snippet(p.notes || p.solution, q),
        href: `/coding?focus=${p.id}`, meta: `${p.topic} · ${p.difficulty}`,
      });
    }
  }

  for (const item of await db.questions.list()) {
    if (score(`${item.question} ${item.answer} ${item.tags.join(" ")}`, q)) {
      results.push({
        type: "question", id: item.id, title: item.question,
        snippet: snippet(item.answer, q),
        href: `/questions?focus=${item.id}`, meta: item.category,
      });
    }
  }

  for (const s of await db.behavioral.list()) {
    const blob = `${s.title} ${s.situation} ${s.task} ${s.action} ${s.result}`;
    if (score(blob, q)) {
      results.push({
        type: "behavioral", id: s.id, title: s.title,
        snippet: snippet(s.result, q),
        href: `/behavioral?focus=${s.id}`, meta: s.theme,
      });
    }
  }

  return results.slice(0, 40);
}
