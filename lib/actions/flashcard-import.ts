"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { generateFlashcardsFromContent } from "@/lib/ai/flashcard-generator";
import { FLASHCARD_TOPICS } from "@/types";
import type { GeneratedFlashcard } from "@/types";

const MAX_CHARS = 60_000;

export interface ExtractedDocument {
  text: string;
  fileName: string;
  charCount: number;
}

/**
 * Pulls plain text out of an uploaded document. Plain text/markdown files are
 * read directly; PDFs are parsed with pdf-parse. Returns the extracted text
 * (capped) so the client can preview it before generation.
 */
export async function extractDocumentText(formData: FormData): Promise<ExtractedDocument> {
  const file = formData.get("file");
  if (!(file instanceof File)) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  let text: string;

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } finally {
      await parser.destroy();
    }
  } else {
    text = buffer.toString("utf-8");
  }

  const trimmed = text.trim().slice(0, MAX_CHARS);
  return { text: trimmed, fileName: file.name, charCount: trimmed.length };
}

const generateSchema = z.object({
  text: z.string().trim().min(40, "Paste or upload at least a few sentences of material"),
  sourceLabel: z.string().trim().min(1).default("Pasted material"),
});

/** Runs the AI/offline pipeline and returns a preview — nothing is persisted yet. */
export async function generateFlashcardsFromSource(input: unknown) {
  const { text, sourceLabel } = generateSchema.parse(input);
  return generateFlashcardsFromContent(text.slice(0, MAX_CHARS), sourceLabel);
}

const cardSchema = z.object({
  topic: z.enum(FLASHCARD_TOPICS),
  subtopic: z.string().trim().optional(),
  question: z.string().trim().min(1),
  answer: z.string().trim().min(1),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  tags: z.array(z.string()).default([]),
  sourceSnippet: z.string().trim().optional(),
});

const importSchema = z.object({
  sourceLabel: z.string().trim().min(1),
  cards: z.array(cardSchema).min(1),
});

/**
 * Persists the user-accepted subset of generated cards into the deck, skipping
 * any whose question text closely matches an existing card (duplicate guard).
 */
export async function importGeneratedFlashcards(input: unknown) {
  const { sourceLabel, cards } = importSchema.parse(input);
  const existing = await db.flashcards.list();
  const existingNorm = new Set(existing.map((c) => normalize(c.front)));

  const created = [];
  for (const card of cards as GeneratedFlashcard[]) {
    if (existingNorm.has(normalize(card.question))) continue;
    const saved = await db.flashcards.create({
      front: card.question,
      back: card.answer,
      topic: card.topic,
      subtopic: card.subtopic,
      difficulty: card.difficulty,
      tags: card.tags,
      sourceSnippet: card.sourceSnippet,
      source: "import",
      sourceRef: sourceLabel,
      streak: 0,
      reviewCount: 0,
      lastReviewedAt: null,
      dueAt: new Date().toISOString(),
    });
    created.push(saved);
    existingNorm.add(normalize(card.question));
  }

  revalidatePath("/flashcards");
  revalidatePath("/dashboard");
  return { created, skipped: cards.length - created.length };
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}
