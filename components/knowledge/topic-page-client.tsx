"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Star, ChevronRight, BookOpen, LockKeyhole, FileText, Code2, AlertCircle, CheckCircle, HelpCircle, Lightbulb, RefreshCw, Pencil, Plus } from "lucide-react";
import { Icon } from "@/components/shared/icon";
import { cn } from "@/lib/utils";
import { ACCENT_CLASS } from "@/lib/constants";
import type { HubSubject, HubTopic } from "@/lib/data/knowledge-hub";
import { NoteEditorDialog } from "./note-editor-dialog";
import { Button } from "@/components/ui/button";

interface TopicPageClientProps {
  subject: HubSubject;
  topic: HubTopic;
  mdxNote?: { slug: string; title: string; component: React.ReactNode } | null;
}

// Structured sections shown when there's no MDX content yet.
const TEMPLATE_SECTIONS = [
  { icon: BookOpen,      label: "Definition",         description: "What is this concept, in one clear sentence." },
  { icon: Lightbulb,     label: "Why It Matters",      description: "The real-world significance — why interviewers ask about it." },
  { icon: Code2,         label: "Code Example",        description: "A concise, runnable snippet demonstrating the concept." },
  { icon: AlertCircle,   label: "Common Mistakes",     description: "Typical pitfalls and misunderstandings candidates make." },
  { icon: CheckCircle,   label: "Best Practices",      description: "Production-grade guidance and senior-engineer perspective." },
  { icon: HelpCircle,    label: "Interview Questions", description: "Specific questions this concept generates in Staff-level loops." },
  { icon: FileText,      label: "Flashcards",          description: "Spaced-repetition cards derived from this topic." },
  { icon: RefreshCw,     label: "Revision Notes",      description: "Condensed key points for quick review the day before." },
];

export function TopicPageClient({ subject, topic, mdxNote }: TopicPageClientProps) {
  const a = ACCENT_CLASS[subject.accent] ?? ACCENT_CLASS.slate;
  const hasMdx = Boolean(mdxNote?.component);
  const [editorOpen, setEditorOpen] = React.useState(false);
  const flashcardHref = subject.flashcardTopic
    ? `/flashcards?topic=${encodeURIComponent(subject.flashcardTopic)}&tab=deck`
    : "/flashcards";

  return (
    <div className="mx-auto max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
        <Link href="/knowledge" className="hover:text-foreground transition-colors">hub</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/knowledge/${subject.slug}`} className="hover:text-foreground transition-colors">{subject.title.toLowerCase()}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{topic.title.toLowerCase()}</span>
      </nav>

      {/* Topic Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          {topic.isPriority && (
            <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs ring-1", a.bg, a.ring, a.text)}>
              <Star className="h-3 w-3" /> Priority
            </span>
          )}
          <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">{subject.band}</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{topic.title}</h1>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className={cn("flex h-6 w-6 items-center justify-center rounded-lg ring-1", a.bg, a.ring)}>
              <Icon name={subject.icon} className={cn("h-3.5 w-3.5", a.text)} />
            </div>
            <Link href={`/knowledge/${subject.slug}`} className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors">
              {subject.title}
            </Link>
          </div>
          <Button size="sm" variant={hasMdx ? "outline" : "default"} onClick={() => setEditorOpen(true)} className="gap-2">
            {hasMdx
              ? <><Pencil className="h-3.5 w-3.5" /> Edit notes</>
              : <><Plus className="h-3.5 w-3.5" /> Write notes</>}
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" asChild className="gap-2">
            <Link href={flashcardHref}>
              <FileText className="h-3.5 w-3.5" />
              {subject.flashcardTopic ? `${subject.flashcardTopic} flashcards` : "Flashcards"}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild className="gap-2">
            <Link href="/flashcards/generate">
              <Plus className="h-3.5 w-3.5" />
              Generate cards
            </Link>
          </Button>
        </div>
      </div>

      {/* Subtopics */}
      {topic.subtopics && topic.subtopics.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {topic.subtopics.map((st) => (
            <span key={st} className="rounded-lg border border-border bg-muted/50 px-2.5 py-1 font-mono text-xs text-muted-foreground">{st}</span>
          ))}
        </div>
      )}

      {/* Content: MDX or template */}
      {hasMdx ? (
        <div className="rounded-xl border border-border bg-card/50 p-6">
          {mdxNote!.component}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <div className="mb-6 flex flex-col items-center gap-4 rounded-xl border border-border/60 bg-primary/5 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <LockKeyhole className="h-5 w-5 text-primary/60" />
            </div>
            <div>
              <p className="font-semibold">No notes yet for <span className="text-primary">{topic.title}</span></p>
              <p className="mt-1 font-mono text-xs text-muted-foreground/70">
                Write directly in the browser — it saves as <code className="rounded bg-muted px-1">content/{subject.mdxSlug ?? subject.slug}/{topic.slug}.mdx</code>
              </p>
            </div>
            <Button onClick={() => setEditorOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Write notes for this topic
            </Button>
          </div>

          <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Content template</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {TEMPLATE_SECTIONS.map((sec, i) => (
              <motion.div
                key={sec.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
                className="flex gap-3 rounded-xl border border-border/60 bg-card/40 p-4"
              >
                <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-1", a.bg, a.ring)}>
                  <sec.icon className={cn("h-4 w-4", a.text)} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{sec.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{sec.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Note editor */}
      <NoteEditorDialog
        open={editorOpen}
        onClose={() => { setEditorOpen(false); }}
        subject={subject}
        topic={topic}
        initialHasNote={hasMdx}
      />

      {/* Sibling topics nav */}
      <div className="mt-10 border-t border-border pt-6">
        <p className="mb-3 font-mono text-xs text-muted-foreground">Other topics in {subject.title}</p>
        <div className="flex flex-wrap gap-2">
          {subject.topics
            .filter((t) => t.slug !== topic.slug)
            .slice(0, 8)
            .map((t) => (
              <Link
                key={t.slug}
                href={`/knowledge/${subject.slug}/${t.slug}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 font-mono text-xs transition-all hover:border-primary/30 hover:text-primary",
                  t.isPriority ? "border-primary/20 text-foreground" : "border-border text-muted-foreground",
                )}
              >
                {t.isPriority && <Star className="h-2.5 w-2.5" />}
                {t.title}
              </Link>
            ))}
          {subject.topics.length > 9 && (
            <Link
              href={`/knowledge/${subject.slug}`}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-2.5 py-1 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              +{subject.topics.length - 8} more <ArrowLeft className="h-3 w-3 rotate-180" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
