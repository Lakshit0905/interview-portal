"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Check, RotateCcw, Circle, ChevronDown, Star, Workflow,
} from "lucide-react";
import type { CodingProblem, CodingStatus, Difficulty } from "@/types";
import { CODING_TOPICS } from "@/types";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import {
  createCodingProblem, updateCodingProblem, setCodingStatus, deleteCodingProblem,
} from "@/lib/actions/coding";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ConfettiBurst } from "@/components/coding/dashboard/confetti-burst";
import { EnhancedProblemDetailTabs } from "@/components/coding/enhanced-problem-detail-tabs";
import { EnhancedProblemForm, EMPTY_ENHANCED_PROBLEM } from "@/components/coding/enhanced-problem-form";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const STATUS_META: Record<CodingStatus, { label: string; icon: typeof Check; accent: string }> = {
  todo: { label: "To do", icon: Circle, accent: "blue" },
  solved: { label: "Solved", icon: Check, accent: "green" },
  revisit: { label: "Revisit", icon: RotateCcw, accent: "amber" },
};

type Draft = Partial<CodingProblem>;

const EMPTY: Draft = {
  ...EMPTY_ENHANCED_PROBLEM,
};

export function CodingBoard({ initial }: { initial: CodingProblem[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const focusId = params.get("focus");

  const [items, setItems] = React.useState(initial);
  const [query, setQuery] = React.useState("");
  const [topic, setTopic] = React.useState<string>("all");
  const [difficulty, setDifficulty] = React.useState<string>("all");
  const [status, setStatus] = React.useState<string>("all");
  const [pattern, setPattern] = React.useState<string>("all");
  const [tag, setTag] = React.useState<string>("all");
  const [favorite, setFavorite] = React.useState<string>("all");
  const [confidence, setConfidence] = React.useState<string>("all");
  const [revisionDue, setRevisionDue] = React.useState<string>("all");
  const [expanded, setExpanded] = React.useState<string | null>(focusId);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [pending, startTransition] = React.useTransition();
  const [celebrate, setCelebrate] = React.useState(false);

  React.useEffect(() => setItems(initial), [initial]);
  React.useEffect(() => {
    if (focusId) {
      setExpanded(focusId);
      document.getElementById(`problem-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId]);

  const filtered = items.filter((p) => {
    const today = new Date().toISOString().slice(0, 10);
    if (topic !== "all" && p.topic !== topic) return false;
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (status !== "all" && p.status !== status) return false;
    if (pattern !== "all" && (p.pattern || "Unpatterned") !== pattern) return false;
    if (tag !== "all" && !(p.tags ?? []).includes(tag)) return false;
    if (favorite !== "all" && Boolean(p.isFavorite) !== (favorite === "yes")) return false;
    if (confidence !== "all" && (p.confidence ?? "Medium") !== confidence) return false;
    if (revisionDue === "due" && (!p.nextRevisionAt || p.nextRevisionAt > today)) return false;
    if (query) {
      const blob = `${p.name} ${p.topic} ${p.notes} ${p.solution} ${p.code} ${p.pattern} ${(p.tags ?? []).join(" ")}`.toLowerCase();
      if (!blob.includes(query.toLowerCase())) return false;
    }
    return true;
  });
  const patternOptions = React.useMemo(
    () => [...new Set(items.map((p) => p.pattern?.trim() || "Unpatterned"))].sort(),
    [items],
  );
  const tagOptions = React.useMemo(
    () => [...new Set(items.flatMap((p) => p.tags ?? []))].sort(),
    [items],
  );

  const counts = {
    total: items.length,
    solved: items.filter((p) => p.status === "solved").length,
    revisit: items.filter((p) => p.status === "revisit").length,
  };

  function cycleStatus(p: CodingProblem) {
    const next: CodingStatus = p.status === "solved" ? "revisit" : p.status === "revisit" ? "todo" : "solved";
    if (next === "solved" && p.status !== "solved") {
      const newSolvedCount = items.filter((x) => x.status === "solved").length + 1;
      if (newSolvedCount % 5 === 0) {
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 1200);
      }
    }
    setItems((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
    startTransition(() => { void setCodingStatus(p.id, next); });
  }

  function openCreate() { setDraft({ ...EMPTY }); setDialogOpen(true); }
  function openEdit(p: CodingProblem) { setDraft({ ...EMPTY, ...p, code: p.code ?? p.solution }); setDialogOpen(true); }

  function save() {
    const payload = {
      name: draft.name?.trim() || "Untitled problem",
      difficulty: draft.difficulty as Difficulty,
      topic: draft.topic as (typeof CODING_TOPICS)[number],
      status: (draft.status as CodingStatus) ?? "todo",
      solution: draft.solution ?? "",
      understanding: draft.understanding ?? "",
      input: draft.input ?? "",
      output: draft.output ?? "",
      constraints: draft.constraints ?? "",
      edgeCases: draft.edgeCases ?? "",
      pattern: draft.pattern ?? "",
      approach: draft.approach ?? "",
      pseudocode: draft.pseudocode ?? "",
      code: draft.code ?? draft.solution ?? "",
      language: draft.language ?? "",
      flowSteps: draft.flowSteps ?? [],
      architectureBlocks: draft.architectureBlocks ?? {},
      memoryNotes: draft.memoryNotes ?? {},
      timeComplexity: draft.timeComplexity ?? "",
      spaceComplexity: draft.spaceComplexity ?? "",
      tags: draft.tags ?? [],
      isFavorite: Boolean(draft.isFavorite),
      confidence: draft.confidence,
      lastRevisedAt: draft.lastRevisedAt || undefined,
      nextRevisionAt: draft.nextRevisionAt || undefined,
      revisionCount: draft.revisionCount ?? 0,
      revisionNotes: draft.revisionNotes ?? [],
      notes: draft.notes ?? "",
      url: draft.url || undefined,
      revisitDate: draft.revisitDate || null,
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateCodingProblem(draft.id, payload);
        if (updated) setItems((cur) => cur.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createCodingProblem(payload);
        setItems((cur) => [created, ...cur]);
      }
      setDialogOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    setItems((cur) => cur.filter((x) => x.id !== id));
    startTransition(() => { void deleteCodingProblem(id); });
  }

  return (
    <div>
      {celebrate && <ConfettiBurst />}
      {/* Toolbar */}
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search problems…" className="w-52 pl-8" />
          </div>
          <FilterSelect value={topic} onValueChange={setTopic} placeholder="Topic" options={["all", ...CODING_TOPICS]} />
          <FilterSelect value={difficulty} onValueChange={setDifficulty} placeholder="Difficulty" options={["all", ...DIFFICULTIES]} />
          <FilterSelect value={status} onValueChange={setStatus} placeholder="Status" options={["all", "todo", "solved", "revisit"]} />
          <FilterSelect value={pattern} onValueChange={setPattern} placeholder="Pattern" options={["all", ...patternOptions]} />
          <FilterSelect value={tag} onValueChange={setTag} placeholder="Tags" options={["all", ...tagOptions]} />
          <FilterSelect value={favorite} onValueChange={setFavorite} placeholder="Favorite" options={["all", "yes", "no"]} />
          <FilterSelect value={confidence} onValueChange={setConfidence} placeholder="Confidence" options={["all", "Low", "Medium", "High"]} />
          <FilterSelect value={revisionDue} onValueChange={setRevisionDue} placeholder="Revision" options={["all", "due"]} />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex">
            <span><span className="text-signal-green">{counts.solved}</span> solved</span>
            <span><span className="text-signal-amber">{counts.revisit}</span> revisit</span>
            <span>{counts.total} total</span>
          </div>
          <Button variant="outline" size="sm" asChild><Link href="/coding/patterns"><Workflow className="h-4 w-4" /> Patterns</Link></Button>
          <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add problem</Button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon="Code2" title="No problems match" description="Adjust filters or add a new problem to your tracker." />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const dAccent = ACCENT_CLASS[DIFFICULTY_ACCENT[p.difficulty]];
            const sMeta = STATUS_META[p.status];
            const sAccent = ACCENT_CLASS[sMeta.accent];
            const isOpen = expanded === p.id;
            return (
              <div
                key={p.id}
                id={`problem-${p.id}`}
                className={cn(
                  "rounded-xl border bg-card transition-colors",
                  isOpen ? "border-primary/30" : "border-border",
                  focusId === p.id && "ring-1 ring-primary/40",
                )}
              >
                <div className="flex items-center gap-3 p-3.5">
                  <button
                    onClick={() => cycleStatus(p)}
                    title={`Mark ${sMeta.label}`}
                    className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1 transition-colors", sAccent.bg, sAccent.ring)}
                  >
                    <sMeta.icon className={cn("h-3.5 w-3.5", sAccent.text)} />
                  </button>

                  <button onClick={() => setExpanded(isOpen ? null : p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <div className="min-w-0 flex-1">
                      <p className={cn("flex items-center gap-1.5 truncate font-medium", p.status === "solved" && "text-muted-foreground")}>
                        {p.isFavorite && <Star className="h-3.5 w-3.5 shrink-0 fill-signal-amber text-signal-amber" />}
                        <span className="truncate">{p.name}</span>
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
                        <span>{p.topic}</span>
                        {p.pattern && <span>· {p.pattern}</span>}
                        {p.revisitDate && p.status === "revisit" && (
                          <span className="text-signal-amber">· revisit {formatDate(p.revisitDate)}</span>
                        )}
                      </div>
                    </div>
                    <span className={cn("hidden rounded-md px-2 py-0.5 font-mono text-xs ring-1 sm:inline", dAccent.bg, dAccent.text, dAccent.ring)}>
                      {p.difficulty}
                    </span>
                    <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <EnhancedProblemDetailTabs
                        problem={p}
                        onEdit={openEdit}
                        onDelete={remove}
                        onRevised={(updated) => setItems((cur) => cur.map((x) => (x.id === updated.id ? updated : x)))}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}

      <ProblemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        draft={draft}
        setDraft={setDraft}
        onSave={save}
        pending={pending}
      />
    </div>
  );
}

function FilterSelect({
  value, onValueChange, placeholder, options,
}: { value: string; onValueChange: (v: string) => void; placeholder: string; options: string[] }) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="h-9 w-[130px]"><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o}>{o === "all" ? `All ${placeholder.toLowerCase()}` : o.charAt(0).toUpperCase() + o.slice(1)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ProblemDialog({
  open, onOpenChange, draft, setDraft, onSave, pending,
}: {
  open: boolean; onOpenChange: (v: boolean) => void;
  draft: Draft; setDraft: React.Dispatch<React.SetStateAction<Draft>>;
  onSave: () => void; pending: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader><DialogTitle>{draft.id ? "Edit problem" : "Add problem"}</DialogTitle></DialogHeader>
        <EnhancedProblemForm draft={draft} onChange={setDraft} />
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add problem"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
