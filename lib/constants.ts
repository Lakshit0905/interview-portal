import type { Difficulty, KnowledgeCategory } from "@/types";

export const KNOWLEDGE_CATEGORIES: KnowledgeCategory[] = [
  {
    slug: "playwright", title: "Playwright", icon: "Theater", accent: "green",
    description: "End-to-end automation: concepts, framework design & real interview questions.",
    sections: ["Concepts", "Interview Questions", "Framework Design Notes", "Real Interview Questions"],
  },
  {
    slug: "typescript", title: "TypeScript", icon: "FileCode2", accent: "blue",
    description: "Language fundamentals through advanced types, OOP and design patterns.",
    sections: ["Basics", "Advanced Concepts", "OOP", "Design Patterns"],
  },
  {
    slug: "api-testing", title: "API Testing", icon: "Network", accent: "violet",
    description: "REST, GraphQL, authentication strategies and contract testing.",
    sections: ["REST", "GraphQL", "Authentication", "Contract Testing"],
  },
  {
    slug: "sql", title: "SQL", icon: "Database", accent: "amber",
    description: "Queries, joins, window functions and the questions interviewers love.",
    sections: ["Queries", "Joins", "Window Functions", "Interview Questions"],
  },
  {
    slug: "cicd", title: "CI/CD", icon: "GitBranch", accent: "green",
    description: "GitHub Actions, Jenkins pipelines and Docker for test infrastructure.",
    sections: ["GitHub Actions", "Jenkins", "Docker"],
  },
  {
    slug: "aws", title: "AWS", icon: "Cloud", accent: "amber",
    description: "Cloud building blocks relevant to test platforms: EC2, S3, Lambda.",
    sections: ["EC2", "S3", "Lambda"],
  },
  {
    slug: "genai", title: "GenAI Testing", icon: "Sparkles", accent: "violet",
    description: "Prompt regression, LLM evaluation, RAG testing and hallucination checks.",
    sections: ["Prompt Regression", "LLM Evaluation", "RAG Testing", "Hallucination Testing"],
  },
  {
    slug: "system-design", title: "System Design", icon: "Workflow", accent: "blue",
    description: "Architect test platforms, data services and contract-testing systems.",
    sections: ["Architecture", "Design Questions", "Sample Answers"],
  },
];

export const ACCENT_CLASS: Record<string, { text: string; bg: string; ring: string; dot: string }> = {
  green:  { text: "text-signal-green",  bg: "bg-signal-green/10",  ring: "ring-signal-green/30",  dot: "bg-signal-green" },
  amber:  { text: "text-signal-amber",  bg: "bg-signal-amber/10",  ring: "ring-signal-amber/30",  dot: "bg-signal-amber" },
  red:    { text: "text-signal-red",    bg: "bg-signal-red/10",    ring: "ring-signal-red/30",    dot: "bg-signal-red" },
  blue:   { text: "text-signal-blue",   bg: "bg-signal-blue/10",   ring: "ring-signal-blue/30",   dot: "bg-signal-blue" },
  violet: { text: "text-signal-violet", bg: "bg-signal-violet/10", ring: "ring-signal-violet/30", dot: "bg-signal-violet" },
  slate:  { text: "text-signal-slate",  bg: "bg-signal-slate/10",  ring: "ring-signal-slate/30",  dot: "bg-signal-slate" },
};

export const DIFFICULTY_ACCENT: Record<string, string> = {
  Easy: "green", Medium: "amber", Hard: "red",
};

// Canonical pipeline status → accent color (gray / blue / purple / orange / green / red).
export const STATUS_ACCENT: Record<string, string> = {
  Applied: "slate", "Recruiter Screen": "blue", "Technical Round": "violet",
  "Final Round": "amber", Offer: "green", Rejected: "red",
};

// ── Coding progress dashboard ────────────────────────────────────────────────
/** Estimated minutes spent per problem, by difficulty — used to derive "time spent coding". */
export const DIFFICULTY_TIME_MINUTES: Record<Difficulty, number> = {
  Easy: 15, Medium: 30, Hard: 45,
};

/** Problems solved in a topic at which "pattern mastery" reaches 100%. */
export const PATTERN_MASTERY_TARGET = 8;

/** Personal target for total problems solved, shown as a goal-progress badge. */
export const CODING_GOAL_TOTAL = 150;
