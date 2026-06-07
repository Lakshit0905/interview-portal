import type {
  CodingProblem, InterviewQuestion, BehavioralStory,
  SystemDesign, Resume, Interview,
} from "@/types";

const t = (d: string) => `2025-${d}T10:00:00.000Z`;

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
    createdAt: t("04-10"), updatedAt: t("05-15"),
  },
  {
    id: "rs_genai", label: "SDET — GenAI / LLM testing", version: "v1.0",
    targetCompany: "Anthropic", fileName: "sdet-genai-v1.pdf", fileUrl: "",
    notes: "Emphasize LLM eval, prompt regression and RAG testing experience.",
    content: "SDET focused on evaluating LLM systems: prompt regression suites, hallucination detection, RAG retrieval quality and offline/online eval harnesses.",
    createdAt: t("05-01"), updatedAt: t("05-20"),
  },
];

export const interviewSeed: Interview[] = [
  {
    id: "iv_stripe", company: "Stripe", position: "Senior SDET, Platform", recruiter: "Dana R.",
    interviewDate: t("06-18"), round: "Technical Round", status: "Technical Round",
    notes: "Coding + framework design. Review their public API docs and idempotency keys.",
    createdAt: t("05-20"), updatedAt: t("06-01"),
  },
  {
    id: "iv_anthropic", company: "Anthropic", position: "Software Engineer, QA / Evals", recruiter: "Self-applied",
    interviewDate: t("06-25"), round: "Recruiter Screen", status: "Recruiter Screen",
    notes: "Lean into GenAI eval stories. Prepare RAG + hallucination testing examples.",
    createdAt: t("05-28"), updatedAt: t("05-28"),
  },
  {
    id: "iv_datadog", company: "Datadog", position: "SDET II", recruiter: "Marco P.",
    interviewDate: t("05-30"), round: "Final Round", status: "Offer",
    notes: "Strong system design round. Offer received — negotiating.",
    createdAt: t("04-15"), updatedAt: t("06-02"),
  },
  {
    id: "iv_cloudflare", company: "Cloudflare", position: "QA Automation Engineer", recruiter: "Priya S.",
    interviewDate: t("04-20"), round: "Technical Round", status: "Rejected",
    notes: "Tripped on a graph DFS question under time pressure. Drill graph traversals.",
    createdAt: t("04-01"), updatedAt: t("04-22"),
  },
];
