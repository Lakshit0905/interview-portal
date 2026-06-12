"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/data/db";
import { generateFlashcardsFromContent } from "@/lib/ai/flashcard-generator";
import { FLASHCARD_TYPES } from "@/types";
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
    // pdfjs-dist (used by pdf-parse) references `DOMMatrix` at module-load time,
    // which doesn't exist in the Node runtime — polyfill it before importing.
    if (typeof globalThis.DOMMatrix === "undefined") {
      const { default: DOMMatrixPolyfill } = await import("dommatrix");
      globalThis.DOMMatrix = DOMMatrixPolyfill as unknown as typeof DOMMatrix;
    }
    // pdfjs-dist normally spins up its worker via a dynamic `import(workerSrc)`,
    // but that path isn't statically analyzable so Vercel's file tracer doesn't
    // bundle pdf.worker.mjs, causing "Setting up fake worker failed". Pre-load
    // the worker module ourselves (a static import path the tracer *can* see)
    // and register it so pdfjs uses it directly instead of dynamic-importing.
    if (!("pdfjsWorker" in globalThis)) {
      const pdfjsWorker = await import("pdfjs-dist/legacy/build/pdf.worker.mjs");
      (globalThis as unknown as { pdfjsWorker: unknown }).pdfjsWorker = pdfjsWorker;
    }
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      text = result.text;
    } catch (err) {
      console.error("PDF extraction failed:", err);
      throw new Error("Couldn't parse that PDF — it may be scanned/image-based or corrupted.");
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
  targetTopic: z.string().trim().min(1).max(80).optional(),
});

/** Runs the AI/offline pipeline and returns a preview — nothing is persisted yet. */
export async function generateFlashcardsFromSource(input: unknown) {
  const { text, sourceLabel, targetTopic } = generateSchema.parse(input);
  return generateFlashcardsFromContent(text.slice(0, MAX_CHARS), sourceLabel, targetTopic);
}

const cardSchema = z.object({
  topic: z.string().trim().min(1).max(80),
  subtopic: z.string().trim().optional(),
  flashcardType: z.enum(FLASHCARD_TYPES).default("Concept"),
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
      flashcardType: card.flashcardType,
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
