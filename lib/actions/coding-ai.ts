"use server";

import { z } from "zod";
import { llm, parseJson, AI_ENABLED } from "@/lib/ai/client";
import type { CodingProblem } from "@/types";

type LearningFields = Pick<
  CodingProblem,
  | "understanding"
  | "pattern"
  | "approach"
  | "pseudocode"
  | "code"
  | "language"
  | "flowSteps"
  | "architectureBlocks"
  | "memoryNotes"
  | "timeComplexity"
  | "spaceComplexity"
  | "confidence"
  | "revisionNotes"
  | "tags"
>;

const inputSchema = z.object({
  name: z.string().trim().default("Untitled problem"),
  topic: z.string().trim().default("Arrays"),
  difficulty: z.enum(["Easy", "Medium", "Hard"]).default("Medium"),
  understanding: z.string().default(""),
  input: z.string().default(""),
  output: z.string().default(""),
  constraints: z.string().default(""),
  edgeCases: z.string().default(""),
  code: z.string().default(""),
  solution: z.string().default(""),
  language: z.string().default("TypeScript"),
});

const EMPTY: LearningFields = {
  understanding: "",
  pattern: "",
  approach: "",
  pseudocode: "",
  code: "",
  language: "TypeScript",
  flowSteps: [],
  architectureBlocks: {},
  memoryNotes: {},
  timeComplexity: "",
  spaceComplexity: "",
  confidence: "Medium",
  revisionNotes: [],
  tags: [],
};

export async function generateCodingLearningFields(input: unknown): Promise<{ enabled: boolean; fields: LearningFields }> {
  const data = inputSchema.parse(input);
  const code = (data.code || data.solution).trim();

  if (AI_ENABLED && (code || data.understanding || data.name)) {
    try {
      const raw = await llm(
        "You are an expert algorithm tutor. Convert a coding problem and solution into concise learning notes. Return ONLY JSON.",
        [{ role: "user", content:
          `Problem: ${data.name}\nTopic: ${data.topic}\nDifficulty: ${data.difficulty}\nLanguage: ${data.language}\n` +
          `Understanding: ${data.understanding}\nInput: ${data.input}\nOutput: ${data.output}\nConstraints: ${data.constraints}\nEdge cases: ${data.edgeCases}\n\n` +
          `Solution/code:\n${code}\n\n` +
          `Return JSON with this exact shape:\n` +
          `{"understanding":"plain-English problem understanding",` +
          `"pattern":"algorithm pattern name",` +
          `"approach":"step-by-step explanation",` +
          `"pseudocode":"language-neutral pseudocode",` +
          `"code":"cleaned code solution, preserve user's language when possible",` +
          `"language":"language name",` +
          `"flowSteps":["Start","Read input","Identify pattern","Choose data structure","Loop / recursion","Apply condition","Update result","Return output"],` +
          `"architectureBlocks":{"inputLayer":"...","processingLayer":"...","dataStructureLayer":"...","decisionLayer":"...","outputLayer":"..."},` +
          `"memoryNotes":{"patternName":"...","whenToUse":"...","keyIdea":"...","visualHook":"...","commonMistake":"...","similarProblems":"...","revisionShortcut":"..."},` +
          `"timeComplexity":"O(...)","spaceComplexity":"O(...)",` +
          `"confidence":"Low|Medium|High",` +
          `"revisionNotes":["2-4 concise revision bullets"],` +
          `"tags":["3-8 short tags"]}` },
        ],
        2600,
      );
      const parsed = parseJson<LearningFields>(raw, EMPTY);
      return { enabled: true, fields: normalizeFields(parsed, data, code) };
    } catch { /* fall through */ }
  }

  return { enabled: false, fields: offlineFields(data, code) };
}

function normalizeFields(fields: LearningFields, data: z.infer<typeof inputSchema>, code: string): LearningFields {
  return {
    ...EMPTY,
    ...fields,
    code: fields.code || code,
    language: fields.language || data.language || "TypeScript",
    confidence: fields.confidence === "Low" || fields.confidence === "High" ? fields.confidence : "Medium",
    flowSteps: fields.flowSteps?.length ? fields.flowSteps : defaultFlow(fields.pattern),
    architectureBlocks: fields.architectureBlocks ?? {},
    memoryNotes: fields.memoryNotes ?? {},
    revisionNotes: fields.revisionNotes ?? [],
    tags: fields.tags ?? [],
  };
}

function offlineFields(data: z.infer<typeof inputSchema>, code: string): LearningFields {
  const pattern = inferPattern(`${data.name} ${data.topic} ${code}`);
  const language = data.language || inferLanguage(code);
  return {
    understanding: data.understanding || `Solve "${data.name}" by identifying the input state, applying the ${pattern} pattern, and returning the required output.`,
    pattern,
    approach: [
      `Read the problem input and clarify the target output.`,
      `Use ${pattern} because the problem signal matches ${pattern.toLowerCase()} behavior.`,
      `Maintain the required state while iterating or recursing.`,
      `Apply the decision condition and update the result.`,
      `Return the final answer after all relevant states are processed.`,
    ].join("\n"),
    pseudocode: [
      "function solve(input):",
      "  initialize required state",
      "  for each item/state in input:",
      "    apply pattern-specific condition",
      "    update state/result",
      "  return result",
    ].join("\n"),
    code,
    language,
    flowSteps: defaultFlow(pattern),
    architectureBlocks: {
      inputLayer: data.input || "Read problem input and expected target/output.",
      processingLayer: "Iterate, recurse, or search through the relevant states.",
      dataStructureLayer: dataStructureFor(pattern),
      decisionLayer: "Check the pattern-specific condition and handle edge cases.",
      outputLayer: data.output || "Return the computed result.",
    },
    memoryNotes: {
      patternName: pattern,
      whenToUse: whenToUse(pattern),
      keyIdea: keyIdea(pattern),
      visualHook: visualHook(pattern),
      commonMistake: commonMistake(pattern),
      similarProblems: "Add similar problems after solving 2-3 more with this pattern.",
      revisionShortcut: `${pattern}: identify state, update it safely, return the tracked answer.`,
    },
    timeComplexity: inferComplexity(code).time,
    spaceComplexity: inferComplexity(code).space,
    confidence: "Medium",
    revisionNotes: [
      `Re-derive why ${pattern} fits before looking at code.`,
      "Explain the state update out loud.",
      "Test one normal case and one edge case by hand.",
    ],
    tags: [...new Set([data.topic, pattern, language].filter(Boolean))],
  };
}

function inferPattern(text: string): string {
  const lower = text.toLowerCase();
  if (/map|hash|complement|frequency/.test(lower)) return "HashMap lookup";
  if (/left|right|two pointer|palindrome|sorted/.test(lower)) return "Two pointers";
  if (/window|substring|subarray/.test(lower)) return "Sliding window";
  if (/binary|mid|low|high/.test(lower)) return "Binary search";
  if (/stack|parenth|monotonic/.test(lower)) return "Stack";
  if (/queue|level|bfs/.test(lower)) return "BFS";
  if (/dfs|recursive|recursion|tree|graph/.test(lower)) return "DFS";
  if (/backtrack|permutation|combination|subset/.test(lower)) return "Backtracking";
  if (/\bdp\b|memo|dynamic programming/.test(lower)) return "Dynamic programming";
  if (/heap|priority/.test(lower)) return "Heap / Priority Queue";
  if (/trie|prefix/.test(lower)) return "Trie";
  if (/interval|merge/.test(lower)) return "Intervals";
  if (/greedy|sort/.test(lower)) return "Greedy";
  return "Pattern recognition";
}

function defaultFlow(pattern?: string): string[] {
  return [
    "Start",
    "Read input",
    `Identify pattern${pattern ? `: ${pattern}` : ""}`,
    "Choose data structure",
    "Loop / recursion",
    "Apply condition",
    "Update result",
    "Return output",
  ];
}

function inferLanguage(code: string): string {
  if (/function|const|let|=>/.test(code)) return "TypeScript";
  if (/def\s+\w+\(|self:|\.append\(/.test(code)) return "Python";
  if (/public\s+class|System\.out|new\s+HashMap/.test(code)) return "Java";
  return "TypeScript";
}

function dataStructureFor(pattern: string): string {
  if (pattern.includes("HashMap")) return "Map / object for O(1) lookup.";
  if (pattern.includes("Two pointers")) return "Two index pointers moving through the array/string.";
  if (pattern.includes("Sliding")) return "Window bounds plus counts/sums for current range.";
  if (pattern.includes("Stack")) return "Stack for last-in-first-out state.";
  if (pattern.includes("BFS")) return "Queue plus visited set.";
  if (pattern.includes("DFS")) return "Call stack / explicit stack plus visited state.";
  if (pattern.includes("Dynamic")) return "DP table or memo map.";
  if (pattern.includes("Heap")) return "Priority queue for repeated best item extraction.";
  return "Use the smallest state needed to track decisions and result.";
}

function whenToUse(pattern: string): string {
  if (pattern.includes("HashMap")) return "Use when you need fast lookup, frequency counting, or complement checks.";
  if (pattern.includes("Sliding")) return "Use for contiguous subarray/substring ranges.";
  if (pattern.includes("Binary")) return "Use when the input or answer space is sorted/monotonic.";
  if (pattern.includes("Dynamic")) return "Use when subproblems repeat and current answers depend on previous states.";
  return `Use when the problem naturally matches ${pattern.toLowerCase()} behavior.`;
}

function keyIdea(pattern: string): string {
  if (pattern.includes("HashMap")) return "Store what you have seen so future checks are constant time.";
  if (pattern.includes("Two pointers")) return "Move pointers based on the condition so you never revisit useless states.";
  if (pattern.includes("Sliding")) return "Expand to include new data, shrink to restore validity.";
  return "Track only the state that directly helps decide the next move.";
}

function visualHook(pattern: string): string {
  if (pattern.includes("HashMap")) return "Current item asks the map whether its missing partner already exists.";
  if (pattern.includes("Two pointers")) return "Two hands squeeze the search space from both sides.";
  if (pattern.includes("Sliding")) return "A flexible window grows and shrinks over the input.";
  return "Input flows through state, condition, update, and output.";
}

function commonMistake(pattern: string): string {
  if (pattern.includes("HashMap")) return "Updating the map before checking can reuse the same element.";
  if (pattern.includes("Binary")) return "Incorrect boundary updates cause off-by-one bugs or infinite loops.";
  if (pattern.includes("Sliding")) return "Forgetting to remove left-side state when shrinking.";
  return "Skipping edge cases before trusting the main loop.";
}

function inferComplexity(code: string): { time: string; space: string } {
  const loops = (code.match(/\b(for|while)\b/g) ?? []).length;
  const hasMap = /\b(Map|Set|dict|HashMap|HashSet)\b/i.test(code);
  if (loops >= 2) return { time: "O(n^2)", space: hasMap ? "O(n)" : "O(1)" };
  if (loops === 1) return { time: "O(n)", space: hasMap ? "O(n)" : "O(1)" };
  return { time: "O(n)", space: hasMap ? "O(n)" : "O(1)" };
}
