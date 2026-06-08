"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Layers, HelpCircle, AlertTriangle, Star, ExternalLink, ChevronRight } from "lucide-react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ACCENT_CLASS } from "@/lib/constants";
import type { HubSubject } from "@/lib/data/knowledge-hub";
import { HUB_SUBJECTS } from "@/lib/data/knowledge-hub";
import type { SubjectStats } from "./subject-card";
import { TopicGrid } from "./topic-grid";

interface SubjectHubClientProps {
  subject: HubSubject;
  stats: SubjectStats;
  noteCountMap: Record<string, number>;
  mdxNotes?: { slug: string; title: string; description: string; section: string; readingTime: number }[];
}

export function SubjectHubClient({ subject, stats, noteCountMap, mdxNotes = [] }: SubjectHubClientProps) {
  const a = ACCENT_CLASS[subject.accent] ?? ACCENT_CLASS.slate;
  const [activeTab, setActiveTab] = React.useState<"topics" | "notes" | "related">("topics");

  const relatedSubjects = HUB_SUBJECTS.filter((s) => subject.relatedSlugs.includes(s.slug));
  const priorityTopics = subject.topics.filter((t) => t.isPriority);

  const completionColor =
    stats.completion >= 70 ? "bg-signal-green" :
    stats.completion >= 35 ? "bg-signal-amber" :
    "bg-muted-foreground/40";

  return (
    <div>
      {/* Back nav */}
      <Link href="/knowledge" className="mono-label mb-5 inline-flex items-center gap-1.5 hover:text-foreground">
        <ArrowLeft className="h-3 w-3" /> Knowledge Hub
      </Link>

      {/* Subject Hero */}
      <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur">
        {/* Gradient accent bar */}
        <div className={cn("h-1 w-full", a.dot.replace("bg-", "bg-"))} />

        <div className="p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Icon + title */}
            <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ring-1", a.bg, a.ring)}>
              <Icon name={subject.icon} className={cn("h-8 w-8", a.text)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight">{subject.title}</h1>
                <span className={cn("rounded-md px-2 py-0.5 font-mono text-xs ring-1", a.bg, a.ring, a.text)}>{subject.band}</span>
                {stats.hasWeakAreas && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-signal-amber/10 px-2 py-0.5 font-mono text-xs text-signal-amber ring-1 ring-signal-amber/30">
                    <AlertTriangle className="h-3 w-3" /> Weak areas
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl">{subject.description}</p>

              {/* Progress bar */}
              <div className="mt-4 max-w-xs">
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground">Overall mastery</span>
                  <span className={cn("font-mono text-xs font-medium", stats.completion > 0 ? a.text : "text-muted-foreground/50")}>
                    {stats.completion}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <motion.div
                    className={cn("h-full rounded-full", completionColor)}
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.completion}%` }}
                    transition={{ duration: 0.9, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:w-32 shrink-0">
              <StatBox icon={BookOpen} value={stats.notes} label="Notes" accent={a} />
              <StatBox icon={Layers} value={stats.flashcards} label="Flashcards" accent={a} />
              <StatBox icon={HelpCircle} value={stats.questions} label="Questions" accent={a} />
            </div>
          </div>
        </div>
      </div>

      {/* Priority topics callout */}
      {priorityTopics.length > 0 && (
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center gap-2">
            <Star className="h-3.5 w-3.5 text-primary" />
            <span className="font-mono text-xs text-primary">High-priority topics for Staff-level interviews</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {priorityTopics.map((t) => (
              <Link
                key={t.slug}
                href={`/knowledge/${subject.slug}/${t.slug}`}
                className="inline-flex items-center gap-1 rounded-md border border-primary/20 bg-card/60 px-2.5 py-1 font-mono text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {t.title}
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border bg-card/40 p-1">
        {(["topics", "notes", "related"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 font-mono text-xs font-medium capitalize transition-all",
              activeTab === tab
                ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab}
            {tab === "topics" && <span className="ml-1.5 text-muted-foreground/60">({subject.topics.length})</span>}
            {tab === "notes" && <span className="ml-1.5 text-muted-foreground/60">({mdxNotes.length})</span>}
            {tab === "related" && <span className="ml-1.5 text-muted-foreground/60">({relatedSubjects.length})</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "topics" && (
        <TopicGrid subject={subject} noteCountMap={noteCountMap} />
      )}

      {activeTab === "notes" && (
        <div>
          {mdxNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <BookOpen className="mb-3 h-8 w-8 text-muted-foreground/40" />
              <p className="font-mono text-sm text-muted-foreground">No notes yet for {subject.title}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground/60">
                Add MDX files under <code className="rounded bg-muted px-1">content/{subject.mdxSlug ?? subject.slug}/</code>
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {mdxNotes.map((note) => (
                <Link
                  key={note.slug}
                  href={`/knowledge/${subject.slug}/${note.slug}`}
                  className="card-glow group flex flex-col gap-2 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30"
                >
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{note.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{note.description}</p>
                  <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2">
                    <span className="font-mono text-[0.65rem] text-muted-foreground">{note.section}</span>
                    <span className="flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground">
                      <ExternalLink className="h-3 w-3" /> {note.readingTime}m read
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "related" && (
        <div>
          {relatedSubjects.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">No related subjects defined.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSubjects.map((rel) => {
                const ra = ACCENT_CLASS[rel.accent] ?? ACCENT_CLASS.slate;
                return (
                  <Link
                    key={rel.slug}
                    href={`/knowledge/${rel.slug}`}
                    className="card-glow group flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30"
                  >
                    <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1", ra.bg, ra.ring)}>
                      <Icon name={rel.icon} className={cn("h-4 w-4", ra.text)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm group-hover:text-primary transition-colors">{rel.title}</p>
                      <p className="mt-0.5 font-mono text-[0.65rem] text-muted-foreground">{rel.band}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatBox({
  icon: IconComp,
  value,
  label,
  accent,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  accent: typeof ACCENT_CLASS[string];
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border/60 bg-card/30 p-3">
      <IconComp className={cn("h-4 w-4", value > 0 ? accent.text : "text-muted-foreground/40")} />
      <span className={cn("font-mono text-lg font-bold tabular-nums", value > 0 ? "" : "text-muted-foreground/40")}>{value}</span>
      <span className="font-mono text-[0.6rem] text-muted-foreground">{label}</span>
    </div>
  );
}
