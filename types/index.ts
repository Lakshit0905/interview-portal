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
  location?: string;
  salaryRange?: string;
  interviewType?: string; // e.g. "Onsite", "Virtual", "Phone Screen", "Technical"
  recruiter?: string;
  interviewDate?: string | null; // ISO
  round: string;
  roundsCompleted?: number;
  roundsTotal?: number;
  readinessScore?: number; // 0–100
  status: InterviewStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ── Flashcards (spaced repetition) ──────────────────────────────────────────
export const FLASHCARD_TOPICS = [
  "Playwright", "TypeScript", "SQL", "API", "AWS",
  "Docker", "CI/CD", "System Design", "Behavioral", "GenAI",
] as const;
export type FlashcardTopic = (typeof FLASHCARD_TOPICS)[number];

/** Days until next review at each step of the schedule, indexed by streak (0-based). */
export const REVIEW_INTERVALS_DAYS = [1, 3, 7, 14, 30] as const;

export type FlashcardSource = "manual" | "note" | "video" | "question" | "import";

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  topic: FlashcardTopic;
  subtopic?: string; // free-form refinement, e.g. AI-detected subtopic within `topic`
  difficulty: Difficulty;
  tags?: string[];
  sourceSnippet?: string; // excerpt of the source material the card was derived from
  source: FlashcardSource;
  sourceRef?: string; // e.g. note slug, video id, question id, uploaded document name
  streak: number; // index into REVIEW_INTERVALS_DAYS — how many correct reviews in a row
  reviewCount: number;
  lastReviewedAt: string | null; // ISO
  dueAt: string; // ISO — when this card is next due
  createdAt: string;
  updatedAt: string;
}

export type FlashcardGrade = "again" | "good";

// ── AI Flashcard Generator (document → structured deck) ─────────────────────
export interface GeneratedFlashcard {
  topic: FlashcardTopic;
  subtopic: string;
  question: string;
  answer: string;
  difficulty: Difficulty;
  tags: string[];
  sourceSnippet: string;
}

export interface GeneratedTopicGroup {
  topic: string;
  subtopics: string[];
}

export interface FlashcardGenerationResult {
  enabled: boolean;
  summary: string;
  topics: GeneratedTopicGroup[];
  insights: string[];
  weakAreas: string[];
  revisionPlan: string[];
  cards: GeneratedFlashcard[];
}

// ── Learning Roadmap ─────────────────────────────────────────────────────────
export interface RoadmapTopic {
  id: string;
  title: string;
  done: boolean;
  estimatedHours: number;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  accent: keyof typeof ACCENTS;
  icon: string; // lucide icon name
  topics: RoadmapTopic[];
  createdAt: string;
  updatedAt: string;
}

// ── Company Preparation Hub ──────────────────────────────────────────────────
export interface CompanyRound {
  name: string;
  description: string;
}

export interface CompanyFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface CompanyChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface CompanyPrep {
  id: string;
  slug: string;
  name: string;
  industry: string;
  process: CompanyRound[];
  focusAreas: string[];
  faqs: CompanyFAQ[];
  notes: string;
  experiences: string;
  checklist: CompanyChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

// ── Video Learning Hub ───────────────────────────────────────────────────────
export interface VideoConcept {
  id: string;
  term: string;
  explanation: string;
}

export interface VideoQA {
  id: string;
  question: string;
  answer: string;
}

export interface VideoFlashcard {
  id: string;
  front: string;
  back: string;
}

export interface VideoMCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export type VideoStatus = "ready" | "processing" | "failed";

export interface VideoLesson {
  id: string;
  url: string;
  title: string;
  channel: string;
  topic: string;
  durationMinutes: number;
  transcript: string;
  summary: string;
  notes: string; // long-form mdx-ish notes
  concepts: VideoConcept[];
  questions: VideoQA[];
  flashcards: VideoFlashcard[];
  revisionNotes: string; // markdown bullet list
  cheatSheet: string; // markdown table/snippet
  mcqs: VideoMCQ[];
  status: VideoStatus;
  generatedByAi: boolean;
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
