import "server-only";
import { llm, parseJson, AI_ENABLED } from "./client";
import { FLASHCARD_TOPICS } from "@/types";
import type { Difficulty, FlashcardTopic, FlashcardGenerationResult, GeneratedFlashcard } from "@/types";

const EMPTY_RESULT: Omit<FlashcardGenerationResult, "enabled"> = {
  summary: "", topics: [], insights: [], weakAreas: [], revisionPlan: [], cards: [],
};

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

function sentencesOf(text: string): string[] {
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

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
}

/** Filters near-duplicate cards by normalized-question word-overlap. */
function dedupeCards(cards: GeneratedFlashcard[]): GeneratedFlashcard[] {
  const kept: GeneratedFlashcard[] = [];
  const seen: Set<string>[] = [];
  for (const card of cards) {
    const words = new Set(normalize(card.question).split(" ").filter((w) => w.length > 3));
    const isDuplicate = seen.some((prev) => {
      const overlap = [...words].filter((w) => prev.has(w)).length;
      const union = new Set([...words, ...prev]).size;
      return union > 0 && overlap / union > 0.6;
    });
    if (!isDuplicate) { kept.push(card); seen.push(words); }
  }
  return kept;
}

// ── Step 2: topic detection (keyword heuristic, also used to steer the AI prompt) ──

const TOPIC_KEYWORDS: Record<FlashcardTopic, string[]> = {
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

const SUBTOPIC_HINTS: Record<FlashcardTopic, { label: string; keywords: string[] }[]> = {
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

function detectTopics(text: string): FlashcardTopic[] {
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

function subtopicFor(topic: FlashcardTopic, sentence: string): string {
  const lower = sentence.toLowerCase();
  const hint = SUBTOPIC_HINTS[topic].find((h) => h.keywords.some((kw) => lower.includes(kw)));
  return hint?.label ?? "Fundamentals";
}

// ── Step 3 + 4: generate atomic, interview-style flashcards with smart structuring ──

const QUESTION_STEMS: { test: (s: string) => boolean; build: (s: string, topic: string) => string }[] = [
  { test: (s) => /\b(is|are)\s+(a|an|the)\b/i.test(s), build: (s) => `What is ${extractSubject(s)}, and why does it matter?` },
  { test: (s) => /\b(should|must|avoid|never|always)\b/i.test(s), build: (s, t) => `What best practice does this highlight for ${t}, and what happens if you ignore it: "${trim(s)}"?` },
  { test: (s) => /\b(because|since|so that|in order to)\b/i.test(s), build: (s, t) => `Why does this matter in ${t}: "${trim(s)}"?` },
  { test: (s) => /\b(vs\.?|versus|compared to|rather than|instead of)\b/i.test(s), build: (s) => `What's the trade-off being described here: "${trim(s)}"?` },
  { test: () => true, build: (s, t) => `In a ${t} interview, how would you explain: "${trim(s)}"?` },
];

function trim(s: string): string {
  return s.length > 130 ? `${s.slice(0, 127)}…` : s;
}

function extractSubject(s: string): string {
  const match = s.match(/^(.*?)\s+(is|are)\s+/i);
  const subject = match?.[1]?.trim().replace(/^(the|a|an)\s+/i, "");
  return subject && subject.length < 60 ? subject : trim(s);
}

function difficultyOf(sentence: string): Difficulty {
  const words = sentence.split(/\s+/).length;
  const advanced = /\b(architecture|trade-off|scal|distributed|consisten|concurrency|latency|edge case|fault|optimi)\b/i.test(sentence);
  if (advanced || words > 35) return "Hard";
  if (words > 20) return "Medium";
  return "Easy";
}

function offlineGenerate(text: string, sourceLabel: string): Omit<FlashcardGenerationResult, "enabled"> {
  const sentences = sentencesOf(text);
  const topics = detectTopics(text);

  const cardsByTopic = new Map<FlashcardTopic, GeneratedFlashcard[]>();
  for (const topic of topics) {
    const lower = TOPIC_KEYWORDS[topic];
    const matched = sentences.filter((s) => {
      const ls = s.toLowerCase();
      return lower.some((kw) => ls.includes(kw));
    });
    const pool = (matched.length ? matched : sentences).slice(0, 8);

    const cards = pool.map((sentence) => {
      const subtopic = subtopicFor(topic, sentence);
      const stem = QUESTION_STEMS.find((q) => q.test(sentence))!;
      return {
        topic,
        subtopic,
        question: stem.build(sentence, topic),
        answer: sentence,
        difficulty: difficultyOf(sentence),
        tags: [topic, subtopic],
        sourceSnippet: trim(sentence),
      } satisfies GeneratedFlashcard;
    });
    cardsByTopic.set(topic, dedupeCards(cards));
  }

  const allCards = dedupeCards([...cardsByTopic.values()].flat()).slice(0, 28);

  const topicGroups: { topic: string; subtopics: string[] }[] = topics.map((topic) => ({
    topic,
    subtopics: [...new Set((cardsByTopic.get(topic) ?? []).map((c) => c.subtopic))],
  }));

  const lead = sentences.slice(0, 3).join(" ");
  const summary = (lead || text.slice(0, 280)).slice(0, 360) ||
    `Generated from "${sourceLabel}" — ${allCards.length} atomic cards across ${topics.length} topic${topics.length === 1 ? "" : "s"}.`;

  const insights = [
    `Detected ${topics.length} topic${topics.length === 1 ? "" : "s"}: ${topics.join(", ")}.`,
    `Generated ${allCards.length} atomic, interview-style cards from "${sourceLabel}".`,
    allCards.filter((c) => c.difficulty === "Hard").length > 0
      ? `${allCards.filter((c) => c.difficulty === "Hard").length} card(s) flagged Hard — likely senior-level or edge-case material worth extra reps.`
      : `Most material reads Easy/Medium — consider pairing with harder follow-up scenarios before interviews.`,
  ];

  const weakAreas = topicGroups
    .filter((g) => g.subtopics.length <= 1)
    .map((g) => `${g.topic} — only shallow coverage detected; the source may be light on ${g.topic.toLowerCase()} depth.`);
  if (!weakAreas.length) weakAreas.push("No clear gaps detected — coverage looks reasonably balanced across the detected topics.");

  const revisionPlan = topics.map((topic, i) =>
    `Day ${i + 1}: Drill the ${topic} cards (${(cardsByTopic.get(topic) ?? []).length}) — focus on explaining each answer out loud, not just recognizing it.`);
  revisionPlan.push(`Day ${topics.length + 1}: Mixed review — shuffle all topics together and time yourself per card.`);

  return { summary, topics: topicGroups, insights, weakAreas, revisionPlan, cards: allCards };
}

/**
 * Converts raw document text into a structured, deduplicated flashcard deck —
 * topic/subtopic groups, atomic interview-style Q/A cards with difficulty and
 * tags, plus a short summary, insights, weak-area callouts, and a revision plan.
 * Uses Claude when configured; otherwise a deterministic keyword-driven heuristic.
 */
export async function generateFlashcardsFromContent(text: string, sourceLabel: string): Promise<FlashcardGenerationResult> {
  const cleaned = cleanDocumentText(text);
  if (!cleaned) return { enabled: false, ...EMPTY_RESULT };

  if (AI_ENABLED) {
    try {
      const raw = await llm(
        "You are an expert SDET interview coach who converts study material into structured, atomic flashcards. Return ONLY JSON.",
        [{ role: "user", content:
          `Source: "${sourceLabel}". Convert the material below into a structured flashcard deck for a Senior SDET / QA Automation Engineer.\n\n` +
          `Rules: detect topics and subtopics; keep each card atomic (one concept); prefer interview-style questions over rote definitions; ` +
          `avoid duplicate or near-duplicate cards by merging similar concepts; include edge cases where the material supports it; ` +
          `for advanced material, add senior-level follow-up questions (system design / trade-offs / failure modes); ` +
          `only use these topic labels: ${FLASHCARD_TOPICS.join(", ")}.\n\n` +
          `MATERIAL:\n${cleaned.slice(0, 14000)}\n\n` +
          `Return JSON with this exact shape:\n` +
          `{"summary":"2-3 sentence overview of the material",` +
          `"topics":[{"topic":"<one of the allowed labels>","subtopics":["...", "..."]}],` +
          `"insights":["3-5 short bullet observations about the material"],` +
          `"weakAreas":["1-3 gaps or shallow-coverage areas detected"],` +
          `"revisionPlan":["3-5 short day-by-day revision steps"],` +
          `"cards":[{"topic":"<allowed label>","subtopic":"...","question":"...","answer":"...",` +
          `"difficulty":"Easy|Medium|Hard","tags":["...","..."],"sourceSnippet":"short excerpt this card was derived from"}, ... 12-24 items]}` },
        ],
        4500,
      );
      const parsed = parseJson<Omit<FlashcardGenerationResult, "enabled">>(raw, EMPTY_RESULT);
      if (parsed.summary && parsed.cards?.length) {
        return {
          enabled: true,
          ...parsed,
          cards: dedupeCards(parsed.cards.filter((c) => FLASHCARD_TOPICS.includes(c.topic))),
        };
      }
    } catch { /* fall through */ }
  }

  return { enabled: false, ...offlineGenerate(cleaned, sourceLabel) };
}
