"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Check, RotateCcw, Circle, Pencil, Trash2,
  ExternalLink, ChevronDown, Clock, Cpu,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const STATUS_META: Record<CodingStatus, { label: string; icon: typeof Check; accent: string }> = {
  todo: { label: "To do", icon: Circle, accent: "blue" },
  solved: { label: "Solved", icon: Check, accent: "green" },
  revisit: { label: "Revisit", icon: RotateCcw, accent: "amber" },
};

type Draft = Partial<CodingProblem>;

const EMPTY: Draft = {
  name: "", difficulty: "Medium", topic: "Arrays", status: "todo",
  solution: "", timeComplexity: "", spaceComplexity: "", notes: "", url: "", revisitDate: "",
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
  const [expanded, setExpanded] = React.useState<string | null>(focusId);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(initial), [initial]);
  React.useEffect(() => {
    if (focusId) {
      setExpanded(focusId);
      document.getElementById(`problem-${focusId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId]);

  const filtered = items.filter((p) => {
    if (topic !== "all" && p.topic !== topic) return false;
    if (difficulty !== "all" && p.difficulty !== difficulty) return false;
    if (status !== "all" && p.status !== status) return false;
    if (query) {
      const blob = `${p.name} ${p.topic} ${p.notes} ${p.solution}`.toLowerCase();
      if (!blob.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  const counts = {
    total: items.length,
    solved: items.filter((p) => p.status === "solved").length,
    revisit: items.filter((p) => p.status === "revisit").length,
  };

  function cycleStatus(p: CodingProblem) {
    const next: CodingStatus = p.status === "solved" ? "revisit" : p.status === "revisit" ? "todo" : "solved";
    setItems((cur) => cur.map((x) => (x.id === p.id ? { ...x, status: next } : x)));
    startTransition(() => { void setCodingStatus(p.id, next); });
  }

  function openCreate() { setDraft(EMPTY); setDialogOpen(true); }
  function openEdit(p: CodingProblem) { setDraft(p); setDialogOpen(true); }

  function save() {
    const payload = {
      name: draft.name?.trim() || "Untitled problem",
      difficulty: draft.difficulty as Difficulty,
      topic: draft.topic as (typeof CODING_TOPICS)[number],
      status: (draft.status as CodingStatus) ?? "todo",
      solution: draft.solution ?? "",
      timeComplexity: draft.timeComplexity ?? "",
      spaceComplexity: draft.spaceComplexity ?? "",
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
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 font-mono text-xs text-muted-foreground sm:flex">
            <span><span className="text-signal-green">{counts.solved}</span> solved</span>
            <span><span className="text-signal-amber">{counts.revisit}</span> revisit</span>
            <span>{counts.total} total</span>
          </div>
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
                      <p className={cn("truncate font-medium", p.status === "solved" && "text-muted-foreground")}>{p.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 font-mono text-[0.65rem] text-muted-foreground">
                        <span>{p.topic}</span>
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
                      <div className="space-y-4 border-t border-border p-4">
                        <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                          {p.timeComplexity && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> time {p.timeComplexity}</span>}
                          {p.spaceComplexity && <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5" /> space {p.spaceComplexity}</span>}
                          {p.url && (
                            <a href={p.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                              <ExternalLink className="h-3.5 w-3.5" /> source
                            </a>
                          )}
                        </div>
                        {p.notes && (
                          <div>
                            <p className="mono-label mb-1">notes</p>
                            <p className="whitespace-pre-wrap text-sm text-foreground/90">{p.notes}</p>
                          </div>
                        )}
                        {p.solution && (
                          <div>
                            <p className="mono-label mb-1">solution</p>
                            <pre className="scrollbar-thin overflow-x-auto rounded-lg border border-border bg-background/60 p-3 font-mono text-xs text-foreground/90">{p.solution}</pre>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => remove(p.id)} className="text-signal-red hover:text-signal-red"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
                        </div>
                      </div>
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
  const set = (patch: Draft) => setDraft((d) => ({ ...d, ...patch }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><DialogTitle>{draft.id ? "Edit problem" : "Add problem"}</DialogTitle></DialogHeader>
        <div className="grid gap-4">
          <Field label="Problem name">
            <Input value={draft.name ?? ""} onChange={(e) => set({ name: e.target.value })} placeholder="Two Sum" />
          </Field>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Topic">
              <Select value={draft.topic} onValueChange={(v) => set({ topic: v as Draft["topic"] })}>
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
                <SelectContent>{(["todo", "solved", "revisit"] as CodingStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS_META[s].label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Revisit date">
              <Input type="date" value={draft.revisitDate ?? ""} onChange={(e) => set({ revisitDate: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Time complexity"><Input value={draft.timeComplexity ?? ""} onChange={(e) => set({ timeComplexity: e.target.value })} placeholder="O(n)" /></Field>
            <Field label="Space complexity"><Input value={draft.spaceComplexity ?? ""} onChange={(e) => set({ spaceComplexity: e.target.value })} placeholder="O(1)" /></Field>
          </div>
          <Field label="Source URL"><Input value={draft.url ?? ""} onChange={(e) => set({ url: e.target.value })} placeholder="https://leetcode.com/problems/…" /></Field>
          <Field label="Notes"><Textarea value={draft.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Pattern, intuition, edge cases…" /></Field>
          <Field label="Solution"><Textarea value={draft.solution ?? ""} onChange={(e) => set({ solution: e.target.value })} placeholder="// your approach / code" className="min-h-[140px] font-mono text-xs" /></Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={onSave} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add problem"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
