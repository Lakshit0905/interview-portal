"use server";
import { llm, parseJson, AI_ENABLED } from "./client";
import type { VideoConcept, VideoQA, VideoFlashcard, VideoMCQ } from "@/types";

// ── Interview Question Generator ─────────────────────────────────────────────
export interface GeneratedQuestions {
  enabled: boolean;
  beginner: string[];
  intermediate: string[];
  senior: string[];
}

const OFFLINE_QUESTIONS: Record<string, GeneratedQuestions> = {};

export async function generateQuestions(topic: string): Promise<GeneratedQuestions> {
  const t = topic.trim() || "Test Automation";
  if (AI_ENABLED) {
    try {
      const text = await llm(
        "You are a senior SDET interviewer. Return ONLY JSON.",
        [{ role: "user", content:
          `Generate interview questions about "${t}" for a Senior SDET / QA Automation Engineer. ` +
          `Return JSON: {"beginner":[5 strings],"intermediate":[5 strings],"senior":[5 strings]}.` }],
      );
      const parsed = parseJson(text, { beginner: [], intermediate: [], senior: [] });
      return { enabled: true, ...parsed };
    } catch { /* fall through */ }
  }
  // Offline heuristic generator — composes plausible prompts from templates.
  const beginner = [
    `What is ${t} and when would you use it in a test suite?`,
    `Explain the core building blocks of ${t}.`,
    `What problem does ${t} solve compared to the alternatives?`,
    `Walk through a basic example using ${t}.`,
    `What are common beginner mistakes with ${t}?`,
  ];
  const intermediate = [
    `How do you keep ${t} maintainable as a suite grows?`,
    `Describe how you'd debug a flaky scenario involving ${t}.`,
    `How does ${t} fit into a CI/CD pipeline?`,
    `What trade-offs have you made when applying ${t}?`,
    `How do you measure the quality or coverage of ${t}?`,
  ];
  const senior = [
    `Design a strategy for adopting ${t} across multiple teams.`,
    `How would you architect ${t} for scale and reliability?`,
    `Tell me about a hard ${t} problem you solved and the trade-offs.`,
    `How do you mentor engineers on ${t} best practices?`,
    `Where does ${t} break down, and how do you mitigate it?`,
  ];
  return { enabled: false, beginner, intermediate, senior };
}

// ── Mock Interview ───────────────────────────────────────────────────────────
export interface MockEvaluation {
  enabled: boolean;
  score: number;       // 0–10
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
}

export async function evaluateAnswer(question: string, answer: string): Promise<MockEvaluation> {
  if (AI_ENABLED && answer.trim()) {
    try {
      const text = await llm(
        "You are a tough but fair Senior SDET interviewer. Return ONLY JSON.",
        [{ role: "user", content:
          `Question: ${question}\nCandidate answer: ${answer}\n` +
          `Evaluate. Return JSON: {"score":0-10,"strengths":[..],"improvements":[..],"modelAnswer":"2-4 sentences"}.` }],
      );
      const parsed = parseJson(text, { score: 5, strengths: [], improvements: [], modelAnswer: "" });
      return { enabled: true, ...parsed };
    } catch { /* fall through */ }
  }
  // Offline heuristic: score by structure & keyword signal.
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasStructure = /because|first|then|finally|trade|measure|result/i.test(answer);
  let score = Math.min(10, Math.round(words / 25) + (hasStructure ? 3 : 0));
  if (!words) score = 0;
  return {
    enabled: false,
    score,
    strengths: words > 40 ? ["Sufficient detail and length"] : ["You attempted the question"],
    improvements: [
      words < 40 ? "Add more specific, concrete detail" : "Tighten the structure",
      hasStructure ? "Quantify outcomes with metrics" : "Use a clear structure (claim → reasoning → result)",
    ],
    modelAnswer: "Structure your answer as: a direct claim, the reasoning or approach, a concrete example, and a measurable result. (Set ANTHROPIC_API_KEY for AI-graded feedback.)",
  };
}

export async function nextMockQuestion(topic: string, asked: string[]): Promise<string> {
  if (AI_ENABLED) {
    try {
      const text = await llm(
        "You are a Senior SDET interviewer. Reply with ONE question only, no preamble.",
        [{ role: "user", content:
          `Topic: ${topic || "general SDET"}. Already asked: ${asked.join("; ") || "none"}. ` +
          `Ask the next interview question. Vary difficulty.` }],
        200,
      );
      if (text) return text.replace(/^["']|["']$/g, "");
    } catch { /* fall through */ }
  }
  const bank = [
    "How do you decide what to automate versus test manually?",
    "Walk me through how you'd reduce flakiness in an E2E suite.",
    "How do you design test data so tests stay independent?",
    "Explain your approach to API contract testing.",
    "How would you set up parallel test execution in CI?",
    "How do you evaluate the quality of an LLM-powered feature?",
    "Describe a test framework you designed and the key decisions.",
  ];
  const remaining = bank.filter((q) => !asked.includes(q));
  return (remaining[0] ?? bank[asked.length % bank.length]);
}

// ── Resume Analyzer ──────────────────────────────────────────────────────────
export interface ResumeAnalysis {
  enabled: boolean;
  atsScore: number; // 0–100
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

const STOP = new Set("the a an and or for to of in on with your you we our are is be as at by".split(" "));

function keywords(text: string): Set<string> {
  return new Set(
    text.toLowerCase().match(/[a-z][a-z0-9+.#-]{2,}/g)?.filter((w) => !STOP.has(w)) ?? [],
  );
}

export async function analyzeResume(resume: string, jobDescription: string): Promise<ResumeAnalysis> {
  if (AI_ENABLED && resume.trim() && jobDescription.trim()) {
    try {
      const text = await llm(
        "You are an expert technical recruiter and ATS. Return ONLY JSON.",
        [{ role: "user", content:
          `RESUME:\n${resume}\n\nJOB DESCRIPTION:\n${jobDescription}\n\n` +
          `Return JSON: {"atsScore":0-100,"matchedSkills":[..],"missingSkills":[..],"suggestions":[3-5 strings]}.` }],
        1400,
      );
      const parsed = parseJson(text, { atsScore: 0, matchedSkills: [], missingSkills: [], suggestions: [] });
      return { enabled: true, ...parsed };
    } catch { /* fall through */ }
  }
  // Offline keyword-overlap analysis.
  const jd = keywords(jobDescription);
  const cv = keywords(resume);
  const matched = [...jd].filter((k) => cv.has(k));
  const missing = [...jd].filter((k) => !cv.has(k));
  const atsScore = jd.size ? Math.round((matched.length / jd.size) * 100) : 0;
  return {
    enabled: false,
    atsScore,
    matchedSkills: matched.slice(0, 25),
    missingSkills: missing.slice(0, 25),
    suggestions: [
      "Mirror the exact phrasing of key skills from the job description.",
      "Lead bullets with quantified impact (%, time saved, scale).",
      "Add a skills line that includes the missing keywords you actually have.",
      "Set ANTHROPIC_API_KEY for AI-written, context-aware suggestions.",
    ],
  };
}

// ── Video Learning Hub ───────────────────────────────────────────────────────
export interface GeneratedVideoLesson {
  enabled: boolean;
  summary: string;
  notes: string;
  concepts: VideoConcept[];
  questions: VideoQA[];
  flashcards: VideoFlashcard[];
  revisionNotes: string;
  cheatSheet: string;
  mcqs: VideoMCQ[];
}

const EMPTY_VIDEO_LESSON: Omit<GeneratedVideoLesson, "enabled"> = {
  summary: "", notes: "", concepts: [], questions: [], flashcards: [], revisionNotes: "", cheatSheet: "", mcqs: [],
};

function sentencesOf(transcript: string): string[] {
  return transcript
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 25 && !/\?\s*$/.test(s));
}

/** Pick evenly-spaced items across an array so all sections of the transcript are represented. */
function spread<T>(arr: T[], count: number): T[] {
  if (arr.length <= count) return arr;
  return Array.from({ length: count }, (_, i) => arr[Math.round((i / (count - 1)) * (arr.length - 1))]);
}

/** Extract a short label from a sentence (first 4–7 words, title-cased). */
function labelOf(sentence: string): string {
  const words = sentence.replace(/[^a-zA-Z0-9 ]/g, "").split(/\s+/).slice(0, 6);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

/**
 * Deterministic offline generator — extracts structured study material from the
 * full transcript instead of just its first few sentences. Samples evenly across
 * the transcript so all parts of the video are represented in every output section.
 */
function offlineVideoLesson(title: string, topic: string, transcript: string): Omit<GeneratedVideoLesson, "enabled"> {
  const all = sentencesOf(transcript);
  const total = all.length;

  // ── Summary ─────────────────────────────────────────────────────────────────
  const summaryParts = spread(all, 3);
  const summary = summaryParts.join(" ").slice(0, 420);

  // ── Notes ────────────────────────────────────────────────────────────────────
  // Divide the transcript into three logical thirds: intro / core / wrap-up
  const third = Math.ceil(total / 3);
  const opening = all.slice(0, third);
  const core    = all.slice(third, third * 2);
  const closing = all.slice(third * 2);

  const bulletBlock = (items: string[]) =>
    items.length ? items.map((s) => `- ${s}`).join("\n") : `- (no content extracted for this section)`;

  const notes =
`## Overview
${bulletBlock(opening)}

## Core Concepts
${bulletBlock(core)}

## Key Takeaways
${bulletBlock(closing)}

## Why It Matters for Interviews
Being fluent in **${topic}** means explaining the core mechanism clearly, giving a concrete example, and calling out the trade-offs — not just reciting a definition.`;

  // ── Concepts ─────────────────────────────────────────────────────────────────
  const conceptSentences = spread(all, 6);
  const concepts: VideoConcept[] = conceptSentences.map((s, i) => ({
    id: `oc${i + 1}`,
    term: labelOf(s),
    explanation: s,
  }));

  // ── Q&A ──────────────────────────────────────────────────────────────────────
  // Pair each Q with a sentence drawn from the relevant third of the transcript.
  const qPick = (idx: number) => all[Math.min(idx, all.length - 1)] ?? "";
  const questions: VideoQA[] = [
    {
      id: "oq1",
      question: `What is the central idea introduced in "${title}"?`,
      answer: qPick(0),
    },
    {
      id: "oq2",
      question: `What is explained in the middle section of this video?`,
      answer: qPick(Math.floor(total * 0.35)),
    },
    {
      id: "oq3",
      question: `What does the video cover in its second half?`,
      answer: qPick(Math.floor(total * 0.6)),
    },
    {
      id: "oq4",
      question: `What is the key takeaway or conclusion of "${title}"?`,
      answer: qPick(Math.max(0, total - 2)),
    },
    {
      id: "oq5",
      question: `How would you apply what you learned here in a ${topic} interview?`,
      answer: `Connect the core concept to a real scenario: explain what it is, why it matters, and how you have used or would use it in practice. Use a concrete example from this video or your own work.`,
    },
  ];

  // ── Flashcards ───────────────────────────────────────────────────────────────
  const flashSentences = spread(all, 6);
  const flashcards: VideoFlashcard[] = flashSentences.map((s, i) => ({
    id: `of${i + 1}`,
    front: labelOf(s) + "?",
    back: s,
  }));

  // ── Revision notes ────────────────────────────────────────────────────────────
  const revisionSentences = spread(all, Math.min(total, 10));
  const revisionNotes = revisionSentences.map((s) => `- ${s}`).join("\n");

  // ── Cheat sheet ───────────────────────────────────────────────────────────────
  const cheatRows = spread(all, 6).map((s) => `| ${labelOf(s)} | ${s} |`).join("\n");
  const cheatSheet =
`| Concept | Explanation |
|---|---|
${cheatRows}`;

  // ── MCQ quiz ──────────────────────────────────────────────────────────────────
  // Build distractors from other sentences in the transcript.
  function mcqDistractors(correct: string): string[] {
    const pool = all.filter((s) => s !== correct);
    const picks = spread(pool, 3);
    return picks.length === 3 ? picks : [...picks, "None of the above", "All of the above"].slice(0, 3);
  }

  const mcqSeeds = spread(all, 4);
  const mcqs: VideoMCQ[] = mcqSeeds.map((seed, i) => {
    const distractors = mcqDistractors(seed);
    const correctIndex = Math.floor(Math.random() * 4); // randomise correct slot
    const opts = [...distractors];
    opts.splice(correctIndex, 0, seed);
    return {
      id: `om${i + 1}`,
      question: `Which statement from "${title}" is accurate?`,
      options: opts.slice(0, 4),
      correctIndex,
      explanation: seed,
    };
  });

  return { summary, notes, concepts, questions, flashcards, revisionNotes, cheatSheet, mcqs };
}

/**
 * Turns a pasted transcript into a full structured lesson — summary, notes, concepts,
 * Q&A, flashcards, revision notes, cheat sheet, and an MCQ quiz. Uses Claude when
 * configured; otherwise falls back to a deterministic transcript-derived heuristic.
 */
export async function generateVideoLesson(title: string, channel: string, topic: string, transcript: string): Promise<GeneratedVideoLesson> {
  const text = transcript.trim();
  if (!text) return { enabled: false, ...EMPTY_VIDEO_LESSON };

  if (AI_ENABLED) {
    try {
      const raw = await llm(
        "You are an expert SDET tutor turning video transcripts into structured study material. Return ONLY JSON.",
        [{ role: "user", content:
          `Video title: "${title}" by ${channel}. Topic: ${topic}.\n\nTRANSCRIPT:\n${text.slice(0, 12000)}\n\n` +
          `Produce study material as JSON with this exact shape:\n` +
          `{"summary":"2-3 sentence overview",` +
          `"notes":"long-form markdown notes with headers and bullet lists",` +
          `"concepts":[{"id":"c1","term":"...","explanation":"..."}, ... 4-6 items],` +
          `"questions":[{"id":"q1","question":"...","answer":"..."}, ... 4-6 items],` +
          `"flashcards":[{"id":"f1","front":"...","back":"..."}, ... 4-6 items],` +
          `"revisionNotes":"markdown bullet list of the highest-yield points",` +
          `"cheatSheet":"a compact markdown reference table or snippet",` +
          `"mcqs":[{"id":"m1","question":"...","options":["a","b","c","d"],"correctIndex":0,"explanation":"..."}, ... 4-6 items]}` },
        ],
        4000,
      );
      const parsed = parseJson<Omit<GeneratedVideoLesson, "enabled">>(raw, EMPTY_VIDEO_LESSON);
      if (parsed.summary && parsed.notes) return { enabled: true, ...parsed };
    } catch { /* fall through */ }
  }

  return { enabled: false, ...offlineVideoLesson(title, topic, text) };
}
