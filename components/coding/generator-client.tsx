"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { generateQuestions, type GeneratedQuestions } from "@/lib/ai/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AiStatus } from "@/components/coding/ai-status";

const PRESETS = ["Playwright", "TypeScript", "API Testing", "SQL", "CI/CD", "System Design", "GenAI Testing"];
const TIERS: { key: keyof Omit<GeneratedQuestions, "enabled">; label: string; accent: string }[] = [
  { key: "beginner", label: "Beginner", accent: "green" },
  { key: "intermediate", label: "Intermediate", accent: "amber" },
  { key: "senior", label: "Senior", accent: "red" },
];
const ACCENT_DOT: Record<string, string> = { green: "bg-signal-green", amber: "bg-signal-amber", red: "bg-signal-red" };

export function GeneratorClient() {
  const [topic, setTopic] = React.useState("");
  const [result, setResult] = React.useState<GeneratedQuestions | null>(null);
  const [pending, startTransition] = React.useTransition();
  const [copied, setCopied] = React.useState<string | null>(null);

  function run(t?: string) {
    const value = (t ?? topic).trim();
    if (!value) return;
    setTopic(value);
    startTransition(async () => setResult(await generateQuestions(value)));
  }

  function copy(q: string) {
    navigator.clipboard?.writeText(q);
    setCopied(q);
    setTimeout(() => setCopied(null), 1200);
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run()}
          placeholder="Enter a topic, e.g. Playwright fixtures"
          className="h-11 text-base"
        />
        <Button onClick={() => run()} disabled={pending || !topic.trim()} className="h-11 px-6">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {PRESETS.map((p) => (
          <button key={p} onClick={() => run(p)} className="rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
            {p}
          </button>
        ))}
      </div>

      {result && <AiStatus enabled={result.enabled} className="mt-5" />}

      {result && (
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier, ti) => (
            <motion.div
              key={tier.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ti * 0.08 }}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", ACCENT_DOT[tier.accent])} />
                <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">{tier.label}</h3>
              </div>
              <ol className="space-y-2">
                {result[tier.key].map((q, i) => (
                  <li key={i} className="group flex items-start gap-2 rounded-lg border border-transparent p-2 text-sm hover:border-border hover:bg-background/40">
                    <span className="mt-0.5 font-mono text-xs text-muted-foreground">{i + 1}.</span>
                    <span className="flex-1 text-foreground/90">{q}</span>
                    <button onClick={() => copy(q)} className="opacity-0 transition-opacity group-hover:opacity-100">
                      {copied === q ? <Check className="h-3.5 w-3.5 text-signal-green" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground" />}
                    </button>
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
