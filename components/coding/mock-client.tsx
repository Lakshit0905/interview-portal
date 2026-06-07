"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send, RotateCcw, Bot, Play } from "lucide-react";
import { nextMockQuestion, evaluateAnswer, type MockEvaluation } from "@/lib/ai/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AiStatus } from "@/components/coding/ai-status";

interface Turn {
  question: string;
  answer: string;
  evaluation: MockEvaluation;
}

const TOPICS = ["General SDET", "Playwright", "API Testing", "CI/CD", "System Design", "GenAI Testing"];

export function MockClient() {
  const [topic, setTopic] = React.useState("General SDET");
  const [started, setStarted] = React.useState(false);
  const [current, setCurrent] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [turns, setTurns] = React.useState<Turn[]>([]);
  const [asked, setAsked] = React.useState<string[]>([]);
  const [loadingQ, startQ] = React.useTransition();
  const [grading, startGrade] = React.useTransition();
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [turns, current]);

  function start() {
    setStarted(true);
    setTurns([]);
    setAsked([]);
    startQ(async () => {
      const q = await nextMockQuestion(topic, []);
      setCurrent(q);
      setAsked([q]);
    });
  }

  function submit() {
    if (!answer.trim() || !current) return;
    const q = current;
    const a = answer;
    setAnswer("");
    startGrade(async () => {
      const evaluation = await evaluateAnswer(q, a);
      setTurns((t) => [...t, { question: q, answer: a, evaluation }]);
      setCurrent("");
      const nextAsked = [...asked, q];
      const nq = await nextMockQuestion(topic, nextAsked);
      setCurrent(nq);
      setAsked([...nextAsked, nq]);
    });
  }

  const avgScore = turns.length
    ? Math.round((turns.reduce((s, t) => s + t.evaluation.score, 0) / turns.length) * 10) / 10
    : 0;
  const aiEnabled = turns.some((t) => t.evaluation.enabled);

  if (!started) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <Bot className="h-7 w-7 text-primary" />
        </div>
        <h2 className="mt-4 text-lg font-semibold">Start a mock interview</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          You&apos;ll be asked questions one at a time. Answer each, get scored feedback and a model answer, then move on.
        </p>
        <div className="mx-auto mt-5 flex max-w-sm flex-col gap-3">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background/60 px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <Button onClick={start} className="h-10"><Play className="h-4 w-4" /> Begin interview</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">topic</span>
          <span className="font-medium">{topic}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="font-mono text-[0.65rem] uppercase tracking-wider text-muted-foreground">avg score</p>
            <p className="font-mono text-lg font-bold text-primary">{avgScore}<span className="text-sm text-muted-foreground">/10</span></p>
          </div>
          <Button variant="outline" size="sm" onClick={start}><RotateCcw className="h-3.5 w-3.5" /> Restart</Button>
        </div>
      </div>

      {turns.length > 0 && <AiStatus enabled={aiEnabled} className="mb-4" />}

      <div className="space-y-4">
        {turns.map((t, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Bubble role="interviewer">{t.question}</Bubble>
            <Bubble role="you">{t.answer}</Bubble>
            <div className="ml-4 rounded-xl border border-border bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <p className="mono-label">feedback</p>
                <span className={cn(
                  "rounded-md px-2 py-0.5 font-mono text-xs ring-1",
                  t.evaluation.score >= 7 ? "bg-signal-green/10 text-signal-green ring-signal-green/30"
                    : t.evaluation.score >= 4 ? "bg-signal-amber/10 text-signal-amber ring-signal-amber/30"
                      : "bg-signal-red/10 text-signal-red ring-signal-red/30",
                )}>{t.evaluation.score}/10</span>
              </div>
              {t.evaluation.strengths.length > 0 && (
                <div className="mt-3"><p className="text-xs font-medium text-signal-green">Strengths</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-foreground/90">{t.evaluation.strengths.map((s, j) => <li key={j}>· {s}</li>)}</ul></div>
              )}
              {t.evaluation.improvements.length > 0 && (
                <div className="mt-2"><p className="text-xs font-medium text-signal-amber">Improvements</p>
                  <ul className="mt-1 space-y-0.5 text-sm text-foreground/90">{t.evaluation.improvements.map((s, j) => <li key={j}>· {s}</li>)}</ul></div>
              )}
              {t.evaluation.modelAnswer && (
                <div className="mt-2"><p className="text-xs font-medium text-primary">Model answer</p>
                  <p className="mt-1 text-sm text-foreground/90">{t.evaluation.modelAnswer}</p></div>
              )}
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {current && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Bubble role="interviewer">{current}</Bubble>
            </motion.div>
          )}
        </AnimatePresence>

        {loadingQ && !current && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> preparing question…</div>
        )}
        <div ref={endRef} />
      </div>

      <div className="sticky bottom-0 mt-4 flex gap-2 border-t border-border bg-background/80 py-3 backdrop-blur">
        <Textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(); }}
          placeholder="Type your answer… (⌘/Ctrl + Enter to submit)"
          className="min-h-[60px] flex-1"
          disabled={grading || !current}
        />
        <Button onClick={submit} disabled={grading || !answer.trim() || !current} className="h-auto">
          {grading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "interviewer" | "you"; children: React.ReactNode }) {
  const isInterviewer = role === "interviewer";
  return (
    <div className={cn("flex", isInterviewer ? "justify-start" : "justify-end")}>
      <div className={cn(
        "max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
        isInterviewer ? "border border-border bg-card" : "bg-primary/15 text-foreground",
      )}>
        <p className="mb-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-muted-foreground">{isInterviewer ? "interviewer" : "you"}</p>
        <p className="whitespace-pre-wrap leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
