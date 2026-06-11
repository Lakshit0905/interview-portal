import "server-only";
import { llm, parseJson, AI_ENABLED } from "./client";
import {
  cleanDocumentText, sentencesOf, dedupeByText, trim, extractSubject, difficultyOf,
  TOPIC_KEYWORDS, detectTopics, subtopicFor,
} from "./document-analysis";
import { FLASHCARD_TOPICS, FLASHCARD_TYPES } from "@/types";
import type { FlashcardTopic, FlashcardType, FlashcardGenerationResult, GeneratedFlashcard, PresetFlashcardTopic } from "@/types";

const EMPTY_RESULT: Omit<FlashcardGenerationResult, "enabled"> = {
  summary: "", topics: [], insights: [], weakAreas: [], revisionPlan: [], cards: [],
};

/** Filters near-duplicate cards by normalized-question word-overlap. */
function dedupeCards(cards: GeneratedFlashcard[]): GeneratedFlashcard[] {
  return dedupeByText(cards, (c) => c.question);
}

// ── Generate atomic, interview-style flashcards with smart structuring ──

const QUESTION_STEMS: { test: (s: string) => boolean; type: FlashcardType; build: (s: string, topic: string) => string }[] = [
  { test: (s) => /\b(avoid|never|don't|do not|mistake|pitfall|anti-pattern)\b/i.test(s), type: "Common Mistake", build: (s, t) => `What common mistake does this call out in ${t}, and how do you avoid it: "${trim(s)}"?` },
  { test: (s) => /\b(should|must|always|best practice)\b/i.test(s), type: "Best Practice", build: (s, t) => `What best practice does this highlight for ${t}, and what happens if you ignore it: "${trim(s)}"?` },
  { test: (s) => /\b(is|are)\s+(a|an|the)\b/i.test(s), type: "Definition", build: (s) => `What is ${extractSubject(s)}, and why does it matter?` },
  { test: (s) => /\b(vs\.?|versus|compared to|rather than|instead of)\b/i.test(s), type: "Scenario", build: (s) => `What's the trade-off being described here: "${trim(s)}"?` },
  { test: (s) => /\b(because|since|so that|in order to)\b/i.test(s), type: "Concept", build: (s, t) => `Why does this matter in ${t}: "${trim(s)}"?` },
  { test: () => true, type: "Interview Question", build: (s, t) => `In a ${t} interview, how would you explain: "${trim(s)}"?` },
];

function applyTargetTopic(
  result: Omit<FlashcardGenerationResult, "enabled">,
  targetTopic?: FlashcardTopic,
): Omit<FlashcardGenerationResult, "enabled"> {
  if (!targetTopic) return result;

  const cards = result.cards.map((card) => ({
    ...card,
    topic: targetTopic,
    subtopic: card.subtopic || subtopicFor(targetTopic, `${card.question} ${card.answer}`),
    tags: [...new Set([targetTopic, ...(card.tags ?? []).filter((tag) => tag !== card.topic)])],
  }));
  const subtopics = [...new Set(cards.map((card) => card.subtopic).filter(Boolean))];

  return {
    ...result,
    topics: [{ topic: targetTopic, subtopics }],
    insights: [
      `Target topic selected: ${targetTopic}.`,
      ...result.insights.filter((item) => !/^Detected \d+ topic/i.test(item)),
    ],
    revisionPlan: cards.length
      ? [`Day 1: Drill the ${targetTopic} cards (${cards.length}) — focus on explaining each answer out loud, not just recognizing it.`, ...result.revisionPlan.slice(1)]
      : result.revisionPlan,
    cards,
  };
}

function offlineGenerate(text: string, sourceLabel: string, targetTopic?: FlashcardTopic): Omit<FlashcardGenerationResult, "enabled"> {
  const sentences = sentencesOf(text);
  const topics = targetTopic ? [targetTopic] : detectTopics(text);

  const cardsByTopic = new Map<FlashcardTopic, GeneratedFlashcard[]>();
  for (const topic of topics) {
    const lower = TOPIC_KEYWORDS[topic as PresetFlashcardTopic] ?? [topic.toLowerCase()];
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
        flashcardType: stem.type,
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

  return applyTargetTopic({ summary, topics: topicGroups, insights, weakAreas, revisionPlan, cards: allCards }, targetTopic);
}

/**
 * Converts raw document text into a structured, deduplicated flashcard deck —
 * topic/subtopic groups, atomic interview-style Q/A cards with difficulty and
 * tags, plus a short summary, insights, weak-area callouts, and a revision plan.
 * Uses Claude when configured; otherwise a deterministic keyword-driven heuristic.
 */
export async function generateFlashcardsFromContent(
  text: string,
  sourceLabel: string,
  targetTopic?: FlashcardTopic,
): Promise<FlashcardGenerationResult> {
  const cleaned = cleanDocumentText(text);
  if (!cleaned) return { enabled: false, ...EMPTY_RESULT };

  if (AI_ENABLED) {
    try {
      const raw = await llm(
        "You are an AI Knowledge Extraction and Flashcard Generation Engine for an Interview Preparation Portal. " +
          "You analyze study material and produce structured, atomic, interview-focused flashcards. " +
          "Use ONLY information present in the material — do not hallucinate or add external knowledge. Return ONLY JSON.",
        [{ role: "user", content:
          `Source: "${sourceLabel}". Convert the material below into a structured flashcard deck for a Senior SDET / QA Automation Engineer.\n\n` +
          `Rules:\n` +
          `1. Use ONLY the information present in the material — no outside knowledge.\n` +
          `2. Automatically identify concepts, definitions, examples, best practices, common mistakes, and interview questions.\n` +
          `3. Keep each card atomic (one concept per card).\n` +
          `4. Classify each card with a flashcardType: one of ${FLASHCARD_TYPES.join(", ")}.\n` +
          `5. ${targetTopic ? `Use "${targetTopic}" as the topic for every card; detect subtopics within that topic.` : `Detect subtopics within each topic; only use these topic labels: ${FLASHCARD_TOPICS.join(", ")}.`}\n` +
          `6. Deduplicate similar/near-duplicate cards by merging similar concepts.\n` +
          `7. Assign a difficulty: Easy, Medium, or Hard.\n` +
          `8. Generate relevant keywords/tags per card.\n` +
          `9. Answers must be under 100 words, in simple language, optimized for spaced repetition.\n` +
          `10. Include edge cases where the material supports it; for advanced material, add senior-level follow-up questions ` +
          `(system design / trade-offs / failure modes).\n\n` +
          `MATERIAL:\n${cleaned.slice(0, 14000)}\n\n` +
          `Return JSON with this exact shape:\n` +
          `{"summary":"2-3 sentence overview of the material",` +
          `"topics":[{"topic":"<one of the allowed labels>","subtopics":["...", "..."]}],` +
          `"insights":["3-5 short bullet observations about the material"],` +
          `"weakAreas":["1-3 gaps or shallow-coverage areas detected"],` +
          `"revisionPlan":["3-5 short day-by-day revision steps"],` +
          `"cards":[{"topic":"<allowed label>","subtopic":"...","flashcardType":"<one of: ${FLASHCARD_TYPES.join(", ")}>",` +
          `"question":"...","answer":"...","difficulty":"Easy|Medium|Hard","tags":["...","..."],` +
          `"sourceSnippet":"short excerpt / section this card was derived from"}, ... 12-24 items]}` },
        ],
        4500,
      );
      const parsed = parseJson<Omit<FlashcardGenerationResult, "enabled">>(raw, EMPTY_RESULT);
      if (parsed.summary && parsed.cards?.length) {
        const validCards = targetTopic
          ? parsed.cards
          : parsed.cards.filter((c) => FLASHCARD_TOPICS.includes(c.topic as (typeof FLASHCARD_TOPICS)[number]));
        return {
          enabled: true,
          ...applyTargetTopic({
            ...parsed,
            cards: dedupeCards(
            validCards
              .map((c) => ({
                ...c,
                flashcardType: FLASHCARD_TYPES.includes(c.flashcardType) ? c.flashcardType : "Concept",
              })),
            ),
          }, targetTopic),
        };
      }
    } catch { /* fall through */ }
  }

  return { enabled: false, ...offlineGenerate(cleaned, sourceLabel, targetTopic) };
}
