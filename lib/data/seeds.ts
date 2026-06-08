import type {
  CodingProblem, InterviewQuestion, BehavioralStory,
  SystemDesign, Resume, Interview, Flashcard, LearningPath, RoadmapTopic,
  CompanyPrep, CompanyRound, CompanyFAQ, CompanyChecklistItem,
  VideoLesson, VideoConcept, VideoQA, VideoFlashcard, VideoMCQ,
} from "@/types";

const t = (d: string) => `2025-${d}T10:00:00.000Z`;

const DAY = 86_400_000;
/** Relative-to-now ISO helper for seed data whose due dates must stay "live". */
const ago = (days: number) => new Date(Date.now() - days * DAY).toISOString();
const ahead = (days: number) => new Date(Date.now() + days * DAY).toISOString();

export const codingSeed: CodingProblem[] = [
  {
    id: "cp_two_sum", name: "Two Sum", difficulty: "Easy", topic: "HashMaps", status: "solved",
    url: "https://leetcode.com/problems/two-sum/",
    solution: "Use a hashmap of value -> index. For each n, check if (target - n) is seen.",
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    notes: "Classic warmup. Watch for duplicate values and the same-element edge case.",
    revisitDate: null, createdAt: t("01-04"), updatedAt: t("05-12"),
  },
  {
    id: "cp_lru", name: "LRU Cache", difficulty: "Medium", topic: "HashMaps", status: "revisit",
    url: "https://leetcode.com/problems/lru-cache/",
    solution: "HashMap + doubly linked list. Map key -> node; move-to-front on access.",
    timeComplexity: "O(1)", spaceComplexity: "O(capacity)",
    notes: "Often appears as a system-design-lite question for SDETs. Practice the DLL pointers.",
    revisitDate: t("06-20"), createdAt: t("02-10"), updatedAt: t("05-28"),
  },
  {
    id: "cp_max_subarray", name: "Maximum Subarray", difficulty: "Medium", topic: "Dynamic Programming", status: "solved",
    url: "https://leetcode.com/problems/maximum-subarray/",
    solution: "Kadane's: running = max(n, running + n); best = max(best, running).",
    timeComplexity: "O(n)", spaceComplexity: "O(1)",
    notes: "Be ready to explain the DP recurrence and the all-negative edge case.",
    revisitDate: null, createdAt: t("02-18"), updatedAt: t("04-30"),
  },
  {
    id: "cp_longest_sub", name: "Longest Substring Without Repeating Characters",
    difficulty: "Medium", topic: "Sliding Window", status: "todo",
    url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/",
    solution: "", timeComplexity: "O(n)", spaceComplexity: "O(min(n, charset))",
    notes: "Shrink the window when a duplicate enters; track last-seen index.",
    revisitDate: null, createdAt: t("03-02"), updatedAt: t("03-02"),
  },
  {
    id: "cp_valid_paren", name: "Valid Parentheses", difficulty: "Easy", topic: "Strings", status: "solved",
    url: "https://leetcode.com/problems/valid-parentheses/",
    solution: "Stack: push openers, pop & match on closers, must be empty at the end.",
    timeComplexity: "O(n)", spaceComplexity: "O(n)",
    notes: "Good for explaining stack invariants out loud.",
    revisitDate: null, createdAt: t("01-20"), updatedAt: t("04-11"),
  },
  {
    id: "cp_num_islands", name: "Number of Islands", difficulty: "Medium", topic: "Graphs", status: "revisit",
    url: "https://leetcode.com/problems/number-of-islands/",
    solution: "DFS/BFS flood fill from each unvisited land cell; count components.",
    timeComplexity: "O(rows*cols)", spaceComplexity: "O(rows*cols)",
    notes: "Mention iterative BFS to avoid stack overflow on large grids.",
    revisitDate: t("06-15"), createdAt: t("03-15"), updatedAt: t("05-30"),
  },
  {
    id: "cp_bt_level", name: "Binary Tree Level Order Traversal", difficulty: "Medium", topic: "Trees", status: "todo",
    url: "https://leetcode.com/problems/binary-tree-level-order-traversal/",
    solution: "", timeComplexity: "O(n)", spaceComplexity: "O(n)",
    notes: "BFS with a queue, capture level size per iteration.",
    revisitDate: null, createdAt: t("03-22"), updatedAt: t("03-22"),
  },
  {
    id: "cp_two_ptr", name: "Container With Most Water", difficulty: "Medium", topic: "Two Pointers", status: "solved",
    url: "https://leetcode.com/problems/container-with-most-water/",
    solution: "Two pointers from both ends; move the shorter wall inward.",
    timeComplexity: "O(n)", spaceComplexity: "O(1)",
    notes: "Explain why moving the taller wall can never improve the area.",
    revisitDate: null, createdAt: t("04-01"), updatedAt: t("05-05"),
  },
];

export const questionSeed: InterviewQuestion[] = [
  {
    id: "q_pw_autowait", question: "How does Playwright's auto-waiting work and why does it reduce flakiness?",
    category: "Playwright", difficulty: "Medium", tags: ["flakiness", "actionability"],
    answer: "Before each action Playwright runs a set of actionability checks (visible, stable, enabled, receives events, not obscured) and retries until they pass or the timeout expires. Because it waits on the element state rather than a fixed sleep, tests don't race the UI, which removes the most common source of flake.",
    createdAt: t("02-01"), updatedAt: t("02-01"),
  },
  {
    id: "q_ts_unknown", question: "What is the difference between `any` and `unknown`?",
    category: "TypeScript", difficulty: "Easy", tags: ["types"],
    answer: "`any` opts out of type checking entirely and is assignable both ways. `unknown` is the type-safe counterpart: you can assign anything to it, but you must narrow it before use, so it preserves safety at the boundaries of untyped data.",
    createdAt: t("02-03"), updatedAt: t("02-03"),
  },
  {
    id: "q_sql_window", question: "When would you use a window function instead of GROUP BY?",
    category: "SQL", difficulty: "Medium", tags: ["window-functions"],
    answer: "Use a window function when you need an aggregate alongside the original rows rather than collapsing them. ROW_NUMBER, RANK and running totals via SUM() OVER (...) keep row-level detail, which GROUP BY discards.",
    createdAt: t("02-05"), updatedAt: t("02-05"),
  },
  {
    id: "q_api_idem", question: "Explain idempotency and which HTTP methods should be idempotent.",
    category: "API", difficulty: "Medium", tags: ["rest", "http"],
    answer: "An idempotent operation produces the same server state when applied once or many times. GET, PUT, DELETE and HEAD should be idempotent; POST generally is not. Testing this means repeating a request and asserting the resource state is unchanged after the first call.",
    createdAt: t("02-07"), updatedAt: t("02-07"),
  },
  {
    id: "q_sysdesign_flaky", question: "How would you design a system to detect and quarantine flaky tests at scale?",
    category: "System Design", difficulty: "Hard", tags: ["platform", "flakiness"],
    answer: "Collect per-test outcomes into a results store keyed by test id + commit. Compute a flakiness score from pass/fail transitions on the same commit. A quarantine service tags tests above a threshold, the runner skips quarantined tests from gating but still records them, and a dashboard surfaces owners. Add automatic de-quarantine after N consecutive green runs.",
    createdAt: t("02-09"), updatedAt: t("02-09"),
  },
  {
    id: "q_behav_conflict", question: "Tell me about a time you disagreed with an engineering lead on test strategy.",
    category: "Behavioral", difficulty: "Medium", tags: ["conflict", "star"],
    answer: "Use a STAR story: frame the disagreement around data (flake rate, pipeline time), propose a small experiment, and land on a shared metric. Emphasize that you committed fully once the team aligned.",
    createdAt: t("02-11"), updatedAt: t("02-11"),
  },
];

export const behavioralSeed: BehavioralStory[] = [
  {
    id: "bs_flaky", title: "Cutting the flaky-test rate from 9% to under 1%", theme: "Flaky Test Reduction",
    situation: "Our E2E suite had a ~9% flake rate, eroding trust and causing engineers to blind-retry pipelines.",
    task: "I was asked to make the suite trustworthy enough to gate deploys again.",
    action: "I instrumented per-test pass/fail history, ranked the worst offenders, replaced hard waits with Playwright auto-waiting and web-first assertions, isolated test data per run, and added a quarantine lane so new flakes never blocked the team.",
    result: "Flake rate dropped below 1% within six weeks, pipeline retries fell ~70%, and we re-enabled E2E as a required merge check.",
    tags: ["playwright", "reliability", "metrics"], createdAt: t("03-01"), updatedAt: t("05-01"),
  },
  {
    id: "bs_cicd", title: "Halving CI feedback time", theme: "CI/CD Optimization",
    situation: "The full pipeline took 42 minutes, so developers context-switched and PRs piled up.",
    task: "Bring feedback time under 20 minutes without losing coverage.",
    action: "I sharded tests across runners by historical duration, cached dependencies and browsers, ran unit + lint in parallel with the build, and moved slow visual tests to a nightly lane.",
    result: "Median pipeline time fell to 18 minutes, PR cycle time improved, and infra cost stayed flat thanks to better runner utilization.",
    tags: ["github-actions", "performance"], createdAt: t("03-05"), updatedAt: t("04-20"),
  },
  {
    id: "bs_defect", title: "Catching a production-bound data-corruption bug", theme: "Production Defect",
    situation: "A release candidate passed all green checks but I noticed an intermittent assertion in a contract test.",
    task: "Decide whether to block the release the night before launch.",
    action: "I reproduced the failure, traced it to a non-deterministic serialization order breaking a downstream consumer, and brought a minimal repro plus a one-line fix to the on-call lead.",
    result: "We shipped a day later with the fix; the bug would have corrupted records for a key integration partner.",
    tags: ["contract-testing", "judgment"], createdAt: t("03-10"), updatedAt: t("03-10"),
  },
  {
    id: "bs_framework", title: "Designing a reusable Playwright framework for 6 teams", theme: "Framework Design",
    situation: "Six teams each maintained divergent, copy-pasted Playwright setups.",
    task: "Create a shared framework that teams would actually adopt.",
    action: "I built a fixtures-based core with typed page objects, an API client for setup/teardown, environment config, and trace-on-failure. I shipped it as an internal package with docs and migration codemods.",
    result: "Five of six teams migrated in a quarter; onboarding a new suite dropped from days to hours.",
    tags: ["architecture", "dx"], createdAt: t("03-12"), updatedAt: t("03-12"),
  },
];

export const systemDesignSeed: SystemDesign[] = [
  {
    id: "sd_pw_framework", title: "Design a Playwright Test Framework",
    summary: "A scalable, fixtures-first automation framework usable across many product teams.",
    diagram: [
      "tests/ ──▶ fixtures (auth, apiClient, page objects)",
      "   │            │",
      "   ▼            ▼",
      "runner ──▶ config (envs, projects) ──▶ reporters (HTML, trace, allure)",
      "   │",
      "   ▼",
      "CI matrix (sharded) ──▶ artifact store (traces/videos)",
    ].join("\n"),
    notes: "Key decisions: fixtures over base-class inheritance, typed POMs, API-driven data setup, trace-on-first-retry, environment via config not code.",
    questions: ["How do you isolate test data?", "How do you keep selectors resilient?", "How do you shard for speed?"],
    sampleAnswer: "Start from requirements (teams, environments, parallelism). Use Playwright projects per browser/env, fixtures to compose auth + data, page objects only for genuinely shared flows, and an API client for fast deterministic setup. Gate on traces and retries, surface results in a shared reporter.",
    createdAt: t("04-01"), updatedAt: t("04-01"),
  },
  {
    id: "sd_test_platform", title: "Design a Test Results Platform",
    summary: "Central service ingesting test outcomes to power flakiness scoring and dashboards.",
    diagram: [
      "runners ──(events)──▶ ingest API ──▶ queue ──▶ writer ──▶ results DB",
      "                                                   │",
      "                                                   ▼",
      "                                       flakiness scorer (batch)",
      "                                                   │",
      "                                                   ▼",
      "                                        dashboard + quarantine API",
    ].join("\n"),
    notes: "Partition results by test id + commit. Score = transitions on identical commit. Expose owner + history.",
    questions: ["What's your data model?", "How do you compute flakiness?", "How do you scale ingest?"],
    sampleAnswer: "Model events as immutable test-run records. Aggregate per (testId, commit) to detect non-determinism. A batch scorer flags flakes; a quarantine API removes them from gating while still recording outcomes. Scale ingest with a queue and idempotent writes.",
    createdAt: t("04-05"), updatedAt: t("04-05"),
  },
];

export const resumeSeed: Resume[] = [
  {
    id: "rs_platform", label: "SDET — Test Platform focus", version: "v3.2",
    targetCompany: "Stripe", fileName: "sdet-platform-v3.2.pdf", fileUrl: "",
    notes: "Leads with framework + platform work. Quantify flake reduction and CI time.",
    content: "Senior SDET with 7+ years building Playwright/TypeScript frameworks, CI/CD pipelines on GitHub Actions, API and contract testing, and test platforms on AWS.",
    createdAt: t("04-10"), updatedAt: "2026-05-28T10:00:00.000Z",
  },
  {
    id: "rs_genai", label: "SDET — GenAI / LLM testing", version: "v1.0",
    targetCompany: "Anthropic", fileName: "sdet-genai-v1.pdf", fileUrl: "",
    notes: "Emphasize LLM eval, prompt regression and RAG testing experience.",
    content: "SDET focused on evaluating LLM systems: prompt regression suites, hallucination detection, RAG retrieval quality and offline/online eval harnesses.",
    createdAt: t("05-01"), updatedAt: "2026-06-03T10:00:00.000Z",
  },
];

const iv = (d: string, time = "10:00:00.000Z") => `2026-${d}T${time}`;

export const interviewSeed: Interview[] = [
  {
    id: "iv_stripe", company: "Stripe", position: "Senior SDET, Platform",
    location: "San Francisco, CA (Hybrid)", salaryRange: "$165K – $195K", interviewType: "Onsite",
    recruiter: "Dana R.", interviewDate: iv("06-07", "17:00:00.000Z"),
    round: "Technical Round · Systems & Coding", roundsCompleted: 2, roundsTotal: 4, readinessScore: 78,
    status: "Technical Round",
    notes: "Round 2 covers framework design plus a live coding pairing session.\n\nReview idempotency keys, webhook retries and their public API versioning strategy.\n\nDana mentioned the panel includes a staff engineer from the Observability team — bring infra-scale testing stories.",
    createdAt: iv("06-02", "09:00:00.000Z"), updatedAt: iv("06-06", "14:30:00.000Z"),
  },
  {
    id: "iv_anthropic", company: "Anthropic", position: "Software Engineer, QA / Evals",
    location: "Remote (US)", salaryRange: "$150K – $180K", interviewType: "Phone Screen",
    recruiter: "Self-applied", interviewDate: iv("06-08", "16:00:00.000Z"),
    round: "Recruiter Screen", roundsCompleted: 1, roundsTotal: 4, readinessScore: 64,
    status: "Recruiter Screen",
    notes: "Lean into GenAI eval stories — prompt regression suites and hallucination scoring.\n\nPrepare two or three RAG testing examples with concrete precision/recall metrics.\n\nResearch their Constitutional AI papers for shared vocabulary going into the call.",
    createdAt: iv("04-08", "09:00:00.000Z"), updatedAt: iv("04-08", "09:00:00.000Z"),
  },
  {
    id: "iv_datadog", company: "Datadog", position: "SDET II",
    location: "New York, NY", salaryRange: "$145K – $170K", interviewType: "Onsite",
    recruiter: "Marco P.", interviewDate: null,
    round: "Offer Extended", roundsCompleted: 4, roundsTotal: 4, readinessScore: 92,
    status: "Offer",
    notes: "Offer came in at $158K base plus equity — countering with the Stripe range as leverage.\n\nStrong system design round: the panel praised the sharded ingestion pipeline walkthrough.\n\nDecision deadline is end of next week — loop the recruiter in by Friday.",
    createdAt: iv("03-05", "09:00:00.000Z"), updatedAt: iv("06-05", "11:00:00.000Z"),
  },
  {
    id: "iv_cloudflare", company: "Cloudflare", position: "QA Automation Engineer",
    location: "Austin, TX", salaryRange: "$130K – $155K", interviewType: "Virtual",
    recruiter: "Priya S.", interviewDate: iv("02-18", "15:00:00.000Z"),
    round: "Technical Round · Graph Traversal", roundsCompleted: 2, roundsTotal: 3, readinessScore: 55,
    status: "Rejected",
    notes: "Tripped on a graph DFS question under time pressure — drill graph traversals and revisit topological sort.\n\nFeedback: strong communication, needs more reps on harder LeetCode mediums.",
    createdAt: iv("02-10", "09:00:00.000Z"), updatedAt: iv("02-22", "10:00:00.000Z"),
  },
  {
    id: "iv_vercel", company: "Vercel", position: "Senior SDET, Edge Platform",
    location: "Remote (US/Canada)", salaryRange: "$170K – $200K", interviewType: "Onsite",
    recruiter: "Jess T.", interviewDate: iv("06-11", "18:00:00.000Z"),
    round: "Final Round · Team Panel", roundsCompleted: 3, roundsTotal: 4, readinessScore: 81,
    status: "Final Round",
    notes: "Final panel includes the Edge Functions team lead — prep deployment-pipeline testing stories.\n\nThey care deeply about flaky-test reduction; have the quarantine-and-triage system story ready to go.\n\nAsk how QA partners with DX on preview-deployment quality gates.",
    createdAt: iv("04-22", "09:00:00.000Z"), updatedAt: iv("06-04", "13:15:00.000Z"),
  },
  {
    id: "iv_notion", company: "Notion", position: "QA Engineer, Platform",
    location: "San Francisco, CA", salaryRange: "$140K – $165K", interviewType: "",
    recruiter: "Recruiting team", interviewDate: null,
    round: "Application Submitted", roundsCompleted: 0, roundsTotal: 4, readinessScore: 60,
    status: "Applied",
    notes: "Applied via referral from a former Datadog teammate — plan to follow up in a week if there's no response.",
    createdAt: iv("02-25", "09:00:00.000Z"), updatedAt: iv("02-25", "09:00:00.000Z"),
  },
  {
    id: "iv_figma", company: "Figma", position: "SDET, Test Infrastructure",
    location: "San Francisco, CA", salaryRange: "$155K – $185K", interviewType: "Virtual",
    recruiter: "Amir K.", interviewDate: iv("06-13", "16:30:00.000Z"),
    round: "Technical Round · Framework Design", roundsCompleted: 2, roundsTotal: 4, readinessScore: 70,
    status: "Technical Round",
    notes: "Focus is on scaling Playwright across 40+ micro-frontends — prep sharding and parallelization stories.\n\nAmir flagged a take-home review portion before the live round — polish the README and CI badges first.",
    createdAt: iv("05-10", "09:00:00.000Z"), updatedAt: iv("05-25", "10:45:00.000Z"),
  },
  {
    id: "iv_linear", company: "Linear", position: "Senior QA Automation Engineer",
    location: "Remote (Global)", salaryRange: "$145K – $175K", interviewType: "Phone Screen",
    recruiter: "Sam W.", interviewDate: iv("06-22", "15:00:00.000Z"),
    round: "Recruiter Screen", roundsCompleted: 1, roundsTotal: 3, readinessScore: 58,
    status: "Recruiter Screen",
    notes: "Small team — expect questions on owning quality end-to-end without a dedicated QA org.\n\nHighlight the CI pipeline you built solo at your last role.",
    createdAt: iv("03-20", "09:00:00.000Z"), updatedAt: iv("06-01", "09:30:00.000Z"),
  },
  {
    id: "iv_openai", company: "OpenAI", position: "Software Engineer, Evals",
    location: "San Francisco, CA", salaryRange: "$175K – $210K", interviewType: "",
    recruiter: "Self-applied", interviewDate: null,
    round: "Application Submitted", roundsCompleted: 0, roundsTotal: 5, readinessScore: 66,
    status: "Applied",
    notes: "Cold application through the careers page — a long shot, but eval-tooling experience is a strong match.\n\nTailor resume bullets toward model-behavior regression testing in case of a callback.",
    createdAt: iv("01-12", "09:00:00.000Z"), updatedAt: iv("01-12", "09:00:00.000Z"),
  },
  {
    id: "iv_shopify", company: "Shopify", position: "Staff SDET, Checkout",
    location: "Remote (Canada)", salaryRange: "$160K – $190K", interviewType: "Onsite",
    recruiter: "Liang H.", interviewDate: iv("07-02", "17:00:00.000Z"),
    round: "Final Round · Architecture Review", roundsCompleted: 3, roundsTotal: 4, readinessScore: 74,
    status: "Final Round",
    notes: "Final round is a system-design and architecture review for the checkout test platform.\n\nPrep a story on contract testing across payment-provider integrations.\n\nLiang said the team is hiring for a staff IC role — emphasize cross-team influence.",
    createdAt: iv("04-29", "09:00:00.000Z"), updatedAt: iv("05-20", "10:00:00.000Z"),
  },
  {
    id: "iv_github", company: "GitHub", position: "SDET III, Actions Platform",
    location: "Remote (US)", salaryRange: "$150K – $175K", interviewType: "Virtual",
    recruiter: "Tasha M.", interviewDate: iv("02-02", "16:00:00.000Z"),
    round: "Technical Round · System Design", roundsCompleted: 2, roundsTotal: 3, readinessScore: 50,
    status: "Rejected",
    notes: "System design round went sideways on queue back-pressure — review message-queue scaling patterns.\n\nTasha offered to keep the profile on file for the Packages team — follow up again in Q3.",
    createdAt: iv("01-28", "09:00:00.000Z"), updatedAt: iv("02-05", "11:00:00.000Z"),
  },
];

export const flashcardSeed: Flashcard[] = [
  {
    id: "fc_pw_autowait", front: "What is Playwright's auto-waiting and which actions trigger it?",
    back: "Playwright waits for elements to be actionable (attached, visible, stable, receives events, enabled) before acting — applies to click, fill, check, etc. Removes most explicit `waitForTimeout` calls.",
    topic: "Playwright", difficulty: "Easy", source: "manual", streak: 3, reviewCount: 4,
    lastReviewedAt: ago(8), dueAt: ago(1), createdAt: ago(40), updatedAt: ago(8),
  },
  {
    id: "fc_pw_locators", front: "Why prefer Playwright locators over ElementHandles?",
    back: "Locators are lazy and re-query the DOM on every action, so they're resilient to re-renders and stale-element errors. ElementHandles capture a single snapshot and can go stale.",
    topic: "Playwright", difficulty: "Medium", source: "note", sourceRef: "playwright/locators-vs-handles", streak: 1, reviewCount: 2,
    lastReviewedAt: ago(2), dueAt: ago(0), createdAt: ago(30), updatedAt: ago(2),
  },
  {
    id: "fc_pw_trace", front: "What does Playwright Trace Viewer let you inspect after a failed run?",
    back: "A timeline of actions, DOM snapshots before/after each step, network requests, console logs, and screenshots/video — all from a single `.zip` trace file, with no re-run needed.",
    topic: "Playwright", difficulty: "Easy", source: "manual", streak: 0, reviewCount: 1,
    lastReviewedAt: ago(1), dueAt: ahead(0), createdAt: ago(20), updatedAt: ago(1),
  },
  {
    id: "fc_ts_unknown_any", front: "Difference between `unknown` and `any` in TypeScript?",
    back: "`any` disables type checking entirely. `unknown` is type-safe — you must narrow it (typeof/instanceof/assertion) before using it, so the compiler still catches misuse.",
    topic: "TypeScript", difficulty: "Medium", source: "manual", streak: 2, reviewCount: 3,
    lastReviewedAt: ago(6), dueAt: ago(0), createdAt: ago(35), updatedAt: ago(6),
  },
  {
    id: "fc_ts_satisfies", front: "What does the `satisfies` operator do that type annotations don't?",
    back: "`satisfies` checks a value against a type without widening or losing the value's inferred literal type — so you keep autocomplete on the narrow shape while still validating against the broader type.",
    topic: "TypeScript", difficulty: "Hard", source: "video", sourceRef: "yt_ts_advanced_types", streak: 0, reviewCount: 0,
    lastReviewedAt: null, dueAt: ahead(0), createdAt: ago(5), updatedAt: ago(5),
  },
  {
    id: "fc_sql_window_fns", front: "When would you reach for a window function over GROUP BY?",
    back: "When you need per-row results alongside an aggregate — e.g., ranking rows within partitions, running totals, or comparing a row to the previous one — without collapsing the row set.",
    topic: "SQL", difficulty: "Medium", source: "manual", streak: 1, reviewCount: 2,
    lastReviewedAt: ago(4), dueAt: ago(1), createdAt: ago(28), updatedAt: ago(4),
  },
  {
    id: "fc_sql_index_seek", front: "Index seek vs. index scan — which is better and why?",
    back: "A seek navigates the B-tree directly to matching rows (fast, selective). A scan walks every row in the index (slow, used when the predicate isn't selective or no usable index exists).",
    topic: "SQL", difficulty: "Easy", source: "question", sourceRef: "iq_sql_explain_plan", streak: 4, reviewCount: 5,
    lastReviewedAt: ago(12), dueAt: ahead(18), createdAt: ago(70), updatedAt: ago(12),
  },
  {
    id: "fc_api_idempotency", front: "What makes an API endpoint idempotent, and why does it matter for test design?",
    back: "Repeating the same request produces the same end-state (e.g., PUT, DELETE). Tests should assert that retries — common in flaky-network scenarios — don't create duplicate side effects.",
    topic: "API", difficulty: "Medium", source: "manual", streak: 0, reviewCount: 1,
    lastReviewedAt: ago(1), dueAt: ago(0), createdAt: ago(18), updatedAt: ago(1),
  },
  {
    id: "fc_api_contract_testing", front: "What problem does consumer-driven contract testing solve that end-to-end tests don't?",
    back: "It verifies provider/consumer compatibility at the API boundary without standing up the whole system — catching breaking changes early and fast, while e2e tests stay focused on user flows.",
    topic: "API", difficulty: "Hard", source: "note", sourceRef: "api-testing/contract-testing", streak: 2, reviewCount: 3,
    lastReviewedAt: ago(9), dueAt: ahead(5), createdAt: ago(50), updatedAt: ago(9),
  },
  {
    id: "fc_docker_layers", front: "Why does layer ordering in a Dockerfile affect build speed?",
    back: "Docker caches each layer; a change invalidates that layer and everything after it. Put rarely-changing steps (deps install) before frequently-changing ones (source copy) to maximize cache hits.",
    topic: "Docker", difficulty: "Easy", source: "manual", streak: 3, reviewCount: 4,
    lastReviewedAt: ago(10), dueAt: ahead(4), createdAt: ago(60), updatedAt: ago(10),
  },
  {
    id: "fc_aws_s3_consistency", front: "What read-after-write consistency guarantee does S3 provide today?",
    back: "Strong read-after-write consistency for all operations (since Dec 2020) — a successful PUT is immediately visible to subsequent GET/LIST, including overwrites and deletes.",
    topic: "AWS", difficulty: "Medium", source: "manual", streak: 1, reviewCount: 2,
    lastReviewedAt: ago(5), dueAt: ago(2), createdAt: ago(33), updatedAt: ago(5),
  },
  {
    id: "fc_cicd_flaky_quarantine", front: "What's a sound strategy for handling flaky tests in a CI pipeline without hiding real regressions?",
    back: "Auto-quarantine tests that fail intermittently into a non-blocking suite, track them with an owner and a fix-by date, and re-promote only after N consecutive green runs — never silently delete or ignore.",
    topic: "CI/CD", difficulty: "Hard", source: "manual", streak: 0, reviewCount: 0,
    lastReviewedAt: null, dueAt: ago(0), createdAt: ago(3), updatedAt: ago(3),
  },
  {
    id: "fc_sysdes_rate_limit", front: "Token bucket vs. sliding-window-log rate limiting — what's the core trade-off?",
    back: "Token bucket is memory-cheap and allows controlled bursts; sliding-window-log is precise (no boundary bursts) but stores a timestamp per request, costing more memory at scale.",
    topic: "System Design", difficulty: "Hard", source: "note", sourceRef: "system-design/rate-limiting", streak: 1, reviewCount: 1,
    lastReviewedAt: ago(3), dueAt: ahead(0), createdAt: ago(15), updatedAt: ago(3),
  },
  {
    id: "fc_behavioral_star", front: "What's the most common way candidates weaken a STAR answer, and how do you fix it?",
    back: "Spending most of the answer on Situation/Task and rushing the Result. Fix: cap S+T at ~20% of the answer, spend the bulk on Action (your specific decisions) and Result (measurable outcome + what you'd do differently).",
    topic: "Behavioral", difficulty: "Medium", source: "manual", streak: 2, reviewCount: 2,
    lastReviewedAt: ago(7), dueAt: ahead(7), createdAt: ago(45), updatedAt: ago(7),
  },
  {
    id: "fc_genai_eval_metrics", front: "Why is exact-match a poor metric for evaluating LLM outputs in most QA scenarios?",
    back: "LLM outputs are non-deterministic and semantically equivalent phrasings vary widely. Prefer rubric-based or LLM-as-judge scoring, embedding similarity, or task-specific checks (e.g., does the SQL execute and return the right rows).",
    topic: "GenAI", difficulty: "Hard", source: "video", sourceRef: "yt_llm_eval_basics", streak: 0, reviewCount: 0,
    lastReviewedAt: null, dueAt: ago(0), createdAt: ago(2), updatedAt: ago(2),
  },
];

// ── Learning Roadmap ─────────────────────────────────────────────────────────
const rt = (id: string, title: string, estimatedHours: number, done: boolean): RoadmapTopic => ({
  id, title, estimatedHours, done,
});

export const roadmapSeed: LearningPath[] = [
  {
    id: "rp_playwright", title: "Playwright Mastery", accent: "green", icon: "TestTube2",
    description: "End-to-end testing with Playwright — from locator strategy to debugging flaky runs in CI.",
    topics: [
      rt("rp_pw_1", "Locators & auto-waiting", 4, true),
      rt("rp_pw_2", "Fixtures & test isolation", 5, true),
      rt("rp_pw_3", "Network interception & mocking", 6, true),
      rt("rp_pw_4", "Visual & component testing", 5, false),
      rt("rp_pw_5", "Parallelism & sharding in CI", 4, false),
      rt("rp_pw_6", "Trace viewer & debugging", 3, true),
    ],
    createdAt: ago(70), updatedAt: ago(2),
  },
  {
    id: "rp_typescript", title: "TypeScript Mastery", accent: "blue", icon: "FileCode2",
    description: "Type-system depth for building reliable test frameworks and tooling.",
    topics: [
      rt("rp_ts_1", "Generics & utility types", 5, true),
      rt("rp_ts_2", "Discriminated unions & narrowing", 4, true),
      rt("rp_ts_3", "Type-safe API layers with zod", 5, false),
      rt("rp_ts_4", "Conditional & mapped types", 6, false),
      rt("rp_ts_5", "tsconfig & strictness tuning", 2, true),
    ],
    createdAt: ago(65), updatedAt: ago(6),
  },
  {
    id: "rp_api_testing", title: "API Testing", accent: "violet", icon: "Webhook",
    description: "Contract validation, auth flows, and mocking strategies for REST and GraphQL services.",
    topics: [
      rt("rp_api_1", "REST contract & schema validation", 4, true),
      rt("rp_api_2", "Auth flows (OAuth2 / JWT)", 5, true),
      rt("rp_api_3", "GraphQL query & mutation testing", 5, false),
      rt("rp_api_4", "Postman/Newman & CI integration", 3, false),
      rt("rp_api_5", "Mocking with WireMock / MSW", 4, false),
    ],
    createdAt: ago(58), updatedAt: ago(9),
  },
  {
    id: "rp_sql", title: "SQL for QA", accent: "amber", icon: "Database",
    description: "Query skills for data validation, debugging, and writing precise test assertions.",
    topics: [
      rt("rp_sql_1", "Joins & set operations", 3, true),
      rt("rp_sql_2", "Window functions", 4, true),
      rt("rp_sql_3", "Query plans & indexing basics", 4, false),
      rt("rp_sql_4", "Data validation queries for assertions", 3, false),
    ],
    createdAt: ago(80), updatedAt: ago(14),
  },
  {
    id: "rp_github_actions", title: "GitHub Actions / CI-CD", accent: "blue", icon: "GitBranch",
    description: "Build pipelines that run, parallelize, and report tests reliably on every push.",
    topics: [
      rt("rp_gha_1", "Workflow syntax & matrix builds", 4, true),
      rt("rp_gha_2", "Caching & artifacts", 3, true),
      rt("rp_gha_3", "Reusable workflows & composite actions", 4, false),
      rt("rp_gha_4", "Secrets & environments", 2, false),
      rt("rp_gha_5", "Self-hosted runners", 3, false),
    ],
    createdAt: ago(50), updatedAt: ago(11),
  },
  {
    id: "rp_docker", title: "Docker", accent: "blue", icon: "Container",
    description: "Containerizing test environments — images, networking, and CI debugging.",
    topics: [
      rt("rp_dk_1", "Images, layers & multi-stage builds", 4, true),
      rt("rp_dk_2", "Compose for test environments", 4, true),
      rt("rp_dk_3", "Networking & volumes", 3, false),
      rt("rp_dk_4", "Debugging containers in CI", 3, false),
    ],
    createdAt: ago(54), updatedAt: ago(20),
  },
  {
    id: "rp_aws", title: "AWS", accent: "amber", icon: "Cloud",
    description: "Core cloud services an SDET needs to read infra, debug deploys, and write infra-aware tests.",
    topics: [
      rt("rp_aws_1", "IAM fundamentals", 3, true),
      rt("rp_aws_2", "S3 & storage classes", 3, true),
      rt("rp_aws_3", "EC2 / ECS / Lambda basics", 6, false),
      rt("rp_aws_4", "CloudWatch & observability", 4, false),
      rt("rp_aws_5", "VPC networking essentials", 5, false),
    ],
    createdAt: ago(46), updatedAt: ago(16),
  },
  {
    id: "rp_contract_testing", title: "Contract Testing", accent: "violet", icon: "FileCheck2",
    description: "Consumer-driven contracts and provider verification for safe service evolution.",
    topics: [
      rt("rp_ct_1", "Consumer-driven contracts (Pact)", 5, false),
      rt("rp_ct_2", "Provider verification in CI", 4, false),
      rt("rp_ct_3", "Schema registries & versioning", 3, false),
    ],
    createdAt: ago(30), updatedAt: ago(30),
  },
  {
    id: "rp_performance", title: "Performance Testing", accent: "red", icon: "Gauge",
    description: "Load, stress, and soak testing — scripting, metrics, and bottleneck triage.",
    topics: [
      rt("rp_perf_1", "Load vs. stress vs. soak testing", 3, true),
      rt("rp_perf_2", "k6 / JMeter scripting", 5, false),
      rt("rp_perf_3", "Analyzing latency percentiles (p50/p95/p99)", 3, true),
      rt("rp_perf_4", "Bottleneck triage (DB / network / app)", 4, false),
    ],
    createdAt: ago(40), updatedAt: ago(8),
  },
  {
    id: "rp_system_design", title: "System Design for SDET", accent: "violet", icon: "Workflow",
    description: "Enough architectural fluency to design for testability and reason about trade-offs in interviews.",
    topics: [
      rt("rp_sd_1", "Scalability & load balancing", 4, true),
      rt("rp_sd_2", "Caching strategies", 4, true),
      rt("rp_sd_3", "Queueing & async processing", 5, false),
      rt("rp_sd_4", "Designing for testability", 3, false),
      rt("rp_sd_5", "Trade-off articulation in interviews", 2, false),
    ],
    createdAt: ago(62), updatedAt: ago(5),
  },
  {
    id: "rp_genai_testing", title: "GenAI Testing", accent: "green", icon: "Sparkles",
    description: "Quality, safety, and regression testing strategies for LLM-powered features.",
    topics: [
      rt("rp_gen_1", "Prompt regression suites", 4, false),
      rt("rp_gen_2", "Hallucination & groundedness checks", 5, false),
      rt("rp_gen_3", "Safety & jailbreak testing", 4, false),
      rt("rp_gen_4", "Model output diffing", 3, false),
    ],
    createdAt: ago(20), updatedAt: ago(20),
  },
  {
    id: "rp_llm_eval", title: "LLM Evaluation", accent: "green", icon: "ClipboardCheck",
    description: "Building rigorous evaluation pipelines for model outputs — metrics, rubrics, and human review.",
    topics: [
      rt("rp_eval_1", "Rubric-based scoring & LLM-as-judge", 5, true),
      rt("rp_eval_2", "Benchmark suites (MMLU, HellaSwag basics)", 4, false),
      rt("rp_eval_3", "Embedding-similarity metrics", 3, false),
      rt("rp_eval_4", "Human-in-the-loop eval pipelines", 4, false),
    ],
    createdAt: ago(18), updatedAt: ago(4),
  },
  {
    id: "rp_rag_testing", title: "RAG Testing", accent: "blue", icon: "Search",
    description: "Validating retrieval-augmented generation pipelines end to end.",
    topics: [
      rt("rp_rag_1", "Retrieval precision/recall evaluation", 5, false),
      rt("rp_rag_2", "Chunking & embedding strategy testing", 4, false),
      rt("rp_rag_3", "Grounded-answer verification", 4, false),
      rt("rp_rag_4", "End-to-end pipeline regression", 3, false),
    ],
    createdAt: ago(12), updatedAt: ago(12),
  },
  {
    id: "rp_ai_agents", title: "AI Agents Testing", accent: "red", icon: "Bot",
    description: "Evaluating tool-using agents — correctness, multi-step planning, guardrails, and cost.",
    topics: [
      rt("rp_agent_1", "Tool-call correctness & schema validation", 4, false),
      rt("rp_agent_2", "Multi-step task evaluation", 5, false),
      rt("rp_agent_3", "Guardrail & safety boundary testing", 4, false),
      rt("rp_agent_4", "Cost / latency budget testing", 3, false),
    ],
    createdAt: ago(9), updatedAt: ago(9),
  },
];

// ── Company Preparation Hub ──────────────────────────────────────────────────
const round = (name: string, description: string): CompanyRound => ({ name, description });
const faq = (id: string, question: string, answer: string): CompanyFAQ => ({ id, question, answer });
const check = (id: string, label: string, done: boolean): CompanyChecklistItem => ({ id, label, done });

export const companyPrepSeed: CompanyPrep[] = [
  {
    id: "co_stripe", slug: "stripe", name: "Stripe", industry: "Fintech / Payments infrastructure",
    process: [
      round("Recruiter screen", "30 min — background, motivation, comp expectations."),
      round("Technical screen", "60 min — Playwright/API test design exercise with a live walkthrough."),
      round("Take-home", "Build a small test framework against a sandbox payments API; reviewed for design, coverage, and flake-resistance."),
      round("Onsite loop", "4 rounds: system design for testability, debugging a flaky-suite case study, coding (medium), and a cross-functional collaboration interview."),
      round("Final / team match", "Conversations with the platform team lead and a peer SDET; culture and ownership focus."),
    ],
    focusAreas: ["API", "Playwright", "System Design", "CI/CD"],
    faqs: [
      faq("co_stripe_f1", "How deep does the API testing round go?", "Expect to design a contract-test suite for a payments-style API: idempotency, webhooks, retries, and failure-mode coverage. They care more about your test taxonomy than raw scripting speed."),
      faq("co_stripe_f2", "Is the take-home graded on coverage percentage?", "No — they explicitly say they value test design judgment (what to test and why) over exhaustive coverage. A focused, well-reasoned suite beats a sprawling one."),
      faq("co_stripe_f3", "What's the bar for the system-design-for-testability round?", "Mid-to-senior: they want you to identify untestable seams in a proposed architecture and propose concrete changes (seams, fakes, contract boundaries), not just describe the happy path."),
    ],
    notes: "Re-read their public engineering blog posts on test infrastructure before the onsite — two of my interviewers referenced them directly. Practice narrating trade-offs out loud, they interrupt to probe reasoning.",
    experiences: "Recruiter screen felt conversational and low-pressure. Technical screen moved fast — they wanted a working Playwright fixture within ~20 minutes, then spent the rest of the time asking 'what would you change for production.' Bring your own opinions; they push back to see how you defend them.",
    checklist: [
      check("co_stripe_c1", "Review Stripe API docs (idempotency keys, webhooks, retries)", true),
      check("co_stripe_c2", "Rebuild the Playwright fixture exercise from memory, untimed", true),
      check("co_stripe_c3", "Draft a contract-test taxonomy for a mock payments API", false),
      check("co_stripe_c4", "Prepare 2 STAR stories about flaky-suite debugging", false),
      check("co_stripe_c5", "Read 3 recent Stripe engineering blog posts on testing/infra", false),
    ],
    createdAt: ago(40), updatedAt: ago(2),
  },
  {
    id: "co_anthropic", slug: "anthropic", name: "Anthropic", industry: "AI safety / Foundation models",
    process: [
      round("Recruiter screen", "30 min — role overview, motivation for AI safety/evals work."),
      round("Technical screen", "60 min — design an evaluation harness for a model behavior; discuss metrics and failure modes."),
      round("Take-home / pairing", "Pair on extending an eval suite; focus on rubric design and reducing evaluator noise."),
      round("Onsite loop", "Eval design deep-dive, coding, cross-team collaboration, and a values/safety-mindset conversation."),
      round("Final", "Conversation with hiring manager — alignment on scope, ambiguity tolerance, and safety culture."),
    ],
    focusAreas: ["GenAI", "System Design", "Behavioral"],
    faqs: [
      faq("co_anthropic_f1", "Do they expect ML research background?", "No — for SDET/QA-adjacent roles they care about rigorous evaluation methodology and statistical thinking, not training models. Strong testing instincts transfer directly."),
      faq("co_anthropic_f2", "What does 'reducing evaluator noise' mean in their context?", "Designing rubrics and sampling strategies so that LLM-as-judge or human ratings are consistent and reproducible — think inter-rater reliability applied to model outputs."),
      faq("co_anthropic_f3", "How much do they probe on safety/values?", "Meaningfully — expect a dedicated conversation about how you'd handle ambiguous or borderline outputs and how you balance shipping speed against safety review."),
    ],
    notes: "Brush up on eval terminology: groundedness, hallucination rate, rubric-based scoring, LLM-as-judge pitfalls. They like candidates who can critique a flawed eval design, not just build one.",
    experiences: "The technical screen was less 'write code' and more 'design a measurement system and defend it.' They asked me to poke holes in my own proposal — treat that as collaborative, not adversarial.",
    checklist: [
      check("co_anthropic_c1", "Review GenAI flashcard deck end to end", true),
      check("co_anthropic_c2", "Sketch an eval harness for a hypothetical summarization feature", false),
      check("co_anthropic_c3", "Read Anthropic's published research overviews (non-technical summaries)", false),
      check("co_anthropic_c4", "Prepare a story about navigating ambiguity in a QA scope decision", false),
    ],
    createdAt: ago(25), updatedAt: ago(4),
  },
  {
    id: "co_datadog", slug: "datadog", name: "Datadog", industry: "Observability / Monitoring SaaS",
    process: [
      round("Recruiter screen", "30 min — background and team matching (which product line)."),
      round("Technical screen", "60 min — debug a failing E2E suite from logs/traces; reason about root cause."),
      round("Coding round", "45 min — data-structure problem with an emphasis on clean, testable code."),
      round("Onsite loop", "System design (observability pipeline), test-architecture discussion, and a bar-raiser behavioral round."),
    ],
    focusAreas: ["System Design", "API", "Docker", "CI/CD"],
    faqs: [
      faq("co_datadog_f1", "Is the debugging round live or take-home?", "Live, screen-shared — they hand you logs/traces for a flaky pipeline and watch how you form and test hypotheses. Narrate everything."),
      faq("co_datadog_f2", "How much infra knowledge is expected?", "Comfort with containers, CI pipelines, and basic observability concepts (traces, metrics, logs) is expected — you don't need to operate Datadog itself, but you should think like one of its users."),
    ],
    notes: "Practice talking through an unfamiliar log/trace dataset out loud — structure: form hypothesis, pick the cheapest test to confirm/deny, narrow down. They're evaluating process as much as the answer.",
    experiences: "The debugging round was the highlight — genuinely interesting and not gotcha-ish. They gave hints when I went down a dead end, which felt collaborative rather than punitive.",
    checklist: [
      check("co_datadog_c1", "Review Docker networking & multi-container debugging notes", false),
      check("co_datadog_c2", "Practice narrating a log/trace investigation out loud (timed, 20 min)", false),
      check("co_datadog_c3", "Prepare a system-design walkthrough for a metrics-ingestion pipeline", false),
      check("co_datadog_c4", "Pick 2 'bar-raiser' stories that show ownership beyond your role", false),
    ],
    createdAt: ago(33), updatedAt: ago(15),
  },
  {
    id: "co_cloudflare", slug: "cloudflare", name: "Cloudflare", industry: "Edge network / Internet infrastructure",
    process: [
      round("Recruiter screen", "30 min — role scope and team overview (edge, dashboard, or platform)."),
      round("Technical screen", "60 min — write E2E tests against a sample dashboard app; discuss flakiness mitigation."),
      round("Systems round", "45 min — reason about testing a globally distributed system (latency, regional rollout, cache invalidation)."),
      round("Onsite loop", "Coding, test-strategy design for a new feature, and team-fit conversations."),
    ],
    focusAreas: ["Playwright", "System Design", "AWS", "API"],
    faqs: [
      faq("co_cloudflare_f1", "What does the 'systems round' actually probe?", "How you'd design test coverage for something that behaves differently by region — caching, edge config propagation, gradual rollouts. They want you to reason about consistency and observability, not memorize CDN internals."),
      faq("co_cloudflare_f2", "Do they care about specific tools?", "Less about tool trivia, more about your mental model of flakiness sources in distributed E2E testing and how you'd design around them."),
    ],
    notes: "Review CDN/edge fundamentals at a conceptual level — cache invalidation, regional rollout strategies, eventual consistency. Frame answers around 'how would I test this' rather than 'how does it work internally.'",
    experiences: "The technical screen felt practical — real dashboard app, real flakiness scenarios. They liked when I proposed retry budgets and trace-based debugging instead of just 'add waits.'",
    checklist: [
      check("co_cloudflare_c1", "Review caching-strategy notes from System Design roadmap", true),
      check("co_cloudflare_c2", "Write a short test-strategy doc for a hypothetical 'gradual rollout' feature", false),
      check("co_cloudflare_c3", "Practice explaining flakiness mitigation strategies (retries, traces, isolation)", false),
      check("co_cloudflare_c4", "Skim Cloudflare's engineering blog for recent reliability posts", false),
    ],
    createdAt: ago(28), updatedAt: ago(7),
  },
  {
    id: "co_vercel", slug: "vercel", name: "Vercel", industry: "Frontend cloud / Edge deployment platform",
    process: [
      round("Recruiter screen", "30 min — background, why Vercel, logistics."),
      round("Technical screen", "60 min — build and debug Playwright tests against a Next.js preview deployment."),
      round("Take-home", "Design a CI test strategy for a multi-region edge deployment pipeline."),
      round("Onsite loop", "Pairing session, system design (edge platform testability), and culture/values conversation."),
    ],
    focusAreas: ["Playwright", "TypeScript", "CI/CD", "System Design"],
    faqs: [
      faq("co_vercel_f1", "How TypeScript-heavy is the technical screen?", "Quite — their test framework code is fully typed, and they'll ask you to extend typed fixtures and helpers. Comfort with generics and utility types is assumed."),
      faq("co_vercel_f2", "What's the focus of the take-home?", "Strategy over implementation: how you'd structure CI to catch regressions across preview deployments and edge regions without ballooning pipeline time."),
    ],
    notes: "Make sure the TypeScript Mastery roadmap topics (generics, type-safe API layers) are fresh — they show up directly in the pairing exercise. Also rehearse explaining CI trade-offs (speed vs. coverage vs. cost).",
    experiences: "Very fast-paced interviews, lots of pairing. They want to see how you think in real time more than a polished final answer — thinking out loud scored well for me.",
    checklist: [
      check("co_vercel_c1", "Re-do TypeScript generics & utility-types flashcards", false),
      check("co_vercel_c2", "Build a typed Playwright fixture from scratch (timed, 30 min)", false),
      check("co_vercel_c3", "Draft a CI strategy doc for multi-region preview deployments", false),
      check("co_vercel_c4", "Prepare a story about balancing pipeline speed vs. coverage", false),
    ],
    createdAt: ago(20), updatedAt: ago(3),
  },
];

// ── Video Learning Hub ───────────────────────────────────────────────────────
const concept = (id: string, term: string, explanation: string): VideoConcept => ({ id, term, explanation });
const qa = (id: string, question: string, answer: string): VideoQA => ({ id, question, answer });
const vcard = (id: string, front: string, back: string): VideoFlashcard => ({ id, front, back });
const mcq = (id: string, question: string, options: string[], correctIndex: number, explanation: string): VideoMCQ =>
  ({ id, question, options, correctIndex, explanation });

export const videoLessonSeed: VideoLesson[] = [
  {
    id: "vid_playwright_network",
    url: "https://www.youtube.com/watch?v=pW7x5kQ92mN",
    title: "Mastering Network Interception in Playwright",
    channel: "Test Automation University",
    topic: "Playwright",
    durationMinutes: 22,
    transcript:
      "Today we're going deep on Playwright's network layer — page.route, request and response listeners, " +
      "HAR recording and replay, and how to use all of it to write tests that don't depend on a live backend...",
    summary:
      "A deep dive into Playwright's route() and page.on('request'/'response') APIs for mocking, intercepting, " +
      "and asserting on network traffic — covering response stubbing, HAR replay, latency injection, and the " +
      "most common ways teams accidentally hang their own tests.",
    notes:
`## Why intercept network traffic?
Network interception decouples UI tests from backend availability, lets you simulate edge cases (slow responses, 500s, empty payloads), and lets you assert on the exact requests your app fires.

## Core APIs
- \`page.route(url, handler)\` — intercept requests matching a glob/regex and decide their fate
- \`route.fulfill({ status, body })\` — stub a response without touching the network
- \`route.continue({ headers })\` — forward the request, optionally modified
- \`page.on("request" | "response")\` — passive listeners for assertions and logging

## Patterns worth stealing
1. **Stub once, reuse everywhere** — wrap common stubs in fixtures so every test gets a consistent backend.
2. **HAR replay** — record a real session with \`recordHar\`, then replay it for deterministic runs.
3. **Latency injection** — delay \`route.fulfill\` to test loading states and timeouts.
4. **Contract assertions** — assert on \`request.postDataJSON()\` to catch payload regressions early.

## Common pitfalls
- Forgetting to call \`continue()\`/\`fulfill()\`/\`abort()\` hangs the request indefinitely.
- Overlapping route patterns can shadow each other — register the most specific first.`,
    concepts: [
      concept("c1", "Route handler", "A function registered via page.route() that intercepts matching requests and decides whether to fulfill, continue, or abort them."),
      concept("c2", "HAR replay", "Recording real network traffic to a HAR file and replaying it in tests for deterministic, offline-friendly runs."),
      concept("c3", "Request fulfillment", "Short-circuiting a network call by returning a canned response via route.fulfill(), bypassing the real backend entirely."),
      concept("c4", "Latency injection", "Deliberately delaying a stubbed response to exercise loading states, spinners, and timeout handling in the UI."),
    ],
    questions: [
      qa("q1", "When would you choose route.fulfill() over route.continue()?",
        "Use fulfill() when you want to fully replace the response — e.g. simulating a 500, an empty list, or a slow endpoint — so the test doesn't depend on a real backend. Use continue() when you only need to inspect or lightly modify the outgoing request (headers, auth tokens) while still hitting the real service."),
      qa("q2", "How do you avoid route handlers hanging a test?",
        "Always resolve every intercepted route — call fulfill, continue, or abort. An unresolved route leaves the request pending and the page (and test) waiting indefinitely, often surfacing as a mysterious timeout."),
      qa("q3", "What's the advantage of HAR replay over hand-written stubs?",
        "HAR files capture real backend responses byte-for-byte, including headers and edge-case payload shapes you might not think to hand-write — giving realistic, deterministic fixtures with far less maintenance."),
      qa("q4", "How would you test a slow-loading state without flaking real CI runs?",
        "Intercept the relevant request and delay the call to route.fulfill() by a fixed amount before resolving — this deterministically triggers the loading UI without depending on real network latency."),
    ],
    flashcards: [
      vcard("f1", "page.route() vs page.on('request')", "route() can intercept and control the outcome (fulfill/continue/abort); on('request') is a passive listener for observation/assertions only."),
      vcard("f2", "What happens if a route handler never resolves?", "The request hangs indefinitely, usually surfacing as a test timeout — always call fulfill, continue, or abort."),
      vcard("f3", "Best way to get realistic response fixtures fast", "Record a HAR file from a real session and replay it — captures real shapes/headers with minimal hand-authoring."),
      vcard("f4", "How to test error states deterministically", "Stub the endpoint with route.fulfill({ status: 500, body: ... }) instead of relying on a real failure to occur."),
    ],
    revisionNotes:
`- route() intercepts & controls; on("request"/"response") only observes
- Always resolve routes: fulfill / continue / abort — or the request hangs
- Register specific route patterns before broad ones (avoid shadowing)
- HAR replay > hand-written stubs for realistic, low-maintenance fixtures
- Inject latency in fulfill() to deterministically test loading/timeout states
- Assert on request.postDataJSON() to catch payload contract regressions`,
    cheatSheet:
`| Goal | API |
|---|---|
| Stub a response | route.fulfill({ status, body }) |
| Forward (optionally modified) | route.continue({ headers }) |
| Block a request | route.abort() |
| Observe only | page.on("request" \\| "response", cb) |
| Record traffic | context.routeFromHAR() / recordHar |
| Assert payload | request.postDataJSON() |`,
    mcqs: [
      mcq("m1", "Which call short-circuits a network request and returns a canned response?",
        ["route.continue()", "route.fulfill()", "route.abort()", "page.on('response')"], 1,
        "fulfill() resolves the route with a response you provide, bypassing the real network entirely."),
      mcq("m2", "What's the risk of NOT resolving a route handler?",
        ["The test passes silently", "The request hangs and the test times out", "Playwright auto-aborts after 5s", "The page reloads"], 1,
        "Every intercepted route must be resolved (fulfill/continue/abort) or the request — and the page waiting on it — hangs."),
      mcq("m3", "Why prefer HAR replay over hand-written stubs?",
        ["It's faster to write inline", "It captures real response shapes and headers with less maintenance", "It works without Playwright", "It avoids using page.route() entirely"], 1,
        "HAR files snapshot real traffic byte-for-byte, giving realistic fixtures without guessing at shapes."),
      mcq("m4", "How do you deterministically trigger a loading spinner in tests?",
        ["Throttle your CI runner", "Use a real slow endpoint", "Delay the resolution inside route.fulfill()", "Set page.setDefaultTimeout(0)"], 2,
        "Injecting an artificial delay before fulfilling the stubbed response deterministically exercises loading UI."),
    ],
    status: "ready",
    generatedByAi: false,
    createdAt: ago(18), updatedAt: ago(18),
  },
  {
    id: "vid_test_pyramid_microservices",
    url: "https://www.youtube.com/watch?v=g4Tn82LqXkR",
    title: "Designing Resilient Test Pyramids for Microservices",
    channel: "GOTO Conferences",
    topic: "System Design",
    durationMinutes: 38,
    transcript:
      "When you move from a monolith to a fleet of services, the classic test pyramid starts to lie to you. " +
      "Most of your incidents now happen at the seams between services, not inside any one of them...",
    summary:
      "An architectural walkthrough of how to balance unit, contract, integration, and end-to-end tests across " +
      "a microservices fleet — and why the classic pyramid needs a dedicated contract-testing layer once service " +
      "seams become the dominant source of incidents.",
    notes:
`## The problem with a literal pyramid
In a monolith, more unit tests and fewer E2E tests works well. In microservices, the seams between services are where most production incidents originate — so a pure pyramid under-invests in exactly the layer that matters most.

## The shape that actually works
1. **Unit tests** — fast, numerous, verify logic in isolation
2. **Contract tests** — verify the request/response shape each service promises its consumers (e.g. Pact)
3. **Integration tests** — verify a service against its real dependencies (DB, queue) in isolation
4. **End-to-end tests** — a thin top layer covering only the critical user journeys

## Key practices
- Run contract tests in CI on every PR — they catch breaking changes before deploy, not after.
- Use consumer-driven contracts so the provider knows exactly what each consumer expects.
- Keep E2E suites small and curated; quarantine and triage flaky tests fast.
- Invest in service virtualization (e.g. WireMock) so integration tests don't need the whole fleet running.

## Anti-patterns to avoid
- "Ice cream cone" — too many slow E2E tests, too few fast unit tests
- Skipping contract tests because "we'll catch it in staging" — staging incidents are expensive to diagnose`,
    concepts: [
      concept("c1", "Consumer-driven contract testing", "Consumers publish the exact request/response shapes they depend on; providers verify against those contracts in CI, catching breaking changes before deployment."),
      concept("c2", "Test trophy", "A shape that replaces the classic pyramid for service-oriented systems — heavier investment in integration and contract tests relative to pure unit tests, with a thin E2E cap."),
      concept("c3", "Service virtualization", "Standing up lightweight fake versions of dependent services (e.g. WireMock) so integration tests run fast and deterministically without the full fleet."),
      concept("c4", "Ice cream cone anti-pattern", "A test suite shape with too many slow, brittle E2E tests and too few fast unit tests — the inverse of a healthy pyramid, and a common symptom of testing 'from the outside in' under deadline pressure."),
    ],
    questions: [
      qa("q1", "Why doesn't the classic test pyramid map cleanly onto microservices?",
        "Most production incidents in service-oriented systems originate at the seams between services — places a pure unit-heavy pyramid doesn't cover. You need a dedicated layer (contract tests) that explicitly verifies those seams."),
      qa("q2", "What problem do consumer-driven contracts solve that integration tests don't?",
        "Integration tests verify a service against its real dependencies, which is slow and requires standing up the fleet. Contract tests let each consumer publish its expectations once, so the provider can verify compatibility in isolation and in CI — fast, and catching breakage pre-deploy."),
      qa("q3", "How do you keep an E2E suite from becoming a liability?",
        "Keep it small and curated — cover only the critical user journeys, triage failures quickly, and quarantine flaky tests rather than letting them erode trust in the whole suite."),
      qa("q4", "What's the role of service virtualization in this strategy?",
        "It lets integration tests run against realistic fake dependencies (e.g. WireMock) instead of the full live fleet — keeping them fast and deterministic while still testing real wiring code."),
    ],
    flashcards: [
      vcard("f1", "Why does the classic pyramid under-serve microservices?", "Most incidents happen at service seams — a layer the pyramid doesn't explicitly cover. Contract tests fill that gap."),
      vcard("f2", "Consumer-driven contract testing in one line", "Consumers publish the shapes they expect; providers verify against those contracts in CI before deploy."),
      vcard("f3", "Ice cream cone anti-pattern", "Too many slow E2E tests, too few fast unit tests — the inverted, unhealthy version of the pyramid."),
      vcard("f4", "Why use service virtualization?", "Lets integration tests run fast & deterministically against fake dependencies instead of spinning up the whole fleet."),
    ],
    revisionNotes:
`- Microservice incidents cluster at service seams — pyramid alone misses this
- Add a contract-testing layer (e.g. Pact) between unit and integration
- Consumer-driven contracts: consumers define expectations, providers verify in CI
- Service virtualization (WireMock etc.) keeps integration tests fast & deterministic
- Keep E2E thin, curated, and aggressively triaged — quarantine flaky tests fast
- Watch for the "ice cream cone" anti-pattern: too much E2E, too little unit coverage`,
    cheatSheet:
`| Layer | Verifies | Speed | Tooling example |
|---|---|---|---|
| Unit | Logic in isolation | Fastest | Jest / Vitest |
| Contract | Request/response shape between services | Fast | Pact |
| Integration | Service + real dependencies | Medium | Testcontainers |
| E2E | Critical user journeys end-to-end | Slowest | Playwright |`,
    mcqs: [
      mcq("m1", "Where do most microservice production incidents originate, according to this talk?",
        ["Inside individual service logic", "At the seams between services", "In the database layer only", "In the CI pipeline"], 1,
        "The seams — where one service's assumptions meet another's — are where most real incidents start, which is exactly what contract tests target."),
      mcq("m2", "What does a consumer publish in consumer-driven contract testing?",
        ["Its full source code", "The exact request/response shapes it depends on", "Its deployment schedule", "Its test coverage report"], 1,
        "Consumers describe what they expect from a provider; the provider then verifies it can satisfy every published contract."),
      mcq("m3", "What's the main benefit of service virtualization in integration testing?",
        ["It replaces the need for unit tests", "It lets tests run fast and deterministically without the full live fleet", "It eliminates the need for contract tests", "It automatically fixes flaky tests"], 1,
        "Virtualized dependencies (e.g. WireMock) give integration tests realistic behavior without the cost and flakiness of running the entire service fleet."),
      mcq("m4", "What is the 'ice cream cone' anti-pattern?",
        ["Too many unit tests, not enough E2E", "A balanced pyramid with a contract layer", "Too many slow E2E tests, too few fast unit tests", "Running tests only in production"], 2,
        "It's the inverted pyramid — heavy on slow, brittle E2E tests and light on fast unit coverage — a common symptom of testing from the outside in under time pressure."),
    ],
    status: "ready",
    generatedByAi: false,
    createdAt: ago(14), updatedAt: ago(14),
  },
  {
    id: "vid_llm_eval_metrics",
    url: "https://www.youtube.com/watch?v=k9Lp34RtVqW",
    title: "Evaluating LLMs: Metrics That Actually Matter",
    channel: "AI Engineer Summit",
    topic: "GenAI Testing",
    durationMinutes: 45,
    transcript:
      "Everyone can tell you their chatbot 'sounds good' in a demo. Almost nobody can tell you whether it actually " +
      "works at scale. Today we're building a metric stack that tells the difference...",
    summary:
      "A practical framework for evaluating LLM-powered features beyond vibes — covering groundedness, task " +
      "success rate, consistency, and latency/cost trade-offs, plus how to build a golden-example regression " +
      "suite that catches quality drift before users do.",
    notes:
`## Why "it sounds good" isn't a metric
Fluent output is table stakes, not a quality signal. The questions that matter: did it solve the user's task, was it grounded in the provided context, and would it do so consistently across model/prompt changes?

## A practical metric stack
1. **Task success rate** — did the output achieve the user's actual goal? Usually needs a rubric or reference answer.
2. **Groundedness / faithfulness** — for RAG systems, does every claim trace back to retrieved context?
3. **Consistency** — same input, similar quality output across runs and minor prompt tweaks.
4. **Latency & cost per request** — quality that arrives too slowly or too expensively isn't shippable.

## Building a golden-example regression suite
- Curate 50–200 representative input/output pairs, including edge cases and known failure modes.
- Re-run the suite on every prompt or model change; diff scores, not just outputs.
- Mix automated scoring (LLM-as-judge, embedding similarity) with periodic human spot-checks.

## Common mistakes
- Eyeballing a handful of demo outputs and calling it "evaluated"
- Using a single aggregate score that hides regressions in specific subpopulations
- Letting the LLM-as-judge model drift without recalibrating against human judgments`,
    concepts: [
      concept("c1", "Groundedness", "A measure of whether every claim in a generated answer can be traced back to the retrieved or provided context — the core defense against hallucination in RAG systems."),
      concept("c2", "LLM-as-judge", "Using a (typically stronger) LLM to score outputs against a rubric at scale — fast and cheap, but needs periodic recalibration against human judgments to avoid silent drift."),
      concept("c3", "Golden-example regression suite", "A curated set of representative input/output pairs — including known edge cases — re-run on every model or prompt change to catch quality regressions before users do."),
      concept("c4", "Task success rate", "The percentage of interactions where the model actually achieved the user's underlying goal, as opposed to merely producing fluent, plausible-sounding text."),
    ],
    questions: [
      qa("q1", "Why is 'the output sounds fluent' not a useful evaluation signal?",
        "Modern LLMs are fluent by default — fluency says nothing about whether the answer is correct, grounded, or actually solves the user's task. Evaluations need to measure task success and groundedness, not surface polish."),
      qa("q2", "How do you defend against hallucination in a RAG system, from an evaluation standpoint?",
        "Score groundedness explicitly — check whether every factual claim in the output can be traced back to the retrieved context, and penalize unsupported assertions even if they sound plausible."),
      qa("q3", "What's the risk of relying solely on an LLM-as-judge?",
        "The judge model can drift from human judgment over time, or share blind spots with the model it's grading. Periodic human spot-checks are needed to recalibrate and catch systematic judge errors."),
      qa("q4", "How should you structure a regression suite for an LLM feature?",
        "Curate 50-200 representative input/output pairs that include edge cases and known failure modes, then re-run that suite — and diff the scores, not just the raw outputs — every time the prompt or model changes."),
    ],
    flashcards: [
      vcard("f1", "Why is fluency not a quality metric?", "LLMs are fluent by default — it says nothing about correctness, groundedness, or task success."),
      vcard("f2", "Groundedness, defined", "Whether every claim in an answer can be traced back to the retrieved/provided context — the core anti-hallucination check."),
      vcard("f3", "Biggest risk of LLM-as-judge", "Judge drift from human judgment, or shared blind spots with the model being graded — needs periodic human recalibration."),
      vcard("f4", "What goes in a golden-example regression suite?", "50-200 curated input/output pairs covering representative cases AND known edge cases/failure modes — re-run on every change."),
    ],
    revisionNotes:
`- Fluency ≠ quality — measure task success and groundedness instead
- Groundedness: every claim must trace back to retrieved/provided context
- LLM-as-judge is fast & cheap but needs human recalibration to avoid drift
- Build a golden-example suite (50-200 cases incl. edge cases); diff scores on every change
- Track latency & cost per request alongside quality — all three gate shippability
- Beware single aggregate scores — they can hide regressions in subpopulations`,
    cheatSheet:
`| Metric | Question it answers | How to measure |
|---|---|---|
| Task success rate | Did it solve the user's goal? | Rubric / reference-answer scoring |
| Groundedness | Is every claim supported by context? | Citation tracing / LLM-as-judge |
| Consistency | Same quality across runs & tweaks? | Repeated-run variance |
| Latency & cost | Is it shippable at scale? | p50/p95 latency, $/request |`,
    mcqs: [
      mcq("m1", "What does 'groundedness' measure in a RAG evaluation?",
        ["How fast the model responds", "Whether claims trace back to retrieved context", "How fluent the prose sounds", "How long the output is"], 1,
        "Groundedness checks that every factual claim is actually supported by the retrieved context — the central defense against hallucination."),
      mcq("m2", "What's the main weakness of LLM-as-judge evaluation?",
        ["It's too slow to run at scale", "It can drift from human judgment without recalibration", "It can't be automated", "It only works for code generation"], 1,
        "Judge models can drift from human standards or share blind spots with the model under test — periodic human spot-checks keep them honest."),
      mcq("m3", "What should a golden-example regression suite include?",
        ["Only the easiest, most common cases", "Only failure cases", "Representative cases plus known edge cases and failure modes", "Randomly sampled production logs with no curation"], 2,
        "A useful suite mixes representative everyday inputs with the edge cases and known failure modes most likely to regress."),
      mcq("m4", "Why track latency and cost alongside quality metrics?",
        ["They're required by most cloud providers", "Quality that's too slow or expensive to serve isn't actually shippable", "They're easier to measure than quality", "They replace the need for groundedness checks"], 1,
        "A technically excellent answer that arrives too slowly or costs too much per request still can't ship at scale — all three dimensions gate launch."),
    ],
    status: "ready",
    generatedByAi: false,
    createdAt: ago(9), updatedAt: ago(9),
  },
  {
    id: "vid_sql_window_functions",
    url: "https://www.youtube.com/watch?v=z3Mq71XwYpD",
    title: "SQL Window Functions for QA Analytics",
    channel: "Data School",
    topic: "SQL",
    durationMinutes: 28,
    transcript:
      "Test result tables are full of 'compare this row to its neighbor' problems. Today we'll solve flaky-test " +
      "dedup, run-over-run trend deltas, and rolling pass rates — all without a single self-join...",
    summary:
      "A hands-on tour of window functions — ROW_NUMBER, RANK, LAG/LEAD, and rolling aggregates — applied to real " +
      "QA analytics problems like deduplicating flaky test runs and tracking pass-rate trends over time.",
    notes:
`## Why window functions matter for QA
Test result tables are full of "compare this row to its neighbors" problems — flaky-test dedup, run-over-run trend deltas, rolling pass rates. Window functions solve these without self-joins or app-side loops.

## The core toolkit
- \`ROW_NUMBER() OVER (PARTITION BY test_name ORDER BY run_at DESC)\` — grab the latest run per test
- \`RANK()\` / \`DENSE_RANK()\` — rank tests by failure count, handling ties
- \`LAG()\` / \`LEAD()\` — compare a run's status to the previous/next run (perfect for flake detection)
- \`AVG(...) OVER (ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)\` — 7-day rolling pass rate

## Worked example: flaky test detection
A test is "flaky" if its status differs from both its previous and next run on the same branch. \`LAG(status)\` and \`LEAD(status)\` over \`(PARTITION BY test_name ORDER BY run_at)\` make this a single filtered query instead of an app-side loop.

## Gotchas
- \`PARTITION BY\` resets the window per group — forgetting it silently computes across the whole table.
- Window functions run after \`WHERE\` but before the final projection — wrap in a subquery or use \`QUALIFY\` where supported.`,
    concepts: [
      concept("c1", "PARTITION BY", "Splits rows into independent groups before a window function is applied — e.g. computing a rank per test_name rather than across the whole table. Forgetting it is the most common window-function bug."),
      concept("c2", "LAG / LEAD", "Window functions that fetch a value from the previous or next row within the current partition's order — ideal for run-over-run comparisons like flaky-test detection."),
      concept("c3", "Rolling aggregate", "An aggregate (e.g. AVG, SUM) computed over a sliding window of rows — such as 'the last 7 days' — using a frame clause like ROWS BETWEEN 6 PRECEDING AND CURRENT ROW."),
      concept("c4", "QUALIFY clause", "A clause (supported by Snowflake, BigQuery, DuckDB) that filters directly on window function results, avoiding the need to wrap the query in a subquery just to filter on a computed rank or row number."),
    ],
    questions: [
      qa("q1", "How would you grab only the latest test run per test name using a window function?",
        "ROW_NUMBER() OVER (PARTITION BY test_name ORDER BY run_at DESC), then filter to row number 1 — either in a subquery/CTE, or directly with QUALIFY on engines that support it."),
      qa("q2", "How do LAG and LEAD help detect flaky tests?",
        "By comparing each run's status to the previous and next run for the same test (PARTITION BY test_name ORDER BY run_at), you can flag a run as flaky when it differs from both neighbors — e.g. pass → fail → pass — in a single query."),
      qa("q3", "What's the most common mistake when writing window functions?",
        "Forgetting PARTITION BY — without it, the function computes across the entire result set instead of per group, silently producing wrong ranks, row numbers, or running totals."),
      qa("q4", "Why can't you put a window function directly in a WHERE clause?",
        "Window functions are evaluated after WHERE filtering but before the final projection, so the engine doesn't yet have their results to filter on. You need to wrap the query in a subquery/CTE and filter the outer query, or use QUALIFY where supported."),
    ],
    flashcards: [
      vcard("f1", "ROW_NUMBER() OVER (PARTITION BY test_name ORDER BY run_at DESC) — what does it give you?", "A per-test sequence number with the latest run as #1 — filter to 1 to grab just the most recent run for each test."),
      vcard("f2", "LAG/LEAD use case in QA analytics", "Compare a run's status to its previous/next run — the basis for single-query flaky-test detection (pass → fail → pass)."),
      vcard("f3", "Most common window function bug", "Forgetting PARTITION BY — the function then computes across the whole table instead of per group."),
      vcard("f4", "Why can't you filter on a window function in WHERE?", "Window functions evaluate after WHERE — wrap in a subquery/CTE, or use QUALIFY where supported."),
    ],
    revisionNotes:
`- ROW_NUMBER()/RANK()/DENSE_RANK() — per-partition ordering & ranking, handle ties differently
- LAG()/LEAD() — compare a row to its neighbor; great for flake & trend detection
- Rolling aggregates: AVG(...) OVER (... ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
- ALWAYS pair window functions with PARTITION BY when you mean "per group"
- Can't filter directly on a window function result — use a subquery/CTE or QUALIFY
- A single window-function query often replaces a self-join or app-side loop`,
    cheatSheet:
`| Need | Function |
|---|---|
| Latest row per group | ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ... DESC) |
| Rank with ties | RANK() / DENSE_RANK() |
| Compare to neighbor row | LAG() / LEAD() |
| Rolling N-day aggregate | AVG(x) OVER (ORDER BY d ROWS BETWEEN N-1 PRECEDING AND CURRENT ROW) |
| Filter on window result | Subquery/CTE, or QUALIFY (Snowflake/BigQuery/DuckDB) |`,
    mcqs: [
      mcq("m1", "What does PARTITION BY do in a window function?",
        ["Sorts rows globally", "Splits rows into independent groups before the function is applied", "Filters out NULL values", "Limits the result set to N rows"], 1,
        "PARTITION BY resets the window per group — e.g. ranking within each test_name rather than across the whole table."),
      mcq("m2", "Which function pair is best suited for flaky-test detection (pass → fail → pass)?",
        ["SUM() and COUNT()", "RANK() and DENSE_RANK()", "LAG() and LEAD()", "MIN() and MAX()"], 2,
        "LAG/LEAD let you compare a run's status to its previous and next neighbor in one pass — the core of single-query flake detection."),
      mcq("m3", "Why can't a window function's result be used directly in a WHERE clause?",
        ["It's a syntax error in all SQL dialects", "WHERE runs before window functions are evaluated", "Window functions can only return booleans", "WHERE only works on indexed columns"], 1,
        "Window functions are computed after WHERE filtering — you need a subquery/CTE or a QUALIFY clause to filter on their output."),
      mcq("m4", "What does ROWS BETWEEN 6 PRECEDING AND CURRENT ROW define?",
        ["A 6-row random sample", "A 7-row rolling window ending at the current row", "A limit of 6 results", "A partition boundary"], 1,
        "It defines a sliding frame of the current row plus the 6 before it — a classic 7-day rolling aggregate when ordered by date."),
    ],
    status: "ready",
    generatedByAi: false,
    createdAt: ago(4), updatedAt: ago(4),
  },
];
