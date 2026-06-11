"use client";

import { Clock, Cpu, ExternalLink, Pencil, Trash2, Star } from "lucide-react";
import type { CodingProblem } from "@/types";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogicFlowVisualizer } from "./logic-flow-visualizer";
import { AlgorithmArchitectureView } from "./algorithm-architecture-view";
import { PseudocodeEditor } from "./pseudocode-editor";
import { MemoryNotesSection } from "./memory-notes-section";
import { RevisionTracker } from "./revision-tracker";

export function EnhancedProblemDetailTabs({
  problem,
  onEdit,
  onDelete,
  onRevised,
}: {
  problem: CodingProblem;
  onEdit: (problem: CodingProblem) => void;
  onDelete: (id: string) => void;
  onRevised: (problem: CodingProblem) => void;
}) {
  const code = problem.code || problem.solution;

  return (
    <div className="space-y-4 border-t border-border p-4">
      <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
        {problem.isFavorite && <Badge className="bg-signal-amber/15 text-signal-amber ring-1 ring-signal-amber/30"><Star className="h-3 w-3" /> Favorite</Badge>}
        {problem.pattern && <Badge variant="muted">{problem.pattern}</Badge>}
        {problem.confidence && <Badge variant="outline">{problem.confidence} confidence</Badge>}
        {problem.timeComplexity && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> time {problem.timeComplexity}</span>}
        {problem.spaceComplexity && <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> space {problem.spaceComplexity}</span>}
        {problem.nextRevisionAt && <span>next revision {formatDate(problem.nextRevisionAt)}</span>}
        {problem.url && (
          <a href={problem.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
            <ExternalLink className="h-3.5 w-3.5" /> source
          </a>
        )}
      </div>

      <Tabs defaultValue="code">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="code">Code</TabsTrigger>
          <TabsTrigger value="logic">Logic Flow</TabsTrigger>
          <TabsTrigger value="architecture">Architecture</TabsTrigger>
          <TabsTrigger value="pseudocode">Pseudocode</TabsTrigger>
          <TabsTrigger value="memory">Memory Notes</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
        </TabsList>

        <TabsContent value="code" className="space-y-4">
          <InfoGrid problem={problem} />
          {problem.approach && <Block title="Approach explanation" content={problem.approach} />}
          {problem.notes && <Block title="Notes" content={problem.notes} />}
          <div>
            <p className="mono-label mb-1">Code solution{problem.language ? ` · ${problem.language}` : ""}</p>
            <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90">{code || "No code saved yet."}</pre>
          </div>
        </TabsContent>

        <TabsContent value="logic">
          <LogicFlowVisualizer steps={problem.flowSteps} />
        </TabsContent>

        <TabsContent value="architecture">
          <AlgorithmArchitectureView blocks={problem.architectureBlocks} />
        </TabsContent>

        <TabsContent value="pseudocode">
          <PseudocodeEditor value={problem.pseudocode} />
        </TabsContent>

        <TabsContent value="memory">
          <MemoryNotesSection notes={problem.memoryNotes} />
        </TabsContent>

        <TabsContent value="revision">
          <RevisionTracker problem={problem} onRevised={onRevised} />
        </TabsContent>
      </Tabs>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(problem)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(problem.id)} className="text-signal-red hover:text-signal-red"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
      </div>
    </div>
  );
}

function InfoGrid({ problem }: { problem: CodingProblem }) {
  const entries = [
    ["Understanding", problem.understanding],
    ["Input", problem.input],
    ["Expected output", problem.output],
    ["Constraints", problem.constraints],
    ["Edge cases", problem.edgeCases],
  ].filter(([, value]) => Boolean(value));

  if (entries.length === 0 && !(problem.tags ?? []).length) return null;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {entries.map(([label, value]) => <Block key={label} title={label!} content={value!} />)}
      {(problem.tags ?? []).length > 0 && (
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="mono-label mb-2">Tags</p>
          <div className="flex flex-wrap gap-1.5">
            {(problem.tags ?? []).map((tag) => <Badge key={tag} variant="muted">{tag}</Badge>)}
          </div>
        </div>
      )}
    </div>
  );
}

function Block({ title, content }: { title: string; content: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="mono-label mb-1">{title}</p>
      <p className="whitespace-pre-wrap text-sm text-foreground/90">{content}</p>
    </div>
  );
}
