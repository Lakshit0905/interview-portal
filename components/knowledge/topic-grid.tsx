"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Star, BookOpen, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACCENT_CLASS } from "@/lib/constants";
import type { HubTopic, HubSubject } from "@/lib/data/knowledge-hub";

interface TopicGridProps {
  subject: HubSubject;
  noteCountMap?: Record<string, number>; // topicSlug → note count
}

export function TopicGrid({ subject, noteCountMap = {} }: TopicGridProps) {
  const a = ACCENT_CLASS[subject.accent] ?? ACCENT_CLASS.slate;

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {subject.topics.map((topic, i) => (
        <TopicCard
          key={topic.slug}
          topic={topic}
          subject={subject}
          noteCount={noteCountMap[topic.slug] ?? 0}
          index={i}
          accent={a}
        />
      ))}
    </div>
  );
}

function TopicCard({
  topic,
  subject,
  noteCount,
  index,
  accent,
}: {
  topic: HubTopic;
  subject: HubSubject;
  noteCount: number;
  index: number;
  accent: ReturnType<typeof getAccent>;
}) {
  const hasNotes = noteCount > 0;
  const isInterviewQ = topic.slug === "interview-questions";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.03, ease: "easeOut" }}
    >
      <Link
        href={`/knowledge/${subject.slug}/${topic.slug}`}
        className={cn(
          "card-glow group flex flex-col gap-2 rounded-xl border bg-card/50 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-card/70",
          isInterviewQ ? "border-primary/20" : "border-border",
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {topic.isPriority && !isInterviewQ && (
              <span className={cn("flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1", accent.bg, accent.ring)} title="High-priority topic">
                <Star className={cn("h-2.5 w-2.5", accent.text)} />
              </span>
            )}
            {isInterviewQ && (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary/10 ring-1 ring-primary/30">
                <Star className="h-2.5 w-2.5 text-primary" />
              </span>
            )}
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-muted-foreground" />
        </div>

        <div className="flex-1">
          <h3 className={cn("text-sm font-semibold leading-snug transition-colors group-hover:text-primary", isInterviewQ && "text-primary")}>
            {topic.title}
          </h3>
          {topic.subtopics && topic.subtopics.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {topic.subtopics.slice(0, 3).map((st) => (
                <span key={st} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[0.6rem] text-muted-foreground">{st}</span>
              ))}
              {topic.subtopics.length > 3 && (
                <span className="font-mono text-[0.6rem] text-muted-foreground/60">+{topic.subtopics.length - 3}</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between border-t border-border/50 pt-2">
          {hasNotes ? (
            <span className={cn("inline-flex items-center gap-1 font-mono text-[0.65rem]", accent.text)}>
              <BookOpen className="h-3 w-3" /> {noteCount} note{noteCount !== 1 ? "s" : ""}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[0.65rem] text-muted-foreground/50">
              <LockKeyhole className="h-3 w-3" /> No notes yet
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

// type helper
function getAccent(key: string) {
  return ACCENT_CLASS[key] ?? ACCENT_CLASS.slate;
}
