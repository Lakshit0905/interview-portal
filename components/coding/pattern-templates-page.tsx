"use client";

import { Code2, Workflow } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogicFlowVisualizer } from "./logic-flow-visualizer";

const PATTERNS = [
  {
    name: "HashMap lookup",
    whenToUse: "Need constant-time lookup for complements, frequencies, or seen values.",
    flow: ["Start", "Read input", "Create map", "Loop items", "Check complement / key", "Update map", "Return result"],
    pseudocode: "map = {}\nfor item in input:\n  if needed(item) in map:\n    return answer\n  map[item] = index_or_count",
    code: "const map = new Map();\nfor (let i = 0; i < nums.length; i++) {\n  const need = target - nums[i];\n  if (map.has(need)) return [map.get(need), i];\n  map.set(nums[i], i);\n}",
    examples: ["Two Sum", "Contains Duplicate", "Subarray Sum Equals K"],
    mistakes: "Storing current value before checking can accidentally reuse the same element.",
  },
  {
    name: "Two pointers",
    whenToUse: "Sorted arrays, pair search, partitioning, or comparing from both ends.",
    flow: ["Start", "Set left/right", "Compare values", "Move one pointer", "Track result", "Return"],
    pseudocode: "left = 0; right = n - 1\nwhile left < right:\n  decide based on current pair\n  move left or right",
    code: "let left = 0, right = nums.length - 1;\nwhile (left < right) {\n  const sum = nums[left] + nums[right];\n  if (sum === target) return [left, right];\n  sum < target ? left++ : right--;\n}",
    examples: ["Two Sum II", "Container With Most Water", "Valid Palindrome"],
    mistakes: "Moving both pointers without a reason can skip valid answers.",
  },
  {
    name: "Sliding window",
    whenToUse: "Contiguous subarray or substring with a dynamic range.",
    flow: ["Start", "Expand right", "Update window state", "Shrink left if invalid", "Update best", "Return best"],
    pseudocode: "left = 0\nfor right in range(n):\n  add input[right]\n  while window invalid:\n    remove input[left]\n    left += 1\n  update answer",
    code: "let left = 0, best = 0;\nconst counts = new Map();\nfor (let right = 0; right < s.length; right++) {\n  counts.set(s[right], (counts.get(s[right]) ?? 0) + 1);\n  while (/* invalid */) left++;\n  best = Math.max(best, right - left + 1);\n}",
    examples: ["Longest Substring Without Repeating", "Minimum Window Substring"],
    mistakes: "Forgetting to remove left-side state when shrinking.",
  },
  {
    name: "Binary search",
    whenToUse: "Sorted answer space, sorted arrays, first/last valid boundary.",
    flow: ["Start", "Set low/high", "Pick mid", "Check condition", "Discard half", "Return boundary"],
    pseudocode: "lo = 0; hi = n - 1\nwhile lo <= hi:\n  mid = (lo + hi) // 2\n  if condition(mid): move hi\n  else move lo",
    code: "let lo = 0, hi = nums.length - 1;\nwhile (lo <= hi) {\n  const mid = Math.floor((lo + hi) / 2);\n  if (nums[mid] >= target) hi = mid - 1;\n  else lo = mid + 1;\n}",
    examples: ["Search Insert Position", "Find Minimum Rotated Array"],
    mistakes: "Wrong boundary updates cause infinite loops or off-by-one bugs.",
  },
  {
    name: "Stack",
    whenToUse: "Nested structure, monotonic next greater/smaller, undo-like processing.",
    flow: ["Start", "Create stack", "Read item", "Pop while condition", "Push item", "Return"],
    pseudocode: "stack = []\nfor item in input:\n  while stack and condition(stack[-1], item):\n    pop\n  push item",
    code: "const stack = [];\nfor (const ch of s) {\n  if (ch === '(') stack.push(ch);\n  else if (!stack.pop()) return false;\n}\nreturn stack.length === 0;",
    examples: ["Valid Parentheses", "Daily Temperatures", "Largest Rectangle"],
    mistakes: "Not checking empty stack before reading the top.",
  },
  {
    name: "Queue",
    whenToUse: "Level-order processing or first-in-first-out simulation.",
    flow: ["Start", "Enqueue initial", "Dequeue", "Process", "Enqueue next", "Return"],
    pseudocode: "queue = [start]\nwhile queue:\n  node = queue.shift()\n  process node\n  add neighbors",
    code: "const queue = [root];\nwhile (queue.length) {\n  const node = queue.shift();\n  if (node.left) queue.push(node.left);\n  if (node.right) queue.push(node.right);\n}",
    examples: ["Binary Tree Level Order", "Rotting Oranges"],
    mistakes: "Using slow array shifting at huge scale without a head index.",
  },
  {
    name: "BFS",
    whenToUse: "Shortest path in unweighted graph or level-by-level traversal.",
    flow: ["Start", "Queue start", "Mark visited", "Explore neighbors", "Track distance", "Return shortest"],
    pseudocode: "queue = [start]\nvisited = set(start)\nwhile queue:\n  node = pop_front\n  for neighbor in node.neighbors:\n    if unseen: mark and enqueue",
    code: "const queue = [[start, 0]];\nconst seen = new Set([start]);\nfor (let head = 0; head < queue.length; head++) {\n  const [node, dist] = queue[head];\n  for (const next of graph[node]) if (!seen.has(next)) { seen.add(next); queue.push([next, dist + 1]); }\n}",
    examples: ["Shortest Path", "Word Ladder", "Rotting Oranges"],
    mistakes: "Marking visited too late can enqueue duplicates.",
  },
  {
    name: "DFS",
    whenToUse: "Explore all reachable paths, connected components, tree recursion.",
    flow: ["Start", "Visit node", "Mark seen", "Recurse neighbors", "Backtrack", "Return"],
    pseudocode: "dfs(node):\n  if invalid or seen: return\n  mark seen\n  for neighbor in neighbors:\n    dfs(neighbor)",
    code: "function dfs(node) {\n  if (!node || seen.has(node)) return;\n  seen.add(node);\n  for (const next of graph[node]) dfs(next);\n}",
    examples: ["Number of Islands", "Clone Graph", "Path Sum"],
    mistakes: "Missing base cases in recursion.",
  },
  {
    name: "Backtracking",
    whenToUse: "Generate combinations, permutations, subsets, or choices with undo.",
    flow: ["Start", "Choose option", "Recurse", "Undo choice", "Collect result", "Return"],
    pseudocode: "backtrack(path):\n  if complete: save path\n  for choice in choices:\n    choose\n    backtrack(path)\n    undo",
    code: "function backtrack(start, path) {\n  result.push([...path]);\n  for (let i = start; i < nums.length; i++) {\n    path.push(nums[i]);\n    backtrack(i + 1, path);\n    path.pop();\n  }\n}",
    examples: ["Subsets", "Permutations", "Combination Sum"],
    mistakes: "Forgetting to undo state after recursion.",
  },
  {
    name: "Dynamic programming",
    whenToUse: "Overlapping subproblems with optimal substructure.",
    flow: ["Start", "Define state", "Set base cases", "Transition", "Fill table / memo", "Return answer"],
    pseudocode: "dp[state] = answer for state\ninitialize base cases\nfor each state:\n  dp[state] = best(previous states)",
    code: "const dp = Array(n + 1).fill(0);\ndp[0] = 1;\nfor (let i = 1; i <= n; i++) {\n  dp[i] = dp[i - 1] + (i > 1 ? dp[i - 2] : 0);\n}",
    examples: ["Climbing Stairs", "House Robber", "Coin Change"],
    mistakes: "Starting with recurrence before clearly defining state.",
  },
  {
    name: "Greedy",
    whenToUse: "Local best choice can be proven to lead to global optimum.",
    flow: ["Start", "Sort / prioritize", "Pick best local option", "Update state", "Skip invalid", "Return"],
    pseudocode: "sort input if needed\nfor item in input:\n  if item improves answer:\n    choose it",
    code: "intervals.sort((a, b) => a[1] - b[1]);\nlet end = -Infinity, count = 0;\nfor (const [s, e] of intervals) if (s >= end) { count++; end = e; }",
    examples: ["Merge Intervals variant", "Jump Game", "Non-overlapping Intervals"],
    mistakes: "Using greedy without proving the choice is safe.",
  },
  {
    name: "Heap / Priority Queue",
    whenToUse: "Need repeated min/max extraction or top K.",
    flow: ["Start", "Build heap", "Push candidates", "Pop best", "Update result", "Return"],
    pseudocode: "heap = priority queue\nfor item in input:\n  heap.push(item)\n  if heap too large: heap.pop()\nreturn heap contents/top",
    code: "// Use a heap implementation\nheap.push(value);\nif (heap.size() > k) heap.pop();",
    examples: ["Kth Largest", "Merge K Lists", "Top K Frequent"],
    mistakes: "Using full sort when only top K is needed.",
  },
  {
    name: "Trie",
    whenToUse: "Prefix search, dictionary words, autocomplete.",
    flow: ["Start", "Create root", "Insert characters", "Traverse prefix", "Check terminal", "Return"],
    pseudocode: "insert(word):\n  node = root\n  for char in word:\n    node = node.children[char]\n  node.end = true",
    code: "let node = root;\nfor (const ch of word) {\n  node.children[ch] ??= { children: {}, end: false };\n  node = node.children[ch];\n}\nnode.end = true;",
    examples: ["Implement Trie", "Word Search II", "Replace Words"],
    mistakes: "Not distinguishing prefix from complete word.",
  },
  {
    name: "Intervals",
    whenToUse: "Ranges, overlaps, scheduling, merge or insert intervals.",
    flow: ["Start", "Sort by start", "Compare with current", "Merge or append", "Return intervals"],
    pseudocode: "sort intervals by start\nfor interval in intervals:\n  if overlaps last: merge\n  else append",
    code: "intervals.sort((a, b) => a[0] - b[0]);\nconst merged = [];\nfor (const cur of intervals) {\n  const last = merged[merged.length - 1];\n  if (last && cur[0] <= last[1]) last[1] = Math.max(last[1], cur[1]);\n  else merged.push([...cur]);\n}",
    examples: ["Merge Intervals", "Insert Interval", "Meeting Rooms"],
    mistakes: "Forgetting to sort before merging.",
  },
];

export function PatternTemplatesPage() {
  return (
    <div className="space-y-4">
      {PATTERNS.map((pattern) => (
        <section key={pattern.name} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">{pattern.name}</h2>
            <Badge variant="muted"><Workflow className="h-3 w-3" /> template</Badge>
          </div>
          <Tabs defaultValue="when">
            <TabsList className="flex h-auto flex-wrap">
              <TabsTrigger value="when">When to use</TabsTrigger>
              <TabsTrigger value="flow">Visual flow</TabsTrigger>
              <TabsTrigger value="pseudo">Pseudocode</TabsTrigger>
              <TabsTrigger value="code">Code template</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
              <TabsTrigger value="mistakes">Mistakes</TabsTrigger>
            </TabsList>
            <TabsContent value="when"><p className="rounded-lg bg-muted/40 p-3 text-sm">{pattern.whenToUse}</p></TabsContent>
            <TabsContent value="flow"><LogicFlowVisualizer steps={pattern.flow} /></TabsContent>
            <TabsContent value="pseudo"><Pre text={pattern.pseudocode} /></TabsContent>
            <TabsContent value="code"><Pre text={pattern.code} /></TabsContent>
            <TabsContent value="examples">
              <div className="flex flex-wrap gap-1.5">{pattern.examples.map((item) => <Badge key={item} variant="outline">{item}</Badge>)}</div>
            </TabsContent>
            <TabsContent value="mistakes"><p className="rounded-lg bg-signal-amber/10 p-3 text-sm text-foreground/90">{pattern.mistakes}</p></TabsContent>
          </Tabs>
        </section>
      ))}
    </div>
  );
}

function Pre({ text }: { text: string }) {
  return (
    <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90">
      <Code2 className="mb-2 h-4 w-4 text-muted-foreground" />
      {text}
    </pre>
  );
}
