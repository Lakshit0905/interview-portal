import "server-only";
import { FLASHCARD_TOPICS } from "@/types";
import type { Difficulty, FlashcardTopic, PresetFlashcardTopic } from "@/types";

// ── Step 1: extract & normalize ──────────────────────────────────────────────

/**
 * Strips common document noise — page markers, repeated headers/footers, and
 * collapses whitespace — so downstream prompts and heuristics see clean prose.
 */
export function cleanDocumentText(raw: string): string {
  const lines = raw
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    // Drop standalone page numbers / "Page X of Y" / "-- N of M --" markers
    .filter((l) => !/^(page\s+)?\d+(\s+of\s+\d+)?$/i.test(l))
    .filter((l) => !/^--\s*\d+\s+of\s+\d+\s*--$/i.test(l));

  // Collapse consecutive duplicate lines (repeated headers/footers across pages)
  const deduped: string[] = [];
  for (const line of lines) {
    if (deduped[deduped.length - 1] !== line) deduped.push(line);
  }
  return deduped.join("\n").replace(/[ \t]{2,}/g, " ").trim();
}

export function sentencesOf(text: string): string[] {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim().replace(/^[-*•\d.)]+\s*/, ""))
    .filter((s) => s.length > 30 && s.length < 400)
    // A sentence that's itself a question (e.g. a coding-problem statement
    // lifted from a "Java interview questions" PDF) makes a useless "answer" —
    // the offline heuristic would just wrap a question around a question with
    // nothing explanatory in it. Leave those for the question side only.
    .filter((s) => !/\?\s*$/.test(s));
}

export function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Filters near-duplicate items by normalized-text word-overlap. */
export function dedupeByText<T>(items: T[], getText: (item: T) => string): T[] {
  const kept: T[] = [];
  const seen: Set<string>[] = [];
  for (const item of items) {
    const words = new Set(normalize(getText(item)).split(" ").filter((w) => w.length > 3));
    const isDuplicate = seen.some((prev) => {
      const overlap = [...words].filter((w) => prev.has(w)).length;
      const union = new Set([...words, ...prev]).size;
      return union > 0 && overlap / union > 0.6;
    });
    if (!isDuplicate) { kept.push(item); seen.push(words); }
  }
  return kept;
}

export function trim(s: string): string {
  return s.length > 130 ? `${s.slice(0, 127)}…` : s;
}

export function extractSubject(s: string): string {
  const match = s.match(/^(.*?)\s+(is|are)\s+/i);
  const subject = match?.[1]?.trim().replace(/^(the|a|an)\s+/i, "");
  return subject && subject.length < 60 ? subject : trim(s);
}

export function difficultyOf(sentence: string): Difficulty {
  const words = sentence.split(/\s+/).length;
  const advanced = /\b(architecture|trade-off|scal|distributed|consisten|concurrency|latency|edge case|fault|optimi)\b/i.test(sentence);
  if (advanced || words > 35) return "Hard";
  if (words > 20) return "Medium";
  return "Easy";
}

// ── Step 2: topic detection (keyword heuristic, also used to steer AI prompts) ──

export const TOPIC_KEYWORDS: Record<PresetFlashcardTopic, string[]> = {
  Playwright: ["playwright", "locator", "selector", "fixture", "trace viewer", "auto-wait", "page object", "getbyrole", "getbytext", "browser context"],
  TypeScript: ["typescript", "type ", "interface", "generic", "union", "enum", "narrowing", "utility type", "tsconfig"],
  SQL: ["sql", "query", "join", "select", "table", "index", "window function", "group by", "schema", "transaction"],
  API: ["api", "rest", "endpoint", "http", "status code", "graphql", "authentication", "request", "response", "payload", "webhook"],
  AWS: ["aws", "s3", "lambda", "ec2", "cloudwatch", "iam", "dynamodb", "serverless", "cloudformation"],
  Docker: ["docker", "container", "image", "dockerfile", "compose", "volume", "registry", "kubernetes"],
  "CI/CD": ["ci/cd", "pipeline", "github actions", "jenkins", "deploy", "build stage", "continuous integration", "continuous delivery", "artifact"],
  "System Design": ["system design", "scalability", "load balancer", "cache", "microservice", "latency", "throughput", "architecture", "queue", "sharding"],
  Behavioral: ["tell me about a time", "conflict", "leadership", "teamwork", "mentor", "stakeholder", "deadline", "feedback", "star method"],
  GenAI: ["llm", "prompt", "hallucination", "embedding", "rag", "token", "fine-tun", "evaluation set", "ai-as-judge", "generative ai"],
};

export const SUBTOPIC_HINTS: Record<PresetFlashcardTopic, { label: string; keywords: string[] }[]> = {
  Playwright: [
    { label: "Locators", keywords: ["locator", "selector", "getbyrole", "getbytext", "getbytestid", "css", "xpath"] },
    { label: "Fixtures & setup", keywords: ["fixture", "setup", "context", "browser", "config", "project"] },
    { label: "Waiting & assertions", keywords: ["wait", "assert", "expect", "retry", "actionability", "stable"] },
    { label: "Debugging & tooling", keywords: ["trace", "debug", "report", "screenshot", "video", "ci"] },
  ],
  TypeScript: [
    { label: "Types & interfaces", keywords: ["interface", "type ", "shape", "structural"] },
    { label: "Generics & utility types", keywords: ["generic", "partial", "pick", "omit", "record", "utility"] },
    { label: "Narrowing & unions", keywords: ["union", "narrow", "discriminat", "guard", "never"] },
    { label: "Tooling & config", keywords: ["tsconfig", "compiler", "strict", "lint", "build"] },
  ],
  SQL: [
    { label: "Joins & set operations", keywords: ["join", "union", "intersect", "subquery"] },
    { label: "Window functions", keywords: ["window", "partition", "rank", "row_number", "over"] },
    { label: "Indexing & performance", keywords: ["index", "explain", "plan", "performance", "optimi"] },
    { label: "Schema & transactions", keywords: ["schema", "transaction", "constraint", "normaliz", "isolation"] },
  ],
  API: [
    { label: "REST fundamentals", keywords: ["rest", "endpoint", "resource", "verb", "crud"] },
    { label: "Auth & security", keywords: ["auth", "token", "oauth", "jwt", "key", "secret"] },
    { label: "Status codes & errors", keywords: ["status code", "4xx", "5xx", "error", "response"] },
    { label: "Contracts & testing", keywords: ["contract", "schema", "mock", "stub", "test", "validate"] },
  ],
  AWS: [
    { label: "Compute & serverless", keywords: ["lambda", "ec2", "serverless", "function", "compute"] },
    { label: "Storage & data", keywords: ["s3", "dynamodb", "rds", "storage", "bucket"] },
    { label: "Networking & IAM", keywords: ["iam", "vpc", "security group", "role", "policy"] },
    { label: "Monitoring & ops", keywords: ["cloudwatch", "log", "alarm", "metric", "trace"] },
  ],
  Docker: [
    { label: "Images & Dockerfiles", keywords: ["image", "dockerfile", "layer", "build"] },
    { label: "Containers & runtime", keywords: ["container", "run", "process", "isolation"] },
    { label: "Compose & orchestration", keywords: ["compose", "kubernetes", "orchestrat", "service"] },
    { label: "Volumes & networking", keywords: ["volume", "network", "port", "mount"] },
  ],
  "CI/CD": [
    { label: "Pipeline design", keywords: ["pipeline", "stage", "workflow", "job"] },
    { label: "Build & test automation", keywords: ["build", "test", "automat", "runner"] },
    { label: "Deployment strategies", keywords: ["deploy", "release", "rollback", "canary", "blue-green"] },
    { label: "Tooling", keywords: ["github actions", "jenkins", "gitlab", "artifact", "registry"] },
  ],
  "System Design": [
    { label: "Scalability & performance", keywords: ["scal", "latency", "throughput", "performance", "load"] },
    { label: "Data & caching", keywords: ["cache", "database", "replicat", "shard", "consisten"] },
    { label: "Architecture patterns", keywords: ["microservice", "monolith", "queue", "event", "architecture"] },
    { label: "Reliability & trade-offs", keywords: ["availability", "fault", "trade-off", "redundan", "failover"] },
  ],
  Behavioral: [
    { label: "Leadership & ownership", keywords: ["lead", "own", "initiative", "decision"] },
    { label: "Conflict & collaboration", keywords: ["conflict", "disagree", "team", "stakeholder", "collaborat"] },
    { label: "Growth & feedback", keywords: ["feedback", "mentor", "learn", "mistake", "growth"] },
    { label: "Delivery under pressure", keywords: ["deadline", "pressure", "priorit", "scope", "trade-off"] },
  ],
  GenAI: [
    { label: "Prompting & evaluation", keywords: ["prompt", "eval", "rubric", "judge", "score"] },
    { label: "RAG & retrieval", keywords: ["rag", "retriev", "embedding", "vector", "context"] },
    { label: "Reliability & hallucination", keywords: ["hallucinat", "faithful", "factual", "grounded"] },
    { label: "Tooling & infrastructure", keywords: ["token", "model", "fine-tun", "latency", "cost"] },
  ],
};

export function detectTopics(text: string): FlashcardTopic[] {
  const lower = text.toLowerCase();
  const scored = FLASHCARD_TOPICS
    .map((topic) => ({
      topic,
      hits: TOPIC_KEYWORDS[topic].reduce((sum, kw) => sum + (lower.includes(kw) ? 1 : 0), 0),
    }))
    .filter((t) => t.hits > 0)
    .sort((a, b) => b.hits - a.hits);
  return (scored.length ? scored : [{ topic: "System Design" as FlashcardTopic, hits: 0 }])
    .slice(0, 4)
    .map((t) => t.topic);
}

export function subtopicFor(topic: FlashcardTopic, sentence: string): string {
  const lower = sentence.toLowerCase();
  const hints = SUBTOPIC_HINTS[topic as PresetFlashcardTopic] ?? [];
  const hint = hints.find((h) => h.keywords.some((kw) => lower.includes(kw)));
  return hint?.label ?? "Fundamentals";
}
