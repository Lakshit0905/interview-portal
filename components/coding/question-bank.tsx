"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { InterviewQuestion, Difficulty, QuestionCategory } from "@/types";
import { QUESTION_CATEGORIES } from "@/types";
import { DIFFICULTY_ACCENT, ACCENT_CLASS } from "@/lib/constants";
import { createQuestion, updateQuestion, deleteQuestion } from "@/lib/actions/questions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
type Draft = Partial<InterviewQuestion>;
const EMPTY: Draft = { question: "", category: "Playwright", answer: "", difficulty: "Medium", tags: [] };

export function QuestionBank({ initial }: { initial: InterviewQuestion[] }) {
  const router = useRouter();
  const focusId = useSearchParams().get("focus");

  const [items, setItems] = React.useState(initial);
  const [query, setQuery] = React.useState("");
  const [category, setCategory] = React.useState<string>("all");
  const [expanded, setExpanded] = React.useState<string | null>(focusId);
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<Draft>(EMPTY);
  const [tagInput, setTagInput] = React.useState("");
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => setItems(initial), [initial]);
  React.useEffect(() => { if (focusId) setExpanded(focusId); }, [focusId]);

  const filtered = items.filter((q) => {
    if (category !== "all" && q.category !== category) return false;
    if (query) {
      const blob = `${q.question} ${q.answer} ${q.tags.join(" ")}`.toLowerCase();
      if (!blob.includes(query.toLowerCase())) return false;
    }
    return true;
  });

  function openCreate() { setDraft(EMPTY); setTagInput(""); setOpen(true); }
  function openEdit(q: InterviewQuestion) { setDraft(q); setTagInput(q.tags.join(", ")); setOpen(true); }

  function save() {
    const payload = {
      question: draft.question?.trim() || "Untitled question",
      category: draft.category as QuestionCategory,
      answer: draft.answer ?? "",
      difficulty: draft.difficulty as Difficulty,
      tags: tagInput.split(",").map((t) => t.trim()).filter(Boolean),
    };
    startTransition(async () => {
      if (draft.id) {
        const updated = await updateQuestion(draft.id, payload);
        if (updated) setItems((c) => c.map((x) => (x.id === draft.id ? updated : x)));
      } else {
        const created = await createQuestion(payload);
        setItems((c) => [created, ...c]);
      }
      setOpen(false);
      router.refresh();
    });
  }

  function remove(id: string) {
    setItems((c) => c.filter((x) => x.id !== id));
    startTransition(() => { void deleteQuestion(id); });
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search questions…" className="pl-8" />
        </div>
        <Button onClick={openCreate} size="sm"><Plus className="h-4 w-4" /> Add question</Button>
      </div>

      <div className="scrollbar-thin mb-5 flex gap-1.5 overflow-x-auto pb-1">
        {["all", ...QUESTION_CATEGORIES].map((c) => {
          const count = c === "all" ? items.length : items.filter((q) => q.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 rounded-lg border px-3 py-1.5 font-mono text-xs transition-colors",
                category === c ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {c === "all" ? "All" : c} <span className="opacity-50">{count}</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="HelpCircle" title="No questions yet" description="Build your bank of interview questions and model answers across every category." />
      ) : (
        <div className="space-y-2">
          {filtered.map((q) => {
            const dAccent = ACCENT_CLASS[DIFFICULTY_ACCENT[q.difficulty]];
            const isOpen = expanded === q.id;
            return (
              <div key={q.id} className={cn("rounded-xl border bg-card transition-colors", isOpen ? "border-primary/30" : "border-border")}>
                <button onClick={() => setExpanded(isOpen ? null : q.id)} className="flex w-full items-start gap-3 p-4 text-left">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{q.question}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Badge variant="muted">{q.category}</Badge>
                      <span className={cn("rounded-md px-1.5 py-0.5 font-mono text-[0.65rem] ring-1", dAccent.bg, dAccent.text, dAccent.ring)}>{q.difficulty}</span>
                    </div>
                  </div>
                  <ChevronDown className={cn("mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="space-y-3 border-t border-border p-4">
                        <p className="whitespace-pre-wrap text-sm text-foreground/90">{q.answer || "No answer recorded yet."}</p>
                        {q.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">{q.tags.map((t) => <Badge key={t} variant="outline">#{t}</Badge>)}</div>
                        )}
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(q)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => remove(q.id)} className="text-signal-red hover:text-signal-red"><Trash2 className="h-3.5 w-3.5" /> Delete</Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{draft.id ? "Edit question" : "Add question"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <label className="block"><span className="mono-label mb-1.5 block">Question</span>
              <Textarea value={draft.question ?? ""} onChange={(e) => setDraft((d) => ({ ...d, question: e.target.value }))} placeholder="How do you handle flaky tests in Playwright?" /></label>
            <div className="grid grid-cols-2 gap-4">
              <label className="block"><span className="mono-label mb-1.5 block">Category</span>
                <Select value={draft.category} onValueChange={(v) => setDraft((d) => ({ ...d, category: v as QuestionCategory }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{QUESTION_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select></label>
              <label className="block"><span className="mono-label mb-1.5 block">Difficulty</span>
                <Select value={draft.difficulty} onValueChange={(v) => setDraft((d) => ({ ...d, difficulty: v as Difficulty }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{DIFFICULTIES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select></label>
            </div>
            <label className="block"><span className="mono-label mb-1.5 block">Answer</span>
              <Textarea value={draft.answer ?? ""} onChange={(e) => setDraft((d) => ({ ...d, answer: e.target.value }))} className="min-h-[140px]" placeholder="Model answer…" /></label>
            <label className="block"><span className="mono-label mb-1.5 block">Tags (comma separated)</span>
              <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="retries, auto-wait, ci" /></label>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={pending}>{pending ? "Saving…" : draft.id ? "Save changes" : "Add question"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
