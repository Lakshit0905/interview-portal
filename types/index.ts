// ── Domain model ─────────────────────────────────────────────────────────────
// These types are the single source of truth shared by the JSON driver and the
// (future) Prisma driver. Keep them framework-agnostic.

export type Difficulty = "Easy" | "Medium" | "Hard";

export type CodingStatus = "todo" | "solved" | "revisit";

export const CODING_TOPICS = [
  "Arrays", "Strings", "HashMaps", "Trees", "Graphs",
  "Dynamic Programming", "Recursion", "Sliding Window", "Two Pointers",
] as const;
export type CodingTopic = (typeof CODING_TOPICS)[number];

export interface CodingProblem {
  id: string;
  name: string;
  difficulty: Difficulty;
  topic: CodingTopic;
  status: CodingStatus;
  solution: string;
  timeComplexity: string;
  spaceComplexity: string;
  notes: string;
  url?: string;
  revisitDate?: string | null; // ISO date
  createdAt: string;
  updatedAt: string;
}

export const QUESTION_CATEGORIES = [
  "Playwright", "TypeScript", "SQL", "API", "AWS",
  "Docker", "CI/CD", "System Design", "Behavioral",
] as const;
export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number];

export interface InterviewQuestion {
  id: string;
  question: string;
  category: QuestionCategory;
  answer: string;
  difficulty: Difficulty;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BehavioralStory {
  id: string;
  title: string;
  theme: string; // e.g. "Flaky Test Reduction", "Leadership"
  situation: string;
  task: string;
  action: string;
  result: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SystemDesign {
  id: string;
  title: string;
  summary: string;
  diagram: string; // ascii / mermaid-like text
  notes: string;
  questions: string[];
  sampleAnswer: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  label: string;        // e.g. "SDET v3 — Platform focus"
  version: string;      // semantic-ish version string
  targetCompany?: string;
  fileName?: string;    // stored file in /public/resumes or external link
  fileUrl?: string;
  notes: string;
  content?: string;     // optional plain-text dump used by the analyzer
  createdAt: string;
  updatedAt: string;
}

export const INTERVIEW_STATUSES = [
  "Applied", "Recruiter Screen", "Technical Round", "Final Round", "Offer", "Rejected",
] as const;
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number];

export interface Interview {
  id: string;
  company: string;
  position: string;
  recruiter?: string;
  interviewDate?: string | null; // ISO
  round: string;
  status: InterviewStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Knowledge base (MDX-backed, read-only at runtime) ────────────────────────
export interface KnowledgeCategory {
  slug: string;
  title: string;
  description: string;
  icon: string; // lucide icon name
  accent: keyof typeof ACCENTS;
  sections: string[];
}

export const ACCENTS = {
  green: "signal-green",
  amber: "signal-amber",
  red: "signal-red",
  blue: "signal-blue",
  violet: "signal-violet",
} as const;

export interface KnowledgeNote {
  category: string;
  slug: string;
  title: string;
  description: string;
  section?: string;
  tags: string[];
  updatedAt: string;
  readingTime: number; // minutes
  content: string; // raw mdx
}

export interface SearchResult {
  type: "note" | "coding" | "question" | "behavioral";
  id: string;
  title: string;
  snippet: string;
  href: string;
  meta?: string;
}
