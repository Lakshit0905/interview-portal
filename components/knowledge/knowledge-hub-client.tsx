"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { HUB_SUBJECTS, SUBJECT_BANDS, type HubSubject, type SubjectBand } from "@/lib/data/knowledge-hub";
import { SubjectCard, type SubjectStats } from "./subject-card";
import { Input } from "@/components/ui/input";

interface KnowledgeHubClientProps {
  statsMap: Record<string, SubjectStats>;
}

const BAND_ICONS: Record<SubjectBand, string> = {
  "Frameworks":    "⚙️",
  "Languages":     "💻",
  "AI & LLMs":     "🤖",
  "Infrastructure":"🏗️",
  "Architecture":  "🧱",
  "Quality":       "🛡️",
  "Career":        "🎯",
};

export function KnowledgeHubClient({ statsMap }: KnowledgeHubClientProps) {
  const [query, setQuery] = React.useState("");
  const [activeBand, setActiveBand] = React.useState<SubjectBand | "All">("All");
  const [sortBy, setSortBy] = React.useState<"default" | "completion" | "cards" | "notes">("default");

  const filtered = React.useMemo(() => {
    let subjects: HubSubject[] = HUB_SUBJECTS;

    if (activeBand !== "All") {
      subjects = subjects.filter((s) => s.band === activeBand);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      subjects = subjects.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.band.toLowerCase().includes(q) ||
          s.topics.some((t) => t.title.toLowerCase().includes(q)),
      );
    }

    if (sortBy === "completion") {
      subjects = [...subjects].sort((a, b) => (statsMap[b.slug]?.completion ?? 0) - (statsMap[a.slug]?.completion ?? 0));
    } else if (sortBy === "cards") {
      subjects = [...subjects].sort((a, b) => (statsMap[b.slug]?.flashcards ?? 0) - (statsMap[a.slug]?.flashcards ?? 0));
    } else if (sortBy === "notes") {
      subjects = [...subjects].sort((a, b) => (statsMap[b.slug]?.notes ?? 0) - (statsMap[a.slug]?.notes ?? 0));
    }

    return subjects;
  }, [query, activeBand, sortBy, statsMap]);

  // Aggregate totals across all subjects
  const totals = React.useMemo(() => {
    const all = Object.values(statsMap);
    return {
      subjects: HUB_SUBJECTS.length,
      topics:   HUB_SUBJECTS.reduce((s, sub) => s + sub.topics.length, 0),
      notes:    all.reduce((s, v) => s + v.notes, 0),
      cards:    all.reduce((s, v) => s + v.flashcards, 0),
      questions:all.reduce((s, v) => s + v.questions, 0),
    };
  }, [statsMap]);

  const bandGroups: SubjectBand[] = [...new Set(filtered.map((s) => s.band))] as SubjectBand[];

  return (
    <div>
      {/* Hero stats */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          { label: "Subjects",       value: totals.subjects },
          { label: "Topics",         value: totals.topics },
          { label: "Notes",          value: totals.notes },
          { label: "Flashcards",     value: totals.cards },
          { label: "Interview Q&As", value: totals.questions },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col gap-1 rounded-xl border border-border bg-card/40 p-3 text-center">
            <span className="font-mono text-xl font-bold tabular-nums tracking-tight">{stat.value}</span>
            <span className="font-mono text-[0.65rem] text-muted-foreground">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Controls bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search subjects, topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 pl-8 pr-8 font-mono text-sm"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 appearance-none rounded-lg border border-border bg-card px-3 pr-7 font-mono text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
          >
            <option value="default">Sort: Default</option>
            <option value="completion">Sort: Mastery</option>
            <option value="cards">Sort: Flashcards</option>
            <option value="notes">Sort: Notes</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        </div>

        <span className="ml-auto font-mono text-xs text-muted-foreground">
          {filtered.length} / {HUB_SUBJECTS.length}
        </span>
      </div>

      {/* Band filter chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        <BandChip band="All" active={activeBand === "All"} onClick={() => setActiveBand("All")} count={HUB_SUBJECTS.length} />
        {SUBJECT_BANDS.map((band) => {
          const n = HUB_SUBJECTS.filter((s) => s.band === band).length;
          return (
            <BandChip key={band} band={band} active={activeBand === band} onClick={() => setActiveBand(activeBand === band ? "All" : band)} count={n} emoji={BAND_ICONS[band]} />
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
            <p className="font-mono text-sm text-muted-foreground">No subjects match "{query}"</p>
            <button onClick={() => { setQuery(""); setActiveBand("All"); }} className="mt-2 font-mono text-xs text-primary hover:underline">Clear filters</button>
          </motion.div>
        ) : activeBand !== "All" || query ? (
          // Flat grid when filtered
          <motion.div key="flat" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((s, i) => (
              <SubjectCard key={s.slug} subject={s} stats={statsMap[s.slug] ?? defaultStats(s)} index={i} />
            ))}
          </motion.div>
        ) : (
          // Band-grouped layout when unfiltered
          <motion.div key="grouped" className="space-y-10">
            {bandGroups.map((band) => {
              const bandSubjects = filtered.filter((s) => s.band === band);
              if (!bandSubjects.length) return null;
              return (
                <section key={band}>
                  <div className="mb-4 flex items-center gap-2.5">
                    <span className="text-base">{BAND_ICONS[band]}</span>
                    <h2 className="font-mono text-sm font-semibold uppercase tracking-widest text-muted-foreground">{band}</h2>
                    <div className="flex-1 border-t border-border/50" />
                    <span className="font-mono text-xs text-muted-foreground/60">{bandSubjects.length}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {bandSubjects.map((s, i) => (
                      <SubjectCard key={s.slug} subject={s} stats={statsMap[s.slug] ?? defaultStats(s)} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BandChip({ band, active, onClick, count, emoji }: { band: string; active: boolean; onClick: () => void; count: number; emoji?: string }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all",
        active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:border-primary/20 hover:text-foreground",
      )}
    >
      {emoji && <span>{emoji}</span>}
      {band}
      <span className={cn("rounded-md px-1 py-0.5 text-[0.6rem] tabular-nums", active ? "bg-primary/20" : "bg-muted")}>{count}</span>
    </button>
  );
}

function defaultStats(s: HubSubject): SubjectStats {
  return {
    notes: 0,
    flashcards: 0,
    questions: 0,
    topics: s.topics.length,
    completion: 0,
    revisionStatus: "new",
    hasWeakAreas: false,
  };
}
