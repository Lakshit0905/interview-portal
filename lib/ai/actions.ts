"use server";
import { llm, parseJson, AI_ENABLED } from "./client";

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
