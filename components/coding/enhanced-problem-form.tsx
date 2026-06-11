"use client";

import * as React from "react";
import { Loader2, Sparkles, Star } from "lucide-react";
import type { CodingProblem, CodingStatus, Difficulty } from "@/types";
import { CODING_TOPICS } from "@/types";
import { generateCodingLearningFields } from "@/lib/actions/coding-ai";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogicFlowVisualizer, DEFAULT_FLOW_STEPS } from "./logic-flow-visualizer";
import { AlgorithmArchitectureView } from "./algorithm-architecture-view";
import { PseudocodeEditor } from "./pseudocode-editor";
import { MemoryNotesSection } from "./memory-notes-section";

export type CodingProblemDraft = Partial<CodingProblem>;

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const CONFIDENCE = ["Low", "Medium", "High"] as const;
const STATUSES: { value: CodingStatus; label: string }[] = [
  { value: "todo", label: "To do" },
  { value: "solved", label: "Solved" },
  { value: "revisit", label: "Revisit" },
];

export const EMPTY_ENHANCED_PROBLEM: CodingProblemDraft = {
  name: "",
  difficulty: "Medium",
  topic: "Arrays",
  status: "todo",
  solution: "",
  code: "",
  language: "TypeScript",
  timeComplexity: "",
  spaceComplexity: "",
  notes: "",
  url: "",
  revisitDate: "",
  understanding: "",
  input: "",
  output: "",
  constraints: "",
  edgeCases: "",
  pattern: "",
  approach: "",
  pseudocode: "",
  flowSteps: DEFAULT_FLOW_STEPS,
  architectureBlocks: {},
  memoryNotes: {},
  tags: [],
  isFavorite: false,
  confidence: "Medium",
  lastRevisedAt: "",
  nextRevisionAt: "",
  revisionCount: 0,
  revisionNotes: [],
};

export function EnhancedProblemForm({
  draft,
  onChange,
}: {
  draft: CodingProblemDraft;
  onChange: React.Dispatch<React.SetStateAction<CodingProblemDraft>>;
}) {
  const set = (patch: CodingProblemDraft) => onChange((d) => ({ ...d, ...patch }));
  const tagsText = (draft.tags ?? []).join(", ");
  const [aiMessage, setAiMessage] = React.useState<string | null>(null);
  const [pendingAi, startAiTransition] = React.useTransition();

  function autofillWithAi() {
    setAiMessage(null);
    startAiTransition(async () => {
      const result = await generateCodingLearningFields({
        name: draft.name,
        topic: draft.topic,
        difficulty: draft.difficulty,
        understanding: draft.understanding,
        input: draft.input,
        output: draft.output,
        constraints: draft.constraints,
        edgeCases: draft.edgeCases,
        code: draft.code,
        solution: draft.solution,
        language: draft.language,
      });
      onChange((current) => ({
        ...current,
        ...result.fields,
        solution: result.fields.code || current.solution,
      }));
      setAiMessage(result.enabled ? "AI filled the learning sections. Review and save when ready." : "Offline autofill filled the learning sections. Add ANTHROPIC_API_KEY for richer AI output.");
    });
  }

  return (
    <Tabs defaultValue="basics" className="max-h-[70vh] overflow-y-auto pr-1">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <div>
          <p className="text-sm font-medium">AI autofill</p>
          <p className="text-xs text-muted-foreground">Uses your problem details and code to fill Logic Flow, Architecture, Pseudocode, Memory Notes, and Revision.</p>
          {aiMessage && <p className="mt-1 text-xs text-signal-green">{aiMessage}</p>}
        </div>
        <Button type="button" variant="outline" onClick={autofillWithAi} disabled={pendingAi || !(draft.code || draft.solution || draft.name)}>
          {pendingAi ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Autofill with AI
        </Button>
      </div>

      <TabsList className="flex h-auto flex-wrap">
        <TabsTrigger value="basics">Basics</TabsTrigger>
        <TabsTrigger value="logic">Logic</TabsTrigger>
        <TabsTrigger value="architecture">Architecture</TabsTrigger>
        <TabsTrigger value="memory">Memory</TabsTrigger>
        <TabsTrigger value="revision">Revision</TabsTrigger>
      </TabsList>

      <TabsContent value="basics" className="grid gap-4">
        <Field label="Problem name">
          <Input value={draft.name ?? ""} onChange={(e) => set({ name: e.target.value })} placeholder="Two Sum" />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Topic">
            <Select value={draft.topic} onValueChange={(v) => set({ topic: v as CodingProblemDraft["topic"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CODING_TOPICS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Difficulty">
            <Select value={draft.difficulty} onValueChange={(v) => set({ difficulty: v as Difficulty })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select value={draft.status} onValueChange={(v) => set({ status: v as CodingStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Language">
            <Input value={draft.language ?? ""} onChange={(e) => set({ language: e.target.value })} placeholder="TypeScript" />
          </Field>
        </div>
        <Field label="My understanding of the question">
          <Textarea value={draft.understanding ?? ""} onChange={(e) => set({ understanding: e.target.value })} rows={3} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Input"><Textarea value={draft.input ?? ""} onChange={(e) => set({ input: e.target.value })} rows={2} /></Field>
          <Field label="Expected output"><Textarea value={draft.output ?? ""} onChange={(e) => set({ output: e.target.value })} rows={2} /></Field>
          <Field label="Constraints"><Textarea value={draft.constraints ?? ""} onChange={(e) => set({ constraints: e.target.value })} rows={2} /></Field>
          <Field label="Edge cases"><Textarea value={draft.edgeCases ?? ""} onChange={(e) => set({ edgeCases: e.target.value })} rows={2} /></Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Pattern"><Input value={draft.pattern ?? ""} onChange={(e) => set({ pattern: e.target.value })} placeholder="HashMap lookup" /></Field>
          <Field label="Time complexity"><Input value={draft.timeComplexity ?? ""} onChange={(e) => set({ timeComplexity: e.target.value })} placeholder="O(n)" /></Field>
          <Field label="Space complexity"><Input value={draft.spaceComplexity ?? ""} onChange={(e) => set({ spaceComplexity: e.target.value })} placeholder="O(n)" /></Field>
        </div>
        <Field label="Approach explanation"><Textarea value={draft.approach ?? ""} onChange={(e) => set({ approach: e.target.value })} rows={4} /></Field>
        <Field label="Code solution">
          <Textarea value={draft.code ?? draft.solution ?? ""} onChange={(e) => set({ code: e.target.value, solution: e.target.value })} className="min-h-[160px] font-mono text-xs" />
        </Field>
        <Field label="Source URL"><Input value={draft.url ?? ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://leetcode.com/problems/…" /></Field>
      </TabsContent>

      <TabsContent value="logic" className="grid gap-4">
        <PseudocodeEditor value={draft.pseudocode} editable onChange={(pseudocode) => set({ pseudocode })} />
        <LogicFlowVisualizer steps={draft.flowSteps} editable onChange={(flowSteps) => set({ flowSteps })} />
      </TabsContent>

      <TabsContent value="architecture">
        <AlgorithmArchitectureView blocks={draft.architectureBlocks} editable onChange={(architectureBlocks) => set({ architectureBlocks })} />
      </TabsContent>

      <TabsContent value="memory" className="grid gap-4">
        <MemoryNotesSection notes={draft.memoryNotes} editable onChange={(memoryNotes) => set({ memoryNotes })} />
        <Field label="Tags">
          <Input
            value={tagsText}
            onChange={(e) => set({ tags: e.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })}
            placeholder="array, hashmap, interview"
          />
        </Field>
        <Field label="General notes">
          <Textarea value={draft.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} rows={3} />
        </Field>
      </TabsContent>

      <TabsContent value="revision" className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Confidence">
            <Select value={draft.confidence ?? "Medium"} onValueChange={(v) => set({ confidence: v as CodingProblemDraft["confidence"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CONFIDENCE.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="Last revised date"><Input type="date" value={draft.lastRevisedAt ?? ""} onChange={(e) => set({ lastRevisedAt: e.target.value })} /></Field>
          <Field label="Next revision date"><Input type="date" value={draft.nextRevisionAt ?? draft.revisitDate ?? ""} onChange={(e) => set({ nextRevisionAt: e.target.value, revisitDate: e.target.value })} /></Field>
          <Field label="Revision count"><Input type="number" min={0} value={draft.revisionCount ?? 0} onChange={(e) => set({ revisionCount: Number(e.target.value) })} /></Field>
        </div>
        <button
          type="button"
          onClick={() => set({ isFavorite: !draft.isFavorite })}
          className={cn(
            "inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors",
            draft.isFavorite ? "border-signal-amber/40 bg-signal-amber/15 text-signal-amber" : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Star className="h-4 w-4" /> Favorite
        </button>
        <Field label="Revision notes">
          <Textarea
            value={(draft.revisionNotes ?? []).join("\n")}
            onChange={(e) => set({ revisionNotes: e.target.value.split("\n").map((line) => line.trim()).filter(Boolean) })}
            rows={4}
            placeholder="One note per line"
          />
        </Field>
      </TabsContent>
    </Tabs>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mono-label mb-1.5 block">{label}</span>
      {children}
    </label>
  );
}
