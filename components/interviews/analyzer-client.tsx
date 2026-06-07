"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ScanSearch, Loader2, CheckCircle2, XCircle, Lightbulb } from "lucide-react";
import { analyzeResume, type ResumeAnalysis } from "@/lib/ai/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AiStatus } from "@/components/coding/ai-status";

interface SavedResume { id: string; label: string; content: string }

export function AnalyzerClient({ resumes }: { resumes: SavedResume[] }) {
  const [resume, setResume] = React.useState("");
  const [jd, setJd] = React.useState("");
  const [result, setResult] = React.useState<ResumeAnalysis | null>(null);
  const [pending, startTransition] = React.useTransition();

  function run() {
    if (!resume.trim() || !jd.trim()) return;
    startTransition(async () => setResult(await analyzeResume(resume, jd)));
  }

  return (
    <div>
      {resumes.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="mono-label mr-1">load saved:</span>
          {resumes.map((r) => (
            <button key={r.id} onClick={() => setResume(r.content)} className="rounded-lg border border-border px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground">
              {r.label}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mono-label mb-1.5">your resume (plain text)</p>
          <Textarea value={resume} onChange={(e) => setResume(e.target.value)} className="min-h-[260px] font-mono text-xs" placeholder="Paste your resume text…" />
        </div>
        <div>
          <p className="mono-label mb-1.5">job description</p>
          <Textarea value={jd} onChange={(e) => setJd(e.target.value)} className="min-h-[260px] font-mono text-xs" placeholder="Paste the target job description…" />
        </div>
      </div>

      <div className="mt-4">
        <Button onClick={run} disabled={pending || !resume.trim() || !jd.trim()} className="h-11 px-6">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />} Analyze match
        </Button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-5">
          <AiStatus enabled={result.enabled} />

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 sm:col-span-1">
              <p className="mono-label">ATS match score</p>
              <div className="mt-2 flex items-end gap-1">
                <span className={cn("font-mono text-4xl font-bold",
                  result.atsScore >= 70 ? "text-signal-green" : result.atsScore >= 40 ? "text-signal-amber" : "text-signal-red")}>
                  {result.atsScore}
                </span>
                <span className="mb-1 text-muted-foreground">/100</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${result.atsScore}%` }} transition={{ duration: 0.6 }}
                  className={cn("h-full rounded-full", result.atsScore >= 70 ? "bg-signal-green" : result.atsScore >= 40 ? "bg-signal-amber" : "bg-signal-red")} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
              <p className="mono-label mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-signal-green" /> matched skills ({result.matchedSkills.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {result.matchedSkills.length ? result.matchedSkills.map((s) => <Badge key={s} className="bg-signal-green/15 text-signal-green">{s}</Badge>)
                  : <span className="text-sm text-muted-foreground">No overlap detected.</span>}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mono-label mb-2 flex items-center gap-1.5"><XCircle className="h-3.5 w-3.5 text-signal-red" /> missing keywords ({result.missingSkills.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {result.missingSkills.length ? result.missingSkills.map((s) => <Badge key={s} variant="outline" className="border-signal-red/30 text-signal-red">{s}</Badge>)
                : <span className="text-sm text-muted-foreground">Nothing major missing — strong coverage.</span>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="mono-label mb-2 flex items-center gap-1.5"><Lightbulb className="h-3.5 w-3.5 text-signal-amber" /> suggestions</p>
            <ul className="space-y-2">
              {result.suggestions.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                  <span className="mt-0.5 font-mono text-xs text-muted-foreground">{i + 1}.</span> {s}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      )}
    </div>
  );
}
