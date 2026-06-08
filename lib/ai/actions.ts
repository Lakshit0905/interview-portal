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
    .filter((s) => s.length > 25);
}

/** Deterministic offline generator — composes a structured lesson from the transcript and metadata. */
function offlineVideoLesson(title: string, topic: string, transcript: string): Omit<GeneratedVideoLesson, "enabled"> {
  const sentences = sentencesOf(transcript);
  const lead = sentences.slice(0, 6);
  const pick = (i: number, fallback: string) => lead[i] ?? fallback;

  const summary = (lead.slice(0, 2).join(" ") || transcript.slice(0, 240)).slice(0, 360);

  const notes =
`## Overview
${pick(0, `This lesson covers "${title}", a ${topic} topic worth drilling before interviews.`)}

## Key points
${lead.map((s) => `- ${s}`).join("\n") || `- Revisit the source video for "${title}" and paste its transcript to get fuller notes.`}

## Why it matters for interviews
Be ready to explain the core idea behind "${title}" out loud, walk through a concrete example, and discuss trade-offs an interviewer might probe on.`;

  const concepts: VideoConcept[] = lead.slice(0, 4).map((s, i) => ({
    id: `oc${i + 1}`,
    term: `Key idea ${i + 1}`,
    explanation: s,
  }));
  if (!concepts.length) {
    concepts.push({ id: "oc1", term: title, explanation: `Core concept introduced in "${title}" — paste a transcript for richer, AI-extracted concepts.` });
  }

  const questions: VideoQA[] = [
    { id: "oq1", question: `In your own words, what is the main idea behind "${title}"?`, answer: pick(0, `Summarize the central claim of "${title}" and why it matters for ${topic}.`) },
    { id: "oq2", question: `What's a concrete example or scenario from this video that illustrates the idea?`, answer: pick(1, `Recall a specific example from the video and explain what it demonstrated.`) },
    { id: "oq3", question: `What trade-off or limitation did the video call out?`, answer: pick(2, `Identify a trade-off, gotcha, or anti-pattern mentioned and why it matters in practice.`) },
    { id: "oq4", question: `How would you apply this in a real ${topic} interview answer?`, answer: `Connect "${title}" to a project you've worked on, and be ready to explain the "why," not just the "what."` },
  ];

  const flashcards: VideoFlashcard[] = lead.slice(0, 4).map((s, i) => ({
    id: `of${i + 1}`,
    front: `${title} — point ${i + 1}`,
    back: s,
  }));
  if (!flashcards.length) {
    flashcards.push({ id: "of1", front: title, back: `Set ANTHROPIC_API_KEY and re-generate, or paste a transcript for richer flashcards.` });
  }

  const revisionNotes = lead.length
    ? lead.map((s) => `- ${s}`).join("\n")
    : `- Revisit "${title}" — paste its transcript to generate richer revision notes.`;

  const cheatSheet =
`| Topic | Takeaway |
|---|---|
| ${topic} | ${pick(0, title)} |
| Watch for | ${pick(1, "the trade-offs and edge cases called out in the video")} |
| Practice | Explain "${title}" out loud in under 90 seconds |`;

  const mcqs: VideoMCQ[] = [
    {
      id: "om1",
      question: `What is "${title}" primarily about?`,
      options: [pick(0, `The core idea covered in the video`), "An unrelated marketing topic", "A history lecture with no technical content", "A product announcement only"],
      correctIndex: 0,
      explanation: `The video's central focus is summarized in its opening points — re-anchor on those when answering interview questions about ${topic}.`,
    },
    {
      id: "om2",
      question: `Which best describes the practical takeaway from this lesson?`,
      options: ["Memorize the title verbatim", pick(1, `Apply the core idea to real ${topic} scenarios`), "Skip it — it's not interview-relevant", "Only relevant to beginners"],
      correctIndex: 1,
      explanation: `Interview answers land best when you connect the idea to a concrete scenario rather than reciting definitions.`,
    },
  ];

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
