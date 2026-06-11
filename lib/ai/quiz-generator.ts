import "server-only";
import { llm, parseJson, AI_ENABLED } from "./client";
import {
  cleanDocumentText, sentencesOf, dedupeByText, trim, difficultyOf,
  TOPIC_KEYWORDS, detectTopics, subtopicFor,
} from "./document-analysis";
import { FLASHCARD_TOPICS, QUIZ_QUESTION_TYPES } from "@/types";
import type { FlashcardTopic, PresetFlashcardTopic, QuizQuestionType, QuizGenerationResult, GeneratedQuizQuestion } from "@/types";

const EMPTY_RESULT: Omit<QuizGenerationResult, "enabled"> = {
  summary: "", topics: [], insights: [], questions: [],
};

function dedupeQuestions(questions: GeneratedQuizQuestion[]): GeneratedQuizQuestion[] {
  return dedupeByText(questions, (q) => q.question);
}

// ── Offline heuristic: build MCQ / True-False / Scenario questions from sentences ──

/** Word pairs swappable to turn a true statement false (and vice-versa) for True/False questions. */
const SWAP_PAIRS: [string, string][] = [
  ["always", "never"], ["never", "always"],
  ["should", "should not"], ["must", "must not"],
  ["can", "cannot"], ["increase", "decrease"], ["decrease", "increase"],
  ["enable", "disable"], ["disable", "enable"],
  ["synchronous", "asynchronous"], ["asynchronous", "synchronous"],
  ["before", "after"], ["after", "before"],
  ["allow", "prevent"], ["prevent", "allow"],
];

function findSwap(sentence: string): { falsified: string } | null {
  const lower = sentence.toLowerCase();
  for (const [from, to] of SWAP_PAIRS) {
    const re = new RegExp(`\\b${from}\\b`, "i");
    if (re.test(lower)) {
      return { falsified: sentence.replace(re, to) };
    }
  }
  return null;
}

/** Deterministically rotates an array so option order (and correctIndex) varies per question without randomness. */
function rotate<T>(arr: T[], n: number): T[] {
  const len = arr.length;
  return arr.map((_, i) => arr[(i + n) % len]);
}

const SCENARIO_DISTRACTORS = [
  "Ignore it and continue as before — it's unlikely to cause real problems.",
  "Apply a quick workaround without addressing the root cause.",
  "Disable the related checks or tests so the issue stops surfacing.",
];

function buildMCQ(sentence: string, topic: FlashcardTopic, subtopic: string, distractorPool: string[], index: number): GeneratedQuizQuestion {
  const correct = trim(sentence);
  const distractors = distractorPool
    .filter((s) => s !== sentence)
    .filter((_, i) => i % 3 === index % 3)
    .slice(0, 3)
    .map(trim);
  while (distractors.length < 3) distractors.push("None of the other statements are accurate based on the material.");

  const options = rotate([correct, ...distractors], index);
  return {
    topic, subtopic, type: "Multiple Choice",
    question: `Which of the following statements about ${subtopic} is accurate, based on the material?`,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `"${correct}" — this is the statement supported by the source material.`,
    difficulty: difficultyOf(sentence),
    tags: [topic, subtopic],
    sourceSnippet: correct,
  };
}

function buildTrueFalse(sentence: string, topic: FlashcardTopic, subtopic: string, index: number): GeneratedQuizQuestion {
  const swap = findSwap(sentence);
  const useFalse = index % 2 === 1 && swap;
  const display = useFalse ? swap.falsified : sentence;
  return {
    topic, subtopic, type: "True/False",
    question: `True or False (${topic} — ${subtopic}): "${trim(display)}"`,
    options: ["True", "False"],
    correctIndex: useFalse ? 1 : 0,
    explanation: useFalse
      ? `False — the material actually states: "${trim(sentence)}"`
      : `True — directly supported by the material: "${trim(sentence)}"`,
    difficulty: difficultyOf(sentence),
    tags: [topic, subtopic],
    sourceSnippet: trim(sentence),
  };
}

function buildScenario(sentence: string, topic: FlashcardTopic, subtopic: string, index: number): GeneratedQuizQuestion {
  const correct = trim(sentence);
  const options = rotate([correct, ...SCENARIO_DISTRACTORS], index);
  return {
    topic, subtopic, type: "Scenario",
    question: `A teammate is doing the opposite of this in ${topic} — what should they do instead, and why?`,
    options,
    correctIndex: options.indexOf(correct),
    explanation: `${correct} This reflects the best practice described in the source material.`,
    difficulty: difficultyOf(sentence),
    tags: [topic, subtopic],
    sourceSnippet: correct,
  };
}

const BEST_PRACTICE_RE = /\b(should|must|avoid|never|always|best practice)\b/i;

function offlineGenerateQuiz(text: string, sourceLabel: string): Omit<QuizGenerationResult, "enabled"> {
  const sentences = sentencesOf(text);
  const topics = detectTopics(text) as PresetFlashcardTopic[];
  const allSentences = sentences;

  const questionsByTopic = new Map<FlashcardTopic, GeneratedQuizQuestion[]>();
  for (const topic of topics) {
    const keywords = TOPIC_KEYWORDS[topic];
    const matched = sentences.filter((s) => {
      const ls = s.toLowerCase();
      return keywords.some((kw) => ls.includes(kw));
    });
    const pool = (matched.length ? matched : sentences).slice(0, 8);

    const distractorPool = allSentences.filter((s) => !pool.includes(s));

    const questions = pool.map((sentence, i) => {
      const subtopic = subtopicFor(topic, sentence);
      const slot = i % 3;
      if (slot === 2 && BEST_PRACTICE_RE.test(sentence)) return buildScenario(sentence, topic, subtopic, i);
      if (slot === 1) return buildTrueFalse(sentence, topic, subtopic, i);
      return buildMCQ(sentence, topic, subtopic, distractorPool.length ? distractorPool : pool, i);
    });
    questionsByTopic.set(topic, dedupeQuestions(questions));
  }

  const allQuestions = dedupeQuestions([...questionsByTopic.values()].flat()).slice(0, 20);

  const topicGroups = topics.map((topic) => ({
    topic,
    subtopics: [...new Set((questionsByTopic.get(topic) ?? []).map((q) => q.subtopic ?? "Fundamentals"))],
  }));

  const counts = {
    "Multiple Choice": allQuestions.filter((q) => q.type === "Multiple Choice").length,
    "True/False": allQuestions.filter((q) => q.type === "True/False").length,
    Scenario: allQuestions.filter((q) => q.type === "Scenario").length,
  };

  const lead = sentences.slice(0, 3).join(" ");
  const summary = (lead || text.slice(0, 280)).slice(0, 360) ||
    `Generated from "${sourceLabel}" — ${allQuestions.length} questions across ${topics.length} topic${topics.length === 1 ? "" : "s"}.`;

  const insights = [
    `Detected ${topics.length} topic${topics.length === 1 ? "" : "s"}: ${topics.join(", ")}.`,
    `Generated ${allQuestions.length} questions from "${sourceLabel}" — ${counts["Multiple Choice"]} multiple choice, ${counts["True/False"]} true/false, ${counts.Scenario} scenario.`,
    allQuestions.filter((q) => q.difficulty === "Hard").length > 0
      ? `${allQuestions.filter((q) => q.difficulty === "Hard").length} question(s) flagged Hard — likely senior-level or edge-case material worth extra reps.`
      : `Most material reads Easy/Medium — consider pairing with harder follow-up scenarios before interviews.`,
  ];

  return { summary, topics: topicGroups, insights, questions: allQuestions };
}

/**
 * Converts raw document text into a structured quiz — multiple-choice,
 * true/false, and scenario-based questions grouped by topic/subtopic, each
 * with an explanation and difficulty. Uses Claude when configured; otherwise
 * a deterministic keyword-driven heuristic.
 */
export async function generateQuizFromContent(text: string, sourceLabel: string): Promise<QuizGenerationResult> {
  const cleaned = cleanDocumentText(text);
  if (!cleaned) return { enabled: false, ...EMPTY_RESULT };

  if (AI_ENABLED) {
    try {
      const raw = await llm(
        "You are an AI Knowledge Extraction and Quiz Generation Engine for an Interview Preparation Portal. " +
          "You analyze study material and produce structured interview quizzes. " +
          "Use ONLY information present in the material — do not hallucinate or add external knowledge. Return ONLY JSON.",
        [{ role: "user", content:
          `Source: "${sourceLabel}". Convert the material below into a structured interview quiz for a Senior SDET / QA Automation Engineer.\n\n` +
          `Rules:\n` +
          `1. Use ONLY the information present in the material — no outside knowledge.\n` +
          `2. Generate a mix of question types: ${QUIZ_QUESTION_TYPES.join(", ")}.\n` +
          `3. Multiple Choice and Scenario questions need exactly 4 options; True/False questions need exactly ["True","False"].\n` +
          `4. "correctIndex" is the 0-based index of the correct option.\n` +
          `5. Every question needs a short "explanation" of why the correct answer is right.\n` +
          `6. Detect subtopics within each topic; only use these topic labels: ${FLASHCARD_TOPICS.join(", ")}.\n` +
          `7. Deduplicate similar/near-duplicate questions.\n` +
          `8. Assign a difficulty: Easy, Medium, or Hard.\n` +
          `9. Generate relevant keywords/tags per question.\n` +
          `10. Include edge cases where the material supports it; for advanced material, add senior-level scenario questions ` +
          `(system design / trade-offs / failure modes).\n\n` +
          `MATERIAL:\n${cleaned.slice(0, 14000)}\n\n` +
          `Return JSON with this exact shape:\n` +
          `{"summary":"2-3 sentence overview of the material",` +
          `"topics":[{"topic":"<one of the allowed labels>","subtopics":["...", "..."]}],` +
          `"insights":["3-5 short bullet observations about the material"],` +
          `"questions":[{"topic":"<allowed label>","subtopic":"...","type":"<one of: ${QUIZ_QUESTION_TYPES.join(", ")}>",` +
          `"question":"...","options":["...","...","...","..."],"correctIndex":0,"explanation":"...",` +
          `"difficulty":"Easy|Medium|Hard","tags":["...","..."],"sourceSnippet":"short excerpt this question was derived from"}, ... 12-20 items]}` },
        ],
        4500,
      );
      const parsed = parseJson<Omit<QuizGenerationResult, "enabled">>(raw, EMPTY_RESULT);
      if (parsed.summary && parsed.questions?.length) {
        return {
          enabled: true,
          ...parsed,
          questions: dedupeQuestions(
            parsed.questions
              .filter((q) => FLASHCARD_TOPICS.includes(q.topic as PresetFlashcardTopic) && Array.isArray(q.options) && q.options.length >= 2)
              .map((q) => ({
                ...q,
                type: (QUIZ_QUESTION_TYPES as readonly string[]).includes(q.type) ? q.type as QuizQuestionType : "Multiple Choice",
                correctIndex: Math.min(Math.max(0, q.correctIndex ?? 0), q.options.length - 1),
              })),
          ),
        };
      }
    } catch { /* fall through */ }
  }

  return { enabled: false, ...offlineGenerateQuiz(cleaned, sourceLabel) };
}
